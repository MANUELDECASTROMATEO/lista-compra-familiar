export type ShoppingSection =
  | "Fruta y verdura"
  | "Panaderia"
  | "Carniceria"
  | "Pescaderia"
  | "Charcuteria"
  | "Lacteos y huevos"
  | "Congelados"
  | "Despensa"
  | "Pasta, arroz y legumbres"
  | "Conservas"
  | "Desayuno y dulces"
  | "Bebidas"
  | "Limpieza"
  | "Hogar y papel"
  | "Higiene y farmacia"
  | "Bebe y mascotas"
  | "Otros";

export type ItemStatus = "pending" | "bought" | "archived";

export type ShoppingItem = {
  id: string;
  name: string;
  normalizedName: string;
  section: ShoppingSection;
  quantity: number;
  unit?: string;
  status: ItemStatus;
  addedByAlias?: string;
  boughtByAlias?: string;
  createdAt: string;
  updatedAt: string;
  boughtAt?: string;
  archivedAt?: string;
};

export type ParsedInputItem = {
  name: string;
  normalizedName: string;
  quantity: number;
  unit?: string;
};

export type FamilyRule = {
  normalizedTerm: string;
  section: ShoppingSection;
};

export type ShoppingState = {
  familyName: string;
  items: ShoppingItem[];
  rules: FamilyRule[];
  hideBought: boolean;
  alias?: string;
  priceEntries?: PriceEntry[];
};

export type PriceEntry = {
  id: string;
  supermarket: string;
  normalizedName: string;
  name: string;
  price: number;
  updatedAt: string;
};
