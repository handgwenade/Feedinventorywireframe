import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { productsService } from '../services/productsService';
import { formatCurrency } from '../utils/calculations';
import type { Product } from '../types';

function getSelectedProduct(locationState: unknown): Product | null {
  return ((locationState as { product?: Product } | null)?.product ?? null);
}

function parseNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function ProductForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const product = getSelectedProduct(location.state);
  const isEditMode = Boolean(product);

  const [name, setName] = useState(product?.name ?? '');
  const [unitLabel, setUnitLabel] = useState(product?.unitLabel ?? 'units');
  const [currentQuantity, setCurrentQuantity] = useState(product?.currentQuantity.toString() ?? '0');
  const [minimumQuantity, setMinimumQuantity] = useState(product?.minimumQuantity.toString() ?? '0');
  const [salePrice, setSalePrice] = useState(product?.salePrice.toString() ?? '0');
  const [vendor, setVendor] = useState(product?.vendor ?? '');
  const [sourceNotes, setSourceNotes] = useState(product?.sourceNotes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setErrorMessage(null);

    const parsedCurrentQuantity = parseNumber(currentQuantity);
    const parsedMinimumQuantity = parseNumber(minimumQuantity);
    const parsedSalePrice = parseNumber(salePrice);

    if (!name.trim()) {
      setErrorMessage('Product name is required.');
      return;
    }

    if (!unitLabel.trim()) {
      setErrorMessage('Unit label is required.');
      return;
    }

    if (!isEditMode && parsedCurrentQuantity < 0) {
      setErrorMessage('Current quantity must be zero or greater.');
      return;
    }

    if (parsedMinimumQuantity < 0) {
      setErrorMessage('Minimum quantity must be zero or greater.');
      return;
    }

    if (parsedSalePrice < 0) {
      setErrorMessage('Sale price must be zero or greater.');
      return;
    }

    try {
      setIsSaving(true);
      const savedProduct = product
        ? await productsService.updateProduct({
            productId: product.id,
            name,
            categoryId: product.categoryId,
            unitLabel,
            minimumQuantity: parsedMinimumQuantity,
            salePrice: parsedSalePrice,
            vendor,
            sourceNotes,
          })
        : await productsService.createProduct({
            name,
            unitLabel,
            currentQuantity: parsedCurrentQuantity,
            minimumQuantity: parsedMinimumQuantity,
            salePrice: parsedSalePrice,
            vendor,
            sourceNotes,
          });

      navigate('/product-detail', { state: { product: savedProduct } });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-48">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(product ? '/product-detail' : '/inventory', product ? { state: { product } } : undefined)}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Product' : 'Add Product'}
          </h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {errorMessage && (
          <div className="bg-white border border-gray-300 rounded-lg p-4 text-sm text-gray-900">
            {errorMessage}
          </div>
        )}

        <FormField
          label="Name"
          value={name}
          onChange={setName}
          placeholder="Enter product name..."
        />

        <FormField
          label="Unit label"
          value={unitLabel}
          onChange={setUnitLabel}
          placeholder="bags, tons, blocks..."
        />

        {isEditMode ? (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Current quantity</div>
            <div className="text-2xl font-bold text-gray-900">
              {product?.currentQuantity} {product?.unitLabel}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Use Add Stock or Adjust Count to change quantity.
            </div>
          </div>
        ) : (
          <FormField
            label="Current quantity"
            value={currentQuantity}
            onChange={setCurrentQuantity}
            placeholder="0"
            type="number"
          />
        )}

        <FormField
          label="Minimum quantity"
          value={minimumQuantity}
          onChange={setMinimumQuantity}
          placeholder="0"
          type="number"
        />

        <FormField
          label="Sale price"
          value={salePrice}
          onChange={setSalePrice}
          placeholder="0.00"
          type="number"
        />

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between gap-4">
            <span className="text-gray-700">Price preview</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(parseNumber(salePrice))} / {unitLabel || 'unit'}
            </span>
          </div>
        </div>

        <FormField
          label="Vendor/source note"
          value={vendor}
          onChange={setVendor}
          placeholder="Vendor or source..."
        />

        <FormField
          label="Notes/source notes"
          value={sourceNotes}
          onChange={setSourceNotes}
          placeholder="Add product notes..."
          multiline
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto space-y-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold active:bg-gray-800 disabled:bg-gray-400"
        >
          {isSaving ? 'Saving Product...' : isEditMode ? 'Save Product' : 'Create Product'}
        </button>
        <button
          onClick={() => navigate(product ? '/product-detail' : '/inventory', product ? { state: { product } } : undefined)}
          disabled={isSaving}
          className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
        >
          Cancel
        </button>

        <div className="mt-3 p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
          <strong>Product setup:</strong><br />
          Quantity changes after creation should use Add Stock or Adjust Count so the inventory ledger stays auditable.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  multiline?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
        />
      ) : (
        <input
          type={type}
          min={type === 'number' ? '0' : undefined}
          step={type === 'number' ? 'any' : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      )}
    </div>
  );
}
