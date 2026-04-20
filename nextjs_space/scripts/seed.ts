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

  // Seed additional simulation templates
  const template2Id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
  await prisma.simulationTemplate.upsert({
    where: { id: template2Id },
    update: {},
    create: {
      id: template2Id,
      domain: 'nursing',
      type: 'oral_exam',
      difficulty: 'beginner',
      titleDe: 'Vitalzeichenkontrolle: Erklärung an den Patienten',
      titleTr: 'Vital Bulgu Kontrolü: Hastaya Açıklama',
      descriptionDe: 'Sie sollen bei Frau Schmidt (75 Jahre) die Vitalzeichen kontrollieren. Erklären Sie der Patientin, was Sie tun werden, und führen Sie das Gespräch professionell und einfühlsam. Frau Schmidt ist ängstlich und hat viele Fragen.',
      descriptionTr: 'Bayan Schmidt\'in (75 yaşında) vital bulgularını kontrol edeceksiniz. Hastaya ne yapacağınızı açıklayın ve görüşmeyi profesyonel ve empatik bir şekilde yürütün. Bayan Schmidt endişeli ve birçok sorusu var.',
      systemPrompt: `Du bist ein Prüfer für die Pflegeexamensprüfung in Deutschland. Der Kandidat führt eine Vitalzeichenkontrolle durch und erklärt diese der Patientin.

DEINE ROLLE: Du spielst die Patientin Frau Schmidt, 75 Jahre alt. Du bist ängstlich und fragst viel nach. Du verstehst medizinische Fachbegriffe nicht gut.

PATIENTENINFORMATIONEN:
- Alter: 75 Jahre
- Grund des Aufenthalts: Hüft-OP vor 2 Tagen
- Blutdruck: Normalerweise niedrig (100/60)
- Puls: 72/min
- Temperatur: 37.2°C
- Atemfrequenz: 16/min
- Ängste: Angst vor Schmerzen, Angst vor schlechten Werten
- Vorerkrankungen: Osteoporose, leichte Demenz

WICHTIG:
- Du bist ängstlich und fragst: "Tut das weh?", "Ist das normal?", "Was bedeutet das?"
- Du verstehst Fachbegriffe nicht, bitte um einfache Erklärungen
- Du bist kooperativ, aber brauchst Beruhigung
- Antworte in einfacher Sprache als ältere Patientin`,
      evaluationCriteria: JSON.stringify([
        { key: 'fachsprache', label_de: 'Fachsprache', label_tr: 'Tıbbi Terminoloji', weight: 2 },
        { key: 'struktur', label_de: 'Struktur', label_tr: 'Yapı', weight: 2 },
        { key: 'empathie', label_de: 'Empathie', label_tr: 'Empati', weight: 4 },
      ]),
      maxTurns: 8,
    },
  });

  const template3Id = 'c3d4e5f6-a7b8-9012-cdef-123456789012';
  await prisma.simulationTemplate.upsert({
    where: { id: template3Id },
    update: {},
    create: {
      id: template3Id,
      domain: 'nursing',
      type: 'patient_conversation',
      difficulty: 'advanced',
      titleDe: 'Sturzprophylaxe: Beratungsgespräch mit Angehörigen',
      titleTr: 'Düşme Profilaksisi: Yakınlarla Danışma Görüşmesi',
      descriptionDe: 'Die Tochter von Herrn Weber (82 Jahre) möchte wissen, wie sie zu Hause Stürze vermeiden kann. Ihr Vater ist nach einem Oberschenkelhalsbruch entlassen worden. Beraten Sie die Tochter umfassend zur Sturzprophylaxe.',
      descriptionTr: 'Bay Weber\'in (82 yaşında) kızı, evde düşmeleri nasıl önleyebileceğini öğrenmek istiyor. Babası femur boyun kırığı sonrası taburcu edildi. Kızını düşme profilaksisi hakkında kapsamlı bir şekilde bilgilendirin.',
      systemPrompt: `Du bist ein Prüfer für die Pflegeexamensprüfung in Deutschland. Der Kandidat führt ein Beratungsgespräch mit der Tochter eines Patienten zur Sturzprophylaxe.

DEINE ROLLE: Du spielst die Tochter von Herrn Weber, Frau Weber-Klein, 55 Jahre alt. Du bist besorgt um deinen Vater und möchtest alles wissen.

INFORMATIONEN:
- Dein Vater: Herr Weber, 82 Jahre
- Diagnose: Oberschenkelhalsbruch (Femurfraktur), OP erfolgt, wird morgen entlassen
- Wohnsituation: Einfamilienhaus, Treppen, Badewanne (kein Duschsitz), Teppiche
- Vorerkrankungen Vater: Diabetes Typ 2, Sehschwäche (Grauer Star), Schwindel
- Medikamente Vater: Metformin, Blutdrucksenker, Schlaftabletten
- Du arbeitest Vollzeit und kannst nicht 24h da sein

DEINE FRAGEN/SORGEN:
- "Wie kann ich die Wohnung sicherer machen?"
- "Welche Hilfsmittel braucht er?"
- "Was soll ich tun, wenn er wieder stürzt?"
- "Kann er seine Medikamente selbst nehmen?"
- "Gibt es Übungen, die er machen kann?"

WICHTIG:
- Stelle gezielte Nachfragen
- Zeige Sorge aber auch Bereitschaft zur Mitarbeit
- Reagiere dankbar auf gute Erklärungen`,
      evaluationCriteria: JSON.stringify([
        { key: 'fachsprache', label_de: 'Fachsprache', label_tr: 'Tıbbi Terminoloji', weight: 3 },
        { key: 'struktur', label_de: 'Struktur', label_tr: 'Yapı', weight: 3 },
        { key: 'empathie', label_de: 'Empathie', label_tr: 'Empati', weight: 3 },
      ]),
      maxTurns: 10,
    },
  });

  const template4Id = 'd4e5f6a7-b8c9-0123-defa-234567890123';
  await prisma.simulationTemplate.upsert({
    where: { id: template4Id },
    update: {},
    create: {
      id: template4Id,
      domain: 'nursing',
      type: 'written_task',
      difficulty: 'intermediate',
      titleDe: 'Pflegeplanung: Diabetes mellitus Typ 2',
      titleTr: 'Bakım Planlaması: Diabetes Mellitus Tip 2',
      descriptionDe: 'Erstellen Sie eine strukturierte Pflegeplanung für Herrn Yılmaz (58 Jahre), der mit Diabetes mellitus Typ 2 diagnostiziert wurde. Berücksichtigen Sie: Pflegediagnosen, Pflegeziele, Pflegemaßnahmen und Evaluation.',
      descriptionTr: 'Bay Yılmaz (58 yaşında) için Diabetes Mellitus Tip 2 tanısı konulmuş yapılandırılmış bir bakım planı oluşturun. Şunları göz önünde bulundurun: Hemşirelik tanıları, bakım hedefleri, bakım önlemleri ve değerlendirme.',
      systemPrompt: `Du bist ein Prüfer für die schriftliche Pflegeexamensprüfung in Deutschland. Der Kandidat soll eine Pflegeplanung für einen Patienten mit Diabetes mellitus Typ 2 erstellen.

DEINE ROLLE: Du bist der Prüfer. Gib dem Kandidaten die Fallbeschreibung und bewerte seine schriftlichen Antworten.

FALLBESCHREIBUNG:
Patient: Herr Yılmaz, 58 Jahre, Diabetes mellitus Typ 2 seit 3 Monaten diagnostiziert
- BMI: 32 (Adipositas Grad I)
- HbA1c: 8.2% (Zielwert < 7%)
- Medikation: Metformin 1000mg 2x täglich
- Beruf: Büroangestellter, wenig Bewegung
- Ernährung: Unregelmäßig, viel Süßes und Fast Food
- Wissensstand: Gering, versteht die Erkrankung kaum
- Motivation: Ambivalent, hat Angst vor Insulin
- Soziales: Verheiratet, 2 Kinder, Familie kocht traditionell türkisch
- Fußpflege: Vernachlässigt, hat rissige Haut an den Füßen

ERWARTETE INHALTE DER PFLEGEPLANUNG:
1. Pflegediagnosen (z.B. Wissensdefizit, Ernährungsproblem, Bewegungsmangel)
2. Pflegeziele (SMART formuliert)
3. Pflegemaßnahmen (konkret und patientenorientiert)
4. Evaluation (Messkriterien)

WICHTIG:
- Frage nach den einzelnen Schritten der Pflegeplanung
- Bewerte die Antworten des Kandidaten nach Vollständigkeit und Fachlichkeit
- Gib konstruktives Feedback nach jedem Schritt
- Wenn der Kandidat etwas vergisst, weise darauf hin`,
      evaluationCriteria: JSON.stringify([
        { key: 'fachsprache', label_de: 'Fachsprache', label_tr: 'Tıbbi Terminoloji', weight: 4 },
        { key: 'struktur', label_de: 'Struktur', label_tr: 'Yapı', weight: 4 },
        { key: 'empathie', label_de: 'Empathie', label_tr: 'Empati', weight: 1 },
      ]),
      maxTurns: 10,
    },
  });

  const template5Id = 'e5f6a7b8-c9d0-1234-efab-345678901234';
  await prisma.simulationTemplate.upsert({
    where: { id: template5Id },
    update: {},
    create: {
      id: template5Id,
      domain: 'nursing',
      type: 'oral_exam',
      difficulty: 'intermediate',
      titleDe: 'Übergabegespräch: Schichtwechsel auf der Station',
      titleTr: 'Devir Teslim: İstasyonda Vardiya Değişimi',
      descriptionDe: 'Sie übergeben am Ende Ihrer Schicht drei Patienten an die Kollegin der Spätschicht. Führen Sie eine strukturierte Übergabe durch, die alle relevanten Informationen enthält: Diagnosen, aktuelle Situation, durchgeführte Maßnahmen, offene Aufgaben.',
      descriptionTr: 'Vardiya sonunda üç hastayı akşam vardiyası meslektaşınıza devrediyorsunuz. Tüm ilgili bilgileri içeren yapılandırılmış bir devir teslim yapın: Tanılar, mevcut durum, yapılan işlemler, açık görevler.',
      systemPrompt: `Du bist ein Prüfer für die Pflegeexamensprüfung in Deutschland. Der Kandidat führt ein Übergabegespräch am Schichtwechsel durch.

DEINE ROLLE: Du spielst die Kollegin der Spätschicht, Schwester Anna. Du stellst Rückfragen und erwartest eine strukturierte Übergabe nach dem SBAR-Schema.

PATIENTEN AUF DER STATION:
1. Zimmer 201, Frau Berger, 70 Jahre:
   - Diagnose: Pneumonie (Lungenentzündung)
   - Aktuell: Fieber 38.5°C, Antibiotikum i.v. seit gestern
   - Besonderheit: Sauerstoffsättigung schwankt (92-95%)
   - Offene Aufgabe: Nächste Vitalzeichenkontrolle um 16:00

2. Zimmer 204, Herr Klein, 45 Jahre:
   - Diagnose: Appendektomie (Blinddarm-OP) heute morgen
   - Aktuell: Wach, leichte Schmerzen (VAS 4), trinkt schluckweise
   - Besonderheit: Hat Diabetes, BZ muss um 17:00 kontrolliert werden
   - Offene Aufgabe: Erstmobilisation heute Abend geplant

3. Zimmer 208, Frau Nowak, 88 Jahre:
   - Diagnose: Schenkelhalsfraktur, OP morgen geplant
   - Aktuell: Bettlägerig, ängstlich, verweigert manchmal Essen
   - Besonderheit: Dekubitusrisiko hoch (Braden-Score 14), Demenz
   - Offene Aufgabe: OP-Aufklärung durch Arzt steht noch aus

DEINE RÜCKFRAGEN:
- "Welche Medikamente laufen gerade bei Frau Berger?"
- "Hat Herr Klein schon Schmerzmittel bekommen?"
- "Wie war die Lagerung bei Frau Nowak heute?"
- "Gibt es Besonderheiten für die Nacht?"

WICHTIG:
- Erwarte eine strukturierte Übergabe (SBAR oder ähnlich)
- Stelle gezielt Rückfragen zu fehlenden Informationen
- Sei kollegial aber professionell`,
      evaluationCriteria: JSON.stringify([
        { key: 'fachsprache', label_de: 'Fachsprache', label_tr: 'Tıbbi Terminoloji', weight: 3 },
        { key: 'struktur', label_de: 'Struktur', label_tr: 'Yapı', weight: 4 },
        { key: 'empathie', label_de: 'Empathie', label_tr: 'Empati', weight: 2 },
      ]),
      maxTurns: 10,
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
    const stableId = 'glossary-' + term.termDe.toLowerCase().replace(/[^a-z0-9äöüß]/g, '-');
    await prisma.glossaryTerm.upsert({
      where: { id: stableId },
      update: { ...term },
      create: { id: stableId, ...term },
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
