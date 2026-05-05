export type Language = "en" | "te";

export interface PricingRow {
  id: string;
  kgs: number;
  price: number;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
}

export interface VegetableStock {
  id: string;
  farmerId: string;
  vegetableId: string; // Restored to single ID
  date: string;
  importedBags: number;
  oldBags?: number;
  totalKgs: number;
  oldKgs?: number;
  pricingRows: PricingRow[];
  soldBags: number;
  soldKgs: number;
  expenses: Expense[];
  createdAt: string;
}

export interface Farmer {
  id: string;
  name: string;
  phone?: string;
  createdAt: string;
}

export interface VegetableInfo {
  id: string;
  nameEn: string;
  nameTe: string;
  emoji: string;
}

export const VEGETABLES: VegetableInfo[] = [
  { id: "aanaba_kayalu", nameEn: "AANABA KAYALU", nameTe: "ఆనబ కాయలు", emoji: "" },
  { id: "aariti_gelalu", nameEn: "AARITI GELALU", nameTe: "ఆరటి గెలలు", emoji: "" },
  { id: "aakakara_kayalu", nameEn: "AAKAKARA KAYALU", nameTe: "ఆకాకర కాయలు", emoji: "" },
  { id: "allam", nameEn: "ALLAM", nameTe: "అల్లం", emoji: "" },
  { id: "bangala_dumpalu", nameEn: "BANGALA DUMPALU", nameTe: "బంగాళాదుంపలు", emoji: "" },
  { id: "benda_kayalu", nameEn: "BENDA KAYALU", nameTe: "బెండకాయలు", emoji: "" },
  { id: "beera_kayalu", nameEn: "BEERA KAYALU", nameTe: "బీరకాయలు", emoji: "" },
  { id: "budida_gummadi_kayalu", nameEn: "BUDIDA GUMMADI KAYALU", nameTe: "బూడిద గుమ్మడి కాయలు", emoji: "" },
  { id: "broccolis", nameEn: "BROCCOLIS", nameTe: "బ్రోకలీ", emoji: "" },
  { id: "beans", nameEn: "BEANS", nameTe: "బీన్స్", emoji: "" },
  { id: "bobbarlu", nameEn: "BOBBARLU", nameTe: "బొబ్బర్లు", emoji: "" },
  { id: "boppai_kayalu", nameEn: "BOPPAI KAYALU", nameTe: "బొప్పాయి కాయలు", emoji: "" },
  { id: "batanis", nameEn: "BATANIS", nameTe: "బఠానీలు", emoji: "" },
  { id: "beetroots", nameEn: "BEETROOTS", nameTe: "బీట్రూట్స్", emoji: "" },
  { id: "carrot_washing", nameEn: "CARROT-WASHING", nameTe: "క్యారెట్ వాషింగ్", emoji: "" },
  { id: "cabbaje", nameEn: "CABBAJE", nameTe: "క్యాబేజీ", emoji: "" },
  { id: "chilukada_dumpalu", nameEn: "CHILUKADA DUMPALU", nameTe: "చిలకడ దుంపలు", emoji: "" },
  { id: "ceeras", nameEn: "CEERAS", nameTe: "చీరస్", emoji: "" },
  { id: "chikkudu_kayalu", nameEn: "CHIKKUDU KAYALU", nameTe: "చిక్కుడు కాయలు", emoji: "" },
  { id: "chinta_kayalu", nameEn: "CHINTA KAYALU", nameTe: "చింత కాయలు", emoji: "" },
  { id: "chakkarakeli_gelalu", nameEn: "CHAKKARAKELI GELALU", nameTe: "చక్కరకేళి గెలలు", emoji: "" },
  { id: "cauli_flowers", nameEn: "CAULI FLOWERS", nameTe: "కాలీఫ్లవర్స్", emoji: "" },
  { id: "chaama_dumpalu", nameEn: "CHAAMA DUMPALU", nameTe: "చామ దుంపలు", emoji: "" },
  { id: "capsicums", nameEn: "CAPSICUMS", nameTe: "క్యాప్సికమ్స్", emoji: "" },
  { id: "carrots", nameEn: "CARROTS", nameTe: "క్యారెట్లు", emoji: "" },
  { id: "chow_chow_lu", nameEn: "CHOW CHOW LU", nameTe: "చౌ చౌ లు", emoji: "" },
  { id: "donda_kayalu", nameEn: "DONDA KAYALU", nameTe: "దొండకాయలు", emoji: "" },
  { id: "dosa_kayalu", nameEn: "DOSA KAYALU", nameTe: "దోసకాయలు", emoji: "" },
  { id: "goru_chikkudu", nameEn: "GORU CHIKKUDU", nameTe: "గోరు చిక్కుడు", emoji: "" },
  { id: "ginjalu", nameEn: "GINJALU", nameTe: "గింజలు", emoji: "" },
  { id: "gomgura", nameEn: "GOMGURA", nameTe: "గోంగూర", emoji: "" },
  { id: "gummadi_kayalu", nameEn: "GUMMADI KAYALU", nameTe: "గుమ్మడి కాయలు", emoji: "" },
  { id: "jeedi_ginjalu", nameEn: "JEEDI GINJALU", nameTe: "జీడి గింజలు", emoji: "" },
  { id: "jamakayalu", nameEn: "JAMAKAYALU", nameTe: "జామకాయలు", emoji: "" },
  { id: "kakara_kayalu", nameEn: "KAKARA KAYALU", nameTe: "కాకర కాయలు", emoji: "" },
  { id: "kanupu_chikkudu", nameEn: "KANUPU CHIKKUDU", nameTe: "కనుపు చిక్కుడు", emoji: "" },
  { id: "kandha_dumpalu", nameEn: "KANDHA DUMPALU", nameTe: "కంద దుంపలు", emoji: "" },
  { id: "kothimera", nameEn: "KOTHIMERA", nameTe: "కొత్తిమీర", emoji: "" },
  { id: "karpura_ariti", nameEn: "KARPURA ARITI", nameTe: "కర్పూర ఆరటి", emoji: "" },
  { id: "karivepaku", nameEn: "KARIVEPAKU", nameTe: "కరివేపాకు", emoji: "" },
  { id: "mamidi_kayalu", nameEn: "MAMIDI KAYALU", nameTe: "మామిడి కాయలు", emoji: "" },
  { id: "mullangi_dumpalu", nameEn: "MULLANGI DUMPALU", nameTe: "ముల్లంగి దుంపలు", emoji: "" },
  { id: "mokka_jonna", nameEn: "MOKKA JONNA", nameTe: "మొక్క జొన్న", emoji: "" },
  { id: "merchi", nameEn: "MERCHI", nameTe: "మిర్చి", emoji: "" },
  { id: "maredu_kayalu", nameEn: "MAREDU KAYALU", nameTe: "మారేడు కాయలు", emoji: "" },
  { id: "munaga_kayalu", nameEn: "MUNAGA KAYALU", nameTe: "మునగ కాయలు", emoji: "" },
  { id: "nimma_kayalu", nameEn: "NIMMA KAYALU", nameTe: "నిమ్మకాయలు", emoji: "" },
  { id: "paala_kuura", nameEn: "PAALA KUURA", nameTe: "పాలకూర", emoji: "" },
  { id: "pandu_merchi", nameEn: "PANDU MERCHI", nameTe: "పండు మిర్చి", emoji: "" },
  { id: "panasa_kayalu", nameEn: "PANASA KAYALU", nameTe: "పనస కాయలు", emoji: "" },
  { id: "potla_kayalu", nameEn: "POTLA KAYALU", nameTe: "పొట్లకాయలు", emoji: "" },
  { id: "pendlam_dumpalu", nameEn: "PENDLAM DUMPALU", nameTe: "పెండ్లం దుంపలు", emoji: "" },
  { id: "potals", nameEn: "POTALS", nameTe: "పోటల్స్", emoji: "" },
  { id: "pudina", nameEn: "PUDINA", nameTe: "పుదీనా", emoji: "" },
  { id: "reegupallu", nameEn: "REEGUPALLU", nameTe: "రేగుపళ్ళు", emoji: "" },
  { id: "bajji_merchi", nameEn: "BAJJI MERCHI", nameTe: "బజ్జీ మిర్చి", emoji: "" },
  { id: "sora_kayalu", nameEn: "SORA KAYALU", nameTe: "సొరకాయలు", emoji: "" },
  { id: "sweet_corns", nameEn: "SWEET CORNS", nameTe: "స్వీట్ కార్న్స్", emoji: "" },
  { id: "thota_kura", nameEn: "THOTA KURA", nameTe: "తోటకూర", emoji: "" },
  { id: "tomatos", nameEn: "TOMATOS", nameTe: "టమోటాలు", emoji: "" },
  { id: "tella_vankayalu", nameEn: "TELLA VANKAYALU", nameTe: "తెల్ల వంకాయలు", emoji: "" },
  { id: "ulli_payalu", nameEn: "ULLI PAYALU", nameTe: "ఉల్లిపాయలు", emoji: "" },
  { id: "usiri_kayalu", nameEn: "USIRI KAYALU", nameTe: "ఉసిరి కాయలు", emoji: "" },
  { id: "villuli_payalu", nameEn: "VILLULI PAYALU", nameTe: "వెల్లుల్లి పాయలు", emoji: "" },
  { id: "pennada_vankayalu", nameEn: "PENNADA VANKAYALU", nameTe: "పెన్నాడ వంకాయలు", emoji: "" },
  { id: "vankayalu", nameEn: "VANKAYALU", nameTe: "వంకాయలు", emoji: "" },
  { id: "velaga_kayalu", nameEn: "VELAGA KAYALU", nameTe: "వెలగ కాయలు", emoji: "" },
];
