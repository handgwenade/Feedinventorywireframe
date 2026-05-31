import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

export default function UserIcon() {
  const navigate = useNavigate();

  return (
    <button
      className="w-9 h-9 bg-[#e9f0e5] rounded-full flex items-center justify-center border border-[#cbd8c4] active:bg-[#dce8d6] shadow-[0_2px_8px_rgba(61,47,31,0.10)] transition-colors"
      onClick={() => navigate('/profile-menu')}
    >
      <User size={16} className="text-[#5a7a4d]" />
    </button>
  );
}
