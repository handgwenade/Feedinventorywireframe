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
      <div className="min-h-screen bg-[#f7f4ed] pb-24">
        <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center justify-between shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/invoices')}
              className="text-[#8b7a6f] active:text-[#3d2f1f]"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-[#3d2f1f]">Invoice Detail</h1>
          </div>
          <UserIcon />
        </div>

        <div className="p-4">
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div className="text-sm text-[#8b7a6f]">
              {wasMissing ? 'Invoice not found.' : 'Select an invoice before continuing.'}
            </div>
            <button
              onClick={() => navigate('/invoices')}
              className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
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
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center justify-between shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="text-[#8b7a6f] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Invoice Detail</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {isLoading && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            Loading invoice details...
          </div>
        )}

        {errorMessage && (
          <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            {errorMessage}
          </div>
        )}

        {/* Invoice Header */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-sm text-[#8b7a6f] mb-1">Invoice Number</div>
              <div className="text-xl font-bold text-[#3d2f1f]">{displayNumber}</div>
            </div>
            <div className="flex gap-1">
              <TypeBadge type={invoiceType} />
              <StatusBadge status={invoice.status} />
            </div>
          </div>
          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Customer/Account</div>
            <div className="font-semibold text-[#3d2f1f]">{accountName}</div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="flex justify-between">
            <span className="text-[#8b7a6f]">Invoice date</span>
            <span className="font-medium text-[#3d2f1f]">{invoiceDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8b7a6f]">Due date</span>
            <span className="font-medium text-[#3d2f1f]">{dueDate}</span>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="p-4 border-b border-[#e8dfd1] bg-[#f7f4ed]">
            <h2 className="font-semibold text-[#3d2f1f]">Line Items</h2>
          </div>
          <div className="divide-y divide-[#e8dfd1]">
            {lineItems.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-[#3d2f1f] mb-1">{item.description}</div>
                    <div className="text-sm text-[#8b7a6f]">
                      Quantity: {item.quantity} {item.unitLabel}
                    </div>
                    <div className="text-sm text-[#8b7a6f]">
                      Unit price: {formatCurrency(item.unitPrice)}
                    </div>
                  </div>
                  <div className="font-semibold text-[#3d2f1f] text-lg">
                    {formatCurrency(item.lineTotal)}
                  </div>
                </div>
              </div>
            ))}
            {lineItems.length === 0 && (
              <div className="p-4">
                <div className="text-sm text-[#8b7a6f]">No line items recorded.</div>
              </div>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="flex justify-between">
            <span className="text-[#8b7a6f]">Subtotal</span>
            <span className="font-medium text-[#3d2f1f]">{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8b7a6f]">Tax</span>
            <span className="font-medium text-[#3d2f1f]">
              {invoice.taxAmount > 0 ? formatCurrency(invoice.taxAmount) : 'Off'}
            </span>
          </div>
          <div className="pt-3 border-t border-[#e8dfd1] flex justify-between items-center">
            <span className="font-semibold text-[#3d2f1f] text-lg">Total</span>
            <span className="font-bold text-[#3d2f1f] text-2xl">{formatCurrency(invoice.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8b7a6f]">Amount paid</span>
            <span className="font-medium text-[#3d2f1f]">{formatCurrency(amountPaid)}</span>
          </div>
        </div>

        {/* Balance Due - Prominent */}
        <div className="bg-[#3d2f1f] text-white rounded-2xl p-4 shadow-[0_4px_14px_rgba(61,47,31,0.18)]">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">Balance due</span>
            <span className="text-3xl font-bold">{formatCurrency(balanceDue)}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm text-[#8b7a6f] mb-1">Notes</div>
          <div className="text-[#3d2f1f]">{invoice.notes ?? '—'}</div>
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
              <div className="text-sm text-[#8b7a6f]">
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
                <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-[#8b7a6f]">Email options</div>
                    {accountEmail ? (
                      <div className="text-sm text-[#8b7a6f]">
                        Saved customer email: <span className="font-semibold text-[#3d2f1f]">{accountEmail}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-[#8b7a6f]">No email address saved for this customer.</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#8b7a6f]">Send to different address</label>
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(event) => setCustomEmail(event.target.value)}
                      placeholder="Enter alternate email"
                      className="w-full px-4 py-3 border border-[#ded2c0] rounded-2xl text-[#3d2f1f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      onClick={() => accountEmail && openMailClient(accountEmail)}
                      disabled={!accountEmail}
                      className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] disabled:opacity-50"
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
                      className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5]"
                    >
                      Open Email to Different Address
                    </button>
                  </div>

                  <button
                    onClick={copyInvoiceText}
                    className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5]"
                  >
                    Copy Invoice Text
                  </button>

                  <div className="text-sm text-[#8b7a6f]">
                    To include a PDF, use Save / Print PDF first, then attach it in your email app.
                  </div>
                  {sendErrorMessage && (
                    <div className="text-sm text-[#8b3f2f]">{sendErrorMessage}</div>
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
                <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
                  <div className="text-sm font-semibold text-[#3d2f1f]">Mark invoice written off</div>
                  <div className="text-sm text-[#8b7a6f]">
                    This will set balance due to $0 and keep the invoice record. A reason is required.
                  </div>
                  <textarea
                    value={writeOffReason}
                    onChange={(event) => setWriteOffReason(event.target.value)}
                    rows={3}
                    placeholder="Enter write-off reason"
                    className="w-full px-4 py-3 border border-[#ded2c0] rounded-2xl text-[#3d2f1f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
                  />
                  {writeOffError && <div className="text-sm text-[#8b3f2f]">{writeOffError}</div>}
                  {writeOffSuccess && <div className="text-sm text-emerald-700">{writeOffSuccess}</div>}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      onClick={handleMarkWrittenOff}
                      disabled={writeOffLoading || !writeOffReason.trim()}
                      className="w-full bg-[#8b3f2f] text-white py-3 rounded-2xl font-semibold active:bg-[#733426] disabled:opacity-50"
                    >
                      {writeOffLoading ? 'Saving...' : 'Confirm Write Off'}
                    </button>
                    <button
                      onClick={() => {
                        setShowWriteOffPanel(false);
                        setWriteOffReason('');
                        setWriteOffError(null);
                      }}
                      className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {showVoidPanel && (
                <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
                  <div className="text-sm font-semibold text-[#3d2f1f]">Void invoice</div>
                  <div className="text-sm text-[#8b7a6f]">
                    Voiding does not restore inventory in this version. A reason is required.
                  </div>
                  <textarea
                    value={voidReason}
                    onChange={(event) => setVoidReason(event.target.value)}
                    rows={3}
                    placeholder="Enter void reason"
                    className="w-full px-4 py-3 border border-[#ded2c0] rounded-2xl text-[#3d2f1f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
                  />
                  {voidError && <div className="text-sm text-[#8b3f2f]">{voidError}</div>}
                  {voidSuccess && <div className="text-sm text-emerald-700">{voidSuccess}</div>}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      onClick={handleVoidInvoice}
                      disabled={voidLoading || !voidReason.trim()}
                      className="w-full bg-[#8b3f2f] text-white py-3 rounded-2xl font-semibold active:bg-[#733426] disabled:opacity-50"
                    >
                      {voidLoading ? 'Saving...' : 'Confirm Void'}
                    </button>
                    <button
                      onClick={() => {
                        setShowVoidPanel(false);
                        setVoidReason('');
                        setVoidError(null);
                      }}
                      className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5]"
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
    <span className="inline-block px-3 py-1 bg-[#e9f0e5] text-[#5a7a4d] text-xs font-semibold rounded-full border border-[#cbd8c4]">
      {labels[type]}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-block px-3 py-1 bg-[#fff4d8] text-[#8b5a1f] text-xs font-semibold rounded-full border border-[#d4a574] capitalize">
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
      className={`w-full p-3 rounded-2xl flex items-center gap-3 font-semibold shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors ${
        primary
          ? 'bg-[#5a7a4d] text-white active:bg-[#4a6a3d]'
          : 'bg-white border border-[#ded2c0] text-[#3d2f1f] active:bg-[#faf8f5]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
