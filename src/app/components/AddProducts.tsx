import { useEffect, useState, type ChangeEvent, type FocusEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, ShoppingCart, AlertCircle, Package } from 'lucide-react';
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

export default function AddProducts() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state ?? {}) as {
    customerName?: string;
    customerId?: string;
    accountId?: string;
    cart?: CartItem[];
    editingIndex?: number;
  };
  const {
    customerName = 'Unassigned',
    customerId,
    accountId,
    cart: initialCart = [],
    editingIndex
  } = routeState;

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

  const handleReviewInvoice = () => {
    navigate('/review-invoice', {
      state: { customerName, customerId, accountId, cart }
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] flex flex-col pb-24">
      <div className="bg-white border-b border-[#e8dfd1] p-4 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate('/choose-customer')}
            className="text-[#8b7a6f] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Add Products</h1>
        </div>
        <div className="text-sm text-[#8b7a6f]">
          Customer: <span className="font-semibold text-[#3d2f1f]">{customerName}</span>
        </div>
      </div>

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

      <div className="flex-1 p-4 space-y-3">
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

        {!isLoading && !errorMessage && filteredProducts.map((product) => {
          const lowStock = isLowStock(product);
          const cartItem = cart.find((item) => item.productId === product.id);

          return (
            <div key={product.id} className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              <div className="flex gap-3">
                <div className="w-20 h-20 bg-[#f7f4ed] border border-[#e8dfd1] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Package size={32} className="text-[#8b7a6f]" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#3d2f1f] mb-1">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-[#8b7a6f]">
                      {product.currentQuantity} {product.unitLabel} available
                    </span>
                    {lowStock && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#fff4d8] text-[#8b5a1f] text-xs font-semibold rounded-full border border-[#d4a574]">
                        <AlertCircle size={12} />
                        Low Stock
                      </span>
                    )}
                    {cartItem && (
                      <span className="inline-flex px-2 py-0.5 bg-[#e9f0e5] text-[#5a7a4d] text-xs font-semibold rounded-full border border-[#cbd8c4]">
                        In invoice: {cartItem.quantity}
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-bold text-[#3d2f1f]">
                    {formatCurrency(product.salePrice)}
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="bg-[#5a7a4d] text-white px-4 py-2 rounded-2xl font-semibold active:bg-[#4a6a3d] h-fit shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
                >
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#3d2f1f] text-white p-4 shadow-[0_-4px_18px_rgba(61,47,31,0.24)] max-w-md mx-auto border-t border-[#8b6f47]">
          <div
            onClick={handleReviewInvoice}
            className="flex items-center justify-between mb-3 cursor-pointer active:opacity-80"
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') handleReviewInvoice();
            }}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} />
              <div>
                <div className="font-medium">
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in invoice
                </div>
                <div className="text-xs text-[#d4c6b3]">Tap to review</div>
              </div>
            </div>
            <div className="text-xl font-bold">
              {formatCurrency(cartTotal)}
            </div>
          </div>
          <button
            onClick={handleReviewInvoice}
            className="w-full bg-white text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5]"
          >
            Review Invoice
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
  initialQuantity = 0,
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
  const afterSale = product.currentQuantity - validQuantity;

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
      setErrorMessage('Enter a quantity greater than 0.');
      return;
    }

    if (quantityValue > product.currentQuantity) {
      setErrorMessage('Enter a quantity less than or equal to available stock.');
      return;
    }

    onConfirm(quantityValue);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={onCancel}>
      <div
        className="bg-white rounded-t-3xl w-full p-6 animate-slide-up border-t border-[#e8dfd1] shadow-[0_-4px_18px_rgba(61,47,31,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-[#3d2f1f] mb-1">{product.name}</h3>
        <p className="text-sm text-[#8b7a6f] mb-6">
          {formatCurrency(product.salePrice)} each
        </p>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#3d2f1f] mb-2">Quantity</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const current = Number(quantityInput);
                const next = Number.isFinite(current) ? Math.max(0, current - 1) : 0;
                setQuantityInput(String(next));
                setErrorMessage(null);
              }}
              className="w-12 h-12 bg-[#f7f4ed] border border-[#ded2c0] rounded-2xl flex items-center justify-center text-2xl font-semibold text-[#3d2f1f] active:bg-[#faf8f5]"
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={quantityInput}
              onChange={handleQuantityChange}
              onFocus={(event: FocusEvent<HTMLInputElement>) => {
                if (event.target.value === '0') {
                  setQuantityInput('');
                }
              }}
              className="flex-1 text-center text-2xl font-bold text-[#3d2f1f] bg-white border border-[#ded2c0] rounded-2xl py-2 focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
              placeholder="0"
            />
            <button
              onClick={() => {
                const current = Number(quantityInput);
                const next = Number.isFinite(current) ? current + 1 : 1;
                setQuantityInput(String(next));
                setErrorMessage(null);
              }}
              className="w-12 h-12 bg-[#f7f4ed] border border-[#ded2c0] rounded-2xl flex items-center justify-center text-2xl font-semibold text-[#3d2f1f] active:bg-[#faf8f5]"
            >
              +
            </button>
          </div>
          {errorMessage && (
            <div className="mt-2 text-sm font-medium text-[#8b3f2f]">{errorMessage}</div>
          )}
        </div>

        <div className="mb-6 p-3 bg-[#f7f4ed] rounded-2xl border border-[#e8dfd1]">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[#8b7a6f]">Available now:</span>
            <span className="font-medium text-[#3d2f1f]">
              {product.currentQuantity} {product.unitLabel}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8b7a6f]">After sale:</span>
            <span className="font-medium text-[#3d2f1f]">
              {afterSale} {product.unitLabel}
            </span>
          </div>
        </div>

        <div className="mb-6 p-4 bg-[#f7f4ed] rounded-2xl border border-[#e8dfd1]">
          <div className="flex justify-between items-center">
            <span className="text-[#8b7a6f]">Line Total</span>
            <span className="text-2xl font-bold text-[#3d2f1f]">
              {formatCurrency(lineTotal)}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
          >
            Add to Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
