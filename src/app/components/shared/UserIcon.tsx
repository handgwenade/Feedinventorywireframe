import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

export default function UserIcon() {
  const navigate = useNavigate();

  return (
    <button
      className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-300 active:bg-gray-200"
      onClick={() => navigate('/profile-menu')}
    >
      <User size={16} className="text-gray-700" />
    </button>
  );
}
