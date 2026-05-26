import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { productsService } from '../services/productsService';
import { formatCurrency } from '../utils/calculations';
import type { Product } from '../types';

export default function SupabaseProductsTest() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authStatus, setAuthStatus] = useState('Not signed in');
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkSessionAndLoadProducts() {
      const user = await authService.getCurrentUser();

      if (!isMounted) return;

      if (user?.email) {
        setAuthStatus(`Signed in as ${user.email}`);
      }

      await loadProducts(isMounted);
    }

    checkSessionAndLoadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  async function loadProducts(isMounted = true) {
    setIsLoading(true);

    try {
      const liveProducts = await productsService.list();

      if (!isMounted) return;

      setProducts(liveProducts);
      setErrorMessage(null);
    } catch (error) {
      if (!isMounted) return;

      setProducts([]);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown Supabase read error');
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  }

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSigningIn(true);
    setErrorMessage(null);

    try {
      const data = await authService.signInWithPassword(email, password);
      setAuthStatus(data.user?.email ? `Signed in as ${data.user.email}` : 'Signed in');
      await loadProducts();
    } catch (error) {
      setAuthStatus('Sign in failed');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown sign-in error');
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleSignOut() {
    await authService.signOut();
    setAuthStatus('Not signed in');
    setProducts([]);
    await loadProducts();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="text-gray-600 active:text-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Supabase Products Test</h1>
          <p className="text-sm text-gray-600">Hidden dev screen for live product reads.</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Read source</div>
          <div className="font-semibold text-gray-900">productsService.list()</div>
        </div>

        <form onSubmit={handleSignIn} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">Auth status</div>
            <div className="font-semibold text-gray-900">{authStatus}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Supabase test password"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSigningIn}
              className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-semibold active:bg-gray-800 disabled:opacity-50"
            >
              {isSigningIn ? 'Signing In...' : 'Sign In + Retry'}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex-1 bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </form>

        {isLoading && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-700">
            Loading products from Supabase...
          </div>
        )}

        {errorMessage && (
          <div className="bg-white border border-gray-300 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
              <AlertCircle size={20} />
              Supabase read failed
            </div>
            <p className="text-sm text-gray-700 break-words">{errorMessage}</p>
          </div>
        )}

        {!isLoading && !errorMessage && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-900 font-semibold mb-1">
              <CheckCircle size={20} />
              Live read succeeded
            </div>
            <p className="text-sm text-gray-600">Loaded {products.length} products from Supabase.</p>
          </div>
        )}

        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="font-semibold text-gray-900 mb-1">{product.name}</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-600 text-xs">Quantity</div>
                  <div className="font-medium text-gray-900">
                    {product.currentQuantity} {product.unitLabel}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-xs">Sale Price</div>
                  <div className="font-medium text-gray-900">{formatCurrency(product.salePrice)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
