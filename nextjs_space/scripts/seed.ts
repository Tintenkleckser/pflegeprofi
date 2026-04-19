import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed test user
  const passwordHash = await bcrypt.hash('johndoe123', 12);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      passwordHash,
      nativeLanguage: 'tr',
    },
  });

  // Seed simulation template
  const templateId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  await prisma.simulationTemplate.upsert({
    where: { id: templateId },
    update: {},
    create: {
      id: templateId,
      domain: 'nursing',
      type: 'oral_exam',
      difficulty: 'intermediate',
      titleDe: 'Anamnesegespräch: Patient mit Rückenschmerzen',
      titleTr: 'Öykü Görüşmesi: Sırt Ağrısı Olan Hasta',
      descriptionDe: 'Sie führen ein Anamnesegespräch mit Herrn Müller (68 Jahre), der über Rückenschmerzen klagt. Erfragen Sie systematisch: Schmerzlokalisation, Schmerzcharakter, Schmerzintensität (Schmerzskala), Beginn, Auslöser, begleitende Symptome, Vorerkrankungen, Medikation.',
      descriptionTr: 'Bay Müller (68 yaşında) ile sırt ağrısı şikayeti olan bir öykü görüşmesi yapıyorsunuz. Sistematik olarak sorun: Ağrı lokalizasyonu, ağrı karakteri, ağrı yoğunluğu (ağrı skalası), başlangıç, tetikleyiciler, eşlik eden semptomlar, önceki hastalıklar, ilaçlar.',
      systemPrompt: `Du bist ein Prüfer für die Pflegeexamensprüfung in Deutschland. Der Kandidat führt ein Anamnesegespräch mit einem Patienten (Herrn Müller, 68 Jahre) mit Rückenschmerzen.

DEINE ROLLE: Du spielst den Patienten Herrn Müller. Antworte auf die Fragen des Kandidaten realistisch und gib nur die Informationen preis, die erfragt werden. Sprich als Patient in einfacher Sprache, nicht in Fachsprache. Du bist ein freundlicher älterer Herr.

PATIENTENINFORMATIONEN:
- Alter: 68 Jahre
- Schmerzen: Unterer Rücken, seit 3 Tagen
- Schmerzcharakter: Stechend, bei Bewegung schlimmer
- Schmerzintensität: 7/10
- Auslöser: Gartenarbeit (schweres Heben)
- Begleitsymptome: Keine Ausstrahlung ins Bein, keine Taubheit
- Vorerkrankungen: Bluthochdruck
- Medikation: Ramipril 5mg
- Allergien: Keine bekannt
- Letzte Mahlzeit: Frühstück um 8 Uhr

WICHTIG:
- Antworte immer in der Ich-Form als Patient
- Gib nur Informationen preis, die direkt erfragt werden
- Wenn der Kandidat eine unklare Frage stellt, frage höflich nach
- Beende NICHT das Gespräch von dir aus`,
      evaluationCriteria: JSON.stringify([
        { key: 'fachsprache', label_de: 'Fachsprache', label_tr: 'Tıbbi Terminoloji', weight: 3 },
        { key: 'struktur', label_de: 'Struktur', label_tr: 'Yapı', weight: 3 },
        { key: 'empathie', label_de: 'Empathie', label_tr: 'Empati', weight: 2 },
      ]),
      maxTurns: 8,
    },
  });

  // Seed glossary terms
  const glossaryTerms = [
    { termDe: 'Anamnese', termTr: 'Öykü alma', contextDe: 'Systematische Befragung des Patienten zu seiner Krankengeschichte', contextTr: 'Hastanın tıbbi geçmişi hakkında sistematik sorgulama' },
    { termDe: 'Schmerzskala', termTr: 'Ağrı skalası', contextDe: 'Numerische Bewertungsskala von 0-10 zur Erfassung der Schmerzintensität', contextTr: 'Ağrı yoğunluğunu değerlendirmek için 0-10 arası sayısal derecelendirme ölçeği' },
    { termDe: 'Vitalzeichen', termTr: 'Vital bulgular', contextDe: 'Blutdruck, Puls, Temperatur, Atemfrequenz', contextTr: 'Kan basıncı, nabız, ateş, solunum hızı' },
    { termDe: 'Blutdruck', termTr: 'Kan basıncı (tansiyon)', contextDe: 'Systolischer und diastolischer Druck in mmHg', contextTr: 'Sistolik ve diastolik basınç, mmHg cinsinden ölçülür' },
    { termDe: 'Puls', termTr: 'Nabız', contextDe: 'Herzfrequenz pro Minute', contextTr: 'Dakikadaki kalp atış sayısı' },
    { termDe: 'Schmerzlokalisation', termTr: 'Ağrı lokalizasyonu', contextDe: 'Genaue Stelle, an der der Schmerz empfunden wird', contextTr: 'Ağrının tam olarak hissedildiği yer' },
    { termDe: 'Schmerzcharakter', termTr: 'Ağrı karakteri', contextDe: 'Art des Schmerzes: stechend, brennend, dumpf, ziehend', contextTr: 'Ağrının türü: bıçak gibi, yanıcı, künt, çekici' },
    { termDe: 'Vorerkrankungen', termTr: 'Önceki hastalıklar', contextDe: 'Bereits bekannte Erkrankungen des Patienten', contextTr: 'Hastanın bilinen mevcut hastalıkları' },
    { termDe: 'Medikation', termTr: 'İlaç tedavisi', contextDe: 'Aktuell eingenommene Medikamente', contextTr: 'Şu anda kullanılan ilaçlar' },
    { termDe: 'Allergie', termTr: 'Alerji', contextDe: 'Überempfindlichkeitsreaktion des Immunsystems', contextTr: 'Bağışıklık sisteminin aşırı duyarlılık reaksiyonu' },
    { termDe: 'Mobilisation', termTr: 'Mobilizasyon', contextDe: 'Förderung der Beweglichkeit des Patienten', contextTr: 'Hastanın hareketliliğinin desteklenmesi' },
    { termDe: 'Pflegeplanung', termTr: 'Bakım planlaması', contextDe: 'Systematische Planung der pflegerischen Maßnahmen', contextTr: 'Hemşirelik önlemlerinin sistematik planlanması' },
    { termDe: 'Dekubitus', termTr: 'Bası yarası', contextDe: 'Druckgeschwür durch langes Liegen', contextTr: 'Uzun süre yatmaktan kaynaklanan basınç ülseri' },
    { termDe: 'Thromboseprophylaxe', termTr: 'Tromboz profilaksisi', contextDe: 'Maßnahmen zur Vorbeugung von Blutgerinnseln', contextTr: 'Kan pıhtılarını önleme tedbirleri' },
    { termDe: 'Sturzprophylaxe', termTr: 'Düşme profilaksisi', contextDe: 'Maßnahmen zur Vermeidung von Stürzen', contextTr: 'Düşmeleri önleme tedbirleri' },
    { termDe: 'Wundversorgung', termTr: 'Yara bakımı', contextDe: 'Pflegerische Versorgung und Behandlung von Wunden', contextTr: 'Yaraların hemşirelik bakımı ve tedavisi' },
    { termDe: 'Dokumentation', termTr: 'Dokümantasyon', contextDe: 'Schriftliche Erfassung aller pflegerischen Maßnahmen', contextTr: 'Tüm hemşirelik önlemlerinin yazılı olarak kayıt altına alınması' },
    { termDe: 'Übergabe', termTr: 'Devir teslim', contextDe: 'Informationsweitergabe zwischen Pflegekräften bei Schichtwechsel', contextTr: 'Vardiya değişiminde hemşireler arasındaki bilgi aktarımı' },
    { termDe: 'Patientenverfügung', termTr: 'Hasta vasiyetnamesi', contextDe: 'Schriftliche Vorausverfügung über medizinische Maßnahmen', contextTr: 'Tıbbi önlemler hakkında yazılı ön talimatname' },
    { termDe: 'Pflegediagnose', termTr: 'Hemşirelik tanısı', contextDe: 'Klinische Beurteilung der Reaktion eines Patienten auf Gesundheitsprobleme', contextTr: 'Hastanın sağlık sorunlarına verdiği tepkinin klinik değerlendirmesi' },
  ];

  for (const term of glossaryTerms) {
    await prisma.glossaryTerm.upsert({
      where: { id: term.termDe.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-id' },
      update: { ...term },
      create: { ...term },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
