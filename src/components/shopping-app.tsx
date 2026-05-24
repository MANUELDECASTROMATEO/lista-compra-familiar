"use client";

import { CheckCircle2, Download, Eye, EyeOff, Link2, Loader2, RefreshCcw, Settings2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createFamilyRule } from "@/lib/classifier";
import { defaultState } from "@/lib/defaults";
import { exportState, importState, loadLocalState, saveLocalState } from "@/lib/local-store";
import { SECTIONS } from "@/lib/sections";
import { addInputToItems, archiveBought, deleteItem, replaceItemWithInput, toggleBought, updateItemSection } from "@/lib/shopping";
import type { ShoppingState, ShoppingSection } from "@/lib/types";
import { AddItemsForm } from "./add-items-form";
import { SectionGroup } from "./section-group";

type ShoppingAppProps = {
  familyToken?: string;
};

export function ShoppingApp({ familyToken }: ShoppingAppProps) {
  const remoteMode = Boolean(familyToken);
  const [state, setState] = useState<ShoppingState>(() => (remoteMode ? defaultState : loadLocalState()));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [importValue, setImportValue] = useState("");
  const [syncStatus, setSyncStatus] = useState(remoteMode ? "Cargando enlace familiar..." : "modo gratis local");
  const [creatingFamily, setCreatingFamily] = useState(false);
  const remoteLoadedRef = useRef(false);

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
    if (!familyToken) {
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
        .sort((a, b) => Number(a.status === "bought") - Number(b.status === "bought") || a.name.localeCompare(b.name, "es")),
    [state.items, state.hideBought],
  );

  const pendingCount = state.items.filter((item) => item.status === "pending").length;
  const boughtCount = state.items.filter((item) => item.status === "bought").length;

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
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{state.familyName}</h1>
            <p className="text-sm text-slate-600">
              {pendingCount} pendientes - {boughtCount} comprados - {syncStatus}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen((value) => !value)}
            title="Ajustes"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-slate-300 bg-white text-slate-700 shadow-sm"
          >
            <Settings2 aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        {settingsOpen && (
          <section className="mb-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
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

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => patch((current) => ({ ...current, hideBought: !current.hideBought }))}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium shadow-sm"
          >
            {state.hideBought ? <Eye aria-hidden="true" className="h-4 w-4" /> : <EyeOff aria-hidden="true" className="h-4 w-4" />}
            {state.hideBought ? "Ver comprados" : "Ocultar comprados"}
          </button>
          <button
            type="button"
            onClick={() => patch((current) => ({ ...current, items: archiveBought(current.items) }))}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white shadow-sm"
          >
            <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            Finalizar compra
          </button>
        </div>

        <div className="grid gap-3">
          {SECTIONS.map((section) => (
            <SectionGroup
              key={section}
              section={section}
              items={visibleItems.filter((item) => item.section === section)}
              onToggle={(id) => patch((current) => ({ ...current, items: toggleBought(current.items, id, current.alias) }))}
              onDelete={(id) => patch((current) => ({ ...current, items: deleteItem(current.items, id) }))}
              onSectionChange={changeSection}
              onReplace={(id, input) => patch((current) => ({ ...current, items: replaceItemWithInput(current.items, id, input, current.rules, current.alias) }))}
            />
          ))}
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
}

function upsertRule(rules: ShoppingState["rules"], nextRule: ShoppingState["rules"][number]) {
  const withoutExisting = rules.filter((rule) => rule.normalizedTerm !== nextRule.normalizedTerm);
  return [...withoutExisting, nextRule];
}
