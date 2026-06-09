import { useEffect, useState, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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
import FamilyDisabled from './components/FamilyDisabled';
import AddStockSelectProduct from './components/AddStockSelectProduct';
import AddStockQuantity from './components/AddStockQuantity';
import AddStockReview from './components/AddStockReview';
import AddStockSuccess from './components/AddStockSuccess';
import InventoryList from './components/InventoryList';
import ProductDetail from './components/ProductDetail';
import ProductForm from './components/ProductForm';
import AdjustCount from './components/AdjustCount';
import InvoicesList from './components/InvoicesList';
import InvoiceDetail from './components/InvoiceDetail';
import RecordPayment from './components/RecordPayment';
import PaymentRecorded from './components/PaymentRecorded';
import AccountsList from './components/AccountsList';
import AccountDetail from './components/AccountDetail';
import AddAccountPerson from './components/AddAccountPerson';
import EditAccountPerson from './components/EditAccountPerson';
import ActivityHistory from './components/ActivityHistory';
import ActivityDetail from './components/ActivityDetail';
import ReportsList from './components/ReportsList';
import ReportInventorySummary from './components/ReportInventorySummary';
import ReportLowStock from './components/ReportLowStock';
import ReportCustomerSales from './components/ReportCustomerSales';
import ReportK2Use from './components/ReportK2Use';
// ReportFamilyUse removed from active navigation; legacy route shows FamilyDisabled
import ReportUnpaidInvoices from './components/ReportUnpaidInvoices';
import ReportPaymentsReceived from './components/ReportPaymentsReceived';
import ProfileMenu from './components/ProfileMenu';
import MyProfile from './components/MyProfile';
import RolePermissions from './components/RolePermissions';
import Settings from './components/Settings';
import ManageUsers from './components/ManageUsers';
import EditUser from './components/EditUser';
import Login from './components/Login';
import UpdatePassword from './components/UpdatePassword';
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

import { supabase } from './services/supabaseClient';
import { userProfileService } from './services/userProfileService';
import type { CurrentUserProfile } from './services/userProfileService';

const PUBLIC_ROUTES = ['/login', '/update-password', '/session-expired'];

function AdminOnlyRoute({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoadingProfile(true);
      setErrorMessage(null);

      try {
        const liveProfile = await userProfileService.getCurrentProfile();

        if (isMounted) {
          setProfile(liveProfile);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to verify access.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] flex items-center justify-center p-4">
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          Checking access...
        </div>
      </div>
    );
  }

  if (profile?.role !== 'admin' || !profile.isActive) {
    return <AdminAccessDenied errorMessage={errorMessage} />;
  }

  return <>{children}</>;
}

function AdminAccessDenied({ errorMessage }: { errorMessage?: string | null }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f4ed] p-4 flex items-center justify-center">
      <div className="w-full max-w-sm bg-white border border-[#ded2c0] rounded-2xl p-5 space-y-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Admin Access Required</h1>
          <p className="mt-2 text-sm text-[#8b7a6f] leading-relaxed">
            Your current role does not allow access to user management.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-[#d8a59a] bg-[#fff4f0] p-3 text-sm text-[#8b3f2f]">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-2">
          <button
            onClick={() => navigate('/profile-menu')}
            className="w-full bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
          >
            Return to Profile Menu
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function AccountAccessScreen({
  title,
  message,
  errorMessage,
}: {
  title: string;
  message: string;
  errorMessage?: string | null;
}) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] p-4 flex items-center justify-center">
      <div className="w-full max-w-sm bg-white border border-[#ded2c0] rounded-2xl p-5 space-y-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-[#3d2f1f]">{title}</h1>
          <p className="mt-2 text-sm text-[#8b7a6f] leading-relaxed">{message}</p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-[#d8a59a] bg-[#fff4f0] p-3 text-sm text-[#8b3f2f]">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="w-full bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'anonymous'>('checking');
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<'idle' | 'checking' | 'ready' | 'error'>('idle');
  const [profileErrorMessage, setProfileErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (!isMounted) return;

      setAuthStatus(data.session ? 'authenticated' : 'anonymous');
    }

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthStatus(session ? 'authenticated' : 'anonymous');
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  useEffect(() => {
    if (authStatus !== 'authenticated' || isPublicRoute) {
      setProfile(null);
      setProfileStatus('idle');
      setProfileErrorMessage(null);
      return;
    }

    let isMounted = true;

    async function loadProfile() {
      setProfileStatus('checking');
      setProfileErrorMessage(null);

      try {
        const liveProfile = await userProfileService.getCurrentProfile();

        if (isMounted) {
          setProfile(liveProfile);
          setProfileStatus('ready');
        }
      } catch (error) {
        if (isMounted) {
          setProfile(null);
          setProfileErrorMessage(error instanceof Error ? error.message : 'Unable to verify profile.');
          setProfileStatus('error');
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [authStatus, isPublicRoute]);

  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen bg-[#f7f4ed] flex items-center justify-center p-4">
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          Checking session...
        </div>
      </div>
    );
  }

  if (authStatus === 'anonymous' && !isPublicRoute) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (authStatus === 'authenticated' && !isPublicRoute) {
    if (profileStatus === 'checking' || profileStatus === 'idle') {
      return (
        <div className="min-h-screen bg-[#f7f4ed] flex items-center justify-center p-4">
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            Checking account...
          </div>
        </div>
      );
    }

    if (profileStatus === 'error') {
      return (
        <AccountAccessScreen
          title="Profile Check Failed"
          message="We could not verify your app profile. Sign out, then try again or contact an admin."
          errorMessage={profileErrorMessage}
        />
      );
    }

    if (!profile || !profile.profileExists) {
      return (
        <AccountAccessScreen
          title="Profile Not Found"
          message="Your login exists, but no app profile is connected. Contact an admin."
        />
      );
    }

    if (!profile.isActive) {
      return (
        <AccountAccessScreen
          title="Account Not Active"
          message="Your account is not active. Contact an admin to restore access."
        />
      );
    }
  }

  return (

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
          <Route path="/choose-family-account" element={<FamilyDisabled />} />
          <Route path="/family-add-products" element={<FamilyDisabled />} />
          <Route path="/family-review-invoice" element={<FamilyDisabled />} />
          <Route path="/family-invoice-created" element={<FamilyDisabled />} />
          <Route path="/add-stock-select" element={<AddStockSelectProduct />} />
          <Route path="/add-stock-quantity" element={<AddStockQuantity />} />
          <Route path="/add-stock-review" element={<AddStockReview />} />
          <Route path="/add-stock-success" element={<AddStockSuccess />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/product-detail" element={<ProductDetail />} />
          <Route path="/product-form" element={<ProductForm />} />
          <Route path="/adjust-count" element={<AdjustCount />} />
          <Route path="/invoices" element={<InvoicesList />} />
          <Route path="/invoice-detail" element={<InvoiceDetail />} />
          <Route path="/record-payment" element={<RecordPayment />} />
          <Route path="/payment-recorded" element={<PaymentRecorded />} />
          <Route path="/accounts" element={<AccountsList />} />
          <Route path="/account-detail" element={<AccountDetail />} />
          <Route path="/add-account-person" element={<AddAccountPerson />} />
          <Route path="/edit-account-person" element={<EditAccountPerson />} />
          <Route path="/activity-history" element={<ActivityHistory />} />
          <Route path="/activity-detail" element={<ActivityDetail />} />
          <Route path="/reports" element={<ReportsList />} />
          <Route path="/report-inventory-summary" element={<ReportInventorySummary />} />
          <Route path="/report-low-stock" element={<ReportLowStock />} />
          <Route path="/report-customer-sales" element={<ReportCustomerSales />} />
          <Route path="/report-k2-use" element={<ReportK2Use />} />
          <Route path="/report-family-use" element={<FamilyDisabled />} />
          <Route path="/report-unpaid-invoices" element={<ReportUnpaidInvoices />} />
          <Route path="/report-payments-received" element={<ReportPaymentsReceived />} />
          <Route path="/profile-menu" element={<ProfileMenu />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/role-permissions" element={<RolePermissions />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/manage-users" element={<AdminOnlyRoute><ManageUsers /></AdminOnlyRoute>} />
          <Route path="/edit-user" element={<AdminOnlyRoute><EditUser /></AdminOnlyRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/update-password" element={<UpdatePassword />} />
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
          {/* Reference-only route; intentionally not linked from normal app navigation. */}
          <Route path="/utility-screens" element={<UtilityScreensReference />} />
        </Routes>
    );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="size-full max-w-md mx-auto bg-white">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}
