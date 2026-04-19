const fs = require('fs');
const path = require('path');

async function extractPDF(filePath, partNumber) {
  const fileBuffer = fs.readFileSync(filePath);
  const base64String = fileBuffer.toString('base64');
  
  const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-5.4-mini',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'file',
            file: {
              filename: `part-${partNumber}.pdf`,
              file_data: `data:application/pdf;base64,${base64String}`
            }
          },
          {
            type: 'text',
            text: `Extrahiere den gesamten Text aus diesem PDF-Kapitel eines Pflege-Examen-Handbuchs. 

Gib den Inhalt als JSON zurück mit folgender Struktur:
{
  "chapter_title": "Titel des Kapitels",
  "sections": [
    {
      "title": "Abschnittstitel",
      "content": "Vollständiger Text des Abschnitts",
      "keywords": ["Schlüsselwort1", "Schlüsselwort2"]
    }
  ]
}

WICHTIG:
- Extrahiere ALLEN Text, keine Zusammenfassung
- Behalte die Struktur des Dokuments bei (Überschriften, Abschnitte)
- Extrahiere medizinische Fachbegriffe als keywords
- Wenn Tabellen oder Listen vorhanden sind, konvertiere sie in lesbaren Text
- Gib NUR valides JSON zurück, kein Markdown

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`
          }
        ]
      }],
      max_tokens: 16000,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error for part ${partNumber}: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  return JSON.parse(content);
}

async function main() {
  const partNum = process.argv[2];
  const filePath = process.argv[3];
  
  console.log(`Extracting part ${partNum}: ${path.basename(filePath)}`);
  const result = await extractPDF(filePath, partNum);
  
  const outPath = `/home/ubuntu/pflege_simulation_poc/extracted/part-${partNum}.json`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Done: ${result.chapter_title} (${result.sections?.length} sections)`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
