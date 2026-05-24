"use client";

import type { ShoppingItem, ShoppingSection } from "@/lib/types";
import { ItemRow } from "./item-row";

type SectionGroupProps = {
  section: ShoppingSection;
  items: ShoppingItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSectionChange: (id: string, section: ShoppingSection) => void;
};

export function SectionGroup({ section, items, onToggle, onDelete, onSectionChange }: SectionGroupProps) {
  if (items.length === 0) {
    return null;
  }

  const pendingCount = items.filter((item) => item.status === "pending").length;

  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between bg-slate-50 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase text-slate-700">{section}</h2>
        <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
          {pendingCount}/{items.length}
        </span>
      </header>
      <ul>
        {items.map((item) => (
          <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} onSectionChange={onSectionChange} />
        ))}
      </ul>
    </section>
  );
}
