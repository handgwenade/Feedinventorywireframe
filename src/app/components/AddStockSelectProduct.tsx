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
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-[#8b7a6f] active:text-[#3d2f1f]"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-[#3d2f1f]">Add Stock</h1>
          </div>
          <UserIcon />
        </div>
        <p className="text-sm text-[#8b7a6f] pl-9">
          Choose the product being restocked.
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
          />
        </div>
      </div>

      {/* Products */}
      <div className="p-4 space-y-3">
        {isLoading && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            Loading products...
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

        {!isLoading && !errorMessage && filteredProducts.map((product) => (
          <div key={product.id} className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div className="flex gap-3">
              {/* Product Image Placeholder */}
              <div className="w-20 h-20 bg-[#f7f4ed] border border-[#e8dfd1] rounded-2xl flex items-center justify-center flex-shrink-0">
                <Package size={32} className="text-[#8b7a6f]" />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#3d2f1f] mb-1">{product.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-[#8b7a6f]">
                    {product.currentQuantity} {product.unitLabel} available
                  </span>
                  {isLowStock(product) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#fff4d8] text-[#8b5a1f] text-xs font-semibold rounded-full border border-[#d4a574]">
                      <AlertCircle size={12} />
                      Low Stock
                    </span>
                  )}
                </div>
                <div className="text-lg font-bold text-[#3d2f1f]">
                  {formatCurrency(product.salePrice)}
                </div>
              </div>

              {/* Select Button */}
              <button
                onClick={() => handleSelectProduct(product)}
                className="bg-[#5a7a4d] text-white px-4 py-2 rounded-2xl font-semibold active:bg-[#4a6a3d] h-fit shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
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
