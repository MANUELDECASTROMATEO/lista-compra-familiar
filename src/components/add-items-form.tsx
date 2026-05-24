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
  const keepListeningRef = useRef(false);
  const latestDraftRef = useRef("");
  const transcriptPrefixRef = useRef("");
  const previewItems = useMemo(() => parseShoppingInput(voiceDraft), [voiceDraft]);
  const showVoicePanel = listening || voiceDraft.trim().length > 0;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setVoiceSupported(Boolean(getSpeechRecognition()));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    latestDraftRef.current = voiceDraft;
  }, [voiceDraft]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    onAdd(trimmed);
    setValue("");
  }

  function dictate() {
    startDictation({ reset: true });
  }

  function startDictation({ reset }: { reset: boolean }) {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const recognition = getSpeechRecognition();
    if (!recognition) {
      return;
    }

    recognitionRef.current = recognition;
    keepListeningRef.current = true;
    setListening(true);
    if (reset) {
      transcriptPrefixRef.current = "";
      latestDraftRef.current = "";
      setVoiceDraft("");
    } else {
      transcriptPrefixRef.current = latestDraftRef.current;
    }
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript)
        .filter(Boolean)
        .join(" ");
      const nextTranscript = [transcriptPrefixRef.current, transcript].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
      latestDraftRef.current = nextTranscript;
      setVoiceDraft(nextTranscript);
    };
    recognition.onerror = () => {
      recognitionRef.current = null;
      if (!keepListeningRef.current) {
        setListening(false);
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      if (!keepListeningRef.current) {
        setListening(false);
        return;
      }

      window.setTimeout(() => {
        if (keepListeningRef.current) {
          startDictation({ reset: false });
        }
      }, 250);
    };
    recognition.start();
  }

  function stopDictation() {
    keepListeningRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }

  function clearDictation() {
    transcriptPrefixRef.current = "";
    latestDraftRef.current = "";
    setVoiceDraft("");
  }

  function discardDictation() {
    stopDictation();
    clearDictation();
  }

  function addDictation() {
    const trimmed = voiceDraft.trim();
    if (!trimmed) {
      return;
    }

    onAdd(trimmed);
    keepListeningRef.current = false;
    clearDictation();
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
          <div className="mx-auto grid max-h-[78vh] max-w-3xl grid-rows-[auto_minmax(0,1fr)_auto]">
            <div className="border-b border-slate-100 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${listening ? "animate-pulse bg-red-600" : "bg-slate-400"}`} />
                  <h2 className="text-lg font-semibold text-slate-950">{listening ? "Escuchando productos" : "Dictado capturado"}</h2>
                </div>
                <p className="text-sm text-slate-600">{previewItems.length} productos detectados. Pausa si necesitas pensar; sigo escuchando.</p>
              </div>
              <button type="button" onClick={discardDictation} title="Cerrar dictado" className="grid h-9 w-9 flex-none place-items-center rounded-md text-slate-500 hover:bg-slate-100">
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            </div>

            <div className="grid min-h-0 gap-3 overflow-y-auto px-4 py-4">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="max-h-32 overflow-y-auto whitespace-pre-wrap text-sm text-slate-800">{voiceDraft || "Habla ahora..."}</p>
              </div>

              {previewItems.length > 0 && (
                <div className="grid gap-2">
                  <p className="text-xs font-semibold uppercase text-slate-500">Productos antes de anadir</p>
                  <div className="grid gap-2">
                    {previewItems.map((item, index) => (
                      <div key={`${item.normalizedName}-${index}`} className="flex min-h-11 items-center justify-between gap-3 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-950 ring-1 ring-emerald-200">
                        <span className="min-w-0 truncate">{item.name}</span>
                        <span className="rounded-full bg-white px-2 py-1 text-xs text-emerald-800 ring-1 ring-emerald-100">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-2 border-t border-slate-100 bg-white px-4 py-3">
              <button type="button" onClick={addDictation} disabled={!voiceDraft.trim()} className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-base font-semibold text-white shadow-sm disabled:opacity-40">
                <Check aria-hidden="true" className="h-5 w-5" />
                Anadir {previewItems.length > 0 ? `${previewItems.length} productos` : "productos"}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={listening ? stopDictation : () => startDictation({ reset: false })} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700">
                  <Mic aria-hidden="true" className="h-4 w-4" />
                  {listening ? "Parar" : "Reanudar"}
                </button>
                <button type="button" onClick={clearDictation} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700">
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
