import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    navigate('/');
  };

  const handleForgotPassword = async () => {
    setMessage('');
    setError('');

    if (!email) {
      setError('Enter your email first, then request a reset link.');
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage('Password reset email sent. Check your inbox.');
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
          <h1 className="text-2xl font-bold text-[#3d2f1f]">StockLog</h1>
          <p className="text-[#8b7a6f] mt-1">Sign in to continue</p>
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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email..."
              className="w-full px-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3d2f1f] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password..."
              className="w-full px-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3d2f1f] mb-2">
              Invite code (optional)
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="Enter invite code..."
              className="w-full px-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
            />
          </div>

          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full bg-[#5a7a4d] text-white py-4 rounded-2xl font-semibold active:bg-[#4a6a3d] disabled:bg-[#c7bdb0] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="text-center">
            <button
              onClick={handleForgotPassword}
              className="text-sm font-semibold text-[#8b7a6f] hover:text-[#3d2f1f] active:text-[#3d2f1f]"
            >
              Forgot password?
            </button>
          </div>

          <div className="border-t border-[#eadfce] pt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-sm font-semibold text-[#5a7a4d] hover:text-[#3d2f1f] active:text-[#3d2f1f]"
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
