import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProductsQuery } from '../hooks/useProductQueries';
import { useCategoriesQuery } from '../hooks/useCategoryQueries';
import { ShopProductCard } from '../components/product/ShopProductCard';
import { Pagination } from '../components/common/Pagination';
import { Spinner } from '../components/common/Loader';
import { Search, Package, SlidersHorizontal, ChevronDown, Check, ArrowUpDown } from 'lucide-react';

const sortOptions = [
  { value: 'createdAt_desc', label: 'Featured (Newest)' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'rating_desc', label: 'Highest Rated' },
];

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = Number(searchParams.get('page') || '1');
  const currentSortBy = (searchParams.get('sortBy') as 'createdAt' | 'name' | 'price' | 'rating' | undefined) || 'createdAt';
  const currentSortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | undefined) || 'desc';
  const pageSize = 8;

  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const activeSortVal = `${currentSortBy}_${currentSortOrder}`;
  const activeSortOption = sortOptions.find((o) => o.value === activeSortVal) || sortOptions[0];

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

  return (
    <div className="space-y-10 animate-fade-in pb-16 font-sans">
      {/* Header Banner */}
      <div className="border-b pb-8 space-y-2" style={{ borderColor: 'var(--border-default)' }}>
        <span className="text-xs font-mono uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>THE COLLECTION</span>
        <h1 className="font-serif-hero text-4xl sm:text-6xl">Useful beauty.</h1>
        <p className="text-xs sm:text-sm max-w-xl font-sans font-normal leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          A considered edit of objects for the kitchen, desk, bath, and all the spaces between.
        </p>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Dropdown */}
          <div className="relative min-w-[220px] sm:min-w-[280px]" ref={categoryDropdownRef}>
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-between shadow-xs cursor-pointer transition-all select-none relative"
              style={dropdownBase}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, dropdownHover)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, dropdownBase)}
            >
              <SlidersHorizontal className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
              <span className="truncate" style={{ color: 'var(--text-primary)' }}>
                {selectedCategory
                  ? categories.find((c) => c.name.toLowerCase() === selectedCategory.toLowerCase())?.name || selectedCategory
                  : `All Categories (${totalCount})`}
              </span>
              <ChevronDown className={`w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
                style={{ color: 'var(--text-secondary)' }} />
            </button>

            {isCategoryDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-full rounded-2xl shadow-2xl p-1.5 z-50 animate-dropdown-drop overflow-hidden space-y-0.5"
                style={{ backgroundColor: 'var(--surface-dropdown)', border: '2px solid var(--text-primary)' }}
              >
                {[{ id: 'all', name: 'All Categories' }, ...categories].map((cat) => {
                  const isSelected = !cat.id.includes('all') ? selectedCategory.toLowerCase() === cat.name.toLowerCase() : !selectedCategory;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        handleCategoryChange(cat.id.includes('all') ? '' : cat.name);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer text-left"
                      style={isSelected
                        ? { backgroundColor: 'var(--text-primary)', color: 'var(--text-inverse)', borderRadius: 'var(--radius-lg)' }
                        : { color: 'var(--text-secondary)', backgroundColor: 'transparent' }
                      }
                      onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.backgroundColor = 'var(--surface-raised)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                      onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                    >
                      <span>{cat.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text" placeholder="Filter collection..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-xs outline-none transition-all font-sans"
                style={{
                  backgroundColor: 'var(--surface-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
              />
            </form>

            {/* Sort Dropdown */}
            <div className="relative min-w-[180px] sm:min-w-[210px]" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen((prev) => !prev)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-between shadow-xs cursor-pointer transition-all select-none relative"
                style={dropdownBase}
              >
                <ArrowUpDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                <span className="truncate" style={{ color: 'var(--text-primary)' }}>{activeSortOption.label}</span>
                <ChevronDown className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-300 ${isSortDropdownOpen ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--text-secondary)' }} />
              </button>

              {isSortDropdownOpen && (
                <div
                  className="absolute top-full right-0 mt-2 w-full min-w-[210px] rounded-2xl shadow-2xl p-1.5 z-50 animate-dropdown-drop overflow-hidden space-y-0.5"
                  style={{ backgroundColor: 'var(--surface-dropdown)', border: '2px solid var(--text-primary)' }}
                >
                  {sortOptions.map((opt) => {
                    const isSelected = activeSortVal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { handleSortChange(opt.value); setIsSortDropdownOpen(false); }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer text-left"
                        style={isSelected
                          ? { backgroundColor: 'var(--text-primary)', color: 'var(--text-inverse)', borderRadius: 'var(--radius-lg)' }
                          : { color: 'var(--text-secondary)', backgroundColor: 'transparent' }
                        }
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'var(--surface-raised)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                      }}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="min-h-[50vh] flex items-center justify-center"><Spinner size="lg" label="Loading collection..." /></div>
      ) : isError ? (
        <div className="onda-modal p-12 rounded-3xl text-center space-y-3">
          <h3 className="font-serif italic text-2xl">Error loading collection</h3>
          <p className="text-xs font-sans">{error?.message}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="onda-modal p-16 rounded-3xl text-center space-y-3 my-8 animate-smooth-grid">
          <Package className="w-12 h-12 mx-auto" style={{ color: 'var(--text-muted)' }} />
          <h3 className="font-serif italic text-3xl">Nothing here yet.</h3>
          <p className="text-xs font-sans" style={{ color: 'var(--text-secondary)' }}>Try another part of the edit.</p>
          {(selectedCategory || currentSearch) && (
            <button
              onClick={() => { setSearchInput(''); handleCategoryChange(''); }}
              className="replit-btn-black px-6 py-2.5 text-xs inline-flex items-center gap-2 font-mono uppercase cursor-pointer mt-2"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div key={`${selectedCategory || 'all'}_page_${currentPage}_sort_${currentSortBy}`}
          className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 transition-opacity duration-300 ${isFetching ? 'opacity-70' : 'opacity-100'}`}
        >
          {products.map((product, index) => (
            <div key={product.id} style={{ animationDelay: `${index * 75}ms` }} className="animate-card-blur-cascade">
              <ShopProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      <Pagination pageIndex={currentPage} pageSize={pageSize} totalCount={totalCount} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};
