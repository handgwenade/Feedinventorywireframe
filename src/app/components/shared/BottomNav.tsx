import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, FileText, Users } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/inventory') return location.pathname.startsWith('/inventory') || location.pathname.startsWith('/product-detail') || location.pathname.startsWith('/add-stock') || location.pathname.startsWith('/adjust-count');
    if (path === '/take-feed') return location.pathname.startsWith('/choose-sale-type') || location.pathname.startsWith('/choose-customer') || location.pathname.startsWith('/add-products') || location.pathname.startsWith('/review-invoice') || location.pathname.startsWith('/k2-') || location.pathname.startsWith('/family-') || location.pathname.startsWith('/choose-family');
    if (path === '/invoices') return location.pathname.startsWith('/invoices');
    if (path === '/accounts') return location.pathname.startsWith('/accounts');
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 max-w-md mx-auto">
      <div className="grid grid-cols-5 h-16">
        <NavItem
          icon={<Home size={20} />}
          label="Home"
          active={isActive('/')}
          onClick={() => navigate('/')}
        />
        <NavItem
          icon={<Package size={20} />}
          label="Inventory"
          active={isActive('/inventory')}
          onClick={() => navigate('/inventory')}
        />
        <NavItem
          icon={<ShoppingCart size={24} />}
          label="Take Feed"
          active={isActive('/take-feed')}
          onClick={() => navigate('/choose-sale-type')}
          primary
        />
        <NavItem
          icon={<FileText size={20} />}
          label="Invoices"
          active={isActive('/invoices')}
          onClick={() => navigate('/invoices')}
        />
        <NavItem
          icon={<Users size={20} />}
          label="Accounts"
          active={isActive('/accounts')}
          onClick={() => navigate('/accounts')}
        />
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
  primary = false
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 ${
        active
          ? 'text-gray-900'
          : 'text-gray-500'
      } active:bg-gray-50`}
    >
      {primary ? (
        <div className={`w-12 h-12 rounded-full flex items-center justify-center -mt-2 ${
          active ? 'bg-gray-900 text-white' : 'bg-gray-700 text-white'
        }`}>
          {icon}
        </div>
      ) : (
        icon
      )}
      <span className={`text-xs ${primary ? 'font-semibold' : 'font-medium'}`}>
        {label}
      </span>
    </button>
  );
}
