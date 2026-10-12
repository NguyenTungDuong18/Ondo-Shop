import React from 'react';
import type { ProductResponse } from '../../types/product';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '../common/Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  product: ProductResponse | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  product,
  isLoading = false,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="onda-modal w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            backgroundColor: 'var(--surface-modal-danger)',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-full"
              style={{
                backgroundColor: 'var(--surface-modal-danger)',
                color: 'var(--text-danger)',
              }}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="nike-title text-base text-[var(--text-primary)]">Confirm Deletion</h3>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={onClose}
            className="rounded-full"
            icon={<X className="w-5 h-5" />}
          >
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="p-6 space-y-3 font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          <p className="text-sm leading-relaxed">
            Are you sure you want to delete product{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{product.name}</strong> (SKU:{' '}
            <code className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{product.sku}</code>)?
          </p>
          <p className="text-xs font-bold" style={{ color: 'var(--text-danger)' }}>
            This action will perform a soft delete in the Backend system.
          </p>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3"
          style={{
            borderTop: '1px solid var(--border-default)',
            backgroundColor: 'var(--surface-raised)',
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full normal-case tracking-normal"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-full shadow-md"
            icon={<Trash2 className="w-4 h-4" />}
          >
            {isLoading ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
};
