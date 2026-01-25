// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          description: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          organization_id: string
          performed_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          description?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          organization_id: string
          performed_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          organization_id?: string
          performed_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'audit_logs_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'audit_logs_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'audit_logs_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'audit_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'audit_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      container_items: {
        Row: {
          available_quantity: number
          cbm: number | null
          container_id: string
          created_at: string | null
          created_by: string | null
          damaged_quantity: number | null
          description: string | null
          id: string
          image_url: string | null
          item_number: number
          notes: string | null
          original_quantity: number
          packaging_type: string | null
          product_code: string
          product_id: string | null
          product_name: string
          released_quantity: number | null
          request_id: string | null
          reserved_quantity: number | null
          total_gross_weight: number | null
          total_net_weight: number | null
          unit_gross_weight: number | null
          unit_net_weight: number | null
          updated_at: string | null
          volumes: number | null
        }
        Insert: {
          available_quantity: number
          cbm?: number | null
          container_id: string
          created_at?: string | null
          created_by?: string | null
          damaged_quantity?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          item_number: number
          notes?: string | null
          original_quantity: number
          packaging_type?: string | null
          product_code: string
          product_id?: string | null
          product_name: string
          released_quantity?: number | null
          request_id?: string | null
          reserved_quantity?: number | null
          total_gross_weight?: number | null
          total_net_weight?: number | null
          unit_gross_weight?: number | null
          unit_net_weight?: number | null
          updated_at?: string | null
          volumes?: number | null
        }
        Update: {
          available_quantity?: number
          cbm?: number | null
          container_id?: string
          created_at?: string | null
          created_by?: string | null
          damaged_quantity?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          item_number?: number
          notes?: string | null
          original_quantity?: number
          packaging_type?: string | null
          product_code?: string
          product_id?: string | null
          product_name?: string
          released_quantity?: number | null
          request_id?: string | null
          reserved_quantity?: number | null
          total_gross_weight?: number | null
          total_net_weight?: number | null
          unit_gross_weight?: number | null
          unit_net_weight?: number | null
          updated_at?: string | null
          volumes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'container_items_container_id_fkey'
            columns: ['container_id']
            isOneToOne: false
            referencedRelation: 'containers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'container_items_container_id_fkey'
            columns: ['container_id']
            isOneToOne: false
            referencedRelation: 'containers_stats_view'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'container_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      container_movements: {
        Row: {
          container_id: string
          created_at: string | null
          description: string
          from_location_id: string | null
          from_status: string | null
          id: string
          metadata: Json | null
          movement_type: string
          organization_id: string
          performed_at: string
          performed_by_user_id: string | null
          related_release_request_id: string | null
          to_location_id: string | null
          to_status: string | null
        }
        Insert: {
          container_id: string
          created_at?: string | null
          description: string
          from_location_id?: string | null
          from_status?: string | null
          id?: string
          metadata?: Json | null
          movement_type: string
          organization_id: string
          performed_at?: string
          performed_by_user_id?: string | null
          related_release_request_id?: string | null
          to_location_id?: string | null
          to_status?: string | null
        }
        Update: {
          container_id?: string
          created_at?: string | null
          description?: string
          from_location_id?: string | null
          from_status?: string | null
          id?: string
          metadata?: Json | null
          movement_type?: string
          organization_id?: string
          performed_at?: string
          performed_by_user_id?: string | null
          related_release_request_id?: string | null
          to_location_id?: string | null
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'container_movements_container_id_fkey'
            columns: ['container_id']
            isOneToOne: false
            referencedRelation: 'containers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'container_movements_container_id_fkey'
            columns: ['container_id']
            isOneToOne: false
            referencedRelation: 'containers_stats_view'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'container_movements_from_location_id_fkey'
            columns: ['from_location_id']
            isOneToOne: false
            referencedRelation: 'storage_locations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'container_movements_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'container_movements_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'container_movements_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'container_movements_performed_by_user_id_fkey'
            columns: ['performed_by_user_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'container_movements_performed_by_user_id_fkey'
            columns: ['performed_by_user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'container_movements_related_release_request_id_fkey'
            columns: ['related_release_request_id']
            isOneToOne: false
            referencedRelation: 'release_requests'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'container_movements_to_location_id_fkey'
            columns: ['to_location_id']
            isOneToOne: false
            referencedRelation: 'storage_locations'
            referencedColumns: ['id']
          },
        ]
      }
      container_types: {
        Row: {
          code: string
          created_at: string | null
          default_base_cost_brl: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          nominal_volume_m3: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          default_base_cost_brl?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          nominal_volume_m3?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          default_base_cost_brl?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          nominal_volume_m3?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      containers: {
        Row: {
          arrival_date: string | null
          base_monthly_cost: number | null
          bl_number: string | null
          consignee_data: Json | null
          consignee_id: string | null
          container_code: string | null
          container_number: string
          container_type: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          delivery_terms: string | null
          destination_country: string | null
          destination_port: string | null
          expected_release_date: string | null
          final_destination: string | null
          hs_code: string | null
          id: string
          initial_capacity_cbm: number | null
          initial_total_net_weight: number | null
          initial_total_volumes: number | null
          internal_notes: string | null
          invoice_date: string | null
          invoice_number: string | null
          invoice_pdf_url: string | null
          notes: string | null
          notify_data: Json | null
          notify_id: string | null
          organization_id: string
          origin_country: string | null
          origin_port: string | null
          other_documents: Json | null
          packing_list_number: string | null
          packing_list_pdf_url: string | null
          payment_terms: string | null
          qr_code_url: string | null
          status: string
          storage_location_id: string | null
          storage_start_date: string | null
          supplier_data: Json | null
          supplier_id: string | null
          total_amount: number | null
          total_cbm: number | null
          total_gross_weight: number | null
          total_net_weight: number | null
          total_volumes: number | null
          updated_at: string | null
          updated_by: string | null
          warehouse_id: string | null
          yard_location: string | null
        }
        Insert: {
          arrival_date?: string | null
          base_monthly_cost?: number | null
          bl_number?: string | null
          consignee_data?: Json | null
          consignee_id?: string | null
          container_code?: string | null
          container_number: string
          container_type?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          delivery_terms?: string | null
          destination_country?: string | null
          destination_port?: string | null
          expected_release_date?: string | null
          final_destination?: string | null
          hs_code?: string | null
          id?: string
          initial_capacity_cbm?: number | null
          initial_total_net_weight?: number | null
          initial_total_volumes?: number | null
          internal_notes?: string | null
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          notes?: string | null
          notify_data?: Json | null
          notify_id?: string | null
          organization_id: string
          origin_country?: string | null
          origin_port?: string | null
          other_documents?: Json | null
          packing_list_number?: string | null
          packing_list_pdf_url?: string | null
          payment_terms?: string | null
          qr_code_url?: string | null
          status?: string
          storage_location_id?: string | null
          storage_start_date?: string | null
          supplier_data?: Json | null
          supplier_id?: string | null
          total_amount?: number | null
          total_cbm?: number | null
          total_gross_weight?: number | null
          total_net_weight?: number | null
          total_volumes?: number | null
          updated_at?: string | null
          updated_by?: string | null
          warehouse_id?: string | null
          yard_location?: string | null
        }
        Update: {
          arrival_date?: string | null
          base_monthly_cost?: number | null
          bl_number?: string | null
          consignee_data?: Json | null
          consignee_id?: string | null
          container_code?: string | null
          container_number?: string
          container_type?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          delivery_terms?: string | null
          destination_country?: string | null
          destination_port?: string | null
          expected_release_date?: string | null
          final_destination?: string | null
          hs_code?: string | null
          id?: string
          initial_capacity_cbm?: number | null
          initial_total_net_weight?: number | null
          initial_total_volumes?: number | null
          internal_notes?: string | null
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          notes?: string | null
          notify_data?: Json | null
          notify_id?: string | null
          organization_id?: string
          origin_country?: string | null
          origin_port?: string | null
          other_documents?: Json | null
          packing_list_number?: string | null
          packing_list_pdf_url?: string | null
          payment_terms?: string | null
          qr_code_url?: string | null
          status?: string
          storage_location_id?: string | null
          storage_start_date?: string | null
          supplier_data?: Json | null
          supplier_id?: string | null
          total_amount?: number | null
          total_cbm?: number | null
          total_gross_weight?: number | null
          total_net_weight?: number | null
          total_volumes?: number | null
          updated_at?: string | null
          updated_by?: string | null
          warehouse_id?: string | null
          yard_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'containers_consignee_id_fkey'
            columns: ['consignee_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'containers_container_type_fkey'
            columns: ['container_type']
            isOneToOne: false
            referencedRelation: 'container_types'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'containers_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'containers_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'containers_notify_id_fkey'
            columns: ['notify_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'containers_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'containers_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'containers_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'containers_storage_location_id_fkey'
            columns: ['storage_location_id']
            isOneToOne: false
            referencedRelation: 'storage_locations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'containers_supplier_id_fkey'
            columns: ['supplier_id']
            isOneToOne: false
            referencedRelation: 'suppliers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'containers_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'containers_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'containers_warehouse_id_fkey'
            columns: ['warehouse_id']
            isOneToOne: false
            referencedRelation: 'warehouses'
            referencedColumns: ['id']
          },
        ]
      }
      customers: {
        Row: {
          address: Json | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          notify_contact: Json | null
          organization_id: string
          phone: string | null
          tax_id: string | null
          trade_name: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          notify_contact?: Json | null
          organization_id: string
          phone?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          notify_contact?: Json | null
          organization_id?: string
          phone?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'customers_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'customers_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'customers_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      organizations: {
        Row: {
          address: Json | null
          cnpj: string
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          plan: string | null
          settings: Json | null
          trade_name: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          cnpj: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          plan?: string | null
          settings?: Json | null
          trade_name?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          cnpj?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          plan?: string | null
          settings?: Json | null
          trade_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          default_gross_weight: number | null
          default_net_weight: number | null
          description: string | null
          hs_code: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          organization_id: string
          unit_of_measure: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          default_gross_weight?: number | null
          default_net_weight?: number | null
          description?: string | null
          hs_code?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          organization_id: string
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          default_gross_weight?: number | null
          default_net_weight?: number | null
          description?: string | null
          hs_code?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          organization_id?: string
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'products_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'products_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'products_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      release_request_items: {
        Row: {
          approved_quantity: number | null
          container_item_id: string
          created_at: string | null
          id: string
          notes: string | null
          picked_at: string | null
          picked_by_user_id: string | null
          picking_location: string | null
          release_request_id: string
          released_quantity: number | null
          requested_quantity: number
          updated_at: string | null
        }
        Insert: {
          approved_quantity?: number | null
          container_item_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          picked_at?: string | null
          picked_by_user_id?: string | null
          picking_location?: string | null
          release_request_id: string
          released_quantity?: number | null
          requested_quantity: number
          updated_at?: string | null
        }
        Update: {
          approved_quantity?: number | null
          container_item_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          picked_at?: string | null
          picked_by_user_id?: string | null
          picking_location?: string | null
          release_request_id?: string
          released_quantity?: number | null
          requested_quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'release_request_items_container_item_id_fkey'
            columns: ['container_item_id']
            isOneToOne: false
            referencedRelation: 'container_items'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'release_request_items_picked_by_user_id_fkey'
            columns: ['picked_by_user_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'release_request_items_picked_by_user_id_fkey'
            columns: ['picked_by_user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'release_request_items_release_request_id_fkey'
            columns: ['release_request_id']
            isOneToOne: false
            referencedRelation: 'release_requests'
            referencedColumns: ['id']
          },
        ]
      }
      release_requests: {
        Row: {
          approved_by_user_id: string | null
          approved_date: string | null
          container_id: string
          created_at: string | null
          customer_id: string | null
          evidence_photos: Json | null
          id: string
          internal_notes: string | null
          notes: string | null
          organization_id: string
          rejection_reason: string | null
          release_completion_date: string | null
          release_order_pdf_url: string | null
          release_start_date: string | null
          request_date: string
          request_number: string
          requested_by_user_id: string | null
          requester_company: string | null
          requester_email: string | null
          requester_name: string | null
          requester_phone: string | null
          scheduled_date: string | null
          signature_url: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_by_user_id?: string | null
          approved_date?: string | null
          container_id: string
          created_at?: string | null
          customer_id?: string | null
          evidence_photos?: Json | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          organization_id: string
          rejection_reason?: string | null
          release_completion_date?: string | null
          release_order_pdf_url?: string | null
          release_start_date?: string | null
          request_date?: string
          request_number: string
          requested_by_user_id?: string | null
          requester_company?: string | null
          requester_email?: string | null
          requester_name?: string | null
          requester_phone?: string | null
          scheduled_date?: string | null
          signature_url?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved_by_user_id?: string | null
          approved_date?: string | null
          container_id?: string
          created_at?: string | null
          customer_id?: string | null
          evidence_photos?: Json | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          organization_id?: string
          rejection_reason?: string | null
          release_completion_date?: string | null
          release_order_pdf_url?: string | null
          release_start_date?: string | null
          request_date?: string
          request_number?: string
          requested_by_user_id?: string | null
          requester_company?: string | null
          requester_email?: string | null
          requester_name?: string | null
          requester_phone?: string | null
          scheduled_date?: string | null
          signature_url?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'release_requests_approved_by_user_id_fkey'
            columns: ['approved_by_user_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'release_requests_approved_by_user_id_fkey'
            columns: ['approved_by_user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'release_requests_container_id_fkey'
            columns: ['container_id']
            isOneToOne: false
            referencedRelation: 'containers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'release_requests_container_id_fkey'
            columns: ['container_id']
            isOneToOne: false
            referencedRelation: 'containers_stats_view'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'release_requests_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'release_requests_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'release_requests_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'release_requests_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'release_requests_requested_by_user_id_fkey'
            columns: ['requested_by_user_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'release_requests_requested_by_user_id_fkey'
            columns: ['requested_by_user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      storage_locations: {
        Row: {
          capacity_cbm: number | null
          code: string
          created_at: string | null
          id: string
          is_occupied: boolean | null
          notes: string | null
          type: string | null
          updated_at: string | null
          warehouse_id: string
        }
        Insert: {
          capacity_cbm?: number | null
          code: string
          created_at?: string | null
          id?: string
          is_occupied?: boolean | null
          notes?: string | null
          type?: string | null
          updated_at?: string | null
          warehouse_id: string
        }
        Update: {
          capacity_cbm?: number | null
          code?: string
          created_at?: string | null
          id?: string
          is_occupied?: boolean | null
          notes?: string | null
          type?: string | null
          updated_at?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'storage_locations_warehouse_id_fkey'
            columns: ['warehouse_id']
            isOneToOne: false
            referencedRelation: 'warehouses'
            referencedColumns: ['id']
          },
        ]
      }
      suppliers: {
        Row: {
          address: Json | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          tax_id: string | null
          trade_name: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'suppliers_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'suppliers_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'suppliers_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          organization_id: string
          password_hash: string | null
          phone: string | null
          preferences: Json | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          organization_id: string
          password_hash?: string | null
          phone?: string | null
          preferences?: Json | null
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          organization_id?: string
          password_hash?: string | null
          phone?: string | null
          preferences?: Json | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'users_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'users_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'users_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      warehouses: {
        Row: {
          address: Json
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          manager_id: string | null
          name: string
          organization_id: string
          total_capacity_cbm: number | null
          total_positions: number | null
          updated_at: string | null
        }
        Insert: {
          address: Json
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          name: string
          organization_id: string
          total_capacity_cbm?: number | null
          total_positions?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: Json
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          name?: string
          organization_id?: string
          total_capacity_cbm?: number | null
          total_positions?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'warehouses_manager_id_fkey'
            columns: ['manager_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'warehouses_manager_id_fkey'
            columns: ['manager_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'warehouses_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'warehouses_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'warehouses_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      admin_users_view: {
        Row: {
          cnpj: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          is_active: boolean | null
          organization_id: string | null
          organization_name: string | null
          role: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: Json | null
          cnpj: string | null
          created_at: string | null
          email: string | null
          fantasy_name: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          fantasy_name?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          fantasy_name?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      containers_stats_view: {
        Row: {
          base_cost_brl: number | null
          bl_number: string | null
          client_id: string | null
          client_name: string | null
          container_code: string | null
          container_number: string | null
          container_type: string | null
          container_type_name: string | null
          id: string | null
          items_count: number | null
          nominal_volume_m3: number | null
          occupancy_percentage: number | null
          start_date: string | null
          status: string | null
          total_available: number | null
          total_gross_weight: number | null
          total_released: number | null
          total_reserved: number | null
          used_volume: number | null
          yard_location: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'containers_container_type_fkey'
            columns: ['container_type']
            isOneToOne: false
            referencedRelation: 'container_types'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'containers_organization_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'admin_users_view'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'containers_organization_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'containers_organization_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Functions: {
      _assert_positive_qty: { Args: { p_qty: number }; Returns: undefined }
      get_auth_user_organization_id: { Args: never; Returns: string }
      register_exit_event: {
        Args: {
          p_container_id: string
          p_destination: string
          p_doc_number: string
          p_item_id: string
          p_quantity: number
          p_responsible: string
          p_user_id: string
        }
        Returns: Json
      }
      release_items: {
        Args: { p_container_item_id: string; p_qty: number }
        Returns: undefined
      }
      report_damage: {
        Args: { p_container_item_id: string; p_qty: number }
        Returns: undefined
      }
      reserve_items: {
        Args: { p_container_item_id: string; p_qty: number }
        Returns: undefined
      }
      rpc_container_items_insert_batch: {
        Args: {
          items: Database['public']['CompositeTypes']['container_item_insert_input'][]
        }
        Returns: {
          available_quantity: number
          container_id: string
          damaged_quantity: number
          message: string
          original_quantity: number
          product_code: string
          released_quantity: number
          reserved_quantity: number
          status: string
        }[]
      }
      rpc_release_items_batch: {
        Args: {
          items: Database['public']['CompositeTypes']['release_item_input'][]
        }
        Returns: {
          container_item_id: string
          message: string
          requested_qty: number
          status: string
        }[]
      }
      rpc_report_damage_batch: {
        Args: {
          items: Database['public']['CompositeTypes']['report_damage_input'][]
        }
        Returns: {
          container_item_id: string
          message: string
          requested_qty: number
          status: string
        }[]
      }
      rpc_reserve_items_batch: {
        Args: {
          items: Database['public']['CompositeTypes']['reserve_item_input'][]
        }
        Returns: {
          container_item_id: string
          message: string
          requested_qty: number
          status: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      container_item_insert_input: {
        container_id: string | null
        product_code: string | null
        description: string | null
        original_quantity: number | null
        unit: string | null
        request_id: string | null
      }
      release_item_input: {
        container_item_id: string | null
        qty: number | null
      }
      report_damage_input: {
        container_item_id: string | null
        qty: number | null
      }
      reserve_item_input: {
        container_item_id: string | null
        qty: number | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
