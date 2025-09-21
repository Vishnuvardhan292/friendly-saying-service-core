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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      advanced_fertilizer_recommendations: {
        Row: {
          application_method: string | null
          application_timing: string | null
          chemical_fertilizer_mix: string[] | null
          climate_suitability: string[] | null
          crop_name: string | null
          expected_yield_improvement: number | null
          growth_stage: string | null
          id: number
          nitrogen_recommendation: number | null
          organic_fertilizer_mix: string[] | null
          phosphorus_recommendation: number | null
          potassium_recommendation: number | null
          precautions: string | null
          soil_type: string | null
          water_requirement: number | null
        }
        Insert: {
          application_method?: string | null
          application_timing?: string | null
          chemical_fertilizer_mix?: string[] | null
          climate_suitability?: string[] | null
          crop_name?: string | null
          expected_yield_improvement?: number | null
          growth_stage?: string | null
          id?: never
          nitrogen_recommendation?: number | null
          organic_fertilizer_mix?: string[] | null
          phosphorus_recommendation?: number | null
          potassium_recommendation?: number | null
          precautions?: string | null
          soil_type?: string | null
          water_requirement?: number | null
        }
        Update: {
          application_method?: string | null
          application_timing?: string | null
          chemical_fertilizer_mix?: string[] | null
          climate_suitability?: string[] | null
          crop_name?: string | null
          expected_yield_improvement?: number | null
          growth_stage?: string | null
          id?: never
          nitrogen_recommendation?: number | null
          organic_fertilizer_mix?: string[] | null
          phosphorus_recommendation?: number | null
          potassium_recommendation?: number | null
          precautions?: string | null
          soil_type?: string | null
          water_requirement?: number | null
        }
        Relationships: []
      }
      crop_cultivation_plans: {
        Row: {
          activity: string | null
          crop_recommendation_id: number | null
          day_number: number | null
          description: string | null
          estimated_duration: unknown | null
          id: number
          required_resources: string[] | null
        }
        Insert: {
          activity?: string | null
          crop_recommendation_id?: number | null
          day_number?: number | null
          description?: string | null
          estimated_duration?: unknown | null
          id?: never
          required_resources?: string[] | null
        }
        Update: {
          activity?: string | null
          crop_recommendation_id?: number | null
          day_number?: number | null
          description?: string | null
          estimated_duration?: unknown | null
          id?: never
          required_resources?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "crop_cultivation_plans_crop_recommendation_id_fkey"
            columns: ["crop_recommendation_id"]
            isOneToOne: false
            referencedRelation: "crop_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_diseases: {
        Row: {
          crop_name: string | null
          disease_name: string | null
          id: number
          prevention_methods: string | null
          risk_level: string | null
          symptoms: string | null
          treatment_methods: string | null
        }
        Insert: {
          crop_name?: string | null
          disease_name?: string | null
          id?: never
          prevention_methods?: string | null
          risk_level?: string | null
          symptoms?: string | null
          treatment_methods?: string | null
        }
        Update: {
          crop_name?: string | null
          disease_name?: string | null
          id?: never
          prevention_methods?: string | null
          risk_level?: string | null
          symptoms?: string | null
          treatment_methods?: string | null
        }
        Relationships: []
      }
      crop_growth_tracking: {
        Row: {
          crop_name: string | null
          current_growth_stage: string | null
          expected_harvest_date: string | null
          health_status: string | null
          id: number
          last_updated: string | null
          planting_date: string | null
          user_id: string | null
        }
        Insert: {
          crop_name?: string | null
          current_growth_stage?: string | null
          expected_harvest_date?: string | null
          health_status?: string | null
          id?: never
          last_updated?: string | null
          planting_date?: string | null
          user_id?: string | null
        }
        Update: {
          crop_name?: string | null
          current_growth_stage?: string | null
          expected_harvest_date?: string | null
          health_status?: string | null
          id?: never
          last_updated?: string | null
          planting_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      crop_recommendations: {
        Row: {
          avg_rainfall: number | null
          avg_temperature: number | null
          id: number
          recommendation_date: string | null
          recommended_crop: string | null
          season: string | null
          soil_type: string | null
          suitability_score: number | null
          user_id: string | null
        }
        Insert: {
          avg_rainfall?: number | null
          avg_temperature?: number | null
          id?: never
          recommendation_date?: string | null
          recommended_crop?: string | null
          season?: string | null
          soil_type?: string | null
          suitability_score?: number | null
          user_id?: string | null
        }
        Update: {
          avg_rainfall?: number | null
          avg_temperature?: number | null
          id?: never
          recommendation_date?: string | null
          recommended_crop?: string | null
          season?: string | null
          soil_type?: string | null
          suitability_score?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      crops: {
        Row: {
          area_planted: number | null
          category: string
          created_at: string
          expected_harvest_date: string | null
          field_location: string | null
          growth_stage: string | null
          id: string
          name: string
          notes: string | null
          planting_date: string | null
          status: string | null
          updated_at: string
          user_id: string
          variety: string | null
        }
        Insert: {
          area_planted?: number | null
          category: string
          created_at?: string
          expected_harvest_date?: string | null
          field_location?: string | null
          growth_stage?: string | null
          id?: string
          name: string
          notes?: string | null
          planting_date?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          variety?: string | null
        }
        Update: {
          area_planted?: number | null
          category?: string
          created_at?: string
          expected_harvest_date?: string | null
          field_location?: string | null
          growth_stage?: string | null
          id?: string
          name?: string
          notes?: string | null
          planting_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          variety?: string | null
        }
        Relationships: []
      }
      disease_detections: {
        Row: {
          confidence_score: number | null
          created_at: string
          crop_type: string
          detected_disease: string | null
          id: string
          image_url: string
          symptoms: string | null
          treatment_recommendation: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          crop_type: string
          detected_disease?: string | null
          id?: string
          image_url: string
          symptoms?: string | null
          treatment_recommendation?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          crop_type?: string
          detected_disease?: string | null
          id?: string
          image_url?: string
          symptoms?: string | null
          treatment_recommendation?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      farm_inventory: {
        Row: {
          condition: string | null
          cost_per_unit: number | null
          created_at: string | null
          current_location: string | null
          expiry_date: string | null
          id: number
          item_name: string | null
          item_type: string | null
          notes: string | null
          purchase_date: string | null
          quantity: number | null
          supplier: string | null
          unit: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          condition?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          current_location?: string | null
          expiry_date?: string | null
          id?: never
          item_name?: string | null
          item_type?: string | null
          notes?: string | null
          purchase_date?: string | null
          quantity?: number | null
          supplier?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          condition?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          current_location?: string | null
          expiry_date?: string | null
          id?: never
          item_name?: string | null
          item_type?: string | null
          notes?: string | null
          purchase_date?: string | null
          quantity?: number | null
          supplier?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      farm_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          crop_name: string | null
          estimated_duration: unknown | null
          id: number
          notes: string | null
          priority: string | null
          reminder_sent: boolean | null
          required_resources: string[] | null
          scheduled_date: string | null
          status: string | null
          task_description: string | null
          task_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          crop_name?: string | null
          estimated_duration?: unknown | null
          id?: never
          notes?: string | null
          priority?: string | null
          reminder_sent?: boolean | null
          required_resources?: string[] | null
          scheduled_date?: string | null
          status?: string | null
          task_description?: string | null
          task_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          crop_name?: string | null
          estimated_duration?: unknown | null
          id?: never
          notes?: string | null
          priority?: string | null
          reminder_sent?: boolean | null
          required_resources?: string[] | null
          scheduled_date?: string | null
          status?: string | null
          task_description?: string | null
          task_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fertilizer_recommendations: {
        Row: {
          application_method: string | null
          crop_name: string | null
          fertilizer_type: string | null
          growth_stage: string | null
          id: number
          quantity_per_acre: number | null
          soil_type: string | null
          timing: string | null
        }
        Insert: {
          application_method?: string | null
          crop_name?: string | null
          fertilizer_type?: string | null
          growth_stage?: string | null
          id?: never
          quantity_per_acre?: number | null
          soil_type?: string | null
          timing?: string | null
        }
        Update: {
          application_method?: string | null
          crop_name?: string | null
          fertilizer_type?: string | null
          growth_stage?: string | null
          id?: never
          quantity_per_acre?: number | null
          soil_type?: string | null
          timing?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          severity: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          severity?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          severity?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          farm_size: number | null
          full_name: string | null
          id: number
          location: string | null
          phone: string | null
          soil_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          farm_size?: number | null
          full_name?: string | null
          id?: never
          location?: string | null
          phone?: string | null
          soil_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          farm_size?: number | null
          full_name?: string | null
          id?: never
          location?: string | null
          phone?: string | null
          soil_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      soil_tests: {
        Row: {
          created_at: string | null
          drainage_quality: string | null
          id: number
          latitude: number | null
          location: string | null
          longitude: number | null
          nitrogen_level: number | null
          notes: string | null
          organic_matter_percentage: number | null
          ph_level: number | null
          phosphorus_level: number | null
          potassium_level: number | null
          report_file_url: string | null
          soil_texture: string | null
          soil_type: string | null
          test_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          drainage_quality?: string | null
          id?: never
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          nitrogen_level?: number | null
          notes?: string | null
          organic_matter_percentage?: number | null
          ph_level?: number | null
          phosphorus_level?: number | null
          potassium_level?: number | null
          report_file_url?: string | null
          soil_texture?: string | null
          soil_type?: string | null
          test_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          drainage_quality?: string | null
          id?: never
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          nitrogen_level?: number | null
          notes?: string | null
          organic_matter_percentage?: number | null
          ph_level?: number | null
          phosphorus_level?: number | null
          potassium_level?: number | null
          report_file_url?: string | null
          soil_texture?: string | null
          soil_type?: string | null
          test_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
