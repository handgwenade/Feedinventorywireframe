import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function SessionExpired() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f4ed] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-[#fff4d8] rounded-full flex items-center justify-center border-2 border-[#d4a574] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <AlertCircle size={40} className="text-[#8b5a1f]" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#3d2f1f] mb-2">Session Expired</h1>
          <p className="text-[#8b7a6f]">Please sign in again to continue.</p>
        </div>

        {/* Sign In Button */}
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-[#5a7a4d] text-white py-4 rounded-2xl font-semibold active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
