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
    <div className="min-h-screen bg-[#f7f4ed] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-[#5a7a4d] rounded-3xl flex items-center justify-center shadow-[0_4px_14px_rgba(61,47,31,0.18)]">
              <Package size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#3d2f1f]">Update Password</h1>
          <p className="text-[#8b7a6f] mt-1">Choose a new password for StockLog.</p>
        </div>

        <div className="bg-white border border-[#ded2c0] rounded-2xl p-6 space-y-4 shadow-[0_4px_18px_rgba(61,47,31,0.10)]">
          {error && (
            <div className="p-3 bg-[#fff4f0] border border-[#d8a59a] rounded-2xl text-sm text-[#8b3f2f]">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-[#e9f0e5] border border-[#cbd8c4] rounded-2xl text-sm text-[#5a7a4d]">
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#3d2f1f] mb-2">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter new password..."
              className="w-full px-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3d2f1f] mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password..."
              className="w-full px-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
            />
          </div>

          <button
            onClick={handleUpdatePassword}
            disabled={isLoading}
            className="w-full bg-[#5a7a4d] text-white py-4 rounded-2xl font-semibold active:bg-[#4a6a3d] disabled:bg-[#c7bdb0] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}