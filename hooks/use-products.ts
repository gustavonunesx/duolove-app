import { useQuery } from '@tanstack/react-query';
import { getProducts, ProductRow } from '../lib/supabase/products';

export function useProducts() {
  const { data: products = [], isLoading } = useQuery<ProductRow[]>({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 15,
  });

  return { products, isLoading };
}
