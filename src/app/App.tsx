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
        </Routes>
      </div>
    </BrowserRouter>
  );
}