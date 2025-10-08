import { createSupabaseBrowserClient } from "@/lib/auth/supabase";
import { AccountRowSchema } from "@/types/account";
import { StrategyRowSchema } from "@/types/strategy";

export async function listAccounts() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from("accounts").select("*");
  if (error) throw error;
  return AccountRowSchema.array().parse(data);
}

export async function listStrategies(accountId: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("strategies")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return StrategyRowSchema.array().parse(data);
}

