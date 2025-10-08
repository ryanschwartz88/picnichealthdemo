import type { Database } from "@/lib/supabase/types";

export type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];
export type StrategyRow = Database["public"]["Tables"]["strategies"]["Row"];

export type AccountInsert = Database["public"]["Tables"]["accounts"]["Insert"];
export type StrategyInsert = Database["public"]["Tables"]["strategies"]["Insert"];

export type AccountUpdate = Database["public"]["Tables"]["accounts"]["Update"];
export type StrategyUpdate = Database["public"]["Tables"]["strategies"]["Update"];

