import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, AlertCircle, Package } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { productsService } from '../services/productsService';
import { formatCurrency, isLowStock } from '../utils/calculations';
import type { Product } from '../types';

export default function AddStockSelectProduct() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [stockProducts, setStockProducts] = useState<Product[]>([]);
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

        setStockProducts(liveProducts);
      } catch (error) {
        if (!isMounted) return;

        setStockProducts([]);
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load products.');
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

  const filteredProducts = stockProducts.filter(product =>
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
        {isLoading && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
            Loading products...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="bg-white border border-gray-300 rounded-lg p-4 text-sm text-gray-900">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && filteredProducts.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
            No products found.
          </div>
        )}

        {!isLoading && !errorMessage && filteredProducts.map((product) => (
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
                    {product.currentQuantity} {product.unitLabel} available
                  </span>
                  {isLowStock(product) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
                      <AlertCircle size={12} />
                      Low Stock
                    </span>
                  )}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(product.salePrice)}
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
