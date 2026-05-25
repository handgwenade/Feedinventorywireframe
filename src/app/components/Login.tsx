import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleSignIn = () => {
    // In a real app, this would authenticate
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* App Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gray-900 rounded-lg flex items-center justify-center">
              <Package size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">C&C Feed Inventory</h1>
          <p className="text-gray-600 mt-1">Sign in to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Invite Code Field (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invite code (optional)
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold active:bg-gray-800"
          >
            Sign In
          </button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <button className="text-sm text-gray-600 hover:text-gray-900 active:text-gray-900">
              Forgot password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
