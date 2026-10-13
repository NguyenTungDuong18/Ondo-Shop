import { ArrowUpDown, Check, ChevronDown, Search } from 'lucide-react';
import { sortOptions } from '../config/sortOptions';
import type { useShopPage } from '../hooks/useShopPage';
type Props = {
  handleSearchSubmit: NonNullable<ReturnType<typeof useShopPage>>['handleSearchSubmit'];
  searchInput: NonNullable<ReturnType<typeof useShopPage>>['searchInput'];
  setSearchInput: NonNullable<ReturnType<typeof useShopPage>>['setSearchInput'];
  sortDropdownRef: NonNullable<ReturnType<typeof useShopPage>>['sortDropdownRef'];
  setIsSortDropdownOpen: NonNullable<ReturnType<typeof useShopPage>>['setIsSortDropdownOpen'];
  dropdownBase: NonNullable<ReturnType<typeof useShopPage>>['dropdownBase'];
  activeSortOption: NonNullable<ReturnType<typeof useShopPage>>['activeSortOption'];
  isSortDropdownOpen: NonNullable<ReturnType<typeof useShopPage>>['isSortDropdownOpen'];
  activeSortVal: NonNullable<ReturnType<typeof useShopPage>>['activeSortVal'];
  handleSortChange: NonNullable<ReturnType<typeof useShopPage>>['handleSortChange'];
};
export function ShopSearchAndSort({ handleSearchSubmit, searchInput, setSearchInput, sortDropdownRef, setIsSortDropdownOpen, dropdownBase, activeSortOption, isSortDropdownOpen, activeSortVal, handleSortChange }: Props) {
  return (<div className="flex items-center gap-3 shrink-0">
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
  </div>);
}
