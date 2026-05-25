import type { ShoppingSection } from "./types";
import { normalizeText, singularize } from "./normalize";

type CatalogEntry = {
  name: string;
  section: ShoppingSection;
  aliases?: string[];
};

type ProductMatch = {
  normalizedName: string;
  displayName: string;
  section: ShoppingSection;
  confidence: "exact" | "alias" | "fuzzy" | "unknown";
};

// Base ampliada con taxonomias publicas de Open Food Facts y alias domesticos frecuentes.
// Fuente: https://github.com/openfoodfacts/openfoodfacts-server/tree/main/taxonomies/food
export const PRODUCT_CATALOG: CatalogEntry[] = [
  { name: "Aceite de oliva", section: "Despensa", aliases: ["aceite", "aceite oliva"] },
  { name: "Aceitunas", section: "Conservas", aliases: ["aceituna"] },
  { name: "Agua", section: "Bebidas" },
  { name: "Aguacate", section: "Fruta y verdura", aliases: ["aguacates"] },
  { name: "Ajo", section: "Fruta y verdura", aliases: ["ajos"] },
  { name: "Albondigas", section: "Carniceria", aliases: ["albondiga"] },
  { name: "Arroz", section: "Pasta, arroz y legumbres" },
  { name: "Atun", section: "Conservas", aliases: ["atun en lata", "latas de atun"] },
  { name: "Azucar", section: "Despensa" },
  { name: "Bacon", section: "Carniceria", aliases: ["beicon"] },
  { name: "Barra de pan", section: "Panaderia", aliases: ["barra"] },
  { name: "Batido", section: "Lacteos y huevos", aliases: ["batidos"] },
  { name: "Berenjena", section: "Fruta y verdura", aliases: ["berenjenas"] },
  { name: "Bolleria", section: "Panaderia", aliases: ["bollos", "bollo"] },
  { name: "Brocoli", section: "Fruta y verdura" },
  { name: "Cacao", section: "Desayuno y dulces", aliases: ["cola cao", "colacao"] },
  { name: "Cafe", section: "Despensa" },
  { name: "Calabacin", section: "Fruta y verdura", aliases: ["calabacines"] },
  { name: "Caldo", section: "Despensa", aliases: ["caldos"] },
  { name: "Carne para guisar", section: "Carniceria", aliases: ["carne guisar", "carne de guisar"] },
  { name: "Cebolla", section: "Fruta y verdura", aliases: ["cebollas"] },
  { name: "Cereal", section: "Desayuno y dulces", aliases: ["cereales"] },
  { name: "Cerveza", section: "Bebidas", aliases: ["cervezas"] },
  { name: "Champiñones", section: "Fruta y verdura", aliases: ["champiñon", "champinon", "champinones"] },
  { name: "Chocolate", section: "Desayuno y dulces", aliases: ["chocolates"] },
  { name: "Chorizo", section: "Charcuteria" },
  { name: "Chuletas", section: "Carniceria", aliases: ["chuleta"] },
  { name: "Coca-Cola", section: "Bebidas", aliases: ["coca cola", "cocacola", "coca"] },
  { name: "Coliflor", section: "Fruta y verdura" },
  { name: "Croquetas", section: "Congelados", aliases: ["croqueta"] },
  { name: "Detergente", section: "Limpieza", aliases: ["detergentes"] },
  { name: "Desodorante", section: "Higiene y farmacia", aliases: ["desodorantes"] },
  { name: "Donuts", section: "Desayuno y dulces", aliases: ["donut"] },
  { name: "Empanadillas", section: "Congelados", aliases: ["empanadilla"] },
  { name: "Fanta", section: "Bebidas" },
  { name: "Filetes", section: "Carniceria", aliases: ["filete"] },
  { name: "Fideos", section: "Pasta, arroz y legumbres", aliases: ["fideo"] },
  { name: "Fregasuelos", section: "Limpieza", aliases: ["friegasuelos"] },
  { name: "Fresas", section: "Fruta y verdura", aliases: ["fresa"] },
  { name: "Galletas", section: "Desayuno y dulces", aliases: ["galleta"] },
  { name: "Garbanzos", section: "Pasta, arroz y legumbres", aliases: ["garbanzo"] },
  { name: "Gel", section: "Higiene y farmacia", aliases: ["gel de ducha"] },
  { name: "Helado", section: "Congelados", aliases: ["helados"] },
  { name: "Huevos", section: "Lacteos y huevos", aliases: ["huevo"] },
  { name: "Jamon", section: "Charcuteria", aliases: ["jamon york", "jamon serrano"] },
  { name: "Jabon", section: "Higiene y farmacia", aliases: ["jabones"] },
  { name: "Ketchup", section: "Despensa", aliases: ["kechup", "catchup", "catsup"] },
  { name: "Kiwi", section: "Fruta y verdura", aliases: ["kiwis"] },
  { name: "Leche", section: "Lacteos y huevos", aliases: ["leches"] },
  { name: "Leche sin lactosa", section: "Lacteos y huevos", aliases: ["sin lactosa"] },
  { name: "Lechuga", section: "Fruta y verdura", aliases: ["lechugas"] },
  { name: "Lejia", section: "Limpieza" },
  { name: "Lentejas", section: "Pasta, arroz y legumbres", aliases: ["lenteja"] },
  { name: "Limon", section: "Fruta y verdura", aliases: ["limones"] },
  { name: "Limpiacristales", section: "Limpieza", aliases: ["limpia cristales"] },
  { name: "Lubina", section: "Pescaderia", aliases: ["lubinas"] },
  { name: "Macarrones", section: "Pasta, arroz y legumbres", aliases: ["macarron"] },
  { name: "Magdalenas", section: "Desayuno y dulces", aliases: ["magdalena"] },
  { name: "Mandarinas", section: "Fruta y verdura", aliases: ["mandarina"] },
  { name: "Mantequilla", section: "Lacteos y huevos" },
  { name: "Manzanas", section: "Fruta y verdura", aliases: ["manzana"] },
  { name: "Mayonesa", section: "Despensa", aliases: ["mahonesa", "mayonesa"] },
  { name: "Melon", section: "Fruta y verdura", aliases: ["melones"] },
  { name: "Merluza", section: "Pescaderia" },
  { name: "Mermelada", section: "Desayuno y dulces" },
  { name: "Miel", section: "Despensa" },
  { name: "Mostaza", section: "Despensa" },
  { name: "Naranjas", section: "Fruta y verdura", aliases: ["naranja"] },
  { name: "Nata", section: "Lacteos y huevos" },
  { name: "Pañales", section: "Bebe y mascotas", aliases: ["pañal", "panales", "panal"] },
  { name: "Pan", section: "Panaderia" },
  { name: "Pan de molde", section: "Panaderia", aliases: ["molde"] },
  { name: "Papel albal", section: "Hogar y papel", aliases: ["albal", "papel aluminio"] },
  { name: "Papel cocina", section: "Hogar y papel", aliases: ["rollo cocina"] },
  { name: "Papel higienico", section: "Hogar y papel", aliases: ["papel del baño", "papel de baño", "papel wc"] },
  { name: "Pasta", section: "Pasta, arroz y legumbres" },
  { name: "Pasta de dientes", section: "Higiene y farmacia", aliases: ["pasta dientes", "dentifrico"] },
  { name: "Patatas", section: "Fruta y verdura", aliases: ["patata", "papas"] },
  { name: "Pavo", section: "Charcuteria" },
  { name: "Pepino", section: "Fruta y verdura", aliases: ["pepinos"] },
  { name: "Peras", section: "Fruta y verdura", aliases: ["pera"] },
  { name: "Pescado", section: "Pescaderia" },
  { name: "Picos", section: "Panaderia" },
  { name: "Pimientos", section: "Fruta y verdura", aliases: ["pimiento"] },
  { name: "Pizza congelada", section: "Congelados", aliases: ["pizza"] },
  { name: "Platano", section: "Fruta y verdura", aliases: ["platanos", "bananas", "banana"] },
  { name: "Pollo", section: "Carniceria" },
  { name: "Potitos", section: "Bebe y mascotas", aliases: ["potito", "comida bebe", "comida para bebe"] },
  { name: "Queso", section: "Lacteos y huevos", aliases: ["quesos"] },
  { name: "Refresco", section: "Bebidas", aliases: ["refrescos"] },
  { name: "Sal", section: "Despensa" },
  { name: "Salchichas", section: "Carniceria", aliases: ["salchicha"] },
  { name: "Salmon", section: "Pescaderia" },
  { name: "Sandia", section: "Fruta y verdura" },
  { name: "Servilletas", section: "Hogar y papel", aliases: ["servilleta"] },
  { name: "Suavizante", section: "Limpieza", aliases: ["suavizantes"] },
  { name: "Ternera", section: "Carniceria" },
  { name: "Toallitas", section: "Bebe y mascotas", aliases: ["toallitas bebe", "toallitas de bebe"] },
  { name: "Tomates", section: "Fruta y verdura", aliases: ["tomate"] },
  { name: "Tortillas de trigo", section: "Panaderia", aliases: ["tortilla trigo", "wraps"] },
  { name: "Uvas", section: "Fruta y verdura", aliases: ["uva"] },
  { name: "Vino", section: "Bebidas" },
  { name: "Yogur", section: "Lacteos y huevos", aliases: ["yogures", "yogurt"] },
  { name: "Zanahorias", section: "Fruta y verdura", aliases: ["zanahoria"] },
  { name: "Zumo", section: "Bebidas", aliases: ["zumos"] },
];

