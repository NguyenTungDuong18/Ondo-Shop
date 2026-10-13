import { Package } from 'lucide-react';
import { Spinner } from '../../../shared/components/Loader';
import { Pagination } from '../../../shared/components/Pagination';
import type { useShopPage } from '../hooks/useShopPage';
import { CategoryFilter } from './CategoryFilter';
import { ShopProductCard } from './ShopProductCard';
import { ShopSearchAndSort } from './ShopSearchAndSort';
export function ShopView({ model }: { model: ReturnType<typeof useShopPage> }) {
  if (!model) return null;
  const { currentSearch, currentPage, currentSortBy, pageSize, selectedCategory, searchInput, setSearchInput, isCategoryDropdownOpen, setIsCategoryDropdownOpen, isSortDropdownOpen, setIsSortDropdownOpen, categoryDropdownRef, sortDropdownRef, activeSortVal, activeSortOption, categories, isLoading, isError, error, isFetching, products, totalPages, totalCount, handleCategoryChange, handleSearchSubmit, handleSortChange, handlePageChange, dropdownBase, dropdownHover } = model;

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
          <CategoryFilter categoryDropdownRef={categoryDropdownRef} setIsCategoryDropdownOpen={setIsCategoryDropdownOpen} dropdownBase={dropdownBase} dropdownHover={dropdownHover} selectedCategory={selectedCategory} categories={categories} totalCount={totalCount} isCategoryDropdownOpen={isCategoryDropdownOpen} handleCategoryChange={handleCategoryChange} />

          {/* Search & Sort Controls */}
          <ShopSearchAndSort handleSearchSubmit={handleSearchSubmit} searchInput={searchInput} setSearchInput={setSearchInput} sortDropdownRef={sortDropdownRef} setIsSortDropdownOpen={setIsSortDropdownOpen} dropdownBase={dropdownBase} activeSortOption={activeSortOption} isSortDropdownOpen={isSortDropdownOpen} activeSortVal={activeSortVal} handleSortChange={handleSortChange} />
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

}
