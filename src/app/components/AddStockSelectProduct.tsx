import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, AlertCircle } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

interface Product {
  id: string;
  name: string;
  available: number;
  price: number;
  lowStock?: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Garlic Salt Blocks',
    available: 247,
    price: 17.15,
  },
  {
    id: '2',
    name: 'Redmond Mineral Salt',
    available: 200,
    price: 9.79,
  },
  {
    id: '3',
    name: 'SweetPro FiberMate 20',
    available: 6,
    price: 154.00,
    lowStock: true,
  },
];

export default function AddStockSelectProduct() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProduct = (product: Product) => {
    navigate('/add-stock-quantity', {
      state: { product }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 active:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Add Stock</h1>
          </div>
          <UserIcon />
        </div>
        <p className="text-sm text-gray-600 pl-9">
          Choose the product being restocked.
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

      {/* Products */}
      <div className="p-4 space-y-3">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex gap-3">
              {/* Product Image Placeholder */}
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package size={32} className="text-gray-400" />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                <div className="flex items-center gap-2 mb-2">
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
                <div className="text-lg font-semibold text-gray-900">
                  ${product.price.toFixed(2)}
                </div>
              </div>

              {/* Select Button */}
              <button
                onClick={() => handleSelectProduct(product)}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium active:bg-gray-800 h-fit"
              >
                Select
              </button>
            </div>
          </div>
        ))}
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
