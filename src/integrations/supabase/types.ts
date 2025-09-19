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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          created_at: string
          id: string
          name: string
          public_url: string
          storage_path: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          public_url: string
          storage_path: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          public_url?: string
          storage_path?: string
          type?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          added_at: string | null
          cart_id: string
          id: string
          product_id: string
          quantity: number
          variant_id: string | null
        }
        Insert: {
          added_at?: string | null
          cart_id: string
          id?: string
          product_id: string
          quantity?: number
          variant_id?: string | null
        }
        Update: {
          added_at?: string | null
          cart_id?: string
          id?: string
          product_id?: string
          quantity?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string | null
          id: string
          session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          followee_id: string
          follower_id: string
        }
        Insert: {
          created_at?: string
          followee_id: string
          follower_id: string
        }
        Update: {
          created_at?: string
          followee_id?: string
          follower_id?: string
        }
        Relationships: []
      }
      garment_categories: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      garment_colors: {
        Row: {
          code: string
          created_at: string
          garment_id: string
          hex: string
          id: string
          is_default: boolean
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          garment_id: string
          hex: string
          id?: string
          is_default?: boolean
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          garment_id?: string
          hex?: string
          id?: string
          is_default?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "garment_colors_garment_id_fkey"
            columns: ["garment_id"]
            isOneToOne: false
            referencedRelation: "garments"
            referencedColumns: ["id"]
          },
        ]
      }
      garment_template_images: {
        Row: {
          category_id: string
          color_slug: string
          created_at: string
          created_by: string | null
          dpi: number
          height_px: number
          id: string
          meta: Json
          print_area: Json
          safe_area: Json
          storage_path: string
          view: string
          width_px: number
        }
        Insert: {
          category_id: string
          color_slug?: string
          created_at?: string
          created_by?: string | null
          dpi?: number
          height_px: number
          id?: string
          meta?: Json
          print_area?: Json
          safe_area?: Json
          storage_path: string
          view: string
          width_px: number
        }
        Update: {
          category_id?: string
          color_slug?: string
          created_at?: string
          created_by?: string | null
          dpi?: number
          height_px?: number
          id?: string
          meta?: Json
          print_area?: Json
          safe_area?: Json
          storage_path?: string
          view?: string
          width_px?: number
        }
        Relationships: [
          {
            foreignKeyName: "garment_template_images_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "garment_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      garment_views: {
        Row: {
          aspect_ratio: number | null
          code: string
          created_at: string
          garment_id: string
          id: string
          name: string
          order_index: number
        }
        Insert: {
          aspect_ratio?: number | null
          code: string
          created_at?: string
          garment_id: string
          id?: string
          name: string
          order_index?: number
        }
        Update: {
          aspect_ratio?: number | null
          code?: string
          created_at?: string
          garment_id?: string
          id?: string
          name?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "garment_views_garment_id_fkey"
            columns: ["garment_id"]
            isOneToOne: false
            referencedRelation: "garments"
            referencedColumns: ["id"]
          },
        ]
      }
      garments: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string
          id: string
          movement_type: string
          quantity: number
          reason: string | null
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          movement_type: string
          quantity: number
          reason?: string | null
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          movement_type?: string
          quantity?: number
          reason?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          read: boolean | null
          recipient_id: string
          type: string
        }
        Insert: {
          actor_id: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          read?: boolean | null
          recipient_id: string
          type: string
        }
        Update: {
          actor_id?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          read?: boolean | null
          recipient_id?: string
          type?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          order_id: string
          product_id: string
          product_image: string | null
          product_name: string
          quantity: number
          size: string | null
          total_price: number
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          order_id: string
          product_id: string
          product_image?: string | null
          product_name: string
          quantity: number
          size?: string | null
          total_price: number
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          order_id?: string
          product_id?: string
          product_image?: string | null
          product_name?: string
          quantity?: number
          size?: string | null
          total_price?: number
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          currency: string
          id: string
          items: Json
          notes: string | null
          order_number: string
          payment_method: Json | null
          shipping_address: Json | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          currency?: string
          id?: string
          items?: Json
          notes?: string | null
          order_number: string
          payment_method?: Json | null
          shipping_address?: Json | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          currency?: string
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          payment_method?: Json | null
          shipping_address?: Json | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_media: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          media_type: string
          media_url: string
          post_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          media_type: string
          media_url: string
          post_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          media_type?: string
          media_url?: string
          post_id?: string
        }
        Relationships: []
      }
      post_reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_history: {
        Row: {
          change_reason: string | null
          created_by: string | null
          effective_date: string | null
          id: string
          new_price: number
          old_price: number | null
          product_id: string
        }
        Insert: {
          change_reason?: string | null
          created_by?: string | null
          effective_date?: string | null
          id?: string
          new_price: number
          old_price?: number | null
          product_id: string
        }
        Update: {
          change_reason?: string | null
          created_by?: string | null
          effective_date?: string | null
          id?: string
          new_price?: number
          old_price?: number | null
          product_id?: string
        }
        Relationships: []
      }
      product_analytics: {
        Row: {
          clicks: number
          conversions: number
          created_at: string
          day: string
          id: string
          product_id: string
          views: number
        }
        Insert: {
          clicks?: number
          conversions?: number
          created_at?: string
          day?: string
          id?: string
          product_id: string
          views?: number
        }
        Update: {
          clicks?: number
          conversions?: number
          created_at?: string
          day?: string
          id?: string
          product_id?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: string
          product_id: string
          url: string
          variant_id: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          product_id: string
          url: string
          variant_id?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          product_id?: string
          url?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          product_id: string
          rating: number
          title: string | null
          updated_at: string | null
          user_id: string
          verified_purchase: boolean | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string | null
          user_id: string
          verified_purchase?: boolean | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string
          verified_purchase?: boolean | null
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          color: string
          created_at: string | null
          id: string
          image_url: string | null
          price: number
          product_id: string
          size: string
          sku: string
          stock_quantity: number
          updated_at: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          price: number
          product_id: string
          size: string
          sku: string
          stock_quantity?: number
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          price?: number
          product_id?: string
          size?: string
          sku?: string
          stock_quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_variants_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          brand_id: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id?: string | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_metrics: {
        Row: {
          followers: number | null
          following: number | null
          total_designs: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          followers?: number | null
          following?: number | null
          total_designs?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          followers?: number | null
          following?: number | null
          total_designs?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          location: string | null
          preferences: Json | null
          privacy_settings: Json | null
          social_instagram: string | null
          social_twitter: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          location?: string | null
          preferences?: Json | null
          privacy_settings?: Json | null
          social_instagram?: string | null
          social_twitter?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          location?: string | null
          preferences?: Json | null
          privacy_settings?: Json | null
          social_instagram?: string | null
          social_twitter?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      recently_viewed: {
        Row: {
          id: string
          product_id: string
          session_id: string | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          id: string
          reason: string
          reporter_id: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason: string
          reporter_id: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      saved_posts: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          created_at: string
          id: string
          query: string
          results_count: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          results_count?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          results_count?: number
          user_id?: string | null
        }
        Relationships: []
      }
      staff_users: {
        Row: {
          user_id: string
        }
        Insert: {
          user_id: string
        }
        Update: {
          user_id?: string
        }
        Relationships: []
      }
      stock_alerts: {
        Row: {
          created_at: string
          id: string
          notification_sent: boolean
          threshold: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_sent?: boolean
          threshold?: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_sent?: boolean
          threshold?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_alerts_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      template_images: {
        Row: {
          active: boolean
          color_id: string
          created_at: string
          dpi: number | null
          garment_id: string
          height_px: number | null
          id: string
          mask_path: string | null
          print_bbox: Json | null
          public_url: string
          storage_path: string
          version: number
          view_id: string
          width_px: number | null
        }
        Insert: {
          active?: boolean
          color_id: string
          created_at?: string
          dpi?: number | null
          garment_id: string
          height_px?: number | null
          id?: string
          mask_path?: string | null
          print_bbox?: Json | null
          public_url: string
          storage_path: string
          version?: number
          view_id: string
          width_px?: number | null
        }
        Update: {
          active?: boolean
          color_id?: string
          created_at?: string
          dpi?: number | null
          garment_id?: string
          height_px?: number | null
          id?: string
          mask_path?: string | null
          print_bbox?: Json | null
          public_url?: string
          storage_path?: string
          version?: number
          view_id?: string
          width_px?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "template_images_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "garment_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_images_garment_id_fkey"
            columns: ["garment_id"]
            isOneToOne: false
            referencedRelation: "garments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_images_view_id_fkey"
            columns: ["view_id"]
            isOneToOne: false
            referencedRelation: "garment_views"
            referencedColumns: ["id"]
          },
        ]
      }
      uploader_jobs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          kind: string
          payload: Json
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          kind: string
          payload: Json
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          kind?: string
          payload?: Json
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          added_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_comment: {
        Args: { content_text: string; post_id_param: string }
        Returns: string
      }
      create_notification: {
        Args: {
          actor: string
          entity_id: string
          entity_type: string
          metadata?: Json
          notification_type: string
          recipient: string
        }
        Returns: string
      }
      create_post: {
        Args: { content_text: string }
        Returns: string
      }
      create_product_with_variants: {
        Args: {
          base_price_val?: number
          category_id_val?: string
          images_data?: Json
          product_description?: string
          product_name: string
          product_slug: string
          variants_data?: Json
        }
        Returns: string
      }
      ensure_my_profile: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["CompositeTypes"]["me_profile_full"]
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_feed_posts: {
        Args: { limit_count?: number }
        Returns: {
          avatar_url: string
          comments_count: number
          content: string
          created_at: string
          display_name: string
          id: string
          is_liked_by_user: boolean
          is_saved_by_user: boolean
          likes_count: number
          media_types: string[]
          media_urls: string[]
          reactions_summary: Json
          updated_at: string
          user_id: string
          user_reaction: string
          username: string
        }[]
      }
      get_following_feed_posts: {
        Args: { limit_count?: number }
        Returns: {
          avatar_url: string
          comments_count: number
          content: string
          created_at: string
          display_name: string
          id: string
          is_liked_by_user: boolean
          is_saved_by_user: boolean
          likes_count: number
          media_types: string[]
          media_urls: string[]
          reactions_summary: Json
          updated_at: string
          user_id: string
          user_reaction: string
          username: string
        }[]
      }
      get_me_profile_full: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          bio: string
          cover_url: string
          created_at: string
          display_name: string
          followers: number
          following: number
          location: string
          metrics_updated_at: string
          preferences: Json
          social_instagram: string
          social_twitter: string
          total_designs: number
          user_id: string
          username: string
          website: string
        }[]
      }
      get_me_profile_full_safe: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["CompositeTypes"]["me_profile_full"]
      }
      get_my_profile: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["CompositeTypes"]["me_profile_full"]
      }
      get_post_comments: {
        Args: { limit_count?: number; post_id_param: string }
        Returns: {
          avatar_url: string
          content: string
          created_at: string
          display_name: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
          username: string
        }[]
      }
      get_product_detail: {
        Args: { pid: string }
        Returns: {
          avg_rating: number
          base_price: number
          category_id: string
          category_name: string
          category_slug: string
          created_at: string
          creator_avatar_url: string
          creator_bio: string
          creator_display_name: string
          creator_id: string
          creator_username: string
          description: string
          images: Json
          name: string
          product_id: string
          recent_reviews: Json
          slug: string
          status: string
          total_favorites: number
          total_reviews: number
          total_views: number
          updated_at: string
          variants: Json
        }[]
      }
      get_product_images_with_views: {
        Args: { pid: string }
        Returns: {
          alt_text: string
          color_variant: string
          created_at: string
          display_order: number
          image_id: string
          url: string
          variant_id: string
          view_type: string
        }[]
      }
      get_public_profile: {
        Args: { u: string }
        Returns: {
          avatar_url: string
          bio: string
          cover_url: string
          display_name: string
          followers: number
          following: number
          location: string
          social_instagram: string
          social_twitter: string
          user_id: string
          username: string
          website: string
        }[]
      }
      get_public_profile_safe: {
        Args: { username_param: string }
        Returns: {
          avatar_url: string
          bio: string
          display_name: string
          followers: number
          following: number
          location: string
          social_instagram: string
          social_twitter: string
          total_designs: number
          user_id: string
          username: string
          website: string
        }[]
      }
      get_saved_posts: {
        Args: { limit_count?: number }
        Returns: {
          avatar_url: string
          comments_count: number
          content: string
          created_at: string
          display_name: string
          id: string
          is_liked_by_user: boolean
          is_saved_by_user: boolean
          likes_count: number
          media_types: string[]
          media_urls: string[]
          reactions_summary: Json
          updated_at: string
          user_id: string
          user_reaction: string
          username: string
        }[]
      }
      is_username_available: {
        Args: { name: string; self_id?: string } | { username_to_check: string }
        Returns: boolean
      }
      list_followers: {
        Args: { lim?: number; off?: number; target: string }
        Returns: {
          created_at: string
          follower_id: string
        }[]
      }
      list_following: {
        Args: { lim?: number; off?: number; target: string }
        Returns: {
          created_at: string
          followee_id: string
        }[]
      }
      list_market_cards: {
        Args: {
          filters?: Json
          lim?: number
          off?: number
          q?: string
          tab?: string
        }
        Returns: {
          avg_rating: number
          created_at: string
          creator_avatar_url: string
          creator_display_name: string
          creator_id: string
          creator_username: string
          currency: string
          description: string
          favorites: number
          has_badge_low_stock: boolean
          has_badge_new: boolean
          has_badge_trending: boolean
          price_cents: number
          primary_image: string
          product_id: string
          reviews_count: number
          slug: string
          status: string
          title: string
          trend_score: number
          views: number
        }[]
      }
      mark_product_view: {
        Args: { pid: string }
        Returns: undefined
      }
      search_discoverable_profiles: {
        Args: { limit_count?: number; search_term: string }
        Returns: {
          avatar_url: string
          bio: string
          display_name: string
          followers: number
          user_id: string
          username: string
        }[]
      }
      set_my_profile: {
        Args: { patch: Json }
        Returns: undefined
      }
      toggle_favorite: {
        Args: { pid: string }
        Returns: boolean
      }
      toggle_post_like: {
        Args: { post_id_param: string }
        Returns: boolean
      }
      toggle_post_save: {
        Args: { post_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      me_profile_full: {
        user_id: string | null
        username: string | null
        display_name: string | null
        bio: string | null
        location: string | null
        website: string | null
        social_instagram: string | null
        social_twitter: string | null
        avatar_url: string | null
        cover_url: string | null
        preferences: Json | null
        privacy_settings: Json | null
        created_at: string | null
        followers: number | null
        following: number | null
        total_designs: number | null
        metrics_updated_at: string | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
