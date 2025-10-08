import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/auth/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeOptions {
  table: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  onUpdate?: () => void;
}

export function useRealtime({ table, event = "*", onUpdate }: UseRealtimeOptions) {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let channel: RealtimeChannel;

    channel = supabase
      .channel(`${table}_changes`)
      .on(
        "postgres_changes" as any,
        { event, schema: "public", table },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, onUpdate]);
}

