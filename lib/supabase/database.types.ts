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
  public: {
    Tables: {
      activity_log: {
        Row: {
          data: Json | null
          day: number | null
          id: string
          journey_id: string | null
          source: string
          timestamp: string
          tool_type: string
          user_id: string
        }
        Insert: {
          data?: Json | null
          day?: number | null
          id?: string
          journey_id?: string | null
          source: string
          timestamp?: string
          tool_type: string
          user_id: string
        }
        Update: {
          data?: Json | null
          day?: number | null
          id?: string
          journey_id?: string | null
          source?: string
          timestamp?: string
          tool_type?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          body_markdown: string
          category: string
          created_at: string
          excerpt: string
          id: string
          published_at: string | null
          risk: string
          slug: string
          sources: Json
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          body_markdown: string
          category: string
          created_at?: string
          excerpt: string
          id?: string
          published_at?: string | null
          risk: string
          slug: string
          sources?: Json
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          body_markdown?: string
          category?: string
          created_at?: string
          excerpt?: string
          id?: string
          published_at?: string | null
          risk?: string
          slug?: string
          sources?: Json
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source_slug: string | null
          unsubscribe_token: string
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source_slug?: string | null
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source_slug?: string | null
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          qty: number
          tea_key: string
          user_id: string
        }
        Insert: {
          qty: number
          tea_key: string
          user_id: string
        }
        Update: {
          qty?: number
          tea_key?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          from_who: string
          id: string
          journey_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          from_who: string
          id?: string
          journey_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          from_who?: string
          id?: string
          journey_id?: string
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      diary_entries: {
        Row: {
          created_at: string
          id: string
          journey_day: number | null
          journey_name: string | null
          moods: string[]
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          journey_day?: number | null
          journey_name?: string | null
          moods?: string[]
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          journey_day?: number | null
          journey_name?: string | null
          moods?: string[]
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      dynamic_journey_days: {
        Row: {
          bloco1: Json
          bloco2: Json
          bloco3: Json
          bloco4: Json
          bloco45: Json
          bloco5: Json
          bloco6: Json
          chapter: number
          day: number
          is_marco: boolean
          journey_id: string
          updated_at: string
        }
        Insert: {
          bloco1: Json
          bloco2: Json
          bloco3: Json
          bloco4: Json
          bloco45: Json
          bloco5: Json
          bloco6: Json
          chapter: number
          day: number
          is_marco?: boolean
          journey_id: string
          updated_at?: string
        }
        Update: {
          bloco1?: Json
          bloco2?: Json
          bloco3?: Json
          bloco4?: Json
          bloco45?: Json
          bloco5?: Json
          bloco6?: Json
          chapter?: number
          day?: number
          is_marco?: boolean
          journey_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_journey_days_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "dynamic_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_journeys: {
        Row: {
          accent: string
          created_at: string
          created_by: string
          id: string
          published_at: string | null
          status: string
          title: string
          total_days: number
          updated_at: string
        }
        Insert: {
          accent: string
          created_at?: string
          created_by: string
          id: string
          published_at?: string | null
          status?: string
          title: string
          total_days: number
          updated_at?: string
        }
        Update: {
          accent?: string
          created_at?: string
          created_by?: string
          id?: string
          published_at?: string | null
          status?: string
          title?: string
          total_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      ferramenta_grupos: {
        Row: {
          created_at: string
          ferramenta: string
          id: string
          semana: string
          tier: number
        }
        Insert: {
          created_at?: string
          ferramenta: string
          id?: string
          semana: string
          tier: number
        }
        Update: {
          created_at?: string
          ferramenta?: string
          id?: string
          semana?: string
          tier?: number
        }
        Relationships: []
      }
      ferramenta_membros: {
        Row: {
          ferramenta: string
          grupo_id: string
          joined_at: string
          semana: string
          user_id: string
        }
        Insert: {
          ferramenta: string
          grupo_id: string
          joined_at?: string
          semana: string
          user_id: string
        }
        Update: {
          ferramenta?: string
          grupo_id?: string
          joined_at?: string
          semana?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ferramenta_membros_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "ferramenta_grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      flora_crisis_counter: {
        Row: {
          acionamentos: number
          dia: string
        }
        Insert: {
          acionamentos?: number
          dia: string
        }
        Update: {
          acionamentos?: number
          dia?: string
        }
        Relationships: []
      }
      flora_crisis_sessions: {
        Row: {
          opened_at: string
          user_id: string
        }
        Insert: {
          opened_at?: string
          user_id: string
        }
        Update: {
          opened_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flora_poses: {
        Row: {
          id: string
          image_url: string
          is_active: boolean
          name: string
          requires_journey_slug: string | null
          requires_tea_key: string | null
          requires_tool: string | null
          unlock_type: string
          unlock_value: number | null
        }
        Insert: {
          id?: string
          image_url: string
          is_active?: boolean
          name: string
          requires_journey_slug?: string | null
          requires_tea_key?: string | null
          requires_tool?: string | null
          unlock_type: string
          unlock_value?: number | null
        }
        Update: {
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          requires_journey_slug?: string | null
          requires_tea_key?: string | null
          requires_tool?: string | null
          unlock_type?: string
          unlock_value?: number | null
        }
        Relationships: []
      }
      flora_usage_daily: {
        Row: {
          messages_used: number
          quota: number
          usage_date: string
          user_id: string
        }
        Insert: {
          messages_used?: number
          quota?: number
          usage_date: string
          user_id: string
        }
        Update: {
          messages_used?: number
          quota?: number
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      garden_unlocks: {
        Row: {
          day: number
          journey_id: string
          key: string
          name: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          day: number
          journey_id: string
          key: string
          name: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          day?: number
          journey_id?: string
          key?: string
          name?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          count: number
          date: string
          habit_id: string
          user_id: string
        }
        Insert: {
          count?: number
          date: string
          habit_id: string
          user_id: string
        }
        Update: {
          count?: number
          date?: string
          habit_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          created_at: string
          freq_label: string
          goal: number
          icon: string
          id: string
          name: string
          origin: string | null
          reminder: boolean
          reminder_time: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          freq_label: string
          goal?: number
          icon: string
          id?: string
          name: string
          origin?: string | null
          reminder?: boolean
          reminder_time?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          freq_label?: string
          goal?: number
          icon?: string
          id?: string
          name?: string
          origin?: string | null
          reminder?: boolean
          reminder_time?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journey_garden_items: {
        Row: {
          day_milestone: number
          glb_node_name: string | null
          id: string
          journey_slug: string
          name: string
          rendered_image_url: string | null
        }
        Insert: {
          day_milestone: number
          glb_node_name?: string | null
          id?: string
          journey_slug: string
          name: string
          rendered_image_url?: string | null
        }
        Update: {
          day_milestone?: number
          glb_node_name?: string | null
          id?: string
          journey_slug?: string
          name?: string
          rendered_image_url?: string | null
        }
        Relationships: []
      }
      liga_grupos: {
        Row: {
          created_at: string
          id: string
          semana: string
          tier: number
        }
        Insert: {
          created_at?: string
          id?: string
          semana: string
          tier: number
        }
        Update: {
          created_at?: string
          id?: string
          semana?: string
          tier?: number
        }
        Relationships: []
      }
      liga_membros: {
        Row: {
          grupo_id: string
          joined_at: string
          semana: string
          user_id: string
        }
        Insert: {
          grupo_id: string
          joined_at?: string
          semana: string
          user_id: string
        }
        Update: {
          grupo_id?: string
          joined_at?: string
          semana?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "liga_membros_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "liga_grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      liga_perfil: {
        Row: {
          apelido: string | null
          aviso_rankings_visto_em: string | null
          onboarding_visto_em: string | null
          opt_in_em: string | null
          tier: number
          updated_at: string
          user_id: string
        }
        Insert: {
          apelido?: string | null
          aviso_rankings_visto_em?: string | null
          onboarding_visto_em?: string | null
          opt_in_em?: string | null
          tier?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          apelido?: string | null
          aviso_rankings_visto_em?: string | null
          onboarding_visto_em?: string | null
          opt_in_em?: string | null
          tier?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      melhor_envio_tokens: {
        Row: {
          access_token: string
          expires_at: string
          id: boolean
          refresh_token: string
          updated_at: string
        }
        Insert: {
          access_token: string
          expires_at: string
          id?: boolean
          refresh_token: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          expires_at?: string
          id?: boolean
          refresh_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      melhoria_area_config: {
        Row: {
          area: string
          dica: string | null
          label: string | null
          position: number | null
          user_id: string
        }
        Insert: {
          area: string
          dica?: string | null
          label?: string | null
          position?: number | null
          user_id: string
        }
        Update: {
          area?: string
          dica?: string | null
          label?: string | null
          position?: number | null
          user_id?: string
        }
        Relationships: []
      }
      melhoria_checkins: {
        Row: {
          area: string
          date: string
          done: boolean
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          area: string
          date: string
          done?: boolean
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          area?: string
          date?: string
          done?: boolean
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mood_checkins: {
        Row: {
          created_at: string
          id: string
          journey_id: string | null
          kit_afirmacao: string | null
          kit_o_que_importa: string | null
          kit_o_que_vem_a_seguir: string | null
          mood: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          journey_id?: string | null
          kit_afirmacao?: string | null
          kit_o_que_importa?: string | null
          kit_o_que_vem_a_seguir?: string | null
          mood: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          journey_id?: string | null
          kit_afirmacao?: string | null
          kit_o_que_importa?: string | null
          kit_o_que_vem_a_seguir?: string | null
          mood?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          checkout_url: string | null
          created_at: string
          id: string
          items: Json
          mp_payment_id: string | null
          mp_preference_id: string | null
          ship_bairro: string | null
          ship_cep: string | null
          ship_cidade: string | null
          ship_complemento: string | null
          ship_numero: string | null
          ship_rua: string | null
          ship_uf: string | null
          shipping_fee: number
          shipping_service: string | null
          status: string
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          checkout_url?: string | null
          created_at?: string
          id?: string
          items: Json
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          ship_bairro?: string | null
          ship_cep?: string | null
          ship_cidade?: string | null
          ship_complemento?: string | null
          ship_numero?: string | null
          ship_rua?: string | null
          ship_uf?: string | null
          shipping_fee?: number
          shipping_service?: string | null
          status?: string
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          checkout_url?: string | null
          created_at?: string
          id?: string
          items?: Json
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          ship_bairro?: string | null
          ship_cep?: string | null
          ship_cidade?: string | null
          ship_complemento?: string | null
          ship_numero?: string | null
          ship_rua?: string | null
          ship_uf?: string | null
          shipping_fee?: number
          shipping_service?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          celular: string | null
          cpf: string | null
          created_at: string
          email: string | null
          endereco_bairro: string | null
          endereco_cep: string | null
          endereco_cidade: string | null
          endereco_complemento: string | null
          endereco_numero: string | null
          endereco_rua: string | null
          endereco_uf: string | null
          faixa_etaria: string | null
          id: string
          nome: string
          sms_whatsapp_opt_in_em: string | null
        }
        Insert: {
          celular?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_complemento?: string | null
          endereco_numero?: string | null
          endereco_rua?: string | null
          endereco_uf?: string | null
          faixa_etaria?: string | null
          id: string
          nome?: string
          sms_whatsapp_opt_in_em?: string | null
        }
        Update: {
          celular?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_complemento?: string | null
          endereco_numero?: string | null
          endereco_rua?: string | null
          endereco_uf?: string | null
          faixa_etaria?: string | null
          id?: string
          nome?: string
          sms_whatsapp_opt_in_em?: string | null
        }
        Relationships: []
      }
      redeemed_rewards: {
        Row: {
          redeemed_at: string
          reward_id: string
          user_id: string
        }
        Insert: {
          redeemed_at?: string
          reward_id: string
          user_id: string
        }
        Update: {
          redeemed_at?: string
          reward_id?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_codigos: {
        Row: {
          codigo: string
          created_at: string
          device_id: string | null
          indicado_por: string | null
          suspeito: boolean
          user_id: string
        }
        Insert: {
          codigo: string
          created_at?: string
          device_id?: string | null
          indicado_por?: string | null
          suspeito?: boolean
          user_id: string
        }
        Update: {
          codigo?: string
          created_at?: string
          device_id?: string | null
          indicado_por?: string | null
          suspeito?: boolean
          user_id?: string
        }
        Relationships: []
      }
      referral_events: {
        Row: {
          id: string
          invited_user_id: string
          ocorrido_em: string
          referrer_id: string
          tipo_acao: string
        }
        Insert: {
          id?: string
          invited_user_id: string
          ocorrido_em?: string
          referrer_id: string
          tipo_acao: string
        }
        Update: {
          id?: string
          invited_user_id?: string
          ocorrido_em?: string
          referrer_id?: string
          tipo_acao?: string
        }
        Relationships: []
      }
      seeds_balance: {
        Row: {
          total_seeds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          total_seeds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          total_seeds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seeds_events: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json | null
          source_tool: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json | null
          source_tool: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          source_tool?: string
          user_id?: string
        }
        Relationships: []
      }
      shop_customers: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shop_order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_slug: string
          qty: number
          subtotal_cents: number
          unit_price_cents: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_slug: string
          qty: number
          subtotal_cents: number
          unit_price_cents: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_slug?: string
          qty?: number
          subtotal_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "shop_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_orders: {
        Row: {
          access_token: string
          bairro: string
          cep: string
          cidade: string
          complemento: string | null
          confirmed_at: string | null
          coupon_code: string | null
          created_at: string
          customer_id: string | null
          email: string
          id: string
          mp_payment_id: string | null
          mp_payment_status: string | null
          mp_preference_id: string | null
          mp_status_detail: string | null
          nome: string
          numero: string
          order_number: string
          rua: string
          shipping_fee_cents: number
          shipping_method: string
          shipping_service_name: string | null
          shipping_quote_cents: number | null
          shipping_delivery_days: number | null
          status: string
          subtotal_cents: number
          telefone: string
          total_cents: number
          uf: string
          updated_at: string
        }
        Insert: {
          access_token?: string
          bairro: string
          cep: string
          cidade: string
          complemento?: string | null
          confirmed_at?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_id?: string | null
          email: string
          id?: string
          mp_payment_id?: string | null
          mp_payment_status?: string | null
          mp_preference_id?: string | null
          mp_status_detail?: string | null
          nome: string
          numero: string
          order_number: string
          rua: string
          shipping_fee_cents?: number
          shipping_method: string
          shipping_service_name: string | null
          shipping_quote_cents: number | null
          shipping_delivery_days: number | null
          status?: string
          subtotal_cents: number
          telefone: string
          total_cents: number
          uf: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          bairro?: string
          cep?: string
          cidade?: string
          complemento?: string | null
          confirmed_at?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string
          id?: string
          mp_payment_id?: string | null
          mp_payment_status?: string | null
          mp_preference_id?: string | null
          mp_status_detail?: string | null
          nome?: string
          numero?: string
          order_number?: string
          rua?: string
          shipping_fee_cents?: number
          shipping_method?: string
          shipping_service_name?: string | null
          shipping_quote_cents?: number | null
          shipping_delivery_days?: number | null
          status?: string
          subtotal_cents?: number
          telefone?: string
          total_cents?: number
          uf?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "shop_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_payment_attempts: {
        Row: {
          amount_cents: number | null
          created_at: string
          id: string
          mp_payment_id: string
          order_id: string
          payment_method_id: string | null
          payment_type_id: string | null
          status: string
          status_detail: string | null
          updated_at: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          id?: string
          mp_payment_id: string
          order_id: string
          payment_method_id?: string | null
          payment_type_id?: string | null
          status: string
          status_detail?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          id?: string
          mp_payment_id?: string
          order_id?: string
          payment_method_id?: string | null
          payment_type_id?: string | null
          status?: string
          status_detail?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_payment_attempts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_products: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          price_cents: number
          price_tier2_cents: number
          price_tier3_cents: number
          slug: string
          updated_at: string
          weight_grams: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          price_cents: number
          price_tier2_cents: number
          price_tier3_cents: number
          slug: string
          updated_at?: string
          weight_grams: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          price_cents?: number
          price_tier2_cents?: number
          price_tier3_cents?: number
          slug?: string
          updated_at?: string
          weight_grams?: number
        }
        Relationships: []
      }
      shop_quiz_responses: {
        Row: {
          answers: Json
          created_at: string
          id: string
          primary_result_slug: string
          secondary_result_slug: string | null
        }
        Insert: {
          answers: Json
          created_at?: string
          id?: string
          primary_result_slug: string
          secondary_result_slug?: string | null
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          primary_result_slug?: string
          secondary_result_slug?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          current_period_ends_at: string | null
          platform: string | null
          product_id: string | null
          status: string
          trial_ends_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          current_period_ends_at?: string | null
          platform?: string | null
          product_id?: string | null
          status?: string
          trial_ends_at: string
          updated_at?: string
          user_id: string
        }
        Update: {
          current_period_ends_at?: string | null
          platform?: string | null
          product_id?: string | null
          status?: string
          trial_ends_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      todo_categories: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          cat_key: string
          cat_name: string
          completed_at: string | null
          created_at: string
          done: boolean
          due_date: string | null
          id: string
          note: string | null
          origin: string | null
          prio: number | null
          repeat: boolean
          repeat_type: string | null
          text: string
          time: string | null
          user_id: string
        }
        Insert: {
          cat_key: string
          cat_name: string
          completed_at?: string | null
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          note?: string | null
          origin?: string | null
          prio?: number | null
          repeat?: boolean
          repeat_type?: string | null
          text: string
          time?: string | null
          user_id: string
        }
        Update: {
          cat_key?: string
          cat_name?: string
          completed_at?: string | null
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          note?: string | null
          origin?: string | null
          prio?: number | null
          repeat?: boolean
          repeat_type?: string | null
          text?: string
          time?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_flora_unlocks: {
        Row: {
          id: string
          pose_id: string
          revealed_at: string | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          id?: string
          pose_id: string
          revealed_at?: string | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          id?: string
          pose_id?: string
          revealed_at?: string | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_flora_unlocks_pose_id_fkey"
            columns: ["pose_id"]
            isOneToOne: false
            referencedRelation: "flora_poses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_garden_progress: {
        Row: {
          current_day: number
          id: string
          journey_slug: string
          started_at: string
          user_id: string
        }
        Insert: {
          current_day?: number
          id?: string
          journey_slug: string
          started_at?: string
          user_id: string
        }
        Update: {
          current_day?: number
          id?: string
          journey_slug?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_garden_unlocks: {
        Row: {
          garden_item_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          garden_item_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          garden_item_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_garden_unlocks_garden_item_id_fkey"
            columns: ["garden_item_id"]
            isOneToOne: false
            referencedRelation: "journey_garden_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journeys: {
        Row: {
          data_conclusao: string | null
          data_inicio: string
          dia_atual: number
          journey_id: string
          lesson_step: number
          status: string
          tea_choice: string | null
          tea_outro_nome: string | null
          user_id: string
        }
        Insert: {
          data_conclusao?: string | null
          data_inicio?: string
          dia_atual?: number
          journey_id: string
          lesson_step?: number
          status: string
          tea_choice?: string | null
          tea_outro_nome?: string | null
          user_id: string
        }
        Update: {
          data_conclusao?: string | null
          data_inicio?: string
          dia_atual?: number
          journey_id?: string
          lesson_step?: number
          status?: string
          tea_choice?: string | null
          tea_outro_nome?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_state: {
        Row: {
          ansiedade_exposicao_avisada_em: string | null
          focus_journey: string | null
          last_completed_day: number | null
          last_completed_journey: string | null
          lesson_intro_seen_at: string | null
          melhoria_priority_onboarded_at: string | null
          onboarded: boolean
          streak_best: number
          streak_current: number
          streak_last_active_date: string | null
          tool_intros_seen: string[]
          updated_at: string
          user_id: string
          wim_hof_checked_at: string | null
        }
        Insert: {
          ansiedade_exposicao_avisada_em?: string | null
          focus_journey?: string | null
          last_completed_day?: number | null
          last_completed_journey?: string | null
          lesson_intro_seen_at?: string | null
          melhoria_priority_onboarded_at?: string | null
          onboarded?: boolean
          streak_best?: number
          streak_current?: number
          streak_last_active_date?: string | null
          tool_intros_seen?: string[]
          updated_at?: string
          user_id: string
          wim_hof_checked_at?: string | null
        }
        Update: {
          ansiedade_exposicao_avisada_em?: string | null
          focus_journey?: string | null
          last_completed_day?: number | null
          last_completed_journey?: string | null
          lesson_intro_seen_at?: string | null
          melhoria_priority_onboarded_at?: string | null
          onboarded?: boolean
          streak_best?: number
          streak_current?: number
          streak_last_active_date?: string | null
          tool_intros_seen?: string[]
          updated_at?: string
          user_id?: string
          wim_hof_checked_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_seeds: {
        Args: {
          p_amount: number
          p_metadata?: Json
          p_source: string
          p_user_id: string
        }
        Returns: number
      }
      advance_journey_day: {
        Args: {
          p_data_conclusao: string
          p_journey_id: string
          p_next_day: number
          p_status: string
          p_user_id: string
        }
        Returns: undefined
      }
      celular_br_valido: { Args: { p_celular: string }; Returns: boolean }
      completar_cadastro: {
        Args: { p_celular: string; p_cpf: string; p_sms_opt_in: boolean }
        Returns: undefined
      }
      cpf_valido: { Args: { p_cpf: string }; Returns: boolean }
      crm_track_server: {
        Args: {
          p_anonymous_id?: string
          p_context?: Json
          p_email?: string
          p_idempotency_key?: string
          p_name: string
          p_occurred_at?: string
          p_person_name?: string
          p_phone?: string
          p_properties?: Json
          p_session_id?: string
          p_shop_customer_id?: string
        }
        Returns: number
      }
      crm_track_web: { Args: { p_events: Json }; Returns: number }
      crm_unsubscribe: { Args: { p_message_id: string }; Returns: string }
      newsletter_unsubscribe: { Args: { p_token: string }; Returns: string | null }
      ferramenta_entrar: { Args: { p_ferramenta: string }; Returns: string }
      ferramenta_meu_ranking: {
        Args: { p_ferramenta: string }
        Returns: {
          apelido: string
          grupo_tamanho: number
          posicao: number
          sou_eu: boolean
          valor: number
        }[]
      }
      ferramenta_valor_semana: {
        Args: { p_ferramenta: string; p_semana: string; p_user_id: string }
        Returns: number
      }
      gerar_codigo_referral: { Args: never; Returns: string }
      has_open_crisis_session: {
        Args: { p_horas?: number; p_user_id: string }
        Returns: boolean
      }
      increment_flora_usage: {
        Args: { p_date: string; p_quota?: number; p_user_id: string }
        Returns: {
          allowed: boolean
          messages_used: number
          quota: number
        }[]
      }
      liga_join: { Args: { p_apelido: string }; Returns: undefined }
      liga_meu_ranking: {
        Args: never
        Returns: {
          apelido: string
          posicao: number
          sou_eu: boolean
          user_id: string
          xp: number
        }[]
      }
      liga_meus_grupo_ids: { Args: never; Returns: string[] }
      liga_weekly_reset: { Args: never; Returns: undefined }
      liga_weekly_xp: {
        Args: { p_semana: string; p_user_id: string }
        Returns: number
      }
      mark_flora_unlock_revealed: {
        Args: { p_pose_id: string; p_user_id: string }
        Returns: undefined
      }
      purge_expired_crisis_sessions: { Args: never; Returns: number }
      record_crisis_trigger: { Args: { p_user_id: string }; Returns: undefined }
      referral_meu_codigo: { Args: never; Returns: string }
      referral_minhas_indicacoes: {
        Args: never
        Returns: {
          quantidade: number
          tipo_acao: string
        }[]
      }
      referral_registrar_ritual: { Args: never; Returns: undefined }
      set_garden_progress: {
        Args: {
          p_current_day: number
          p_journey_slug: string
          p_user_id: string
        }
        Returns: undefined
      }
      track_events: { Args: { p_events: Json }; Returns: number }
      unlock_flora_pose: {
        Args: { p_pose_id: string; p_user_id: string }
        Returns: boolean
      }
      unlock_garden_item: {
        Args: { p_garden_item_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

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
  public: {
    Enums: {},
  },
} as const
