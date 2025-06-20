import { supabase } from '../supabaseClient';
import { generateShortId, generateEditKey, addDays } from '../utils';
import { getUserFingerprint } from '../userFingerprint';
import type { Menu, CreateMenuData, UpdateMenuData, ShareLinks, MenuEntry, DiscoverMenusFilters, DiscoverMenusResponse } from '../types';

export const menuApi = {
  async create(data: CreateMenuData): Promise<Menu> {
    const shortId = generateShortId();
    const editKey = generateEditKey();
    const endDate = addDays(data.start_date, (data.period_weeks * 7) - 1);

    const { data: menu, error } = await supabase
      .from('menuapp_menus')
      .insert({
        short_id: shortId,
        edit_key: editKey,
        name: data.name,
        created_by: data.created_by,
        start_date: data.start_date.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        period_weeks: data.period_weeks,
      })
      .select()
      .single();

    if (error) throw error;
    return menu;
  },

  async getById(id: string): Promise<Menu | null> {
    const { data, error } = await supabase
      .from('menuapp_menus')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  async getByShortId(shortId: string): Promise<Menu | null> {
    const { data, error } = await supabase
      .from('menuapp_menus')
      .select('*')
      .eq('short_id', shortId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  async update(id: string, data: UpdateMenuData): Promise<Menu> {
    const { data: menu, error } = await supabase
      .from('menuapp_menus')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return menu;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('menuapp_menus')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getMenuEntries(menuId: string): Promise<MenuEntry[]> {
    const { data, error } = await supabase
      .from('menuapp_menu_entries')
      .select(`
        *,
        meal:menuapp_meals(*)
      `)
      .eq('menu_id', menuId)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async upsertMenuEntry(entry: Omit<MenuEntry, 'id' | 'created_at'>): Promise<MenuEntry> {
    const { data, error } = await supabase
      .from('menuapp_menu_entries')
      .upsert({
        menu_id: entry.menu_id,
        meal_id: entry.meal_id,
        date: entry.date,
        meal_type: entry.meal_type,
        notes: entry.notes,
      })
      .select(`
        *,
        meal:menuapp_meals(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMenuEntry(menuId: string, date: string, mealType: string): Promise<void> {
    const { error } = await supabase
      .from('menuapp_menu_entries')
      .delete()
      .eq('menu_id', menuId)
      .eq('date', date)
      .eq('meal_type', mealType);

    if (error) throw error;
  },

  async getDiscoverableMenus(filters: DiscoverMenusFilters = {}, page = 1, limit = 20): Promise<DiscoverMenusResponse> {
    const userFingerprint = getUserFingerprint();
    
    let query = supabase
      .from('menuapp_menus')
      .select(`
        id, short_id, edit_key, name, description, created_by, period_weeks, 
        total_days, created_at, updated_at, discovery_tags, view_count, star_count
      `)
      .eq('is_discoverable', true)
      .not('name', 'is', null);

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    if (filters.tags?.length) {
      query = query.overlaps('discovery_tags', filters.tags);
    }
    
    if (filters.period_weeks?.length) {
      query = query.in('period_weeks', filters.period_weeks);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'most_starred':
        query = query.order('star_count', { ascending: false });
        break;
      case 'popular':
        query = query.order('view_count', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    // Check which menus are starred by current user
    const menuIds = data?.map(m => m.id) || [];
    const { data: starredMenus } = await supabase
      .from('menuapp_user_menu_stars')
      .select('menu_id')
      .eq('user_fingerprint', userFingerprint)
      .in('menu_id', menuIds);

    const starredSet = new Set(starredMenus?.map(s => s.menu_id) || []);

    return {
      menus: (data || []).map(menu => ({
        ...menu,
        is_starred: starredSet.has(menu.id)
      })),
      total: count || 0,
      hasMore: (data?.length || 0) === limit
    };
  },

  async toggleMenuStar(menuId: string): Promise<{ starred: boolean; newCount: number }> {
    const userFingerprint = getUserFingerprint();
    
    // Check if already starred
    const { data: existingStar } = await supabase
      .from('menuapp_user_menu_stars')
      .select('id')
      .eq('menu_id', menuId)
      .eq('user_fingerprint', userFingerprint)
      .single();

    if (existingStar) {
      // Unstar
      await supabase
        .from('menuapp_user_menu_stars')
        .delete()
        .eq('menu_id', menuId)
        .eq('user_fingerprint', userFingerprint);
    } else {
      // Star
      await supabase
        .from('menuapp_user_menu_stars')
        .insert({ menu_id: menuId, user_fingerprint: userFingerprint });
    }

    // Get updated star count
    const { data: menu } = await supabase
      .from('menuapp_menus')
      .select('star_count')
      .eq('id', menuId)
      .single();

    return {
      starred: !existingStar,
      newCount: menu?.star_count || 0
    };
  },

  async incrementViewCount(menuId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_view_count', { menu_id: menuId });
    if (error) throw error;
  },

  generateShareLinks(menu: Menu): ShareLinks {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return {
      view_link: `${baseUrl}/menu/${menu.short_id}`,
      edit_link: `${baseUrl}/menu/${menu.short_id}/edit?key=${menu.edit_key}`,
    };
  },
}; 