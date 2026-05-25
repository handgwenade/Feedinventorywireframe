import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Download, Printer } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

type FilterType = 'all' | 'low-stock' | 'salt' | 'mineral' | 'tubs' | 'blocks';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  inventoryValue: number;
  status: 'in-stock' | 'low-stock';
}

const inventoryData: InventoryItem[] = [
  {
    id: '1',
    name: 'Garlic Salt Blocks',
    quantity: 247,
    unitPrice: 17.15,
    inventoryValue: 4236.05,
    status: 'in-stock'
  },
  {
    id: '2',
    name: 'Redmond Mineral Salt',
    quantity: 200,
    unitPrice: 9.79,
    inventoryValue: 1958.00,
    status: 'in-stock'
  },
  {
    id: '3',
    name: 'SweetPro FiberMate 20',
    quantity: 6,
    unitPrice: 154.00,
    inventoryValue: 924.00,
    status: 'low-stock'
  },
  {
    id: '4',
    name: 'RumenEdge Tubs',
    quantity: 4,
    unitPrice: 123.70,
    inventoryValue: 494.80,
    status: 'low-stock'
  }
];

export default function ReportInventorySummary() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const totalValue = inventoryData.reduce((sum, item) => sum + item.inventoryValue, 0);
  const totalUnits = inventoryData.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = inventoryData.filter(item => item.status === 'low-stock').length;

  const filteredData = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'low-stock') return matchesSearch && item.status === 'low-stock';
    // Simple filters based on product name keywords
    if (activeFilter === 'salt') return matchesSearch && item.name.toLowerCase().includes('salt');
    if (activeFilter === 'mineral') return matchesSearch && item.name.toLowerCase().includes('mineral');
    if (activeFilter === 'tubs') return matchesSearch && item.name.toLowerCase().includes('tub');
    if (activeFilter === 'blocks') return matchesSearch && item.name.toLowerCase().includes('block');

    return matchesSearch;
  });

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
          <h1 className="text-xl font-semibold text-gray-900">Inventory Summary</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* Date Label */}
        <div className="text-sm text-gray-600">
          As of today
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard label="Total Inventory Value" value={`$${totalValue.toFixed(2)}`} />
          <SummaryCard label="Total Units" value={totalUnits.toString()} />
          <SummaryCard label="Low Stock Items" value={lowStockCount.toString()} />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterChip label="All" active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
          <FilterChip label="Low Stock" active={activeFilter === 'low-stock'} onClick={() => setActiveFilter('low-stock')} />
          <FilterChip label="Salt" active={activeFilter === 'salt'} onClick={() => setActiveFilter('salt')} />
          <FilterChip label="Mineral" active={activeFilter === 'mineral'} onClick={() => setActiveFilter('mineral')} />
          <FilterChip label="Tubs" active={activeFilter === 'tubs'} onClick={() => setActiveFilter('tubs')} />
          <FilterChip label="Blocks" active={activeFilter === 'blocks'} onClick={() => setActiveFilter('blocks')} />
        </div>

        {/* Inventory List */}
        <div className="space-y-3">
          {filteredData.map(item => (
            <InventoryRow key={item.id} item={item} />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <ActionButton icon={<Download size={20} />} label="Export" onClick={() => {}} />
          <ActionButton icon={<Printer size={20} />} label="Print" onClick={() => {}} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="font-semibold text-gray-900 text-sm">{value}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
        active ? 'bg-gray-900 text-white' : 'bg-white border border-gray-300 text-gray-700 active:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

function InventoryRow({ item }: { item: InventoryItem }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="font-semibold text-gray-900">{item.name}</div>
        <span className={`text-xs px-2 py-1 rounded border ${
          item.status === 'low-stock'
            ? 'bg-gray-100 border-gray-300 text-gray-700'
            : 'bg-gray-50 border-gray-200 text-gray-600'
        }`}>
          {item.status === 'low-stock' ? 'Low Stock' : 'In Stock'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <div className="text-gray-600 text-xs">Quantity</div>
          <div className="font-medium text-gray-900">{item.quantity} units</div>
        </div>
        <div>
          <div className="text-gray-600 text-xs">Unit Price</div>
          <div className="font-medium text-gray-900">${item.unitPrice.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-600 text-xs">Value</div>
          <div className="font-medium text-gray-900">${item.inventoryValue.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-lg flex items-center gap-3 font-medium bg-white border border-gray-300 text-gray-900 active:bg-gray-50"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
