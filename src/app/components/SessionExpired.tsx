import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function SessionExpired() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-300">
            <AlertCircle size={40} className="text-gray-600" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Expired</h1>
          <p className="text-gray-600">Please sign in again to continue.</p>
        </div>

        {/* Sign In Button */}
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold active:bg-gray-800"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
