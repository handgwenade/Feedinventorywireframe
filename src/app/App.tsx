import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ChooseSaleType from './components/ChooseSaleType';
import ChooseCustomer from './components/ChooseCustomer';
import AddProducts from './components/AddProducts';
import ReviewInvoice from './components/ReviewInvoice';
import PaymentDetails from './components/PaymentDetails';
import InvoiceCreated from './components/InvoiceCreated';
import K2AddProducts from './components/K2AddProducts';
import K2ReviewStatement from './components/K2ReviewStatement';
import K2StatementCreated from './components/K2StatementCreated';
import ChooseFamilyAccount from './components/ChooseFamilyAccount';
import FamilyAddProducts from './components/FamilyAddProducts';
import FamilyReviewInvoice from './components/FamilyReviewInvoice';
import FamilyInvoiceCreated from './components/FamilyInvoiceCreated';
import AddStockSelectProduct from './components/AddStockSelectProduct';
import AddStockQuantity from './components/AddStockQuantity';
import AddStockReview from './components/AddStockReview';
import AddStockSuccess from './components/AddStockSuccess';
import InventoryList from './components/InventoryList';
import ProductDetail from './components/ProductDetail';
import AdjustCount from './components/AdjustCount';
import InvoicesList from './components/InvoicesList';
import InvoiceDetail from './components/InvoiceDetail';
import RecordPayment from './components/RecordPayment';
import PaymentRecorded from './components/PaymentRecorded';
import AccountsList from './components/AccountsList';
import AccountDetail from './components/AccountDetail';
import AddAccountPerson from './components/AddAccountPerson';
import ActivityHistory from './components/ActivityHistory';
import ActivityDetail from './components/ActivityDetail';
import ReportsList from './components/ReportsList';
import ReportInventorySummary from './components/ReportInventorySummary';
import ReportLowStock from './components/ReportLowStock';
import ReportCustomerSales from './components/ReportCustomerSales';
import ReportK2Use from './components/ReportK2Use';
import ReportFamilyUse from './components/ReportFamilyUse';
import ReportUnpaidInvoices from './components/ReportUnpaidInvoices';
import ReportPaymentsReceived from './components/ReportPaymentsReceived';
import ProfileMenu from './components/ProfileMenu';
import MyProfile from './components/MyProfile';
import RolePermissions from './components/RolePermissions';
import Settings from './components/Settings';
import ManageUsers from './components/ManageUsers';
import EditUser from './components/EditUser';
import Login from './components/Login';
import SessionExpired from './components/SessionExpired';
import EmptyInventory from './components/EmptyInventory';
import EmptyInvoices from './components/EmptyInvoices';
import EmptyAccounts from './components/EmptyAccounts';
import EmptyReports from './components/EmptyReports';
import LowStockWarning from './components/LowStockWarning';
import NotEnoughInventoryError from './components/NotEnoughInventoryError';
import MissingPriceWarning from './components/MissingPriceWarning';
import PermissionNeeded from './components/PermissionNeeded';
import CannotEditActivityWarning from './components/CannotEditActivityWarning';
import UtilityScreensReference from './components/UtilityScreensReference';

export default function App() {
  return (
    <BrowserRouter>
      <div className="size-full max-w-md mx-auto bg-white">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/choose-sale-type" element={<ChooseSaleType />} />
          <Route path="/choose-customer" element={<ChooseCustomer />} />
          <Route path="/add-products" element={<AddProducts />} />
          <Route path="/review-invoice" element={<ReviewInvoice />} />
          <Route path="/payment-details" element={<PaymentDetails />} />
          <Route path="/invoice-created" element={<InvoiceCreated />} />
          <Route path="/k2-add-products" element={<K2AddProducts />} />
          <Route path="/k2-review-statement" element={<K2ReviewStatement />} />
          <Route path="/k2-statement-created" element={<K2StatementCreated />} />
          <Route path="/choose-family-account" element={<ChooseFamilyAccount />} />
          <Route path="/family-add-products" element={<FamilyAddProducts />} />
          <Route path="/family-review-invoice" element={<FamilyReviewInvoice />} />
          <Route path="/family-invoice-created" element={<FamilyInvoiceCreated />} />
          <Route path="/add-stock-select" element={<AddStockSelectProduct />} />
          <Route path="/add-stock-quantity" element={<AddStockQuantity />} />
          <Route path="/add-stock-review" element={<AddStockReview />} />
          <Route path="/add-stock-success" element={<AddStockSuccess />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/product-detail" element={<ProductDetail />} />
          <Route path="/adjust-count" element={<AdjustCount />} />
          <Route path="/invoices" element={<InvoicesList />} />
          <Route path="/invoice-detail" element={<InvoiceDetail />} />
          <Route path="/record-payment" element={<RecordPayment />} />
          <Route path="/payment-recorded" element={<PaymentRecorded />} />
          <Route path="/accounts" element={<AccountsList />} />
          <Route path="/account-detail" element={<AccountDetail />} />
          <Route path="/add-account-person" element={<AddAccountPerson />} />
          <Route path="/activity-history" element={<ActivityHistory />} />
          <Route path="/activity-detail" element={<ActivityDetail />} />
          <Route path="/reports" element={<ReportsList />} />
          <Route path="/report-inventory-summary" element={<ReportInventorySummary />} />
          <Route path="/report-low-stock" element={<ReportLowStock />} />
          <Route path="/report-customer-sales" element={<ReportCustomerSales />} />
          <Route path="/report-k2-use" element={<ReportK2Use />} />
          <Route path="/report-family-use" element={<ReportFamilyUse />} />
          <Route path="/report-unpaid-invoices" element={<ReportUnpaidInvoices />} />
          <Route path="/report-payments-received" element={<ReportPaymentsReceived />} />
          <Route path="/profile-menu" element={<ProfileMenu />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/role-permissions" element={<RolePermissions />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/manage-users" element={<ManageUsers />} />
          <Route path="/edit-user" element={<EditUser />} />
          <Route path="/login" element={<Login />} />
          <Route path="/session-expired" element={<SessionExpired />} />
          <Route path="/empty-inventory" element={<EmptyInventory />} />
          <Route path="/empty-invoices" element={<EmptyInvoices />} />
          <Route path="/empty-accounts" element={<EmptyAccounts />} />
          <Route path="/empty-reports" element={<EmptyReports />} />
          <Route path="/low-stock-warning" element={<LowStockWarning />} />
          <Route path="/not-enough-inventory-error" element={<NotEnoughInventoryError />} />
          <Route path="/missing-price-warning" element={<MissingPriceWarning />} />
          <Route path="/permission-needed" element={<PermissionNeeded />} />
          <Route path="/cannot-edit-activity-warning" element={<CannotEditActivityWarning />} />
          <Route path="/utility-screens" element={<UtilityScreensReference />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}