"use client";

import type { ShoppingItem, ShoppingSection } from "@/lib/types";
import { SECTION_STYLES } from "@/lib/sections";
import { ItemRow } from "./item-row";

type SectionGroupProps = {
  section: ShoppingSection;
  items: ShoppingItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSectionChange: (id: string, section: ShoppingSection) => void;
  onReplace: (id: string, input: string) => void;
};

export function SectionGroup({ section, items, onToggle, onDelete, onSectionChange, onReplace }: SectionGroupProps) {
  if (items.length === 0) {
    return null;
  }

  const pendingCount = items.filter((item) => item.status === "pending").length;
  const styles = SECTION_STYLES[section];

  return (
    <section className={`overflow-hidden rounded-md border border-l-4 border-slate-200 ${styles.border} bg-white shadow-sm`}>
      <header className={`flex items-center justify-between px-4 py-3 ${styles.header}`}>
        <h2 className={`text-sm font-semibold uppercase ${styles.text}`}>{section}</h2>
        <span className={`rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ${styles.badge}`}>
          {pendingCount}/{items.length}
        </span>
      </header>
      <ul>
        {items.map((item) => (
          <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} onSectionChange={onSectionChange} onReplace={onReplace} />
        ))}
      </ul>
    </section>
  );
}
