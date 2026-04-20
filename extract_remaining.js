const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const API_KEY = process.env.ABACUSAI_API_KEY;
const OUT_DIR = '/home/ubuntu/pflege_simulation_poc/extracted';

// Only process parts that haven't been extracted yet
const PARTS_TO_PROCESS = [];
for (let i = 6; i <= 15; i++) {
  const outFile = path.join(OUT_DIR, `part-${i}.json`);
  if (!fs.existsSync(outFile)) {
    PARTS_TO_PROCESS.push(i);
  }
}

async function splitPDFPages(pdfPath) {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const totalPages = pdfDoc.getPageCount();
  const chunks = [];
  
  for (let i = 0; i < totalPages; i += 3) {
    const end = Math.min(i + 3, totalPages);
    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(pdfDoc, Array.from({length: end - i}, (_, j) => i + j));
    pages.forEach(p => newDoc.addPage(p));
    const bytes = await newDoc.save();
    chunks.push({ startPage: i + 1, endPage: end, base64: Buffer.from(bytes).toString('base64') });
  }
  return { chunks, totalPages };
}

async function extractChunk(base64, partNum, startPage, endPage, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-5.4-mini',
          messages: [{
            role: 'user',
            content: [
              {
                type: 'file',
                file: {
                  filename: `part-${partNum}-pages-${startPage}-${endPage}.pdf`,
                  file_data: `data:application/pdf;base64,${base64}`
                }
              },
              {
                type: 'text',
                text: `Extrahiere den VOLLSTÄNDIGEN Text aus diesen Seiten eines Pflege-Examen-Handbuchs (i-care Pflegeexamen Kompakt).

Gib den Inhalt als JSON zurück:
{
  "sections": [
    {
      "title": "Abschnittstitel oder Überschrift",
      "content": "Vollständiger Text des Abschnitts",
      "keywords": ["medizinische", "Fachbegriffe"]
    }
  ]
}

WICHTIG:
- Extrahiere ALLEN Text vollständig, KEINE Zusammenfassung
- Behalte alle Überschriften und Strukturen bei
- Extrahiere medizinische/pflegerische Fachbegriffe als keywords
- Tabellen und Listen in lesbaren Text konvertieren
- NUR valides JSON, kein Markdown

Respond with raw JSON only.`
              }
            ]
          }],
          max_tokens: 12000,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API ${response.status}: ${errText.substring(0, 200)}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      return JSON.parse(content);
    } catch (e) {
      console.error(`  Attempt ${attempt + 1} failed for part ${partNum} pages ${startPage}-${endPage}: ${e.message.substring(0, 100)}`);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 5000 * (attempt + 1)));
      } else {
        return { sections: [{ title: `ERROR pages ${startPage}-${endPage}`, content: e.message, keywords: [] }] };
      }
    }
  }
}

async function processPart(partNum) {
  const filePath = `/home/ubuntu/Uploads/i-care-pflegeexamen-kompakt-1nbsped-3132408875-9783132408876_compress-part-${partNum}.pdf`;
  if (!fs.existsSync(filePath)) {
    console.log(`Part ${partNum}: PDF not found, skipping`);
    return;
  }
  
  console.log(`\n=== Part ${partNum}: ${path.basename(filePath)} ===`);
  const { chunks, totalPages } = await splitPDFPages(filePath);
  console.log(`  ${totalPages} pages, ${chunks.length} chunks`);
  
  const allSections = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`  Processing chunk ${i + 1}/${chunks.length} (pages ${chunk.startPage}-${chunk.endPage})...`);
    const result = await extractChunk(chunk.base64, partNum, chunk.startPage, chunk.endPage);
    if (result.sections) {
      allSections.push(...result.sections);
    }
    // Rate limit
    if (i < chunks.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  
  const output = {
    part_number: partNum,
    total_pages: totalPages,
    sections: allSections
  };
  
  const outPath = path.join(OUT_DIR, `part-${partNum}.json`);
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`  ✓ Saved: ${allSections.length} sections to ${outPath}`);
  return output;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Parts to extract: ${PARTS_TO_PROCESS.join(', ')}`);
  
  if (PARTS_TO_PROCESS.length === 0) {
    console.log('All parts already extracted!');
    return;
  }
  
  for (const partNum of PARTS_TO_PROCESS) {
    await processPart(partNum);
  }
  
  console.log('\n=== EXTRACTION COMPLETE ===');
  
  // Summary
  for (let i = 2; i <= 15; i++) {
    const f = path.join(OUT_DIR, `part-${i}.json`);
    if (fs.existsSync(f)) {
      const d = JSON.parse(fs.readFileSync(f, 'utf8'));
      console.log(`Part ${i}: ${d.sections?.length || 0} sections (${d.total_pages || '?'} pages)`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
