import { Check, ChevronDown, SlidersHorizontal } from 'lucide-react';
import type { useShopPage } from '../hooks/useShopPage';
type Props = {
  categoryDropdownRef: NonNullable<ReturnType<typeof useShopPage>>['categoryDropdownRef'];
  setIsCategoryDropdownOpen: NonNullable<ReturnType<typeof useShopPage>>['setIsCategoryDropdownOpen'];
  dropdownBase: NonNullable<ReturnType<typeof useShopPage>>['dropdownBase'];
  dropdownHover: NonNullable<ReturnType<typeof useShopPage>>['dropdownHover'];
  selectedCategory: NonNullable<ReturnType<typeof useShopPage>>['selectedCategory'];
  categories: NonNullable<ReturnType<typeof useShopPage>>['categories'];
  totalCount: NonNullable<ReturnType<typeof useShopPage>>['totalCount'];
  isCategoryDropdownOpen: NonNullable<ReturnType<typeof useShopPage>>['isCategoryDropdownOpen'];
  handleCategoryChange: NonNullable<ReturnType<typeof useShopPage>>['handleCategoryChange'];
};
export function CategoryFilter({ categoryDropdownRef, setIsCategoryDropdownOpen, dropdownBase, dropdownHover, selectedCategory, categories, totalCount, isCategoryDropdownOpen, handleCategoryChange }: Props) {
  return (<div className="relative min-w-[220px] sm:min-w-[280px]" ref={categoryDropdownRef}>
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
  </div>);
}
