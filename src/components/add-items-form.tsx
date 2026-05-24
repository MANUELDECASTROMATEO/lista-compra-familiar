"use client";

import { Mic, Plus, SquarePen } from "lucide-react";
import { useEffect, useState } from "react";
import { getSpeechRecognition } from "@/lib/voice";

type AddItemsFormProps = {
  onAdd: (input: string) => void;
};

export function AddItemsForm({ onAdd }: AddItemsFormProps) {
  const [value, setValue] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setVoiceSupported(Boolean(getSpeechRecognition()));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    onAdd(trimmed);
    setValue("");
  }

  function dictate() {
    const recognition = getSpeechRecognition();
    if (!recognition) {
      return;
    }

    setListening(true);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript)
        .filter(Boolean)
        .join(" ");
      setValue((current) => [current, transcript].filter(Boolean).join(" "));
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  return (
    <section className="sticky top-0 z-20 w-full overflow-x-hidden border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-4">
      <div className="mx-auto flex w-full max-w-3xl min-w-0 gap-2">
        <label className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 shadow-sm focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
          <SquarePen aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-500" />
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submit();
              }
            }}
            className="min-w-0 flex-1 bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400"
            placeholder="Leche, pan, tomates..."
          />
        </label>
        <button
          type="button"
          onClick={dictate}
          disabled={!voiceSupported || listening}
          title={voiceSupported ? "Dictar productos" : "Dictado no disponible en este navegador"}
          className="grid h-12 w-12 flex-none place-items-center rounded-md border border-slate-300 bg-white text-slate-700 shadow-sm disabled:opacity-40"
        >
          <Mic aria-hidden="true" className={listening ? "h-5 w-5 text-red-600" : "h-5 w-5"} />
        </button>
        <button
          type="button"
          onClick={submit}
          title="Anadir productos"
          className="grid h-12 w-12 flex-none place-items-center rounded-md bg-emerald-600 text-white shadow-sm"
        >
          <Plus aria-hidden="true" className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
}
