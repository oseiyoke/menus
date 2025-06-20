import { supabase } from '../supabaseClient';
import type { Meal } from '../types';

export const mealsApi = {
  async getAll(searchTerm?: string): Promise<Meal[]> {
    let query = supabase
      .from('menuapp_meals')
      .select('*')
      .order('name');

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getPresets(): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('menuapp_meals')
      .select('*')
      .eq('is_preset', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Meal | null> {
    const { data, error } = await supabase
      .from('menuapp_meals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  async create(meal: Omit<Meal, 'id' | 'created_at'>): Promise<Meal> {
    const { data, error } = await supabase
      .from('menuapp_meals')
      .insert(meal)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Meal>): Promise<Meal> {
    const { data, error } = await supabase
      .from('menuapp_meals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('menuapp_meals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
}; 