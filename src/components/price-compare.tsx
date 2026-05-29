"use client";

import { Euro, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { normalizeText, singularize } from "@/lib/normalize";
import { calculateSupermarketTotals, upsertPriceEntry } from "@/lib/prices";
import type { PriceEntry, ShoppingItem } from "@/lib/types";

type PriceCompareProps = {
  items: ShoppingItem[];
  prices: PriceEntry[];
  onChange: (prices: PriceEntry[]) => void;
};

export function PriceCompare({ items, prices, onChange }: PriceCompareProps) {
  const [open, setOpen] = useState(false);
  const [supermarket, setSupermarket] = useState("Mercadona");
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const totals = useMemo(() => calculateSupermarketTotals(items, prices), [items, prices]);

  function addPrice() {
    const parsedPrice = Number(price.replace(",", "."));
    const normalizedName = singularize(normalizeText(product));
    if (!supermarket.trim() || !normalizedName || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return;
    }

    onChange(upsertPriceEntry(prices, { supermarket: supermarket.trim(), normalizedName, name: product.trim(), price: parsedPrice }));
    setProduct("");
    setPrice("");
  }

  return (
    <section className="mb-4 rounded-md border border-slate-200 bg-white shadow-sm">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Euro aria-hidden="true" className="h-4 w-4 text-emerald-700" />
          Comparativa de precios
        </span>
        <span className="text-xs text-slate-500">{prices.length} precios</span>
      </button>

      {open && (
        <div className="grid gap-3 border-t border-slate-100 p-4">
          <div className="grid gap-2 sm:grid-cols-4">
            <input value={supermarket} onChange={(event) => setSupermarket(event.target.value)} className="h-10 rounded-md border border-slate-300 px-3 text-sm" placeholder="Supermercado" />
            <input value={product} onChange={(event) => setProduct(event.target.value)} className="h-10 rounded-md border border-slate-300 px-3 text-sm sm:col-span-2" placeholder="Producto" />
            <div className="flex gap-2">
              <input value={price} onChange={(event) => setPrice(event.target.value)} className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm" placeholder="Precio" inputMode="decimal" />
              <button type="button" onClick={addPrice} title="Guardar precio" className="grid h-10 w-10 flex-none place-items-center rounded-md bg-emerald-600 text-white">
                <Plus aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>

          {totals.length > 0 ? (
            <div className="grid gap-2">
              {totals.map((total) => (
                <div key={total.supermarket} className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-900">{total.supermarket}</span>
                    <span className="font-mono text-lg font-bold text-emerald-700">{total.total.toFixed(2)} €</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {total.matchedItems} con precio · {total.missingItems.length} sin precio
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">Anade precios manuales para comparar supermercados.</p>
          )}
        </div>
      )}
    </section>
  );
}
