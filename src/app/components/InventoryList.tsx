import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle, ChevronDown, Package, Plus } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import useRefreshOnFocus from '../hooks/useRefreshOnFocus';

import { productsService } from '../services/productsService';
import { calculateInventoryValue, formatCurrency, isLowStock } from '../utils/calculations';
import type { Product } from '../types';


type FilterType = 'all' | 'low-stock' | 'salt' | 'mineral' | 'tubs' | 'blocks';
type SortType = 'name' | 'quantity' | 'low-stock';


function inferProductCategoryName(product: Product): string {
  const name = product.name.toLowerCase();

  if (name.includes('salt')) return 'salt';
  if (name.includes('mineral')) return 'mineral';
  if (name.includes('tub')) return 'tubs';
  if (name.includes('block')) return 'blocks';

  return product.categoryId?.toLowerCase() ?? 'other';
}

export default function InventoryList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [inventoryProducts, setInventoryProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadProducts() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const liveProducts = await productsService.list();
      setInventoryProducts(liveProducts);
    } catch (error) {
      setInventoryProducts([]);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load inventory.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadProductsOnMount() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const liveProducts = await productsService.list();

        if (!isMounted) return;

        setInventoryProducts(liveProducts);
      } catch (error) {
        if (!isMounted) return;

        setInventoryProducts([]);
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load inventory.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProductsOnMount();

    return () => {
      isMounted = false;
    };
  }, []);

  useRefreshOnFocus(loadProducts, isLoading);

  const filteredProducts = inventoryProducts
    .filter((product) => {
      const categoryName = inferProductCategoryName(product);
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());

      if (activeFilter === 'all') return matchesSearch;
      if (activeFilter === 'low-stock') return matchesSearch && isLowStock(product);
      return matchesSearch && categoryName === activeFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'quantity') return b.currentQuantity - a.currentQuantity;
      if (sortBy === 'low-stock') return Number(isLowStock(b)) - Number(isLowStock(a));
      return 0;
    });

  const handleViewProduct = (product: Product) => {
    navigate('/product-detail', { state: { product } });
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-[#3d2f1f]">Inventory</h1>
          <UserIcon />
        </div>
        <p className="text-sm text-[#8b7a6f]">
          View current stock and product details.
        </p>
      </div>

      {/* Search */}
      <div className="p-4 bg-[#f7f4ed]">
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
      </div>

      {/* Filter Chips */}
      <div className="px-4 pb-3 bg-[#f7f4ed]">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterChip
            label="All"
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          />
          <FilterChip
            label="Low Stock"
            active={activeFilter === 'low-stock'}
            onClick={() => setActiveFilter('low-stock')}
          />
          <FilterChip
            label="Salt"
            active={activeFilter === 'salt'}
            onClick={() => setActiveFilter('salt')}
          />
          <FilterChip
            label="Mineral"
            active={activeFilter === 'mineral'}
            onClick={() => setActiveFilter('mineral')}
          />
          <FilterChip
            label="Tubs"
            active={activeFilter === 'tubs'}
            onClick={() => setActiveFilter('tubs')}
          />
          <FilterChip
            label="Blocks"
            active={activeFilter === 'blocks'}
            onClick={() => setActiveFilter('blocks')}
          />
        </div>
      </div>

      {/* Sort Option */}
      <div className="px-4 pb-4 bg-[#f7f4ed]">
        <div className="flex items-center justify-between gap-3">
          <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
          >
            <span className="text-sm font-medium">
              Sort by: {sortBy === 'name' ? 'Name' : sortBy === 'quantity' ? 'Quantity' : 'Low Stock'}
            </span>
            <ChevronDown size={16} />
          </button>

          {showSortMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-[#ded2c0] rounded-2xl shadow-[0_4px_14px_rgba(61,47,31,0.16)] z-10 min-w-[200px] overflow-hidden">
              <button
                onClick={() => { setSortBy('name'); setShowSortMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-[#3d2f1f] hover:bg-[#faf8f5] first:rounded-t-lg"
              >
                Sort by Name
              </button>
              <button
                onClick={() => { setSortBy('quantity'); setShowSortMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-[#3d2f1f] hover:bg-[#faf8f5] border-t border-[#e8dfd1]"
              >
                Sort by Quantity
              </button>
              <button
                onClick={() => { setSortBy('low-stock'); setShowSortMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-[#3d2f1f] hover:bg-[#faf8f5] border-t border-[#e8dfd1] last:rounded-b-lg"
              >
                Sort by Low Stock
              </button>
            </div>
          )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadProducts}
              disabled={isLoading}
              className="px-4 py-2 bg-white border border-[#ded2c0] text-[#3d2f1f] rounded-2xl text-sm font-semibold active:bg-[#faf8f5] disabled:opacity-50 shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => navigate('/product-form')}
              className="flex items-center gap-2 px-4 py-2 bg-[#5a7a4d] text-white rounded-2xl text-sm font-semibold active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="p-4 space-y-3">
        {isLoading && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            Loading inventory...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && filteredProducts.length === 0 && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            No products found.
          </div>
        )}

        {!isLoading && !errorMessage && filteredProducts.map((product) => {
          const inventoryValue = calculateInventoryValue(product);
          const lowStock = isLowStock(product);
          return (
            <button
              key={product.id}
              onClick={() => handleViewProduct(product)}
              className="w-full bg-white border border-[#ded2c0] rounded-2xl p-4 text-left active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors"
            >
              <div className="flex gap-3">
                {/* Product Image Placeholder */}
                <div className="w-20 h-20 bg-[#f7f4ed] border border-[#e8dfd1] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Package size={32} className="text-[#8b7a6f]" />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#3d2f1f] mb-1">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-[#8b7a6f]">
                      {product.currentQuantity} {product.unitLabel} available
                    </span>
                    {lowStock && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#fff4d8] text-[#8b5a1f] text-xs font-semibold rounded-full border border-[#d4a574]">
                        <AlertCircle size={12} />
                        Low Stock
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[#8b7a6f] mb-1">
                    {formatCurrency(product.salePrice)} / {product.unitLabel}
                  </div>
                  <div className="text-sm font-semibold text-[#3d2f1f]">
                    Value: {formatCurrency(inventoryValue)}
                  </div>
                </div>

                {/* View Button */}
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-[#5a7a4d]">View →</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}


function FilterChip({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
        active
          ? 'bg-[#5a7a4d] text-white shadow-[0_2px_8px_rgba(61,47,31,0.12)]'
          : 'bg-white border border-[#ded2c0] text-[#3d2f1f] active:bg-[#faf8f5]'
      }`}
    >
      {label}
    </button>
  );
}
