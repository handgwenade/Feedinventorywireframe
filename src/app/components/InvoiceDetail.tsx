import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Send, DollarSign, XCircle, Trash2 } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { invoicesService } from '../services/invoicesService';
import { accountsService } from '../services/accountsService';
import { formatCurrency } from '../utils/calculations';
import type { InvoiceDetailRecord, InvoiceListItem } from '../services/invoicesService';

function getInitialInvoice(locationState: unknown): InvoiceDetailRecord | null {
  const routedInvoice = (locationState as { invoice?: InvoiceListItem } | null)?.invoice;

  if (!routedInvoice?.id) return null;

  return {
    ...routedInvoice,
    lineItems: [],
  };
}

export default function InvoiceDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const routedInvoice = getInitialInvoice(location.state);
  const [invoice, setInvoice] = useState<InvoiceDetailRecord | null>(routedInvoice);
  const [isLoading, setIsLoading] = useState(Boolean(routedInvoice?.id));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [wasMissing, setWasMissing] = useState(false);

  useEffect(() => {
    if (!routedInvoice?.id) {
      setIsLoading(false);
      setWasMissing(false);
      return;
    }

    let isMounted = true;

    async function loadInvoice() {
      setIsLoading(true);
      setErrorMessage(null);
      setWasMissing(false);

      try {
        const liveInvoice = await invoicesService.getById(routedInvoice.id);

        if (!isMounted) return;

        if (!liveInvoice) {
          setInvoice(null);
          setWasMissing(true);
          return;
        }

        setInvoice(liveInvoice);
      } catch (error) {
        if (!isMounted) return;

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load invoice.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInvoice();

    return () => {
      isMounted = false;
    };
  }, [routedInvoice?.id]);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/invoices')}
              className="text-gray-600 active:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Invoice Detail</h1>
          </div>
          <UserIcon />
        </div>

        <div className="p-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="text-sm text-gray-700">
              {wasMissing ? 'Invoice not found.' : 'Select an invoice before continuing.'}
            </div>
            <button
              onClick={() => navigate('/invoices')}
              className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
            >
              Back to Invoices
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  const invoiceType = invoice.type;
  const accountName = invoice.accountName;
  const displayNumber = invoice.displayNumber;
  const balanceDue = invoice.balanceDue;
  const lineItems = invoice.lineItems;
  const paymentInvoice = {
    ...invoice,
    number: displayNumber,
    account: accountName,
    type: invoiceType,
    balance: balanceDue,
  };

  const invoiceDate = new Date(invoice.issueDate).toLocaleDateString();
  const dueDate = 'Due on receipt';
  const amountPaid = invoice.amountPaid;
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [showNoEmailMessage, setShowNoEmailMessage] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAccountEmail() {
      setAccountEmail(null);

      try {
        if (invoice.accountId) {
          const accounts = await accountsService.listActive();
          if (!isMounted) return;
          const acc = accounts.find((a) => a.id === invoice.accountId);
          setAccountEmail(acc?.email ?? null);
          return;
        }
      } catch (err) {
        // ignore — leave accountEmail null
        if (!isMounted) return;
        setAccountEmail(null);
      }
    }

    loadAccountEmail();

    return () => {
      isMounted = false;
    };
  }, [invoice.accountId]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Invoice Detail</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {isLoading && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
            Loading invoice details...
          </div>
        )}

        {errorMessage && (
          <div className="bg-white border border-gray-300 rounded-lg p-4 text-sm text-gray-900">
            {errorMessage}
          </div>
        )}

        {/* Invoice Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-sm text-gray-600 mb-1">Invoice Number</div>
              <div className="text-xl font-bold text-gray-900">{displayNumber}</div>
            </div>
            <div className="flex gap-1">
              <TypeBadge type={invoiceType} />
              <StatusBadge status={invoice.status} />
            </div>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Customer/Account</div>
            <div className="font-semibold text-gray-900">{accountName}</div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-700">Invoice date</span>
            <span className="font-medium text-gray-900">{invoiceDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Due date</span>
            <span className="font-medium text-gray-900">{dueDate}</span>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Line Items</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {lineItems.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">{item.description}</div>
                    <div className="text-sm text-gray-600">
                      Quantity: {item.quantity} {item.unitLabel}
                    </div>
                    <div className="text-sm text-gray-600">
                      Unit price: {formatCurrency(item.unitPrice)}
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900 text-lg">
                    {formatCurrency(item.lineTotal)}
                  </div>
                </div>
              </div>
            ))}
            {lineItems.length === 0 && (
              <div className="p-4">
                <div className="text-sm text-gray-600">No line items recorded.</div>
              </div>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-700">Subtotal</span>
            <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Tax</span>
            <span className="font-medium text-gray-900">
              {invoice.taxAmount > 0 ? formatCurrency(invoice.taxAmount) : 'Off'}
            </span>
          </div>
          <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-900 text-lg">Total</span>
            <span className="font-bold text-gray-900 text-2xl">{formatCurrency(invoice.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Amount paid</span>
            <span className="font-medium text-gray-900">{formatCurrency(amountPaid)}</span>
          </div>
        </div>

        {/* Balance Due - Prominent */}
        <div className="bg-gray-900 text-white rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">Balance due</span>
            <span className="text-3xl font-bold">{formatCurrency(balanceDue)}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Notes</div>
          <div className="text-gray-900">{invoice.notes ?? '—'}</div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <ActionButton
            icon={<Download size={20} />}
            label="Download PDF (Not Ready)"
            onClick={() => {}}
            disabled
          />
          <ActionButton
            icon={<Printer size={20} />}
            label="Print (Not Ready)"
            onClick={() => {}}
            disabled
          />
          {/* Send / Email behavior: enable mailto for customer invoices with email */}
          {invoiceType === 'k2' ? (
            <ActionButton
              icon={<Send size={20} />}
              label="Email Not Needed"
              onClick={() => {}}
              disabled
            />
          ) : (
            <ActionButton
              icon={<Send size={20} />}
              label="Send"
              onClick={() => {
                setShowNoEmailMessage(false);
                // prefer account email when present
                if (accountEmail) {
                  const subject = `Invoice ${displayNumber} from C&C Feed`;
                  const lines = [
                    `Account: ${accountName}`,
                    `Invoice: ${displayNumber}`,
                    `Total: ${formatCurrency(invoice.total)}`,
                    `Balance due: ${formatCurrency(balanceDue)}`,
                    `Status: ${invoice.status}`,
                    '',
                    'Line items:',
                    ...lineItems.map((li) => `- ${li.description} — ${li.quantity} ${li.unitLabel} — ${formatCurrency(li.lineTotal)}`),
                    '',
                    'This invoice was generated from StockLog (C&C Feed Inventory).',
                  ];

                  const body = lines.join('\n');
                  const mailto = `mailto:${encodeURIComponent(accountEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

                  // open mail client
                  window.location.href = mailto;
                } else {
                  setShowNoEmailMessage(true);
                }
              }}
            />
          )}
          {showNoEmailMessage && (
            <div className="bg-white border border-dashed border-gray-300 rounded-lg p-3 text-sm text-gray-700">
              No email address is saved for this customer.
            </div>
          )}
          {balanceDue > 0 && (
            <ActionButton
              icon={<DollarSign size={20} />}
              label="Record Payment"
              onClick={() => navigate('/record-payment', { state: { invoice: paymentInvoice } })}
              primary
            />
          )}
          <ActionButton
            icon={<XCircle size={20} />}
            label="Mark Written Off (Not Ready)"
            onClick={() => {}}
            disabled
          />
          <ActionButton
            icon={<Trash2 size={20} />}
            label="Void Invoice (Not Ready)"
            onClick={() => {}}
            disabled
          />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function TypeBadge({ type }: { type: 'customer' | 'k2' | 'family' }) {
  const labels = { customer: 'Customer', k2: 'K2', family: 'Legacy Person Use' };
  return (
    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
      {labels[type]}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300 capitalize">
      {status.replace('-', ' ')}
    </span>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  primary = false,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full p-3 rounded-lg flex items-center gap-3 font-medium ${
        primary
          ? 'bg-gray-900 text-white active:bg-gray-800'
          : 'bg-white border border-gray-300 text-gray-900 active:bg-gray-50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