const ENTRY_BY_TERM = new Map<string, CatalogEntry>();
const ALIAS_TERMS = new Set<string>();

for (const entry of PRODUCT_CATALOG) {
  const terms = [entry.name, ...(entry.aliases ?? [])];
  for (const term of terms) {
    const normalized = singularize(term);
    ENTRY_BY_TERM.set(normalized, entry);
    if (term !== entry.name) {
      ALIAS_TERMS.add(normalized);
    }
  }
}

export const PRODUCT_SEARCH_TERMS = Array.from(ENTRY_BY_TERM.keys());

const EMPTY_SECTION_TERMS: Record<ShoppingSection, string[]> = {
  "Fruta y verdura": [],
  Panaderia: [],
  Carniceria: [],
  Pescaderia: [],
  Charcuteria: [],
  "Lacteos y huevos": [],
  Congelados: [],
  Despensa: [],
  "Pasta, arroz y legumbres": [],
  Conservas: [],
  "Desayuno y dulces": [],
  Bebidas: [],
  Limpieza: [],
  "Hogar y papel": [],
  "Higiene y farmacia": [],
  "Bebe y mascotas": [],
  Otros: [],
};

export const CATALOG_SECTION_TERMS = PRODUCT_CATALOG.reduce<Record<ShoppingSection, string[]>>(
  (acc, entry) => {
    const terms = [entry.name, ...(entry.aliases ?? [])].map((term) => singularize(term));
    acc[entry.section].push(...terms);
    return acc;
  },
  EMPTY_SECTION_TERMS,
);

