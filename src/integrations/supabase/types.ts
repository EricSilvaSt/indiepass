export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  indiepass: {
    Tables: {
      events: {
        Row: {
          address: string
          category: string
          city: string
          created_at: string
          date: string
          description: string
          fee_payer: string
          id: string
          image_url: string
          location: string
          organizer: string
          producer_id: string | null
          status: string
          time: string
          title: string
        }
        Insert: {
          address?: string
          category?: string
          city?: string
          created_at?: string
          date: string
          description?: string
          fee_payer?: string
          id?: string
          image_url?: string
          location?: string
          organizer?: string
          producer_id?: string | null
          status?: string
          time?: string
          title: string
        }
        Update: {
          address?: string
          category?: string
          city?: string
          created_at?: string
          date?: string
          description?: string
          fee_payer?: string
          id?: string
          image_url?: string
          location?: string
          organizer?: string
          producer_id?: string | null
          status?: string
          time?: string
          title?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_cpf: string
          customer_email: string
          customer_name: string
          customer_whatsapp: string
          event_id: string
          fee_amount: number
          id: string
          payment_method: string
          status: string
          total_amount: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_cpf: string
          customer_email: string
          customer_name: string
          customer_whatsapp: string
          event_id: string
          fee_amount: number
          id?: string
          payment_method: string
          status?: string
          total_amount: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_cpf?: string
          customer_email?: string
          customer_name?: string
          customer_whatsapp?: string
          event_id?: string
          fee_amount?: number
          id?: string
          payment_method?: string
          status?: string
          total_amount?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      producer_profiles: {
        Row: {
          account_number: string
          agency: string
          bank_code: string
          bio: string
          created_at: string
          doc_number: string
          instagram: string
          legal_name: string
          legal_type: string
          pix_key: string
          pix_key_type: string
          user_id: string
        }
        Insert: {
          account_number?: string
          agency?: string
          bank_code?: string
          bio?: string
          created_at?: string
          doc_number?: string
          instagram?: string
          legal_name?: string
          legal_type?: string
          pix_key?: string
          pix_key_type?: string
          user_id: string
        }
        Update: {
          account_number?: string
          agency?: string
          bank_code?: string
          bio?: string
          created_at?: string
          doc_number?: string
          instagram?: string
          legal_name?: string
          legal_type?: string
          pix_key?: string
          pix_key_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_city: string
          address_number: string
          address_state: string
          address_street: string
          address_zip: string
          cpf: string
          created_at: string
          full_name: string
          id: string
          role: Database["indiepass"]["Enums"]["account_role"]
          updated_at: string
          whatsapp: string
        }
        Insert: {
          address_city?: string
          address_number?: string
          address_state?: string
          address_street?: string
          address_zip?: string
          cpf?: string
          created_at?: string
          full_name?: string
          id: string
          role?: Database["indiepass"]["Enums"]["account_role"]
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          address_city?: string
          address_number?: string
          address_state?: string
          address_street?: string
          address_zip?: string
          cpf?: string
          created_at?: string
          full_name?: string
          id?: string
          role?: Database["indiepass"]["Enums"]["account_role"]
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      ticket_types: {
        Row: {
          available_quantity: number
          batch_number: number
          description: string
          event_id: string
          id: string
          name: string
          price: number
          total_quantity: number
        }
        Insert: {
          available_quantity: number
          batch_number?: number
          description?: string
          event_id: string
          id?: string
          name: string
          price?: number
          total_quantity: number
        }
        Update: {
          available_quantity?: number
          batch_number?: number
          description?: string
          event_id?: string
          id?: string
          name?: string
          price?: number
          total_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          attendee_cpf: string
          attendee_name: string
          checked_in_at: string | null
          event_id: string
          id: string
          order_id: string
          qr_code_hash: string
          status: string
          ticket_type_id: string
        }
        Insert: {
          attendee_cpf: string
          attendee_name: string
          checked_in_at?: string | null
          event_id: string
          id?: string
          order_id: string
          qr_code_hash: string
          status?: string
          ticket_type_id: string
        }
        Update: {
          attendee_cpf?: string
          attendee_name?: string
          checked_in_at?: string | null
          event_id?: string
          id?: string
          order_id?: string
          qr_code_hash?: string
          status?: string
          ticket_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_ticket: { Args: { _ticket_id: string }; Returns: undefined }
      check_in_ticket: {
        Args: { _code: string }
        Returns: {
          attendee: string
          event_title: string
          message: string
          ok: boolean
        }[]
      }
      create_order: {
        Args: {
          _cpf: string
          _email: string
          _event_id: string
          _items: Json
          _name: string
          _payment: string
          _whatsapp: string
        }
        Returns: string
      }
      get_order_tickets: {
        Args: { _email: string; _order_id: string }
        Returns: {
          attendee_name: string
          event_id: string
          id: string
          qr_code_hash: string
          status: string
          ticket_type: string
        }[]
      }
    }
    Enums: {
      account_role: "buyer" | "producer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "indiepass">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  indiepass: {
    Enums: {
      account_role: ["buyer", "producer"],
    },
  },
} as const
