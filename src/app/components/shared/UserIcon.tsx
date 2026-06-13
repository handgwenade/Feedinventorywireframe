import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

export default function UserIcon() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      aria-label="Open profile menu"
      title="Open profile menu"
      className="app-header-action rounded-full border border-[#cbd8c4] bg-[#e9f0e5] text-[#5a7a4d] shadow-[0_2px_8px_rgba(61,47,31,0.10)] transition-colors active:bg-[#dce8d6]"
      onClick={() => navigate('/profile-menu')}
    >
      <User size={18} aria-hidden="true" />
    </button>
  );
}
