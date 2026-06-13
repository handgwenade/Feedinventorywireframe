import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Download, Printer } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { productsService } from '../services/productsService';
import { calculateInventoryValue, formatCurrency, isLowStock } from '../utils/calculations';
import type { Product } from '../types';

type FilterType = 'all' | 'low-stock' | 'salt' | 'mineral' | 'tubs' | 'blocks';

function inferProductCategoryName(product: Product): string {
  const name = product.name.toLowerCase();

  if (name.includes('salt')) return 'salt';
  if (name.includes('mineral')) return 'mineral';
  if (name.includes('tub')) return 'tubs';
  if (name.includes('block')) return 'blocks';

  return product.categoryId?.toLowerCase() ?? 'other';
}

export default function ReportInventorySummary() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
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
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load inventory summary.');
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

  const totalValue = products.reduce((total, product) => total + calculateInventoryValue(product), 0);
  const totalUnits = products.reduce((total, product) => total + product.currentQuantity, 0);
  const lowStockCount = products.filter((product) => isLowStock(product)).length;

  const filteredData = products.filter((product) => {
    const categoryName = inferProductCategoryName(product);
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'low-stock') return matchesSearch && isLowStock(product);
    return matchesSearch && categoryName === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="app-header-safe">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="app-header-action rounded-2xl text-[#8b7a6f] active:bg-[#faf8f5] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Inventory Summary</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* Date Label */}
        <div className="text-sm text-[#8b7a6f]">
          As of today
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard label="Total Inventory Value" value={formatCurrency(totalValue)} />
          <SummaryCard label="Total Units" value={totalUnits.toString()} />
          <SummaryCard label="Low Stock Items" value={lowStockCount.toString()} />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7a6f]" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterChip label="All" active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
          <FilterChip label="Low Stock" active={activeFilter === 'low-stock'} onClick={() => setActiveFilter('low-stock')} />
          <FilterChip label="Salt" active={activeFilter === 'salt'} onClick={() => setActiveFilter('salt')} />
          <FilterChip label="Mineral" active={activeFilter === 'mineral'} onClick={() => setActiveFilter('mineral')} />
          <FilterChip label="Tubs" active={activeFilter === 'tubs'} onClick={() => setActiveFilter('tubs')} />
          <FilterChip label="Blocks" active={activeFilter === 'blocks'} onClick={() => setActiveFilter('blocks')} />
        </div>

        {/* Inventory List */}
        <div className="space-y-3">
          {isLoading && (
            <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              Loading inventory summary...
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && filteredData.length === 0 && (
            <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              No products found.
            </div>
          )}

          {!isLoading && !errorMessage && filteredData.map((product) => (
            <InventoryRow key={product.id} product={product} />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <ActionButton icon={<Download size={20} />} label="Export (Not Ready)" onClick={() => {}} disabled />
          <ActionButton icon={<Printer size={20} />} label="Print (Not Ready)" onClick={() => {}} disabled />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-[#ded2c0] rounded-2xl p-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
      <div className="text-xs text-[#8b7a6f] mb-1">{label}</div>
      <div className="font-bold text-[#3d2f1f] text-sm">{value}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
        active ? 'bg-[#5a7a4d] text-white shadow-[0_2px_8px_rgba(61,47,31,0.12)]' : 'bg-white border border-[#ded2c0] text-[#3d2f1f] active:bg-[#faf8f5]'
      }`}
    >
      {label}
    </button>
  );
}

function InventoryRow({ product }: { product: Product }) {
  const status = isLowStock(product) ? 'low-stock' : 'in-stock';
  const inventoryValue = calculateInventoryValue(product);

  return (
    <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
      <div className="flex justify-between items-start mb-2 gap-3">
        <div className="font-semibold text-[#3d2f1f]">{product.name}</div>
        <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${
          status === 'low-stock'
            ? 'bg-[#fff4d8] border-[#d4a574] text-[#8b5a1f]'
            : 'bg-[#e9f0e5] border-[#cbd8c4] text-[#5a7a4d]'
        }`}>
          {status === 'low-stock' ? 'Low Stock' : 'In Stock'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <div className="text-[#8b7a6f] text-xs">Quantity</div>
          <div className="font-medium text-[#3d2f1f]">
            {product.currentQuantity} {product.unitLabel}
          </div>
        </div>
        <div>
          <div className="text-[#8b7a6f] text-xs">Unit Price</div>
          <div className="font-medium text-[#3d2f1f]">{formatCurrency(product.salePrice)}</div>
        </div>
        <div>
          <div className="text-[#8b7a6f] text-xs">Value</div>
          <div className="font-medium text-[#3d2f1f]">{formatCurrency(inventoryValue)}</div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick, disabled = false }: { icon: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full p-3 rounded-2xl flex items-center gap-3 font-semibold bg-white border border-[#ded2c0] text-[#3d2f1f] active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
