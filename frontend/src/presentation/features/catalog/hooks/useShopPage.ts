import React, { useEffect, useRef, useState, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { pagination } from '../../../../shared/config/commerce';
import { useCategoriesQuery } from '../../../hooks/useCategoryQueries';
import { useProductsQuery } from '../../../hooks/useProductQueries';
import { sortOptions } from '../config/sortOptions';
export function useShopPage() {

  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = Number(searchParams.get('page') || '1');
  const currentSortBy = (searchParams.get('sortBy') as 'createdAt' | 'name' | 'price' | 'rating' | undefined) || 'createdAt';
  const currentSortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | undefined) || 'desc';
  const pageSize = pagination.catalog;

  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const activeSortVal = `${currentSortBy}_${currentSortOrder}`;
  const activeSortOption = sortOptions.find((o) => o.value === activeSortVal) || sortOptions[0];

  useEffect(() => { setSearchInput(currentSearch); }, [currentSearch]);
  useEffect(() => { setSelectedCategory(currentCategory); }, [currentCategory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) setIsCategoryDropdownOpen(false);
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) setIsSortDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: catData } = useCategoriesQuery(true);
  const categories = catData?.data || [];

  const { data: productsResponse, isLoading, isError, error, isFetching } = useProductsQuery({
    pageIndex: currentPage, pageSize,
    category: selectedCategory || undefined,
    search: currentSearch || undefined,
    sortBy: currentSortBy, sortOrder: currentSortOrder,
  });

  const productsData = productsResponse?.data;
  const products = productsData?.items || [];
  const totalPages = productsData?.totalPages || 1;
  const totalCount = productsData?.totalCount || 0;

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (categoryName) params.set('category', categoryName);
      else params.delete('category');
      params.set('page', '1');
      setSearchParams(params, { replace: true });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (searchInput.trim()) params.set('search', searchInput.trim());
      else params.delete('search');
      params.set('page', '1');
      setSearchParams(params);
    });
  };

  const handleSortChange = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      const [sortBy, sortOrder] = value.split('_');
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('page', '1');
      setSearchParams(params);
    });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dropdownBase = {
    backgroundColor: 'var(--surface-card)',
    border: '2px solid var(--text-primary)',
    color: 'var(--text-primary)',
  };
  const dropdownHover = { backgroundColor: 'var(--surface-raised)' };
  return { currentSearch, currentPage, currentSortBy, pageSize, selectedCategory, searchInput, setSearchInput, isCategoryDropdownOpen, setIsCategoryDropdownOpen, isSortDropdownOpen, setIsSortDropdownOpen, categoryDropdownRef, sortDropdownRef, activeSortVal, activeSortOption, categories, isLoading, isError, error, isFetching, products, totalPages, totalCount, handleCategoryChange, handleSearchSubmit, handleSortChange, handlePageChange, dropdownBase, dropdownHover };
}
