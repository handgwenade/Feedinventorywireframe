import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle, ChevronDown } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

interface Product {
  id: string;
  name: string;
  available: number;
  price: number;
  category: string;
  lowStock?: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Garlic Salt Blocks',
    available: 247,
    price: 17.15,
    category: 'blocks',
  },
  {
    id: '2',
    name: 'Redmond Mineral Salt',
    available: 200,
    price: 9.79,
    category: 'salt',
  },
  {
    id: '3',
    name: 'SweetPro FiberMate 20',
    available: 6,
    price: 154.00,
    category: 'tubs',
    lowStock: true,
  },
  {
    id: '4',
    name: 'RumenEdge Tubs',
    available: 4,
    price: 123.70,
    category: 'tubs',
    lowStock: true,
  },
];

type FilterType = 'all' | 'low-stock' | 'salt' | 'mineral' | 'tubs' | 'blocks';
type SortType = 'name' | 'quantity' | 'low-stock';

export default function InventoryList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filteredProducts = PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'low-stock') return matchesSearch && product.lowStock;
    return matchesSearch && product.category === activeFilter;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'quantity') return b.available - a.available;
    if (sortBy === 'low-stock') return (b.lowStock ? 1 : 0) - (a.lowStock ? 1 : 0);
    return 0;
  });

  const handleViewProduct = (product: Product) => {
    navigate('/product-detail', { state: { product } });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-semibold text-gray-900">Inventory</h1>
          <UserIcon />
        </div>
        <p className="text-sm text-gray-600">
          View current stock and product details.
        </p>
      </div>

      {/* Search */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="p-4 bg-white border-b border-gray-200">
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
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 active:bg-gray-50"
          >
            <span className="text-sm font-medium">
              Sort by: {sortBy === 'name' ? 'Name' : sortBy === 'quantity' ? 'Quantity' : 'Low Stock'}
            </span>
            <ChevronDown size={16} />
          </button>

          {showSortMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[200px]">
              <button
                onClick={() => { setSortBy('name'); setShowSortMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 first:rounded-t-lg"
              >
                Sort by Name
              </button>
              <button
                onClick={() => { setSortBy('quantity'); setShowSortMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 border-t border-gray-200"
              >
                Sort by Quantity
              </button>
              <button
                onClick={() => { setSortBy('low-stock'); setShowSortMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 border-t border-gray-200 last:rounded-b-lg"
              >
                Sort by Low Stock
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="p-4 space-y-3">
        {filteredProducts.map((product) => {
          const inventoryValue = product.available * product.price;
          return (
            <button
              key={product.id}
              onClick={() => handleViewProduct(product)}
              className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left active:bg-gray-50"
            >
              <div className="flex gap-3">
                {/* Product Image Placeholder */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package size={32} className="text-gray-400" />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-600">
                      {product.available} available
                    </span>
                    {product.lowStock && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
                        <AlertCircle size={12} />
                        Low Stock
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    ${product.price.toFixed(2)} / unit
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    Value: ${inventoryValue.toFixed(2)}
                  </div>
                </div>

                {/* View Button */}
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600">View →</span>
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

function Package({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16.5 9.4l-9-5.19" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
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
      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
        active
          ? 'bg-gray-900 text-white'
          : 'bg-white border border-gray-300 text-gray-700 active:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}
