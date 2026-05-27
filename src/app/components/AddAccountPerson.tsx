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

  // Family person fields
  const [displayName, setDisplayName] = useState('');
  const [familyPhone, setFamilyPhone] = useState('');
  const [familyNotes, setFamilyNotes] = useState('');
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
        phone: familyPhone,
        notes: familyNotes,
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
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create family/person record.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/accounts')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Add Account / Person</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {errorMessage && (
          <div className="bg-white border border-gray-300 rounded-lg p-4 text-sm text-gray-900">
            {errorMessage}
          </div>
        )}

        {/* Account Type Selector */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
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
              label="Family Person"
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

        {/* Family Person Form */}
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
              value={familyPhone}
              onChange={setFamilyPhone}
              placeholder="(555) 123-4567"
              type="tel"
            />
            <FormField
              label="Notes"
              value={familyNotes}
              onChange={setFamilyNotes}
              placeholder="Add notes..."
              multiline
            />
            <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
              <strong>Tip:</strong> Use one official name per person to avoid duplicate records.
            </div>
          </>
        )}
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto space-y-2">
        {accountType === 'customer' ? (
          <button
            onClick={handleSaveCustomer}
            disabled={isSaving}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold active:bg-gray-800 disabled:bg-gray-400"
          >
            {isSaving ? 'Saving Customer...' : 'Save Customer'}
          </button>
        ) : (
          <button
            onClick={handleSavePerson}
            disabled={isSaving}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold active:bg-gray-800 disabled:bg-gray-400"
          >
            {isSaving ? 'Saving Person...' : 'Save Person'}
          </button>
        )}
        <button
          onClick={() => navigate('/accounts')}
          disabled={isSaving}
          className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
        >
          Cancel
        </button>

        {/* Annotation */}
        <div className="mt-3 p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
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
      className={`w-full p-3 border rounded-lg flex items-center gap-3 active:bg-gray-50 ${
        selected ? 'border-gray-900 bg-gray-50' : 'border-gray-300 bg-white'
      }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        selected ? 'border-gray-900' : 'border-gray-300'
      }`}>
        {selected && <div className="w-3 h-3 rounded-full bg-gray-900" />}
      </div>
      <span className="font-medium text-gray-900">{label}</span>
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
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      )}
    </div>
  );
}
