import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { accountsService } from '../services/accountsService';
import { peopleService } from '../services/peopleService';
import type { Account, Person } from '../types';

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

function getSelectedAccount(locationState: unknown): AccountDetailRouteItem | null {
  return ((locationState as { account?: AccountDetailRouteItem } | null)?.account ?? null);
}

function isCustomerSource(source: Account | Person): source is Account {
  return 'accountType' in source;
}

export default function EditAccountPerson() {
  const navigate = useNavigate();
  const location = useLocation();
  const account = getSelectedAccount(location.state);
  const customerSource = account?.source && isCustomerSource(account.source) ? account.source : null;
  const personSource = account?.source && !isCustomerSource(account.source) ? account.source : null;

  const [name, setName] = useState(account?.type === 'family' ? personSource?.officialDisplayName ?? account?.name ?? '' : customerSource?.name ?? account?.name ?? '');
  const [phone, setPhone] = useState(account?.type === 'family' ? personSource?.phone ?? account?.phone ?? '' : customerSource?.phone ?? account?.phone ?? '');
  const [email, setEmail] = useState(customerSource?.email ?? account?.email ?? '');
  const [billingAddress, setBillingAddress] = useState(customerSource?.address ?? '');
  const [notes, setNotes] = useState(account?.type === 'family' ? personSource?.notes ?? '' : customerSource?.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigateBack = () => {
    if (account) {
      navigate('/account-detail', { state: { account } });
    } else {
      navigate('/accounts');
    }
  };

  const handleSave = async () => {
    setErrorMessage(null);

    if (!account || account.type === 'k2') return;

    if (!name.trim()) {
      setErrorMessage(account.type === 'family' ? 'Official display name is required.' : 'Customer account name is required.');
      return;
    }

    try {
      setIsSaving(true);

      if (account.type === 'customer') {
        const updatedAccount = await accountsService.updateCustomerAccount({
          accountId: account.id,
          name,
          phone,
          email,
          billingAddress,
          notes,
        });

        navigate('/account-detail', {
          state: {
            account: {
              ...account,
              name: updatedAccount.name,
              phone: updatedAccount.phone,
              email: updatedAccount.email,
              lastActivity: new Date().toLocaleDateString(),
              source: updatedAccount,
            },
          },
        });
      } else {
        const updatedPerson = await peopleService.updateFamilyPerson({
          personId: account.id,
          officialDisplayName: name,
          phone,
          notes,
        });

        navigate('/account-detail', {
          state: {
            account: {
              ...account,
              name: updatedPerson.officialDisplayName,
              phone: updatedPerson.phone,
              lastActivity: new Date().toLocaleDateString(),
              source: updatedPerson,
            },
          },
        });
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!account || account.type === 'k2') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/accounts')}
              className="text-gray-600 active:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Edit Account / Person</h1>
          </div>
          <UserIcon />
        </div>

        <div className="p-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="text-sm text-gray-700">Select an account or person before editing.</div>
            <button
              onClick={() => navigate('/accounts')}
              className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
            >
              Back to Accounts
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={navigateBack}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {account.type === 'family' ? 'Edit Person' : 'Edit Account'}
          </h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {errorMessage && (
          <div className="bg-white border border-gray-300 rounded-lg p-4 text-sm text-gray-900">
            {errorMessage}
          </div>
        )}

        <FormField
          label={account.type === 'family' ? 'Official display name' : 'Name'}
          value={name}
          onChange={setName}
          placeholder={account.type === 'family' ? 'Enter full name...' : 'Enter customer or business name...'}
        />

        <FormField
          label="Phone"
          value={phone}
          onChange={setPhone}
          placeholder="(555) 123-4567"
          type="tel"
        />

        {account.type === 'customer' && (
          <>
            <FormField
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="email@example.com"
              type="email"
            />
            <FormField
              label="Billing address"
              value={billingAddress}
              onChange={setBillingAddress}
              placeholder="Enter billing address..."
              multiline
            />
          </>
        )}

        <FormField
          label="Notes"
          value={notes}
          onChange={setNotes}
          placeholder="Add notes..."
          multiline
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto space-y-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold active:bg-gray-800 disabled:bg-gray-400"
        >
          {isSaving ? 'Saving Changes...' : 'Save Changes'}
        </button>
        <button
          onClick={navigateBack}
          disabled={isSaving}
          className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
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
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      )}
    </div>
  );
}
