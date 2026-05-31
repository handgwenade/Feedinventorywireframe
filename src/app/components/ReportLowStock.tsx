import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Plus } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { productsService } from '../services/productsService';
import type { Product } from '../types';
import { isLowStock } from '../utils/calculations';


export default function ReportLowStock() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const liveProducts = await productsService.list();

        if (!isMounted) return;

        setProducts(liveProducts);
      } catch (error) {
        if (!isMounted) return;

        setProducts([]);
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load low stock report.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const lowStockProducts = products.filter((product) => isLowStock(product));

return (
  <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
    <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center justify-between shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/reports')}
            className="text-[#8b7a6f] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Low Stock</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* Summary Card */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm text-[#8b7a6f] mb-1">Low Stock Items</div>
          <div className="text-3xl font-bold text-[#3d2f1f]">{lowStockProducts.length}</div>
        </div>

        {/* Low Stock List */}
        <div className="space-y-3">
          {isLoading && (
            <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              Loading low stock report...
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && lowStockProducts.length === 0 && (
            <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              No low stock products found.
            </div>
          )}

          {!isLoading && !errorMessage && lowStockProducts.map((product) => (
            <LowStockRow key={product.id} product={product} navigate={navigate} />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <ActionButton
            icon={<Plus size={20} />}
            label="Add Stock"
            onClick={() => navigate('/add-stock-select')}
            primary
          />
          <ActionButton icon={<Download size={20} />} label="Export (Not Ready)" onClick={() => {}} disabled />
          <ActionButton icon={<Printer size={20} />} label="Print (Not Ready)" onClick={() => {}} disabled />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function LowStockRow({
  product,
  navigate,
}: {
  product: Product;
  navigate: (route: string, options?: { state?: unknown }) => void;
}) {
  const shortage = Math.max(product.minimumQuantity - product.currentQuantity, 0);

  return (
    <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
      <div className="font-semibold text-[#3d2f1f] mb-3">{product.name}</div>
      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <div className="text-[#8b7a6f] text-xs mb-1">Current</div>
          <div className="font-medium text-[#3d2f1f]">
            {product.currentQuantity} {product.unitLabel}
          </div>
        </div>
        <div>
          <div className="text-[#8b7a6f] text-xs mb-1">Minimum</div>
          <div className="font-medium text-[#3d2f1f]">
            {product.minimumQuantity} {product.unitLabel}
          </div>
        </div>
      </div>
      <div className="mb-3 p-3 bg-[#fff4d8] border border-[#d4a574] rounded-2xl text-sm">
        <span className="text-[#8b7a6f]">Shortage:</span>{' '}
        <span className="font-semibold text-[#3d2f1f]">
          {shortage} {product.unitLabel} needed
        </span>
      </div>
      <button
        onClick={() => navigate('/add-stock-quantity', { state: { product } })}
        className="w-full bg-[#5a7a4d] text-white py-2 rounded-2xl font-semibold text-sm active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
      >
        Add Stock
      </button>
    </div>
  );
}

 function ActionButton({
  icon,
  label,
  onClick,
  primary = false,
  disabled = false,
 }: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
 }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full p-3 rounded-2xl flex items-center gap-3 font-semibold shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors ${
        primary
          ? 'bg-[#5a7a4d] text-white active:bg-[#4a6a3d]'
          : 'bg-white border border-[#ded2c0] text-[#3d2f1f] active:bg-[#faf8f5]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
 }
