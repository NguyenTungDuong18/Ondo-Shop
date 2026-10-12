import React, { useState } from 'react';
import { Search, Plus, Filter, X } from 'lucide-react';
import { Button } from '../common/Button';
import { IconButton } from '../common/IconButton';

interface ProductFilterBarProps {
  search: string;
  category: string;
  categories: string[];
  onSearchChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onAddClick: () => void;
}

export const ProductFilterBar: React.FC<ProductFilterBarProps> = ({
  search,
  category,
  categories,
  onSearchChange,
  onCategoryChange,
  onAddClick,
}) => {
  const [searchInput, setSearchInput] = useState(search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchInput);
  };

  const handleClear = () => {
    setSearchInput('');
    onSearchChange('');
  };

  return (
    <div className="onda-modal p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-96 relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        <input
          type="text"
          placeholder="Search by Name or SKU..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-10 pr-9 py-2 text-sm rounded-lg transition-all outline-none"
          style={{
            backgroundColor: 'var(--surface-raised)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
        />
        {searchInput && (
          <IconButton
            icon={<X className="w-4 h-4" />}
            onClick={handleClear}
            title="Clear search"
            size="sm"
            className="absolute right-0.5"
          />
        )}
      </form>

      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        <div className="flex items-center gap-2 relative min-w-[160px]">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg appearance-none cursor-pointer outline-none transition-all"
            style={{
              backgroundColor: 'var(--surface-raised)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onAddClick}
          className="shrink-0"
          icon={<Plus className="w-4 h-4" />}
        >
          Add Product
        </Button>
      </div>
    </div>
  );
};
