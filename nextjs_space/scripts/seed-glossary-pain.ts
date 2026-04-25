import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const glossaryTerms = [
  {
    termDe: 'VAS',
    termTr: 'Görsel analog ağrı skalası',
    contextDe: 'Schmerzskala von 0 bis 10 zur Einschätzung der aktuellen Schmerzintensität',
    contextTr: 'Hastaya ağrısını 0 ile 10 arasında değerlendirmesi istenir',
  },
  {
    termDe: 'Schmerzen einschätzen',
    termTr: 'Ağrı değerlendirmesi',
    contextDe: 'Oberbegriff für Fragen zu Ort, Stärke, Qualität und Bedarf an Schmerzmitteln',
    contextTr: 'Ağrının yeri, şiddeti, niteliği ve ağrı kesici ihtiyacını sorma',
  },
  {
    termDe: 'Lokalisation des Schmerzes',
    termTr: 'Ağrınız nerede?',
    contextDe: 'Patientensprache: "Können Sie mir zeigen, wo genau es wehtut?"',
    contextTr: 'Hastadan ağrının tam yerini göstermesi istenir',
  },
  {
    termDe: 'Schmerzqualität',
    termTr: 'Ağrı nasıl bir his?',
    contextDe: 'Patientensprache: "Ist der Schmerz eher stechend, ziehend oder drückend?"',
    contextTr: 'Ağrının batıcı, çekici ya da baskı şeklinde olup olmadığı sorulur',
  },
  {
    termDe: 'Analgetikabedarf prüfen',
    termTr: 'Ağrı kesici ister misiniz?',
    contextDe: 'Patientensprache: "Brauchen Sie etwas gegen die Schmerzen?"',
    contextTr: 'Hastanın ağrı kesiciye ihtiyacı olup olmadığı sorulur',
  },
];

async function main() {
  for (const term of glossaryTerms) {
    const stableId = 'glossary-' + term.termDe.toLowerCase().replace(/[^a-z0-9äöüß]/g, '-');
    await prisma.glossaryTerm.upsert({
      where: { id: stableId },
      update: term,
      create: { id: stableId, ...term },
    });
  }

  console.log(`Seeded ${glossaryTerms.length} pain glossary terms.`);
}

main()
  .catch((error) => {
    console.error('Pain glossary seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
