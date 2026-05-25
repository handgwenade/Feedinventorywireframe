import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, UserPlus, User } from 'lucide-react';
import BottomNav from './shared/BottomNav';

const RECENT_CUSTOMERS = [
  { id: '1', name: 'Anderson Cattle Co.' },
  { id: '2', name: 'Johnson Ranch' },
  { id: '3', name: 'Miller Family Farm' },
  { id: '4', name: 'Thompson Livestock' },
];

export default function ChooseCustomer() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = RECENT_CUSTOMERS.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCustomer = (customerId: string, customerName: string) => {
    navigate('/add-products', {
      state: { customerId, customerName }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="text-gray-600 active:text-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">New Sale</h1>
      </div>

      <div className="flex-1 p-4">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search customers or accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Add New Customer Button */}
        <button className="w-full bg-white border-2 border-dashed border-gray-300 p-4 rounded-lg mb-6 flex items-center justify-center gap-2 text-gray-600 active:bg-gray-50">
          <UserPlus size={20} />
          <span className="font-medium">Add New Customer</span>
        </button>

        {/* Recent Customers */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Recent Customers</h2>
          <div className="space-y-2">
            {filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleSelectCustomer(customer.id, customer.name)}
                className="w-full bg-white border border-gray-200 p-4 rounded-lg flex items-center gap-3 active:bg-gray-50"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-gray-600" />
                </div>
                <span className="font-medium text-gray-900">{customer.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Skip Option */}
        <button
          onClick={() => handleSelectCustomer('unassigned', 'Unassigned')}
          className="w-full text-gray-600 py-3 text-center active:text-gray-900"
        >
          Skip for Now / Unassigned Sale
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
