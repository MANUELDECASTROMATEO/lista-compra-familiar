"use client";

import type { ShoppingState } from "./types";
import { defaultState } from "./defaults";

const STORAGE_KEY = "lista-compra-familiar:v1";

export function loadLocalState(): ShoppingState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultState;
  }

  try {
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function saveLocalState(state: ShoppingState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportState(state: ShoppingState): string {
  return JSON.stringify(state, null, 2);
}

export function importState(value: string): ShoppingState {
  const parsed = JSON.parse(value) as Partial<ShoppingState>;
  return {
    ...defaultState,
    ...parsed,
    items: parsed.items ?? [],
    rules: parsed.rules ?? [],
  };
}
