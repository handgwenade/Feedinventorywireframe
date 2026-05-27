export type UserRole = 'admin' | 'manager' | 'operator' | 'view_only';

export type ProductStatus = 'active' | 'archived';

export type AccountType = 'customer' | 'k2' | 'family';

export type InvoiceRecordType = 'customer_invoice' | 'k2_statement' | 'family_use';

export type CustomerInvoiceStatus =
  | 'unpaid'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'void'
  | 'written_off';

export type K2RecordStatus =
  | 'internal_transfer'
  | 'unpaid'
  | 'paid'
  | 'void';

export type FamilyUseStatus =
  | 'track_only'
  | 'needs_payment'
  | 'paid'
  | 'written_off'
  | 'void';

export type InvoiceStatus = CustomerInvoiceStatus | K2RecordStatus | FamilyUseStatus;

export type PaymentMethod = 'cash' | 'check' | 'other';

export type InventoryTransactionType =
  | 'take_feed_customer'
  | 'take_feed_k2'
  | 'take_feed_family'
  | 'add_stock'
  | 'adjust_count'
  | 'correction';

export type ActivityType =
  | 'take_feed'
  | 'add_stock'
  | 'adjust_count'
  | 'correction'
  | 'invoice_created'
  | 'k2_statement_created'
  | 'family_use_recorded'
  | 'payment_recorded'
  | 'account_created'
  | 'account_updated'
  | 'person_created'
  | 'person_updated'
  | 'product_created'
  | 'product_updated'
  | 'status_changed';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'invited' | 'disabled';
  lastLoginAt?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  currentQuantity: number;
  minimumQuantity: number;
  unitLabel: string;
  salePrice: number;
  costPerUnit?: number;
  vendor?: string;
  sourceNotes?: string;
  productPhotoUrl?: string;
  status: ProductStatus;
}

export interface Account {
  id: string;
  accountType: AccountType;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'archived';
  isSystemAccount: boolean;
}

export interface Person {
  id: string;
  officialDisplayName: string;
  aliases?: string[];
  phone?: string;
  notes?: string;
  status: 'active' | 'archived';
}

export interface InventoryTransaction {
  id: string;
  transactionType: InventoryTransactionType;
  productId: string;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  accountId?: string;
  personId?: string;
  invoiceRecordId?: string;
  recordedByUserId: string;
  reason?: string;
  notes?: string;
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  invoiceRecordId: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface InvoiceRecord {
  id: string;
  recordType: InvoiceRecordType;
  displayNumber: string;
  accountId?: string;
  personId?: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceRecordId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  checkNumber?: string;
  paymentNote?: string;
  receivedByUserId: string;
  receivedAt: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  activityType: ActivityType;
  actorUserId: string;
  productId?: string;
  accountId?: string;
  personId?: string;
  inventoryTransactionId?: string;
  invoiceRecordId?: string;
  paymentId?: string;
  summary: string;
  details?: Record<string, unknown>;
  createdAt: string;
}
