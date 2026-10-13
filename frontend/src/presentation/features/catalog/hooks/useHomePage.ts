import { useCategoriesQuery } from '../../../hooks/useCategoryQueries';
import { useProductsQuery } from '../../../hooks/useProductQueries';

export function useHomePage() {

  const { data: productsResponse, isLoading } = useProductsQuery({
    pageIndex: 1,
    pageSize: 8,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: catData } = useCategoriesQuery(true);
  const categories = catData?.data || [];
  const featuredProducts = productsResponse?.data?.items || [];
  return { isLoading, categories, featuredProducts };
}
