const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const API_KEY = process.env.ABACUSAI_API_KEY;
const OUT_DIR = '/home/ubuntu/pflege_simulation_poc/extracted';
const CONCURRENCY = 3; // Process 3 chunks at a time

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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-5.4-mini',
          messages: [{ role: 'user', content: [
            { type: 'file', file: { filename: `part-${partNum}-p${startPage}-${endPage}.pdf`, file_data: `data:application/pdf;base64,${base64}` } },
            { type: 'text', text: `Extrahiere den VOLLST\u00c4NDIGEN Text aus diesen Seiten eines Pflege-Examen-Handbuchs (i-care Pflegeexamen Kompakt).\n\nGib den Inhalt als JSON zur\u00fcck:\n{\n  "sections": [{"title": "Abschnittstitel", "content": "Vollst\u00e4ndiger Text", "keywords": ["Fachbegriffe"]}]\n}\n\nWICHTIG: ALLEN Text extrahieren, KEINE Zusammenfassung. Medizinische Fachbegriffe als keywords. NUR valides JSON.` }
          ] }],
          max_tokens: 12000,
          response_format: { type: 'json_object' }
        })
      });
      if (!response.ok) throw new Error(`API ${response.status}`);
      const data = await response.json();
      return JSON.parse(data.choices?.[0]?.message?.content);
    } catch (e) {
      console.error(`  Retry ${attempt+1} p${partNum} pg${startPage}-${endPage}: ${e.message.substring(0,80)}`);
      if (attempt < retries) await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
      else return { sections: [{ title: `ERROR pages ${startPage}-${endPage}`, content: e.message, keywords: [] }] };
    }
  }
}

async function processChunkBatch(chunks, partNum) {
  return Promise.all(chunks.map(c => extractChunk(c.base64, partNum, c.startPage, c.endPage)));
}

async function processPart(partNum) {
  const filePath = `/home/ubuntu/Uploads/i-care-pflegeexamen-kompakt-1nbsped-3132408875-9783132408876_compress-part-${partNum}.pdf`;
  if (!fs.existsSync(filePath)) return;
  
  console.log(`\n=== Part ${partNum} ===`);
  const { chunks, totalPages } = await splitPDFPages(filePath);
  console.log(`  ${totalPages} pages, ${chunks.length} chunks (concurrency: ${CONCURRENCY})`);
  
  const allSections = [];
  
  for (let i = 0; i < chunks.length; i += CONCURRENCY) {
    const batch = chunks.slice(i, i + CONCURRENCY);
    const batchEnd = Math.min(i + CONCURRENCY, chunks.length);
    console.log(`  Batch ${Math.floor(i/CONCURRENCY)+1}: chunks ${i+1}-${batchEnd}/${chunks.length}`);
    
    const results = await processChunkBatch(batch, partNum);
    for (const r of results) {
      if (r.sections) allSections.push(...r.sections);
    }
    
    if (i + CONCURRENCY < chunks.length) await new Promise(r => setTimeout(r, 1000));
  }
  
  const output = { part_number: partNum, total_pages: totalPages, sections: allSections };
  fs.writeFileSync(path.join(OUT_DIR, `part-${partNum}.json`), JSON.stringify(output, null, 2), 'utf8');
  console.log(`  \u2713 Part ${partNum}: ${allSections.length} sections saved`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Parts to extract: ${PARTS_TO_PROCESS.join(', ')}`);
  if (PARTS_TO_PROCESS.length === 0) { console.log('All done!'); return; }
  
  for (const p of PARTS_TO_PROCESS) await processPart(p);
  
  console.log('\n=== ALL EXTRACTION COMPLETE ===');
  for (let i = 2; i <= 15; i++) {
    const f = path.join(OUT_DIR, `part-${i}.json`);
    if (fs.existsSync(f)) {
      const d = JSON.parse(fs.readFileSync(f, 'utf8'));
      console.log(`Part ${i}: ${d.sections?.length || 0} sections`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
