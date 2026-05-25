import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, AlertCircle, Package } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import { products } from '../data/mockData';
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
  const { cart: initialCart = [], editingIndex } = location.state || {};
  const initialEditingProduct = typeof editingIndex === 'number'
    ? products.find((product) => product.id === initialCart[editingIndex]?.productId) ?? null
    : null;

  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialEditingProduct);
  const [editingCartIndex, setEditingCartIndex] = useState<number | null>(
    typeof editingIndex === 'number' ? editingIndex : null
  );

  const filteredProducts = products.filter((product) =>
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
        {filteredProducts.map((product) => {
          const lowStock = isLowStock(product);

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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
              </span>
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
  const [quantity, setQuantity] = useState(initialQuantity);

  const lineTotal = calculateLineTotal(quantity, product.salePrice);
  const afterUse = product.currentQuantity - quantity;

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
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl font-semibold text-gray-700 active:bg-gray-200"
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Math.min(product.currentQuantity, parseInt(event.target.value) || 1)))}
              className="flex-1 text-center text-2xl font-semibold text-gray-900 border border-gray-300 rounded-lg py-2"
            />
            <button
              onClick={() => setQuantity(Math.min(product.currentQuantity, quantity + 1))}
              className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl font-semibold text-gray-700 active:bg-gray-200"
            >
              +
            </button>
          </div>
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
            onClick={() => onConfirm(quantity)}
            className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-semibold active:bg-gray-800"
          >
            Add to Statement
          </button>
        </div>
      </div>
    </div>
  );
}
