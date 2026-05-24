"use client";

import { Trash2 } from "lucide-react";
import { SECTIONS } from "@/lib/sections";
import type { ShoppingItem, ShoppingSection } from "@/lib/types";

type ItemRowProps = {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSectionChange: (id: string, section: ShoppingSection) => void;
};

export function ItemRow({ item, onToggle, onDelete, onSectionChange }: ItemRowProps) {
  const bought = item.status === "bought";
  const quantity = item.quantity > 1 ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""} ` : "";

  return (
    <li className="flex min-h-14 items-center gap-3 border-b border-slate-100 bg-white px-4 py-2 last:border-b-0">
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        aria-pressed={bought}
        title={bought ? "Marcar como pendiente" : "Marcar como comprado"}
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border-2 ${
          bought ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white"
        }`}
      >
        {bought ? "✓" : ""}
      </button>
      <div className="min-w-0 flex-1">
        <div className={bought ? "truncate text-base font-medium text-slate-400 line-through" : "truncate text-base font-medium text-slate-950"}>
          {quantity}
          {item.name}
        </div>
        {(item.addedByAlias || item.boughtByAlias) && (
          <div className="truncate text-xs text-slate-500">
            {item.boughtByAlias ? `Comprado por ${item.boughtByAlias}` : `Anadido por ${item.addedByAlias}`}
          </div>
        )}
      </div>
      <select
        value={item.section}
        onChange={(event) => onSectionChange(item.id, event.target.value as ShoppingSection)}
        className="hidden max-w-36 rounded-md border border-slate-200 bg-white px-2 py-2 text-sm text-slate-700 sm:block"
        title="Cambiar seccion"
      >
        {SECTIONS.map((section) => (
          <option key={section} value={section}>
            {section}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        title="Eliminar"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-red-600"
      >
        <Trash2 aria-hidden="true" className="h-5 w-5" />
      </button>
    </li>
  );
}