export function matchProductName(value: string): ProductMatch {
  const normalized = singularize(normalizeText(value));
  const exact = ENTRY_BY_TERM.get(normalized);

  if (exact) {
    return {
      normalizedName: singularize(exact.name),
      displayName: exact.name,
      section: exact.section,
      confidence: ALIAS_TERMS.has(normalized) ? "alias" : "exact",
    };
  }

  const fuzzy = findFuzzyMatch(normalized);
  if (fuzzy) {
    return {
      normalizedName: singularize(fuzzy.name),
      displayName: fuzzy.name,
      section: fuzzy.section,
      confidence: "fuzzy",
    };
  }

  return {
    normalizedName: normalized,
    displayName: titleCase(normalized),
    section: "Otros",
    confidence: "unknown",
  };
}

function findFuzzyMatch(value: string): CatalogEntry | null {
  if (value.length < 5 || value.split(" ").length > 3) {
    return null;
  }

  let best: { entry: CatalogEntry; distance: number } | null = null;
  for (const [term, entry] of ENTRY_BY_TERM) {
    if (Math.abs(term.length - value.length) > 2 || term[0] !== value[0]) {
      continue;
    }
    const distance = levenshtein(value, term);
    if (!best || distance < best.distance) {
      best = { entry, distance };
    }
  }

  if (!best) {
    return null;
  }

  const maxDistance = value.length >= 8 ? 2 : 1;
  return best.distance <= maxDistance ? best.entry : null;
}

function levenshtein(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length];
}

function titleCase(value: string): string {
  return value.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}
