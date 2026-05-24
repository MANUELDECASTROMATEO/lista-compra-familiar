import { NextResponse } from "next/server";
import { hashFamilyToken } from "@/lib/server-token";
import { defaultState } from "@/lib/defaults";
import { itemToDb, mapDbItem, mapDbPrice, mapDbRule, priceToDb, ruleToDb, sanitizeRemoteState } from "@/lib/supabase/mappers";
import { getSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import type { ShoppingState } from "@/lib/types";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const family = await resolveFamily(context);
  if (family instanceof NextResponse) {
    return family;
  }

  const supabase = getSupabaseServerClient();
  const [itemsResult, rulesResult, pricesResult] = await Promise.all([
    supabase.from("shopping_items").select("*").eq("family_id", family.id).neq("status", "archived"),
    supabase.from("family_classification_rules").select("normalized_term, section").eq("family_id", family.id),
    supabase.from("product_prices").select("id, supermarket, normalized_name, name, price, updated_at").eq("family_id", family.id),
  ]);

  if (itemsResult.error || rulesResult.error || pricesResult.error) {
    return NextResponse.json({ error: itemsResult.error?.message ?? rulesResult.error?.message ?? pricesResult.error?.message }, { status: 500 });
  }

  return NextResponse.json({
    ...defaultState,
    familyName: family.name,
    items: (itemsResult.data ?? []).map(mapDbItem),
    rules: (rulesResult.data ?? []).map(mapDbRule),
    priceEntries: (pricesResult.data ?? []).map(mapDbPrice),
  });
}

export async function PUT(request: Request, context: RouteContext) {
  const family = await resolveFamily(context);
  if (family instanceof NextResponse) {
    return family;
  }

  const payload = sanitizeRemoteState((await request.json()) as ShoppingState);
  const supabase = getSupabaseServerClient();

  const { error: familyError } = await supabase.from("families").update({ name: payload.familyName }).eq("id", family.id);
  if (familyError) {
    return NextResponse.json({ error: familyError.message }, { status: 500 });
  }

  const { error: deleteItemsError } = await supabase.from("shopping_items").delete().eq("family_id", family.id);
  if (deleteItemsError) {
    return NextResponse.json({ error: deleteItemsError.message }, { status: 500 });
  }

  const activeItems = payload.items.filter((item) => item.status !== "archived");
  if (activeItems.length > 0) {
    const { error } = await supabase.from("shopping_items").insert(activeItems.map((item) => itemToDb(item, family.id)));
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const { error: deleteRulesError } = await supabase.from("family_classification_rules").delete().eq("family_id", family.id);
  if (deleteRulesError) {
    return NextResponse.json({ error: deleteRulesError.message }, { status: 500 });
  }

  if (payload.rules.length > 0) {
    const { error } = await supabase.from("family_classification_rules").insert(payload.rules.map((rule) => ruleToDb(rule, family.id)));
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const { error: deletePricesError } = await supabase.from("product_prices").delete().eq("family_id", family.id);
  if (deletePricesError) {
    return NextResponse.json({ error: deletePricesError.message }, { status: 500 });
  }

  if ((payload.priceEntries ?? []).length > 0) {
    const { error } = await supabase.from("product_prices").insert((payload.priceEntries ?? []).map((price) => priceToDb(price, family.id)));
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

async function resolveFamily(context: RouteContext): Promise<{ id: string; name: string } | NextResponse> {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase no esta configurado en este despliegue." }, { status: 503 });
  }

  const { token } = await context.params;
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("families").select("id, name").eq("share_token_hash", hashFamilyToken(token)).single();

  if (error || !data) {
    return NextResponse.json({ error: "Enlace familiar no valido." }, { status: 404 });
  }

  return data;
}
