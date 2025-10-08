/**
 * Supabase Database Type Definitions
 * 
 * This file contains TypeScript types generated from your Supabase schema.
 * Update this file after running database migrations or schema changes.
 * 
 * To generate these types automatically, run:
 * npx supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      strategies: {
        Row: {
          id: string
          account_id: string
          user_id: string | null
          title: string
          status: string
          inputs: Json | null
          priorities: string | null
          key_assets: string | null
          opportunities: string | null
          contacts: string | null
          created_at: string
        }
        Insert: {
          id?: string
          account_id: string
          user_id?: string | null
          title: string
          status?: string
          inputs?: Json | null
          priorities?: string | null
          key_assets?: string | null
          opportunities?: string | null
          contacts?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          user_id?: string | null
          title?: string
          status?: string
          inputs?: Json | null
          priorities?: string | null
          key_assets?: string | null
          opportunities?: string | null
          contacts?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

