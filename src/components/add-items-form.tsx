"use client";

import { Check, Mic, Plus, SquarePen, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { parseShoppingInput } from "@/lib/parser";
import { getSpeechRecognition, type SpeechRecognitionLike } from "@/lib/voice";

type AddItemsFormProps = {
  onAdd: (input: string) => void;
};

export function AddItemsForm({ onAdd }: AddItemsFormProps) {
  const [value, setValue] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceDraft, setVoiceDraft] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const previewItems = useMemo(() => parseShoppingInput(voiceDraft), [voiceDraft]);
  const showVoicePanel = listening || voiceDraft.trim().length > 0;

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
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const recognition = getSpeechRecognition();
    if (!recognition) {
      return;
    }

    recognitionRef.current = recognition;
    setListening(true);
    setVoiceDraft("");
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript)
        .filter(Boolean)
        .join(" ");
      setVoiceDraft(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.start();
  }

  function stopDictation() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }

  function addDictation() {
    const trimmed = voiceDraft.trim();
    if (!trimmed) {
      return;
    }

    onAdd(trimmed);
    setVoiceDraft("");
    setListening(false);
    recognitionRef.current?.stop();
    recognitionRef.current = null;
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
          disabled={!voiceSupported}
          title={voiceSupported ? "Dictar productos" : "Dictado no disponible en este navegador"}
          className={`grid h-12 w-12 flex-none place-items-center rounded-md border shadow-sm disabled:opacity-40 ${
            listening ? "border-red-300 bg-red-50 text-red-700" : "border-slate-300 bg-white text-slate-700"
          }`}
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

      {showVoicePanel && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white shadow-2xl">
          <div className="mx-auto grid max-h-[70vh] max-w-3xl gap-3 overflow-y-auto px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${listening ? "animate-pulse bg-red-600" : "bg-slate-400"}`} />
                  <h2 className="text-base font-semibold text-slate-950">{listening ? "Escuchando productos" : "Dictado capturado"}</h2>
                </div>
                <p className="text-sm text-slate-600">{previewItems.length} productos detectados</p>
              </div>
              <button type="button" onClick={() => setVoiceDraft("")} title="Cerrar dictado" className="grid h-9 w-9 flex-none place-items-center rounded-md text-slate-500 hover:bg-slate-100">
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="max-h-28 overflow-y-auto whitespace-pre-wrap text-sm text-slate-800">{voiceDraft || "Habla ahora..."}</p>
            </div>

            {previewItems.length > 0 && (
              <div className="grid gap-2">
                <p className="text-xs font-semibold uppercase text-slate-500">Vista previa</p>
                <div className="flex flex-wrap gap-2">
                  {previewItems.map((item, index) => (
                    <span key={`${item.normalizedName}-${index}`} className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 ring-1 ring-emerald-200">
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={listening ? stopDictation : dictate} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700">
                <Mic aria-hidden="true" className="h-4 w-4" />
                {listening ? "Parar" : "Seguir"}
              </button>
              <button type="button" onClick={() => setVoiceDraft("")} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700">
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                Limpiar
              </button>
              <button type="button" onClick={addDictation} disabled={!voiceDraft.trim()} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white disabled:opacity-40">
                <Check aria-hidden="true" className="h-4 w-4" />
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
