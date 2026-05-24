import { NextResponse } from "next/server";
import { createFamilyToken, hashFamilyToken } from "@/lib/server-token";
import { getSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase no esta configurado en este despliegue." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Compra familiar";
  const token = createFamilyToken();
  const supabase = getSupabaseServerClient();

  const { error } = await supabase.from("families").insert({
    name,
    share_token_hash: hashFamilyToken(token),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ token, url: `/f/${token}` }, { status: 201 });
}
