import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  pageIndex,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (pageIndex - 1) * pageSize + 1;
  const endItem = Math.min(pageIndex * pageSize, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 font-mono text-xs"
      style={{ borderTop: '1px solid var(--border-default)' }}
    >
      <div className="text-[var(--text-secondary)] font-normal">
        Showing <strong className="text-[var(--text-primary)]">{startItem}</strong> – <strong className="text-[var(--text-primary)]">{endItem}</strong> of{' '}
        <strong className="text-[var(--text-primary)]">{totalCount}</strong> objects
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="xs"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex <= 1}
          className="rounded-lg"
          title="Previous Page"
          icon={<ChevronLeft className="w-4 h-4" />}
        >
          <span className="sr-only">Previous</span>
        </Button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - pageIndex) <= 2 || p === 1 || p === totalPages)
            .map((p, idx, arr) => {
              const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
              return (
                <React.Fragment key={p}>
                  {showEllipsis && <span className="px-1 text-[var(--text-secondary)]">...</span>}
                  <Button
                    variant={pageIndex === p ? 'primary' : 'outline'}
                    size="xs"
                    onClick={() => onPageChange(p)}
                    className={`w-8 h-8 rounded-lg !px-0 ${pageIndex === p ? 'shadow-xs' : ''}`}
                  >
                    {p}
                  </Button>
                </React.Fragment>
              );
            })}
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex >= totalPages}
          className="rounded-lg"
          title="Next Page"
          icon={<ChevronRight className="w-4 h-4" />}
        >
          <span className="sr-only">Next</span>
        </Button>
      </div>
    </div>
  );
};
