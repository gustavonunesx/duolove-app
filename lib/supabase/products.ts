import { supabase } from './client';

export type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  affiliate_url: string;
  price_range: string | null;
  category: string | null;
  occasion: string[] | null;
  is_active: boolean;
  created_at: string;
};

export async function getProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getProductsForOccasion(occasion: string): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .contains('occasion', [occasion]);

  if (error) throw error;
  return data ?? [];
}
