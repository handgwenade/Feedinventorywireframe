

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdatePassword = async () => {
    setError('');
    setMessage('');

    if (!password) {
      setError('Enter a new password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setIsLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage('Password updated. You can now sign in.');

    setTimeout(() => {
      navigate('/login');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gray-900 rounded-lg flex items-center justify-center">
              <Package size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Update Password</h1>
          <p className="text-gray-600 mt-1">Choose a new password for StockLog.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          {error && (
            <div className="p-3 bg-gray-50 border border-gray-300 rounded text-sm text-gray-900">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-gray-50 border border-gray-300 rounded text-sm text-gray-900">
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter new password..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <button
            onClick={handleUpdatePassword}
            disabled={isLoading}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold active:bg-gray-800 disabled:bg-gray-400"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-medium active:bg-gray-50"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}