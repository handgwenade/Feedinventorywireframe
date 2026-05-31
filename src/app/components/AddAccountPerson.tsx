import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import UserIcon from './shared/UserIcon';
import BottomNav from './shared/BottomNav';
import { accountsService } from '../services/accountsService';
import { peopleService } from '../services/peopleService';
import type { Account, Person } from '../types';

type AccountType = 'customer' | 'family';
type AccountListType = 'customer' | 'k2' | 'family';

interface AccountDetailRouteItem {
  id: string;
  name: string;
  type: AccountListType;
  balance: number;
  lastActivity: string;
  phone?: string;
  email?: string;
  source: Account | Person;
}

export default function AddAccountPerson() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<AccountType>('customer');

  // Customer fields
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Person fields
  const [displayName, setDisplayName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [personNotes, setPersonNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigateToAccountDetail = (account: AccountDetailRouteItem) => {
    navigate('/account-detail', { state: { account } });
  };

  const handleSaveCustomer = async () => {
    setErrorMessage(null);

    if (!businessName.trim()) {
      setErrorMessage('Customer account name is required.');
      return;
    }

    try {
      setIsSaving(true);
      const account = await accountsService.createCustomerAccount({
        name: businessName,
        phone,
        email,
        billingAddress: address,
        notes,
      });

      navigateToAccountDetail({
        id: account.id,
        name: account.name,
        type: 'customer',
        balance: 0,
        lastActivity: new Date().toLocaleDateString(),
        phone: account.phone,
        email: account.email,
        source: account,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create customer account.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePerson = async () => {
    setErrorMessage(null);

    if (!displayName.trim()) {
      setErrorMessage('Official display name is required.');
      return;
    }

    try {
      setIsSaving(true);
      const person = await peopleService.createFamilyPerson({
        officialDisplayName: displayName,
        phone: personPhone,
        notes: personNotes,
      });

      navigateToAccountDetail({
        id: person.id,
        name: person.officialDisplayName,
        type: 'family',
        balance: 0,
        lastActivity: new Date().toLocaleDateString(),
        phone: person.phone,
        source: person,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create person record.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-32">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center justify-between shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/accounts')}
            className="text-[#8b7a6f] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Add Account / Person</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {errorMessage && (
          <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            {errorMessage}
          </div>
        )}

        {/* Account Type Selector */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <label className="block text-sm font-semibold text-[#3d2f1f] mb-3">
            Account type
          </label>
          <div className="space-y-2">
            <TypeOption
              value="customer"
              label="Customer"
              selected={accountType === 'customer'}
              onSelect={() => setAccountType('customer')}
            />
            <TypeOption
              value="family"
              label="Person"
              selected={accountType === 'family'}
              onSelect={() => setAccountType('family')}
            />
          </div>
        </div>

        {/* Customer Form */}
        {accountType === 'customer' && (
          <>
            <FormField
              label="Name"
              value={businessName}
              onChange={setBusinessName}
              placeholder="Enter customer or business name..."
            />
            <FormField
              label="Phone"
              value={phone}
              onChange={setPhone}
              placeholder="(555) 123-4567"
              type="tel"
            />
            <FormField
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="email@example.com"
              type="email"
            />
            <FormField
              label="Billing address"
              value={address}
              onChange={setAddress}
              placeholder="Enter billing address..."
              multiline
            />
            <FormField
              label="Notes"
              value={notes}
              onChange={setNotes}
              placeholder="Add notes..."
              multiline
            />
          </>
        )}

        {/* Person Form */}
        {accountType === 'family' && (
          <>
            <FormField
              label="Official display name"
              value={displayName}
              onChange={setDisplayName}
              placeholder="Enter full name..."
            />
            <FormField
              label="Phone (optional)"
              value={personPhone}
              onChange={setPersonPhone}
              placeholder="(555) 123-4567"
              type="tel"
            />
            <FormField
              label="Notes"
              value={personNotes}
              onChange={setPersonNotes}
              placeholder="Add notes..."
              multiline
            />
            <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              <strong>Tip:</strong> Use one official name per person to avoid duplicate records.
            </div>
          </>
        )}
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8dfd1] p-4 max-w-md mx-auto space-y-2 shadow-[0_-4px_18px_rgba(61,47,31,0.14)]">
        {accountType === 'customer' ? (
          <button
            onClick={handleSaveCustomer}
            disabled={isSaving}
            className="w-full bg-[#5a7a4d] text-white py-4 rounded-2xl font-semibold active:bg-[#4a6a3d] disabled:bg-[#c7bdb0] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
          >
            {isSaving ? 'Saving Customer...' : 'Save Customer'}
          </button>
        ) : (
          <button
            onClick={handleSavePerson}
            disabled={isSaving}
            className="w-full bg-[#5a7a4d] text-white py-4 rounded-2xl font-semibold active:bg-[#4a6a3d] disabled:bg-[#c7bdb0] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
          >
            {isSaving ? 'Saving Person...' : 'Save Person'}
          </button>
        )}
        <button
          onClick={() => navigate('/accounts')}
          disabled={isSaving}
          className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
        >
          Cancel
        </button>

        {/* Annotation */}
        <div className="mt-3 p-3 bg-[#f7f4ed] border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed">
          <strong>Role-based access:</strong><br />
          Only Admin/Manager should add or merge people/accounts by default. Operators may request or add new records if allowed, but new records should be reviewed.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function TypeOption({
  value,
  label,
  selected,
  onSelect
}: {
  value: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-3 border rounded-2xl flex items-center gap-3 active:bg-[#faf8f5] transition-colors ${
        selected ? 'border-[#5a7a4d] bg-[#e9f0e5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]' : 'border-[#ded2c0] bg-white'
      }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        selected ? 'border-[#5a7a4d]' : 'border-[#ded2c0]'
      }`}>
        {selected && <div className="w-3 h-3 rounded-full bg-[#5a7a4d]" />}
      </div>
      <span className="font-semibold text-[#3d2f1f]">{label}</span>
    </button>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  multiline?: boolean;
}) {
  return (
    <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
      <label className="block text-sm font-semibold text-[#3d2f1f] mb-2">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-white border border-[#ded2c0] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] text-[#3d2f1f] placeholder:text-[#8b7a6f]"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
        />
      )}
    </div>
  );
}
