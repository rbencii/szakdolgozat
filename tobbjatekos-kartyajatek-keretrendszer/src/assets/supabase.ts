export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      actions: {
        Row: {
          action: string
          id: number
          left_field: number
          left_player: number | null
          left_value: number | null
          number: number | null
          operator: string | null
          right_field: number | null
          right_player: number | null
          right_value: number | null
          round_attr: string | null
        }
        Insert: {
          action: string
          id?: number
          left_field: number
          left_player?: number | null
          left_value?: number | null
          number?: number | null
          operator?: string | null
          right_field?: number | null
          right_player?: number | null
          right_value?: number | null
          round_attr?: string | null
        }
        Update: {
          action?: string
          id?: number
          left_field?: number
          left_player?: number | null
          left_value?: number | null
          number?: number | null
          operator?: string | null
          right_field?: number | null
          right_player?: number | null
          right_value?: number | null
          round_attr?: string | null
        }
      }
      games: {
        Row: {
          created_at: string | null
          creator: string | null
          gamefields: string[]
          id: number
          init: Json
          name: string
          official: boolean
          playercount: number
          playerfields: string[] | null
        }
        Insert: {
          created_at?: string | null
          creator?: string | null
          gamefields?: string[]
          id?: number
          init: Json
          name?: string
          official?: boolean
          playercount?: number
          playerfields?: string[] | null
        }
        Update: {
          created_at?: string | null
          creator?: string | null
          gamefields?: string[]
          id?: number
          init?: Json
          name?: string
          official?: boolean
          playercount?: number
          playerfields?: string[] | null
        }
      }
      games_rules: {
        Row: {
          game_id: number | null
          id: number
          rule_id: number | null
        }
        Insert: {
          game_id?: number | null
          id?: number
          rule_id?: number | null
        }
        Update: {
          game_id?: number | null
          id?: number
          rule_id?: number | null
        }
      }
      hands: {
        Row: {
          hand: Json | null
          id: number
          session_players_id: number
        }
        Insert: {
          hand?: Json | null
          id?: number
          session_players_id: number
        }
        Update: {
          hand?: Json | null
          id?: number
          session_players_id?: number
        }
      }
      handview: {
        Row: {
          id: number
          session_players_id: number
          top: Json
        }
        Insert: {
          id?: number
          session_players_id: number
          top: Json
        }
        Update: {
          id?: number
          session_players_id?: number
          top?: Json
        }
      }
      rules: {
        Row: {
          action_id: number | null
          created_at: string | null
          id: number
          left_field: number | null
          left_player: number
          left_value: number | null
          name: string
          operator: string
          or_bool: boolean
          required: boolean
          right_field: number | null
          right_player: number | null
          right_value: number | null
        }
        Insert: {
          action_id?: number | null
          created_at?: string | null
          id?: number
          left_field?: number | null
          left_player?: number
          left_value?: number | null
          name?: string
          operator?: string
          or_bool?: boolean
          required?: boolean
          right_field?: number | null
          right_player?: number | null
          right_value?: number | null
        }
        Update: {
          action_id?: number | null
          created_at?: string | null
          id?: number
          left_field?: number | null
          left_player?: number
          left_value?: number | null
          name?: string
          operator?: string
          or_bool?: boolean
          required?: boolean
          right_field?: number | null
          right_player?: number | null
          right_value?: number | null
        }
      }
      session: {
        Row: {
          created_at: string | null
          game: number | null
          id: number
          owner: string
          started: boolean
          table: Json | null
        }
        Insert: {
          created_at?: string | null
          game?: number | null
          id?: number
          owner?: string
          started?: boolean
          table?: Json | null
        }
        Update: {
          created_at?: string | null
          game?: number | null
          id?: number
          owner?: string
          started?: boolean
          table?: Json | null
        }
      }
      session_players: {
        Row: {
          hand: Json | null
          id: number
          name: string
          session_id: number
          user_id: string | null
        }
        Insert: {
          hand?: Json | null
          id?: number
          name?: string
          session_id: number
          user_id?: string | null
        }
        Update: {
          hand?: Json | null
          id?: number
          name?: string
          session_id?: number
          user_id?: string | null
        }
      }
      tables: {
        Row: {
          id: number
          session_id: number
          table: Json | null
        }
        Insert: {
          id?: number
          session_id: number
          table?: Json | null
        }
        Update: {
          id?: number
          session_id?: number
          table?: Json | null
        }
      }
      tableview: {
        Row: {
          current: number
          dir: number
          id: number
          next: number
          session_id: number
          top: Json
        }
        Insert: {
          current: number
          dir?: number
          id?: number
          next: number
          session_id: number
          top: Json
        }
        Update: {
          current?: number
          dir?: number
          id?: number
          next?: number
          session_id?: number
          top?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
