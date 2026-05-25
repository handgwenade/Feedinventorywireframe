import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Plus } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

interface LowStockItem {
  id: string;
  name: string;
  currentQuantity: number;
  minimumQuantity: number;
  shortage: number;
}

const lowStockData: LowStockItem[] = [
  {
    id: '1',
    name: 'SweetPro FiberMate 20',
    currentQuantity: 6,
    minimumQuantity: 8,
    shortage: 2
  },
  {
    id: '2',
    name: 'RumenEdge Tubs',
    currentQuantity: 4,
    minimumQuantity: 12,
    shortage: 8
  }
];

export default function ReportLowStock() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/reports')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Low Stock</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* Summary Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Low Stock Items</div>
          <div className="text-3xl font-bold text-gray-900">{lowStockData.length}</div>
        </div>

        {/* Low Stock List */}
        <div className="space-y-3">
          {lowStockData.map(item => (
            <LowStockRow key={item.id} item={item} navigate={navigate} />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <ActionButton
            icon={<Plus size={20} />}
            label="Add Stock"
            onClick={() => navigate('/add-stock-select')}
            primary
          />
          <ActionButton icon={<Download size={20} />} label="Export" onClick={() => {}} />
          <ActionButton icon={<Printer size={20} />} label="Print" onClick={() => {}} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function LowStockRow({ item, navigate }: { item: LowStockItem; navigate: any }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="font-semibold text-gray-900 mb-3">{item.name}</div>
      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <div className="text-gray-600 text-xs mb-1">Current</div>
          <div className="font-medium text-gray-900">{item.currentQuantity}</div>
        </div>
        <div>
          <div className="text-gray-600 text-xs mb-1">Minimum</div>
          <div className="font-medium text-gray-900">{item.minimumQuantity}</div>
        </div>
      </div>
      <div className="mb-3 p-2 bg-gray-50 border border-gray-300 rounded text-sm">
        <span className="text-gray-600">Shortage:</span>{' '}
        <span className="font-semibold text-gray-900">{item.shortage} units needed</span>
      </div>
      <button
        onClick={() => navigate('/add-stock-select')}
        className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium text-sm active:bg-gray-800"
      >
        Add Stock
      </button>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  primary = false
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-lg flex items-center gap-3 font-medium ${
        primary
          ? 'bg-gray-900 text-white active:bg-gray-800'
          : 'bg-white border border-gray-300 text-gray-900 active:bg-gray-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
