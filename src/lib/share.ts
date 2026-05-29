import { SECTIONS } from "./sections";
import type { ShoppingItem, ShoppingState } from "./types";

export function formatShoppingListForShare(state: ShoppingState): string {
  const lines = [state.familyName || "Compra familiar", ""];
  const activeItems = state.items.filter((item) => item.status !== "archived" && item.status !== "bought");

  for (const section of SECTIONS) {
    const sectionItems = activeItems.filter((item) => item.section === section);
    if (sectionItems.length === 0) {
      continue;
    }

    lines.push(section);
    for (const item of sectionItems) {
      lines.push(`- ${formatItem(item)}`);
    }
    lines.push("");
  }

  if (activeItems.length === 0) {
    lines.push("No hay productos pendientes.");
  }

  return lines.join("\n").trim();
}

export function createWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function formatItem(item: ShoppingItem): string {
  const quantity = item.quantity > 1 ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""} ` : "";
  return `${quantity}${item.name}`;
}
