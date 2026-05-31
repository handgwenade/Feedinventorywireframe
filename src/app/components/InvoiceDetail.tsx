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
  const [showSendPanel, setShowSendPanel] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [sendErrorMessage, setSendErrorMessage] = useState<string | null>(null);
  const [showWriteOffPanel, setShowWriteOffPanel] = useState(false);
  const [writeOffReason, setWriteOffReason] = useState('');
  const [writeOffLoading, setWriteOffLoading] = useState(false);
  const [writeOffError, setWriteOffError] = useState<string | null>(null);
  const [writeOffSuccess, setWriteOffSuccess] = useState<string | null>(null);
  const [showVoidPanel, setShowVoidPanel] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [voidLoading, setVoidLoading] = useState(false);
  const [voidError, setVoidError] = useState<string | null>(null);
  const [voidSuccess, setVoidSuccess] = useState<string | null>(null);

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
        if (!isMounted) return;
        setAccountEmail(null);
      }
    }

    loadAccountEmail();

    return () => {
      isMounted = false;
    };
  }, [invoice.accountId]);

  const invoiceEmailSubject = `Invoice ${displayNumber} from C&C Feed`;

  const invoiceEmailBody = () => {
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

    return lines.join('\n');
  };

  const openMailClient = (email: string) => {
    const body = invoiceEmailBody();
    const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(invoiceEmailSubject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  const copyInvoiceText = async () => {
    try {
      await navigator.clipboard.writeText(invoiceEmailBody());
      setSendErrorMessage(null);
    } catch {
      setSendErrorMessage('Unable to copy invoice text. Please copy it manually.');
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const handleMarkWrittenOff = async () => {
    setWriteOffError(null);
    setWriteOffSuccess(null);
    setWriteOffLoading(true);

    try {
      const result = await invoicesService.markInvoiceWrittenOff({
        invoiceId: invoice.id,
        reason: writeOffReason.trim(),
      });

      setInvoice((current) =>
        current
          ? {
              ...current,
              status: result.status,
              balanceDue: result.newBalanceDue,
              amountPaid: Number(current.total) - result.newBalanceDue,
              notes: current.notes
                ? `${current.notes}\n\nWrite-off reason: ${writeOffReason.trim()}`
                : `Write-off reason: ${writeOffReason.trim()}`,
            }
          : current,
      );

      setWriteOffSuccess('Invoice marked written off successfully.');
      setShowWriteOffPanel(false);
      setWriteOffReason('');
    } catch (error) {
      setWriteOffError(error instanceof Error ? error.message : 'Unable to mark invoice written off.');
    } finally {
      setWriteOffLoading(false);
    }
  };

  const handleVoidInvoice = async () => {
    setVoidError(null);
    setVoidSuccess(null);
    setVoidLoading(true);

    try {
      const result = await invoicesService.voidInvoice({
        invoiceId: invoice.id,
        reason: voidReason.trim(),
      });

      setInvoice((current) =>
        current
          ? {
              ...current,
              status: result.status,
              balanceDue: result.newBalanceDue,
              amountPaid: Number(current.total) - result.newBalanceDue,
              notes: current.notes
                ? `${current.notes}\n\nVoid reason: ${voidReason.trim()}`
                : `Void reason: ${voidReason.trim()}`,
            }
          : current,
      );

      setVoidSuccess('Invoice voided successfully.');
      setShowVoidPanel(false);
      setVoidReason('');
    } catch (error) {
      setVoidError(error instanceof Error ? error.message : 'Unable to void invoice.');
    } finally {
      setVoidLoading(false);
    }
  };

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
            label="Save / Print PDF"
            onClick={printInvoice}
          />
          <ActionButton
            icon={<Printer size={20} />}
            label="Print"
            onClick={printInvoice}
          />
          {invoiceType === 'k2' ? (
            <div className="space-y-3">
              <ActionButton
                icon={<Send size={20} />}
                label="Email Not Needed"
                onClick={() => {}}
                disabled
              />
              <div className="text-sm text-gray-600">
                Write-off and void actions are not available for internal K2 statements.
              </div>
              <ActionButton
                icon={<XCircle size={20} />}
                label="Mark Written Off"
                onClick={() => {}}
                disabled
              />
              <ActionButton
                icon={<Trash2 size={20} />}
                label="Void Invoice"
                onClick={() => {}}
                disabled
              />
            </div>
          ) : (
            <>
              <ActionButton
                icon={<Send size={20} />}
                label={showSendPanel ? 'Hide Email Options' : 'Send'}
                onClick={() => {
                  setShowSendPanel((prev) => !prev);
                  setSendErrorMessage(null);
                }}
              />
              {showSendPanel && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Email options</div>
                    {accountEmail ? (
                      <div className="text-sm text-gray-700">
                        Saved customer email: <span className="font-semibold text-gray-900">{accountEmail}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700">No email address saved for this customer.</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Send to different address</label>
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(event) => setCustomEmail(event.target.value)}
                      placeholder="Enter alternate email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      onClick={() => accountEmail && openMailClient(accountEmail)}
                      disabled={!accountEmail}
                      className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50 disabled:opacity-50"
                    >
                      Open Email to Saved Address
                    </button>
                    <button
                      onClick={() => {
                        if (customEmail.trim()) {
                          openMailClient(customEmail.trim());
                        } else {
                          setSendErrorMessage('Enter a valid email address to send to.');
                        }
                      }}
                      className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
                    >
                      Open Email to Different Address
                    </button>
                  </div>

                  <button
                    onClick={copyInvoiceText}
                    className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
                  >
                    Copy Invoice Text
                  </button>

                  <div className="text-sm text-gray-600">
                    To include a PDF, use Save / Print PDF first, then attach it in your email app.
                  </div>
                  {sendErrorMessage && (
                    <div className="text-sm text-red-600">{sendErrorMessage}</div>
                  )}
                </div>
              )}

              <ActionButton
                icon={<XCircle size={20} />}
                label="Mark Written Off"
                onClick={() => {
                  setShowWriteOffPanel((prev) => !prev);
                  setShowVoidPanel(false);
                  setWriteOffError(null);
                  setWriteOffSuccess(null);
                }}
                disabled={balanceDue <= 0 || invoice.status === 'written_off' || invoice.status === 'void'}
              />
              <ActionButton
                icon={<Trash2 size={20} />}
                label="Void Invoice"
                onClick={() => {
                  setShowVoidPanel((prev) => !prev);
                  setShowWriteOffPanel(false);
                  setVoidError(null);
                  setVoidSuccess(null);
                }}
                disabled={invoice.status === 'void'}
              />

              {showWriteOffPanel && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="text-sm font-semibold text-gray-900">Mark invoice written off</div>
                  <div className="text-sm text-gray-600">
                    This will set balance due to $0 and keep the invoice record. A reason is required.
                  </div>
                  <textarea
                    value={writeOffReason}
                    onChange={(event) => setWriteOffReason(event.target.value)}
                    rows={3}
                    placeholder="Enter write-off reason"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  {writeOffError && <div className="text-sm text-red-600">{writeOffError}</div>}
                  {writeOffSuccess && <div className="text-sm text-emerald-700">{writeOffSuccess}</div>}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      onClick={handleMarkWrittenOff}
                      disabled={writeOffLoading || !writeOffReason.trim()}
                      className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold active:bg-gray-800 disabled:opacity-50"
                    >
                      {writeOffLoading ? 'Saving...' : 'Confirm Write Off'}
                    </button>
                    <button
                      onClick={() => {
                        setShowWriteOffPanel(false);
                        setWriteOffReason('');
                        setWriteOffError(null);
                      }}
                      className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {showVoidPanel && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="text-sm font-semibold text-gray-900">Void invoice</div>
                  <div className="text-sm text-gray-600">
                    Voiding does not restore inventory in this version. A reason is required.
                  </div>
                  <textarea
                    value={voidReason}
                    onChange={(event) => setVoidReason(event.target.value)}
                    rows={3}
                    placeholder="Enter void reason"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  {voidError && <div className="text-sm text-red-600">{voidError}</div>}
                  {voidSuccess && <div className="text-sm text-emerald-700">{voidSuccess}</div>}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      onClick={handleVoidInvoice}
                      disabled={voidLoading || !voidReason.trim()}
                      className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold active:bg-gray-800 disabled:opacity-50"
                    >
                      {voidLoading ? 'Saving...' : 'Confirm Void'}
                    </button>
                    <button
                      onClick={() => {
                        setShowVoidPanel(false);
                        setVoidReason('');
                        setVoidError(null);
                      }}
                      className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          {balanceDue > 0 && (
            <ActionButton
              icon={<DollarSign size={20} />}
              label="Record Payment"
              onClick={() => navigate('/record-payment', { state: { invoice: paymentInvoice } })}
              primary
            />
          )}
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
