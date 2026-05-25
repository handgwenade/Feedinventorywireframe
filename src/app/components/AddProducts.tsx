import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ArrowLeft, ShoppingCart, AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  available: number;
  price: number;
  image?: string;
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
    available: 247,
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

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export default function AddProducts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { customerName = 'Unassigned' } = location.state || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cartTotal = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleQuantityConfirm = (quantity: number) => {
    if (!selectedProduct) return;

    const existingItem = cart.find(item => item.productId === selectedProduct.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === selectedProduct.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        quantity,
        price: selectedProduct.price,
      }]);
    }
    setSelectedProduct(null);
  };

  const handleReviewInvoice = () => {
    navigate('/review-invoice', { state: { customerName, cart } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate('/choose-customer')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Add Products</h1>
        </div>
        <div className="text-sm text-gray-600">
          Customer: <span className="font-medium text-gray-900">{customerName}</span>
        </div>
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
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Products */}
      <div className="flex-1 p-4 space-y-3">
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
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                      <AlertCircle size={12} />
                      Low Stock
                    </span>
                  )}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  ${product.price.toFixed(2)}
                </div>
              </div>

              {/* Add Button */}
              <button
                onClick={() => handleAddToCart(product)}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium active:bg-gray-800 h-fit"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="text-xl font-bold">
              ${cartTotal.toFixed(2)}
            </div>
          </div>
          <button
            onClick={handleReviewInvoice}
            className="w-full bg-white text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-100"
          >
            Review Invoice
          </button>
        </div>
      )}

      {/* Quantity Modal */}
      {selectedProduct && (
        <QuantityModal
          product={selectedProduct}
          onConfirm={handleQuantityConfirm}
          onCancel={() => setSelectedProduct(null)}
        />
      )}
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

function QuantityModal({
  product,
  onConfirm,
  onCancel
}: {
  product: Product;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
}) {
  const [quantity, setQuantity] = useState(1);

  const lineTotal = quantity * product.price;
  const afterSale = product.available - quantity;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={onCancel}>
      <div
        className="bg-white rounded-t-2xl w-full p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-6">
          ${product.price.toFixed(2)} each
        </p>

        {/* Quantity Stepper */}
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
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 text-center text-2xl font-semibold text-gray-900 border border-gray-300 rounded-lg py-2"
            />
            <button
              onClick={() => setQuantity(Math.min(product.available, quantity + 1))}
              className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl font-semibold text-gray-700 active:bg-gray-200"
            >
              +
            </button>
          </div>
        </div>

        {/* Inventory Preview */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Available now:</span>
            <span className="font-medium text-gray-900">{product.available}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">After sale:</span>
            <span className="font-medium text-gray-900">{afterSale}</span>
          </div>
        </div>

        {/* Line Total */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Line Total</span>
            <span className="text-2xl font-bold text-gray-900">
              ${lineTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
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
            Add to Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
