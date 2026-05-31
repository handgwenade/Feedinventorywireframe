import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, UserPlus, User } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import { accountsService } from '../services/accountsService';
import type { Account } from '../types';

export default function ChooseCustomer() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [customerAccounts, setCustomerAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCustomers() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const customers = await accountsService.listCustomers();

        if (!isMounted) return;

        setCustomerAccounts(customers);
      } catch (error) {
        if (!isMounted) return;

        setCustomerAccounts([]);
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load customers.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCustomers = customerAccounts.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCustomer = (customerId: string, customerName: string) => {
    navigate('/add-products', {
      state: { customerId, customerName, accountId: customerId }
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] flex flex-col pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center gap-3 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <button
          onClick={() => navigate('/')}
          className="text-[#8b7a6f] active:text-[#3d2f1f]"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-[#3d2f1f]">New Sale</h1>
      </div>

      <div className="flex-1 p-4">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7a6f]" size={20} />
            <input
              type="text"
              placeholder="Search customers or accounts..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
            />
          </div>
        </div>

        {/* Add New Customer Button */}
        <button
          onClick={() => navigate('/add-account-person')}
          className="w-full bg-white border-2 border-dashed border-[#d4a574] p-4 rounded-2xl mb-6 flex items-center justify-center gap-2 text-[#5a7a4d] active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors"
        >
          <UserPlus size={20} />
          <span className="font-semibold">Add New Customer</span>
        </button>

        {/* Recent Customers */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#8b7a6f] mb-3">Recent Customers</h2>
          <div className="space-y-2">
            {isLoading && (
              <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
                Loading customers...
              </div>
            )}

            {!isLoading && errorMessage && (
              <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
                {errorMessage}
              </div>
            )}

            {!isLoading && !errorMessage && filteredCustomers.length === 0 && (
              <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
                No customers found.
              </div>
            )}

            {!isLoading && !errorMessage && filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleSelectCustomer(customer.id, customer.name)}
                className="w-full bg-white border border-[#ded2c0] p-4 rounded-2xl flex items-center gap-3 active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors"
              >
                <div className="w-10 h-10 bg-[#e9f0e5] border border-[#cbd8c4] rounded-full flex items-center justify-center">
                  <User size={20} className="text-[#5a7a4d]" />
                </div>
                <span className="font-semibold text-[#3d2f1f]">{customer.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Skip Option */}
        <button
          onClick={() => handleSelectCustomer('unassigned', 'Unassigned')}
          className="w-full text-[#8b7a6f] py-3 text-center font-semibold active:text-[#3d2f1f]"
        >
          Skip for Now / Unassigned Sale
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
