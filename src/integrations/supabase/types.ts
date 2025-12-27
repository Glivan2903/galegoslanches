export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null;
          description: string | null;
          display_order: number | null;
          id: string;
          image_url: string | null;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          id?: string;
          image_url?: string | null;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      delivery_regions: {
        Row: {
          created_at: string;
          fee: number;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          fee?: number;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          fee?: number;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      drivers: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          phone: string;
          status: string;
          updated_at: string;
          vehicle: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          phone: string;
          status?: string;
          updated_at?: string;
          vehicle?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          phone?: string;
          status?: string;
          updated_at?: string;
          vehicle?: string | null;
        };
        Relationships: [];
      };
      order_item_addons: {
        Row: {
          addon_id: string;
          created_at: string;
          id: string;
          order_item_id: string;
          quantity: number;
          total_price: number;
          unit_price: number;
        };
        Insert: {
          addon_id: string;
          created_at?: string;
          id?: string;
          order_item_id: string;
          quantity: number;
          total_price: number;
          unit_price: number;
        };
        Update: {
          addon_id?: string;
          created_at?: string;
          id?: string;
          order_item_id?: string;
          quantity?: number;
          total_price?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_item_addons_addon_id_fkey";
            columns: ["addon_id"];
            isOneToOne: false;
            referencedRelation: "product_addons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_item_addons_order_item_id_fkey";
            columns: ["order_item_id"];
            isOneToOne: false;
            referencedRelation: "order_items";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          order_id: string;
          product_id: string;
          quantity: number;
          total_price: number;
          unit_price: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          order_id: string;
          product_id: string;
          quantity: number;
          total_price: number;
          unit_price: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          total_price?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          created_at: string;
          customer_name: string;
          customer_phone: string;
          delivery_address: string | null;
          delivery_completed_at: string | null;
          delivery_driver_id: string | null;
          delivery_fee: number;
          delivery_region_id: string | null;
          delivery_started_at: string | null;
          delivery_status: string | null;
          discount: number;
          id: string;
          notes: string | null;
          number: string | null;
          order_type: string;
          payment_method: string;
          payment_status: string;
          status: string;
          subtotal: number;
          table_number: string | null;
          total: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          customer_name: string;
          customer_phone: string;
          delivery_address?: string | null;
          delivery_completed_at?: string | null;
          delivery_driver_id?: string | null;
          delivery_fee?: number;
          delivery_region_id?: string | null;
          delivery_started_at?: string | null;
          delivery_status?: string | null;
          discount?: number;
          id?: string;
          notes?: string | null;
          number?: string | null;
          order_type?: string;
          payment_method: string;
          payment_status: string;
          status: string;
          subtotal: number;
          table_number?: string | null;
          total: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          customer_name?: string;
          customer_phone?: string;
          delivery_address?: string | null;
          delivery_completed_at?: string | null;
          delivery_driver_id?: string | null;
          delivery_fee?: number;
          delivery_region_id?: string | null;
          delivery_started_at?: string | null;
          delivery_status?: string | null;
          discount?: number;
          id?: string;
          notes?: string | null;
          number?: string | null;
          order_type?: string;
          payment_method?: string;
          payment_status?: string;
          status?: string;
          subtotal?: number;
          table_number?: string | null;
          total?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_delivery_driver_id_fkey";
            columns: ["delivery_driver_id"];
            isOneToOne: false;
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_delivery_region_id_fkey";
            columns: ["delivery_region_id"];
            isOneToOne: false;
            referencedRelation: "delivery_regions";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_methods: {
        Row: {
          created_at: string | null;
          description: string | null;
          display_order: number | null;
          enabled: boolean;
          icon: string | null;
          id: string;
          name: string;
          restaurant_id: string | null;
          updated_at: string | null;
          pix_key: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          enabled?: boolean;
          icon?: string | null;
          id?: string;
          name: string;
          restaurant_id?: string | null;
          updated_at?: string | null;
          pix_key?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          enabled?: boolean;
          icon?: string | null;
          id?: string;
          name?: string;
          restaurant_id?: string | null;
          updated_at?: string | null;
          pix_key?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payment_methods_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          }
        ];
      };
      product_addon_relations: {
        Row: {
          addon_id: string;
          created_at: string;
          id: string;
          product_id: string;
        };
        Insert: {
          addon_id: string;
          created_at?: string;
          id?: string;
          product_id: string;
        };
        Update: {
          addon_id?: string;
          created_at?: string;
          id?: string;
          product_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_addon_relations_addon_id_fkey";
            columns: ["addon_id"];
            isOneToOne: false;
            referencedRelation: "product_addons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_addon_relations_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      product_addons: {
        Row: {
          available: boolean;
          created_at: string;
          description: string | null;
          id: string;
          is_global: boolean;
          max_options: number | null;
          name: string;
          price: number;
          updated_at: string;
        };
        Insert: {
          available?: boolean;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_global?: boolean;
          max_options?: number | null;
          name: string;
          price: number;
          updated_at?: string;
        };
        Update: {
          available?: boolean;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_global?: boolean;
          max_options?: number | null;
          name?: string;
          price?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          available: boolean | null;
          category_id: string | null;
          created_at: string | null;
          description: string | null;
          featured: boolean | null;
          id: string;
          image_url: string | null;
          name: string;
          price: number;
          updated_at: string | null;
        };
        Insert: {
          available?: boolean | null;
          category_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          featured?: boolean | null;
          id?: string;
          image_url?: string | null;
          name: string;
          price: number;
          updated_at?: string | null;
        };
        Update: {
          available?: boolean | null;
          category_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          featured?: boolean | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          price?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      restaurants: {
        Row: {
          address: string | null;
          banner_url: string | null;
          close_time: string | null;
          created_at: string | null;
          delivery_fee: number | null;
          description: string | null;
          id: string;
          logo_url: string | null;
          min_order_value: number | null;
          name: string;
          open_time: string | null;
          phone: string | null;
          theme_settings: Json | null;
          updated_at: string | null;
        };
        Insert: {
          address?: string | null;
          banner_url?: string | null;
          close_time?: string | null;
          created_at?: string | null;
          delivery_fee?: number | null;
          description?: string | null;
          id?: string;
          logo_url?: string | null;
          min_order_value?: number | null;
          name: string;
          open_time?: string | null;
          phone?: string | null;
          theme_settings?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          address?: string | null;
          banner_url?: string | null;
          close_time?: string | null;
          created_at?: string | null;
          delivery_fee?: number | null;
          description?: string | null;
          id?: string;
          logo_url?: string | null;
          min_order_value?: number | null;
          name?: string;
          open_time?: string | null;
          phone?: string | null;
          theme_settings?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      system_settings: {
        Row: {
          allow_registration: boolean | null;
          created_at: string | null;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          allow_registration?: boolean | null;
          created_at?: string | null;
          id?: string;
          updated_at?: string | null;
        };
        Update: {
          allow_registration?: boolean | null;
          created_at?: string | null;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      user_permissions: {
        Row: {
          created_at: string | null;
          id: string;
          permission: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          permission: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          permission?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string | null;
          email: string;
          first_name: string | null;
          id: string;
          last_name: string | null;
          password: string;
          role: Database["public"]["Enums"]["user_role"] | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          password: string;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          password?: string;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      business_hours: {
        Row: {
          id: string;
          day_of_week: string;
          open_time: string;
          close_time: string;
          is_closed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          day_of_week: string;
          open_time: string;
          close_time: string;
          is_closed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          day_of_week?: string;
          open_time?: string;
          close_time?: string;
          is_closed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      delivery_times: {
        Row: {
          id: string;
          restaurant_id: string;
          min_time: number;
          max_time: number;
          day_of_week: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          min_time: number;
          max_time: number;
          day_of_week?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          min_time?: number;
          max_time?: number;
          day_of_week?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "delivery_times_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      activate_license: {
        Args: { license_key: string };
        Returns: boolean;
      };
      authenticate_user: {
        Args: { p_email: string; p_password: string };
        Returns: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: Database["public"]["Enums"]["user_role"];
        }[];
      };
      check_license_validity: {
        Args: { license_key: string };
        Returns: boolean;
      };
      create_appointments_table_if_not_exists: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      create_user: {
        Args: {
          p_email: string;
          p_password: string;
          p_first_name: string;
          p_last_name: string;
        };
        Returns: string;
      };
      get_product_addon_relations: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          product_id: string;
          addon_id: string;
        }[];
      };
      get_product_addons: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          name: string;
          description: string;
          price: number;
          available: boolean;
          is_global: boolean;
          max_options: number;
        }[];
      };
      get_product_addons_by_product: {
        Args: { product_id_param: string };
        Returns: {
          id: string;
          name: string;
          description: string;
          price: number;
          available: boolean;
          is_global: boolean;
          max_options: number;
        }[];
      };
      get_user_permissions: {
        Args: { user_id_param: string };
        Returns: {
          permission: Database["public"]["Enums"]["permission"];
        }[];
      };
      has_permission: {
        Args: { permission_name: Database["public"]["Enums"]["permission"] };
        Returns: boolean;
      };
      has_role: {
        Args: { role: Database["public"]["Enums"]["app_role"] };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_owner: {
        Args: { resource_user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "manager" | "staff" | "driver";
      permission:
      | "dashboard"
      | "agenda"
      | "services"
      | "professionals"
      | "clients"
      | "loyalty"
      | "reports"
      | "settings"
      | "evolution_api"
      | "ai";
      user_role: "admin" | "staff";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
  ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
  ? R
  : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I;
  }
  ? I
  : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U;
  }
  ? U
  : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
  ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "staff", "driver"],
      permission: [
        "dashboard",
        "agenda",
        "services",
        "professionals",
        "clients",
        "loyalty",
        "reports",
        "settings",
        "evolution_api",
        "ai",
      ],
      user_role: ["admin", "staff"],
    },
  },
} as const;
