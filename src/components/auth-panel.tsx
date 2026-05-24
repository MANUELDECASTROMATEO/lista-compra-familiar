"use client";

import { LogIn, LogOut, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [message, setMessage] = useState("");
  const supabase = getSupabaseBrowserClient();
  const notConfigured = !supabase;

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  async function signIn() {
    if (!supabase || !email.trim()) {
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    setMessage(error ? error.message : "Revisa tu email para entrar.");
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setMessage("Sesion cerrada.");
  }

  return (
    <section className="mx-auto grid min-h-screen max-w-md content-center gap-4 bg-slate-100 px-4 text-slate-950">
      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold">Login familiar</h1>
        <p className="mt-1 text-sm text-slate-600">Entra con email para asociar listas a tu familia.</p>

        {session ? (
          <div className="mt-5 grid gap-3">
            <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-900 ring-1 ring-emerald-200">
              Sesion iniciada como {session.user.email}
            </div>
            <Link className="inline-flex h-11 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white" href="/">
              Ir a la lista
            </Link>
            <button type="button" onClick={() => void signOut()} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium">
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Cerrar sesion
            </button>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Email
              <span className="flex h-11 items-center gap-2 rounded-md border border-slate-300 px-3">
                <Mail aria-hidden="true" className="h-4 w-4 text-slate-500" />
                <input value={email} onChange={(event) => setEmail(event.target.value)} className="min-w-0 flex-1 outline-none" placeholder="familia@email.com" type="email" />
              </span>
            </label>
            <button type="button" onClick={() => void signIn()} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white">
              <LogIn aria-hidden="true" className="h-4 w-4" />
              Enviar enlace magico
            </button>
          </div>
        )}

        {(message || notConfigured) && <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-slate-200">{message || "Supabase no esta configurado."}</p>}
      </div>
    </section>
  );
}
