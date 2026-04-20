/**
 * Topic categories derived from i-care Pflegeexamen Kompakt handbook.
 * These represent the main content areas that can be used to generate simulations.
 */

export interface TopicCategory {
  id: string;
  titleDe: string;
  titleTr: string;
  descriptionDe: string;
  descriptionTr: string;
  keywords: string[]; // Used for RAG retrieval
  icon: string; // Lucide icon name
}

export const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    id: 'professionelle_pflege',
    titleDe: 'Professionelle Pflege',
    titleTr: 'Profesyonel Hemşirelik',
    descriptionDe: 'Pflegewissenschaft, Pflegeprozess, Pflegemodelle und professionelles Handeln',
    descriptionTr: 'Hemşirelik bilimi, bakım süreci, bakım modelleri ve profesyonel uygulama',
    keywords: ['professionelle pflege', 'pflegewissenschaft', 'pflegeprozess', 'pflegemodelle', 'pflegeausbildung'],
    icon: 'Stethoscope',
  },
  {
    id: 'kommunikation_beratung',
    titleDe: 'Kommunikation & Beratung',
    titleTr: 'İletişim ve Danışmanlık',
    descriptionDe: 'Patientengespräche, Beratung, Angehörigenarbeit und interprofessionelle Kommunikation',
    descriptionTr: 'Hasta görüşmeleri, danışmanlık, yakınlarla çalışma ve meslekler arası iletişim',
    keywords: ['kommunikation', 'beratung', 'patientengespräch', 'angehörige', 'gesprächsführung'],
    icon: 'MessageSquare',
  },
  {
    id: 'hygiene_infektionslehre',
    titleDe: 'Hygiene & Infektionslehre',
    titleTr: 'Hijyen ve Enfeksiyon Bilimi',
    descriptionDe: 'Standardhygiene, Desinfektion, Sterilisation und Infektionsprävention',
    descriptionTr: 'Standart hijyen, dezenfeksiyon, sterilizasyon ve enfeksiyon önleme',
    keywords: ['hygiene', 'infektionslehre', 'standardhygiene', 'desinfektion', 'sterilisation', 'nosokomiale infektionen'],
    icon: 'ShieldCheck',
  },
  {
    id: 'vitalzeichen_diagnostik',
    titleDe: 'Vitalzeichen & Diagnostik',
    titleTr: 'Yaşamsal Bulgular ve Tanı',
    descriptionDe: 'Vitalzeichenkontrolle, Blutdruck, Puls, Temperatur, Blutzucker und Diagnostik',
    descriptionTr: 'Yaşamsal bulgu kontrolleri, tansiyon, nabız, ateş, kan şekeri ve tanı yöntemleri',
    keywords: ['vitalzeichen', 'blutdruck', 'puls', 'temperatur', 'blutzucker', 'diagnostik', 'monitoring'],
    icon: 'Activity',
  },
  {
    id: 'medikamente_injektionen',
    titleDe: 'Medikamente & Injektionen',
    titleTr: 'İlaçlar ve Enjeksiyonlar',
    descriptionDe: 'Medikamentenmanagement, Injektionstechniken, Blutentnahme und Gefäßzugänge',
    descriptionTr: 'İlaç yönetimi, enjeksiyon teknikleri, kan alma ve damar erişimi',
    keywords: ['injektionen', 'blutentnahme', 'gefäßzugänge', 'medikamente', 'infusion', 'subkutan', 'intramuskulär'],
    icon: 'Syringe',
  },
  {
    id: 'pflege_alter',
    titleDe: 'Pflege im Alter',
    titleTr: 'Yaşlı Bakımı',
    descriptionDe: 'Geriatrische Pflege, Demenz, Sturzprophylaxe und altersbedingte Erkrankungen',
    descriptionTr: 'Geriatrik bakım, demans, düşme önleme ve yaşa bağlı hastalıklar',
    keywords: ['pflege im alter', 'altern', 'geriatrie', 'demenz', 'sturzprophylaxe', 'inkontinenz'],
    icon: 'Heart',
  },
  {
    id: 'chronische_erkrankungen',
    titleDe: 'Chronische Erkrankungen',
    titleTr: 'Kronik Hastalıklar',
    descriptionDe: 'Diabetes, Herzinsuffizienz, COPD, chronische Wunden und Multimorbidität',
    descriptionTr: 'Diyabet, kalp yetmezliği, KOAH, kronik yaralar ve çoklu hastalıklar',
    keywords: ['chronisch kranke', 'diabetes', 'herzinsuffizienz', 'copd', 'multimorbide', 'chronische wunden'],
    icon: 'HeartPulse',
  },
  {
    id: 'herz_kreislauf',
    titleDe: 'Herz-Kreislauf-System',
    titleTr: 'Kardiyovasküler Sistem',
    descriptionDe: 'Herzerkrankungen, Blutdruck, Rhythmusstörungen und Gefäßerkrankungen',
    descriptionTr: 'Kalp hastalıkları, tansiyon, ritim bozuklukları ve damar hastalıkları',
    keywords: ['herzerkrankungen', 'herz', 'kreislauf', 'gefäßsystem', 'blutdruck', 'rhythmusstörungen'],
    icon: 'HeartPulse',
  },
  {
    id: 'wundversorgung',
    titleDe: 'Wundversorgung & Verbände',
    titleTr: 'Yara Bakımı ve Pansumanlar',
    descriptionDe: 'Wundbeurteilung, Wundheilung, Verbandwechsel und Dekubitusprophylaxe',
    descriptionTr: 'Yara değerlendirme, yara iyileşmesi, pansuman değişimi ve bası yarası önleme',
    keywords: ['wundversorgung', 'verbandwechsel', 'dekubitus', 'wundheilung', 'wundbeurteilung'],
    icon: 'Bandage',
  },
  {
    id: 'notfallsituationen',
    titleDe: 'Notfallsituationen',
    titleTr: 'Acil Durumlar',
    descriptionDe: 'Reanimation, Schock, akute Atemnot, Bewusstseinsstörungen und Erste Hilfe',
    descriptionTr: 'Resüsitasyon, şok, akut nefes darlığı, bilinç bozuklukları ve ilk yardım',
    keywords: ['notfall', 'reanimation', 'schock', 'atemnot', 'bewusstlosigkeit', 'erste hilfe'],
    icon: 'AlertTriangle',
  },
  {
    id: 'pflegeplanung_dokumentation',
    titleDe: 'Pflegeplanung & Dokumentation',
    titleTr: 'Bakım Planlaması ve Dokümantasyon',
    descriptionDe: 'Pflegeanamnese, Pflegeplanung, Pflegebericht und Übergabe',
    descriptionTr: 'Bakım anamnezi, bakım planlaması, bakım raporu ve devir teslim',
    keywords: ['pflegeplanung', 'dokumentation', 'pflegeanamnese', 'pflegebericht', 'übergabe'],
    icon: 'ClipboardList',
  },
  {
    id: 'schmerzmanagement',
    titleDe: 'Schmerzmanagement',
    titleTr: 'Ağrı Yönetimi',
    descriptionDe: 'Schmerzerfassung, Schmerztherapie, medikamentöse und nicht-medikamentöse Maßnahmen',
    descriptionTr: 'Ağrı değerlendirme, ağrı tedavisi, ilaçlı ve ilaçsız önlemler',
    keywords: ['schmerz', 'schmerzmanagement', 'schmerzerfassung', 'schmerztherapie', 'analgetika'],
    icon: 'Thermometer',
  },
];

export const DIFFICULTY_LEVELS = [
  { id: 'beginner', labelDe: 'Einsteiger', labelTr: 'Başlangıç', color: 'bg-green-500/10 text-green-700', badgeVariant: 'secondary' as const },
  { id: 'intermediate', labelDe: 'Mittel', labelTr: 'Orta', color: 'bg-blue-500/10 text-blue-700', badgeVariant: 'default' as const },
  { id: 'advanced', labelDe: 'Fortgeschritten', labelTr: 'İleri', color: 'bg-orange-500/10 text-orange-700', badgeVariant: 'destructive' as const },
];

export const SIMULATION_TYPES = [
  { id: 'oral_exam', labelDe: 'Mündliche Prüfung', labelTr: 'Sözlü Sınav', icon: 'MessageSquare' },
  { id: 'patient_conversation', labelDe: 'Patientengespräch', labelTr: 'Hasta Görüşmesi', icon: 'Users' },
  { id: 'written_task', labelDe: 'Schriftliche Aufgabe', labelTr: 'Yazılı Görev', icon: 'PenTool' },
  { id: 'documentation', labelDe: 'Dokumentation', labelTr: 'Dokümantasyon', icon: 'ClipboardList' },
];
