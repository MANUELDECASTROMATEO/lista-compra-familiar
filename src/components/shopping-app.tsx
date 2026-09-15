"use client";

import { CheckCircle2, Download, Eye, EyeOff, Link2, Loader2, RefreshCcw, Send, Settings2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createFamilyRule } from "@/lib/classifier";
import { defaultState } from "@/lib/defaults";
import { exportState, importState, loadLocalState, saveLocalState } from "@/lib/local-store";
import { SECTIONS } from "@/lib/sections";
import { createWhatsAppShareUrl, formatShoppingListForShare } from "@/lib/share";
import { addInputToItems, archiveBought, deleteItem, replaceItemWithInput, toggleBought, updateItemSection } from "@/lib/shopping";
import type { ShoppingState, ShoppingSection } from "@/lib/types";
import { AddItemsForm } from "./add-items-form";
import { ItemRow } from "./item-row";
import { SectionGroup } from "./section-group";

type ShoppingAppProps = {
  familyToken?: string;
};

export function ShoppingApp({ familyToken }: ShoppingAppProps) {
  const remoteMode = Boolean(familyToken);
  const [state, setState] = useState<ShoppingState>(defaultState);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [importValue, setImportValue] = useState("");
  const [syncStatus, setSyncStatus] = useState(remoteMode ? "Cargando enlace familiar..." : "modo gratis local");
  const [creatingFamily, setCreatingFamily] = useState(false);
  const remoteLoadedRef = useRef(false);
  const localLoadedRef = useRef(remoteMode);

  useEffect(() => {
    if (familyToken) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      localLoadedRef.current = true;
      setState(loadLocalState());
    });

    return () => window.cancelAnimationFrame(frame);
  }, [familyToken]);

  useEffect(() => {
    if (!familyToken) {
      return;
    }

    let cancelled = false;
    fetch(`/api/families/${familyToken}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("No se pudo cargar el enlace familiar");
        }
        return response.json() as Promise<ShoppingState>;
      })
      .then((remoteState) => {
        if (!cancelled) {
          setState((current) => ({ ...remoteState, alias: current.alias }));
          remoteLoadedRef.current = true;
          setSyncStatus("sincronizado con Supabase");
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setSyncStatus(error.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [familyToken]);

  useEffect(() => {
    if (!familyToken && localLoadedRef.current) {
      saveLocalState(state);
    }
  }, [familyToken, state]);

  useEffect(() => {
    if (!familyToken || !remoteLoadedRef.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      fetch(`/api/families/${familyToken}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(state),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("No se pudo sincronizar");
          }
          setSyncStatus("sincronizado con Supabase");
        })
        .catch((error: Error) => setSyncStatus(error.message));
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [familyToken, state]);

  const visibleItems = useMemo(
    () =>
      state.items
        .filter((item) => item.status !== "archived")
        .filter((item) => !state.hideBought || item.status !== "bought")
        .sort((a, b) => a.name.localeCompare(b.name, "es")),
    [state.items, state.hideBought],
  );

  const pendingItems = useMemo(() => visibleItems.filter((item) => item.status !== "bought"), [visibleItems]);
  const boughtItems = useMemo(() => visibleItems.filter((item) => item.status === "bought"), [visibleItems]);

  function patch(updater: (current: ShoppingState) => ShoppingState) {
    setState((current) => updater(current));
  }

  function add(input: string) {
    patch((current) => ({
      ...current,
      items: addInputToItems(input, current.items, current.rules, current.alias),
    }));
  }

  function changeSection(itemId: string, section: ShoppingSection) {
    patch((current) => {
      const item = current.items.find((entry) => entry.id === itemId);
      const rules = item ? upsertRule(current.rules, createFamilyRule(item.normalizedName, section)) : current.rules;
      return {
        ...current,
        rules,
        items: updateItemSection(current.items, itemId, section),
      };
    });
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <AddItemsForm onAdd={add} />

      <div className="mx-auto max-w-3xl px-4 py-5">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">{state.familyName}</h1>
        </header>

        {settingsOpen && (
          <section className="mb-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            {remoteMode && <p className="mb-3 text-xs text-slate-500">{syncStatus}</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Nombre de la lista
                <input
                  value={state.familyName}
                  onChange={(event) => patch((current) => ({ ...current, familyName: event.target.value }))}
                  className="h-10 rounded-md border border-slate-300 px-3 text-base text-slate-950"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Tu alias
                <input
                  value={state.alias ?? ""}
                  onChange={(event) => patch((current) => ({ ...current, alias: event.target.value }))}
                  className="h-10 rounded-md border border-slate-300 px-3 text-base text-slate-950"
                  placeholder="Mama, Papa..."
                />
              </label>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {!remoteMode && (
                <button type="button" onClick={() => void createFamilyLink()} disabled={creatingFamily} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-medium text-emerald-800 disabled:opacity-50">
                  {creatingFamily ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Link2 aria-hidden="true" className="h-4 w-4" />}
                  Crear enlace familiar
                </button>
              )}
              <button type="button" onClick={() => navigator.clipboard.writeText(exportState(state))} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium">
                <Download aria-hidden="true" className="h-4 w-4" />
                Exportar
              </button>
              <button type="button" onClick={() => setImportValue(exportState(state))} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium">
                <Upload aria-hidden="true" className="h-4 w-4" />
                Preparar importacion
              </button>
              <button type="button" onClick={() => patch(() => defaultState)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700">
                <RefreshCcw aria-hidden="true" className="h-4 w-4" />
                Reiniciar
              </button>
            </div>
            {importValue && (
              <div className="mt-3 grid gap-2">
                <textarea value={importValue} onChange={(event) => setImportValue(event.target.value)} className="min-h-24 rounded-md border border-slate-300 p-2 font-mono text-xs" />
                <button type="button" onClick={() => patch(() => importState(importValue))} className="h-10 rounded-md bg-slate-950 px-3 text-sm font-medium text-white">
                  Importar datos
                </button>
              </div>
            )}
          </section>
        )}

        <div className="mb-4 flex justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setSettingsOpen((value) => !value)}
            title="Ajustes"
            className="grid h-8 w-8 place-items-center rounded-md border border-slate-300 bg-white text-slate-600"
          >
            <Settings2 aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => patch((current) => ({ ...current, hideBought: !current.hideBought }))}
            title={state.hideBought ? "Ver comprados" : "Ocultar comprados"}
            className="grid h-8 w-8 place-items-center rounded-md border border-slate-300 bg-white text-slate-600"
          >
            {state.hideBought ? <Eye aria-hidden="true" className="h-4 w-4" /> : <EyeOff aria-hidden="true" className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => patch((current) => ({ ...current, items: archiveBought(current.items) }))}
            title="Finalizar compra"
            className="grid h-8 w-8 place-items-center rounded-md border border-slate-300 bg-white text-slate-600"
          >
            <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => void shareList()}
            title="Compartir por WhatsApp"
            className="grid h-8 w-8 place-items-center rounded-md border border-slate-300 bg-white text-slate-600"
          >
            <Send aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3">
          {SECTIONS.map((section) => (
            <SectionGroup
              key={section}
              section={section}
              items={pendingItems.filter((item) => item.section === section)}
              onToggle={(id) => patch((current) => ({ ...current, items: toggleBought(current.items, id, current.alias) }))}
              onDelete={(id) => patch((current) => ({ ...current, items: deleteItem(current.items, id) }))}
              onSectionChange={changeSection}
              onReplace={(id, input) => patch((current) => ({ ...current, items: replaceItemWithInput(current.items, id, input, current.rules, current.alias) }))}
            />
          ))}

          {boughtItems.length > 0 && (
            <section className="overflow-hidden rounded-md border border-l-4 border-emerald-400 bg-white shadow-sm">
              <header className="flex items-center justify-between bg-emerald-50 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase text-emerald-900">En la cesta</h2>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-emerald-200">{boughtItems.length}</span>
              </header>
              <ul>
                {boughtItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onToggle={(id) => patch((current) => ({ ...current, items: toggleBought(current.items, id, current.alias) }))}
                    onDelete={(id) => patch((current) => ({ ...current, items: deleteItem(current.items, id) }))}
                    onSectionChange={changeSection}
                    onReplace={(id, input) => patch((current) => ({ ...current, items: replaceItemWithInput(current.items, id, input, current.rules, current.alias) }))}
                  />
                ))}
              </ul>
            </section>
          )}
        </div>

        {visibleItems.length === 0 && (
          <section className="rounded-md border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-slate-600">
            <p className="text-lg font-semibold text-slate-900">Lista vacia</p>
            <p className="mt-1 text-sm">Anade productos arriba por texto o dictado.</p>
          </section>
        )}
      </div>
    </main>
  );

  async function createFamilyLink() {
    setCreatingFamily(true);
    setSyncStatus("creando enlace familiar...");
    try {
      const response = await fetch("/api/families", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: state.familyName }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "No se pudo crear el enlace familiar");
      }

      const payload = (await response.json()) as { url: string };
      window.location.href = payload.url;
    } catch (error) {
      setSyncStatus(error instanceof Error ? error.message : "No se pudo crear el enlace familiar");
      setCreatingFamily(false);
    }
  }

  async function shareList() {
    const text = formatShoppingListForShare(state);
    if (navigator.share) {
      try {
        await navigator.share({ title: state.familyName, text });
        return;
      } catch {
        // Fallback to WhatsApp if native share is cancelled or unavailable.
      }
    }

    window.open(createWhatsAppShareUrl(text), "_blank", "noopener,noreferrer");
  }
}

function upsertRule(rules: ShoppingState["rules"], nextRule: ShoppingState["rules"][number]) {
  const withoutExisting = rules.filter((rule) => rule.normalizedTerm !== nextRule.normalizedTerm);
  return [...withoutExisting, nextRule];
}
