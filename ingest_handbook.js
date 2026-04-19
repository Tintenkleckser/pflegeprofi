const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const EXTRACTED_DIR = '/home/ubuntu/pflege_simulation_poc/extracted';

async function main() {
  const files = fs.readdirSync(EXTRACTED_DIR)
    .filter(f => f.endsWith('.json') && f.startsWith('part-'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/part-(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/part-(\d+)/)?.[1] || '0');
      return numA - numB;
    });

  console.log(`Found ${files.length} extracted JSON files`);
  let totalSections = 0;

  for (const file of files) {
    const filePath = path.join(EXTRACTED_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const partNumber = parseInt(file.match(/part-(\d+)/)?.[1] || '0');

    console.log(`\nProcessing ${file} (Part ${partNumber}): ${data.sections?.length || 0} sections`);

    if (!data.sections || data.sections.length === 0) {
      console.log('  Skipping: no sections');
      continue;
    }

    for (let i = 0; i < data.sections.length; i++) {
      const section = data.sections[i];
      const title = section.title || `Part ${partNumber} Section ${i + 1}`;
      const content = section.content || '';
      const keywords = (section.keywords || []).map(k => k.toLowerCase());

      if (!content || content.length < 20) {
        console.log(`  Skipping section ${i}: too short`);
        continue;
      }

      // Use upsert with a deterministic ID based on part + section index
      const sectionId = `handbook-p${partNumber}-s${i}`;

      await prisma.handbookSection.upsert({
        where: { id: sectionId },
        update: {
          title,
          content,
          keywords,
        },
        create: {
          id: sectionId,
          domain: 'nursing',
          partNumber,
          sectionIdx: i,
          title,
          content,
          keywords,
        },
      });

      totalSections++;
    }

    console.log(`  Ingested ${data.sections.length} sections`);
  }

  console.log(`\n=== Done: ${totalSections} total sections ingested ===`);
}

main()
  .catch(e => {
    console.error('Ingestion error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
