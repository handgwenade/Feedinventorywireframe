import { useEffect, useState, type ChangeEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, AlertCircle, Package } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import { productsService } from '../services/productsService';
import { calculateLineTotal, formatCurrency, isLowStock } from '../utils/calculations';
import type { Product } from '../types';

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  unitLabel: string;
}

export default function K2AddProducts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart: initialCart = [], editingIndex } = (location.state ?? {}) as {
    cart?: CartItem[];
    editingIndex?: number;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [productOptions, setProductOptions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingCartIndex, setEditingCartIndex] = useState<number | null>(
    typeof editingIndex === 'number' ? editingIndex : null
  );

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const liveProducts = await productsService.list();

        if (!isMounted) return;

        setProductOptions(liveProducts);

        if (typeof editingIndex === 'number') {
          const productToEdit = liveProducts.find((product) => product.id === initialCart[editingIndex]?.productId);
          setSelectedProduct(productToEdit ?? null);
        }
      } catch (error) {
        if (!isMounted) return;

        setProductOptions([]);
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

  const filteredProducts = productOptions.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cartTotal = cart.reduce((sum, item) => sum + calculateLineTotal(item.quantity, item.price), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleQuantityConfirm = (quantity: number) => {
    if (!selectedProduct) return;

    if (editingCartIndex !== null) {
      setCart(cart.map((item, index) =>
        index === editingCartIndex
          ? {
              productId: selectedProduct.id,
              name: selectedProduct.name,
              quantity,
              price: selectedProduct.salePrice,
              unitLabel: selectedProduct.unitLabel,
            }
          : item
      ));
      setSelectedProduct(null);
      setEditingCartIndex(null);
      return;
    }

    const existingItem = cart.find((item) => item.productId === selectedProduct.id);
    if (existingItem) {
      setCart(cart.map((item) =>
        item.productId === selectedProduct.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        quantity,
        price: selectedProduct.salePrice,
        unitLabel: selectedProduct.unitLabel,
      }]);
    }
    setSelectedProduct(null);
  };

  const handleReviewStatement = () => {
    navigate('/k2-review-statement', { state: { cart } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate('/choose-sale-type')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">K2 Account Use</h1>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
            K2
          </span>
        </div>
        <p className="text-sm text-gray-600">Record feed or products used by K2.</p>
      </div>

      <div className="p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3">
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

        {!isLoading && !errorMessage && filteredProducts.map((product) => {
          const lowStock = isLowStock(product);
          const cartItem = cart.find((item) => item.productId === product.id);

          return (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package size={32} className="text-gray-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">
                      {product.currentQuantity} {product.unitLabel} available
                    </span>
                    {lowStock && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
                        <AlertCircle size={12} />
                        Low Stock
                      </span>
                    )}
                    {cartItem && (
                      <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
                        In statement: {cartItem.quantity}
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(product.salePrice)}
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium active:bg-gray-800 h-fit"
                >
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg max-w-md mx-auto">
          <div
            onClick={handleReviewStatement}
            className="flex items-center justify-between mb-3 cursor-pointer active:opacity-80"
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') handleReviewStatement();
            }}
          >
            <div className="flex items-center gap-2">
              <div>
                <div className="font-medium">
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in statement
                </div>
                <div className="text-xs text-gray-300">Tap to review</div>
              </div>
            </div>
            <div className="text-xl font-bold">
              {formatCurrency(cartTotal)}
            </div>
          </div>
          <button
            onClick={handleReviewStatement}
            className="w-full bg-white text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-100"
          >
            Review Statement
          </button>
        </div>
      )}

      {selectedProduct && (
        <QuantityModal
          product={selectedProduct}
          initialQuantity={editingCartIndex !== null ? cart[editingCartIndex]?.quantity : undefined}
          onConfirm={handleQuantityConfirm}
          onCancel={() => {
            setSelectedProduct(null);
            setEditingCartIndex(null);
          }}
        />
      )}

      <BottomNav />
    </div>
  );
}

function QuantityModal({
  product,
  initialQuantity = 1,
  onConfirm,
  onCancel,
}: {
  product: Product;
  initialQuantity?: number;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
}) {
  const [quantityInput, setQuantityInput] = useState(String(initialQuantity));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parsedQuantity = Number(quantityInput);
  const validQuantity = Number.isFinite(parsedQuantity) ? Math.min(product.currentQuantity, parsedQuantity) : 0;
  const lineTotal = calculateLineTotal(validQuantity, product.salePrice);
  const afterUse = product.currentQuantity - validQuantity;

  const handleQuantityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    if (rawValue === '') {
      setQuantityInput('');
      return;
    }

    if (/^\d*$/.test(rawValue)) {
      setQuantityInput(rawValue.replace(/^0+(\d)/, '$1'));
    }
  };

  const handleConfirm = () => {
    const quantityValue = Number(quantityInput);
    if (!Number.isFinite(quantityValue) || quantityValue < 1) {
      setErrorMessage('Enter a quantity of 1 or greater.');
      return;
    }
    onConfirm(Math.min(product.currentQuantity, quantityValue));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={onCancel}>
      <div
        className="bg-white rounded-t-2xl w-full p-6 animate-slide-up"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-6">
          {formatCurrency(product.salePrice)} each
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const current = Number(quantityInput);
                const next = Number.isFinite(current) && current >= 1 ? Math.max(1, current - 1) : 1;
                setQuantityInput(String(next));
                setErrorMessage(null);
              }}
              className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl font-semibold text-gray-700 active:bg-gray-200"
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={quantityInput}
              onChange={handleQuantityChange}
              className="flex-1 text-center text-2xl font-semibold text-gray-900 border border-gray-300 rounded-lg py-2"
              placeholder="1"
            />
            <button
              onClick={() => {
                const current = Number(quantityInput);
                const next = Number.isFinite(current) && current >= 0 ? current + 1 : 1;
                setQuantityInput(String(next));
                setErrorMessage(null);
              }}
              className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl font-semibold text-gray-700 active:bg-gray-200"
            >
              +
            </button>
          </div>
          {errorMessage && (
            <div className="mt-2 text-sm text-red-600">{errorMessage}</div>
          )}
        </div>

        <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Available now:</span>
            <span className="font-medium text-gray-900">
              {product.currentQuantity} {product.unitLabel}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Available after use:</span>
            <span className="font-medium text-gray-900">
              {afterUse} {product.unitLabel}
            </span>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Line Total</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(lineTotal)}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold active:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-semibold active:bg-gray-800"
          >
            Add to Statement
          </button>
        </div>
      </div>
    </div>
  );
}
