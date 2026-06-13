import { useMemo, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Check, CheckCircle2, ChevronLeft, Package, ShieldCheck, UserPlus } from 'lucide-react';
import { userManagementService, type AcceptInviteResult, type CreateRanchResult } from '../services/userManagementService';

type JoinMode = 'new-ranch' | 'existing-ranch';
type Step = 'welcome' | 'joining' | 'ranch' | 'details' | 'password' | 'invite' | 'role' | 'complete';

const joinStepOrder: Step[] = ['welcome', 'joining', 'details', 'password', 'invite', 'role', 'complete'];
const setupStepOrder: Step[] = ['welcome', 'joining', 'ranch', 'details', 'password', 'role', 'complete'];

export default function SignUpFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('welcome');
  const [joinMode, setJoinMode] = useState<JoinMode>('existing-ranch');
  const [ranchName, setRanchName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [acceptedInvite, setAcceptedInvite] = useState<AcceptInviteResult | null>(null);
  const [createdRanch, setCreatedRanch] = useState<CreateRanchResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeStepOrder = joinMode === 'new-ranch' ? setupStepOrder : joinStepOrder;
  const activeStepIndex = activeStepOrder.indexOf(step);
  const roleName = createdRanch ? 'Admin' : acceptedInvite ? formatRoleLabel(acceptedInvite.role) : 'Assigned by invite';
  const trimmedEmail = email.trim();
  const emailIsValid = isValidEmail(trimmedEmail);
  const showEmailError = trimmedEmail.length > 0 && !emailIsValid;

  const passwordChecks = useMemo(
    () => [
      { label: 'At least 8 characters', met: password.length >= 8 },
    ],
    [password],
  );

  const isPasswordReady = passwordChecks.every((check) => check.met);
  const inviteCodeReady = normalizeInviteCodeForDisplay(inviteCode).length > 0;

  const goToStep = (nextStep: Step) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(nextStep);
  };

  const goBack = () => {
    if (activeStepIndex <= 0) {
      navigate('/login');
      return;
    }

    const previousStep = activeStepOrder[Math.max(activeStepIndex - 1, 0)];
    goToStep(previousStep);
  };

  const startNewRanchSetup = () => {
    setJoinMode('new-ranch');
    setAcceptedInvite(null);
    setCreatedRanch(null);
    setSubmitError(null);
    goToStep('ranch');
  };

  const startExistingRanchJoin = () => {
    setJoinMode('existing-ranch');
    setAcceptedInvite(null);
    setCreatedRanch(null);
    setSubmitError(null);
    goToStep('details');
  };

  const handleInviteChange = (value: string) => {
    setInviteCode(value.replace(/[^a-z0-9-\s]/gi, '').toUpperCase());
    setSubmitError(null);
  };

  const handleAcceptInvite = async () => {
    setSubmitError(null);

    if (!fullName.trim()) {
      setSubmitError('Full name is required.');
      return;
    }

    if (!trimmedEmail) {
      setSubmitError('Email is required.');
      return;
    }

    if (!emailIsValid) {
      setSubmitError('Enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setSubmitError('Password must be at least 8 characters.');
      return;
    }

    if (!inviteCodeReady) {
      setSubmitError('Invite code is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await userManagementService.acceptInvite({
        fullName,
        email: trimmedEmail,
        password,
        inviteCode,
      });

      setAcceptedInvite(result);
      setCreatedRanch(null);
      setPassword('');
      goToStep('complete');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to create your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRanch = async () => {
    setSubmitError(null);

    if (!ranchName.trim()) {
      setSubmitError('Ranch name is required.');
      return;
    }

    if (!fullName.trim()) {
      setSubmitError('Full name is required.');
      return;
    }

    if (!trimmedEmail) {
      setSubmitError('Email is required.');
      return;
    }

    if (!emailIsValid) {
      setSubmitError('Enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setSubmitError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await userManagementService.createRanch({
        ranchName,
        fullName,
        email: trimmedEmail,
        password,
      });

      setCreatedRanch(result);
      setAcceptedInvite(null);
      setPassword('');
      goToStep('complete');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to set up your ranch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#3d2f1f]">
      <div className="signup-shell-safe mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-5">
        {step !== 'complete' && (
          <button
            type="button"
            onClick={goBack}
            className="relative z-50 mb-4 flex h-11 min-h-11 w-11 min-w-11 items-center justify-center rounded-2xl border border-[#ded2c0] bg-white text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)] active:bg-[#faf8f5]"
            aria-label="Go back"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {step === 'welcome' && (
          <WelcomeScreen
            onCreateAccount={() => goToStep('joining')}
            onSignIn={() => navigate('/login')}
          />
        )}

        {step === 'joining' && (
          <JoiningScreen
            onSetupNewRanch={startNewRanchSetup}
            onJoinExisting={startExistingRanchJoin}
          />
        )}

        {step === 'ranch' && (
          <StepCard stepLabel="Step 1 of 4" title="Set up your ranch">
            <Field
              label="Ranch / business name"
              value={ranchName}
              onChange={setRanchName}
              placeholder="Ranch or business name"
              autoComplete="organization"
            />
            <p className="text-sm leading-relaxed text-[#8b7a6f]">
              This creates a new StockLog workspace for your operation.
            </p>
            <PrimaryButton
              disabled={!ranchName.trim()}
              onClick={() => goToStep('details')}
            >
              Continue
            </PrimaryButton>
          </StepCard>
        )}

        {step === 'details' && (
          <StepCard
            stepLabel={joinMode === 'new-ranch' ? 'Step 2 of 4' : 'Step 1 of 4'}
            title="Tell us who you are"
          >
            <Field
              label="Full name"
              value={fullName}
              onChange={setFullName}
              placeholder="Full name"
              autoComplete="name"
            />
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Email address"
              autoComplete="email"
            />
            {showEmailError && (
              <div className="rounded-2xl border border-[#d8a59a] bg-[#fff4f0] p-3 text-sm text-[#8b3f2f]">
                Enter a valid email address.
              </div>
            )}
            <PrimaryButton
              disabled={!fullName.trim() || !emailIsValid}
              onClick={() => goToStep('password')}
            >
              Continue
            </PrimaryButton>
          </StepCard>
        )}

        {step === 'password' && (
          <StepCard
            stepLabel={joinMode === 'new-ranch' ? 'Step 3 of 4' : 'Step 2 of 4'}
            title="Create a password"
          >
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Password"
              autoComplete="new-password"
            />
            <div className="space-y-2 rounded-2xl bg-[#f7f4ed] p-3">
              {passwordChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-2 text-sm text-[#3d2f1f]">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${
                      check.met ? 'bg-[#5a7a4d] text-white' : 'bg-white text-[#8b7a6f]'
                    }`}
                  >
                    <Check size={13} />
                  </span>
                  {check.label}
                </div>
              ))}
            </div>
            <PrimaryButton disabled={!isPasswordReady} onClick={() => goToStep(joinMode === 'new-ranch' ? 'role' : 'invite')}>
              Continue
            </PrimaryButton>
          </StepCard>
        )}

        {step === 'invite' && (
          <StepCard stepLabel="Step 3 of 4" title="Enter your invite code">
            <Field
              label="Invite code"
              value={inviteCode}
              onChange={handleInviteChange}
              placeholder="ENTER CODE"
              inputMode="text"
              maxLength={16}
              className="text-center text-xl font-bold uppercase tracking-[0.12em]"
            />
            <p className="text-sm leading-relaxed text-[#8b7a6f]">
              Your code connects you to the right ranch and sets what you’re allowed to do.
            </p>
            {inviteCodeReady && (
              <div className="flex items-center gap-2 rounded-2xl border border-[#cbd8c4] bg-[#e9f0e5] p-3 text-sm font-semibold text-[#5a7a4d]">
                <ShieldCheck size={18} />
                Invite code entered. Your role is assigned by the invite.
              </div>
            )}
            <PrimaryButton disabled={!inviteCodeReady} onClick={() => goToStep('role')}>
              Continue
            </PrimaryButton>
            <p className="w-full py-2 text-center text-sm font-semibold text-[#8b7a6f]">
              Need an invite? Ask your StockLog admin.
            </p>
          </StepCard>
        )}

        {step === 'role' && joinMode === 'existing-ranch' && (
          <StepCard stepLabel="Step 4 of 4" title="Create your account">
            <div className="rounded-2xl border border-[#ded2c0] bg-[#fffdf8] p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f0e5] text-[#5a7a4d]">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#8b7a6f]">Ready to join</p>
                  <h2 className="text-xl font-bold text-[#3d2f1f]">Existing ranch</h2>
                </div>
              </div>
              <p className="mb-4 rounded-2xl bg-[#f7f4ed] p-3 text-sm leading-relaxed text-[#6f5f54]">
                Your role is assigned by the invite. An admin can change this later.
              </p>
              <div className="space-y-3 text-sm">
                <SummaryRow label="Name" value={fullName || 'Not entered'} />
                <SummaryRow label="Email" value={email || 'Not entered'} />
                <SummaryRow label="Invite code" value={normalizeInviteCodeForDisplay(inviteCode) || 'Not entered'} />
              </div>
            </div>
            {submitError && (
              <div className="rounded-2xl border border-[#d8a59a] bg-[#fff4f0] p-3 text-sm text-[#8b3f2f]">
                {submitError}
              </div>
            )}
            <PrimaryButton disabled={isSubmitting} onClick={handleAcceptInvite}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </PrimaryButton>
          </StepCard>
        )}

        {step === 'role' && joinMode === 'new-ranch' && (
          <StepCard stepLabel="Step 4 of 4" title="Create your ranch">
            <div className="rounded-2xl border border-[#ded2c0] bg-[#fffdf8] p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f0e5] text-[#5a7a4d]">
                  <Building2 size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#8b7a6f]">Ready to set up</p>
                  <h2 className="text-xl font-bold text-[#3d2f1f]">{ranchName || 'New ranch'}</h2>
                </div>
              </div>
              <p className="mb-4 rounded-2xl bg-[#f7f4ed] p-3 text-sm leading-relaxed text-[#6f5f54]">
                You’ll be the first admin for this ranch.
              </p>
              <div className="space-y-3 text-sm">
                <SummaryRow label="Ranch" value={ranchName || 'Not entered'} />
                <SummaryRow label="Name" value={fullName || 'Not entered'} />
                <SummaryRow label="Email" value={email || 'Not entered'} />
                <SummaryRow label="Role" value="Admin" />
              </div>
            </div>
            {submitError && (
              <div className="rounded-2xl border border-[#d8a59a] bg-[#fff4f0] p-3 text-sm text-[#8b3f2f]">
                {submitError}
              </div>
            )}
            <PrimaryButton disabled={isSubmitting} onClick={handleCreateRanch}>
              {isSubmitting ? 'Creating ranch...' : 'Create ranch'}
            </PrimaryButton>
          </StepCard>
        )}

        {step === 'complete' && (
          <CompleteScreen
            headline={createdRanch ? 'Your ranch is ready.' : 'Your StockLog account is ready.'}
            copy="Sign in to start using StockLog."
            fullName={fullName}
            email={createdRanch?.email ?? acceptedInvite?.email ?? email}
            ranchName={createdRanch?.ranchName}
            roleName={roleName}
            onContinue={() => navigate('/login')}
          />
        )}
      </div>
    </div>
  );
}

function normalizeInviteCodeForDisplay(code: string): string {
  return code.trim().toUpperCase().replace(/[\s-]+/g, '');
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatRoleLabel(role: string): string {
  if (role === 'viewer') return 'View Only';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function WelcomeScreen({
  onCreateAccount,
  onSignIn,
}: {
  onCreateAccount: () => void;
  onSignIn: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center py-8">
      <div className="mb-8 text-center">
        <div className="mb-5 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[#5a7a4d] shadow-[0_6px_18px_rgba(61,47,31,0.22)]">
            <Package size={46} className="text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-[#3d2f1f]">StockLog</h1>
        <p className="mx-auto mt-4 max-w-xs text-base leading-relaxed text-[#6f5f54]">
          Feed inventory and invoicing built for the ranch — faster to record than to skip.
        </p>
      </div>

      <div className="mb-6 rounded-3xl border border-[#ded2c0] bg-white p-5 shadow-[0_4px_18px_rgba(61,47,31,0.10)]">
        <div className="space-y-3">
          {['Live inventory', 'Track who took it', 'Simple invoicing'].map((feature) => (
            <div key={feature} className="flex items-center gap-3 text-[#3d2f1f]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9f0e5] text-[#5a7a4d]">
                <Check size={17} />
              </span>
              <span className="font-semibold">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <PrimaryButton onClick={onCreateAccount}>Create account</PrimaryButton>

      <button
        type="button"
        onClick={onSignIn}
        className="mt-5 w-full py-3 text-sm font-semibold text-[#8b7a6f] active:text-[#3d2f1f]"
      >
        Already have an account? Sign in
      </button>
    </div>
  );
}

function JoiningScreen({
  onSetupNewRanch,
  onJoinExisting,
}: {
  onSetupNewRanch: () => void;
  onJoinExisting: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center py-4">
      <div className="rounded-3xl border border-[#ded2c0] bg-white p-5 shadow-[0_4px_18px_rgba(61,47,31,0.10)]">
        <p className="text-sm font-semibold text-[#8b7a6f]">Account setup</p>
        <h1 className="mt-2 text-2xl font-bold text-[#3d2f1f]">
          How are you joining StockLog?
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#6f5f54]">
          Choose the path that matches your operation. Roles are assigned by setup or invite, not chosen by users.
        </p>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={onSetupNewRanch}
            className="w-full rounded-2xl border-2 border-[#5a7a4d] bg-[#fffdf8] p-4 text-left shadow-[0_3px_10px_rgba(61,47,31,0.10)] active:bg-[#f7f4ed]"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e9f0e5] text-[#5a7a4d]">
                <Building2 size={23} />
              </span>
              <span>
                <span className="font-bold text-[#3d2f1f]">Set up a new ranch</span>
                <span className="mt-1 block text-sm leading-relaxed text-[#6f5f54]">
                  Create the first admin account for your operation.
                </span>
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={onJoinExisting}
            className="w-full rounded-2xl border-2 border-[#5a7a4d] bg-[#fffdf8] p-4 text-left shadow-[0_3px_10px_rgba(61,47,31,0.10)] active:bg-[#f7f4ed]"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e9f0e5] text-[#5a7a4d]">
                <UserPlus size={23} />
              </span>
              <span>
                <span className="font-bold text-[#3d2f1f]">Join an existing ranch</span>
                <span className="mt-1 block text-sm leading-relaxed text-[#6f5f54]">
                  Use an invite code from your StockLog admin.
                </span>
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  stepLabel,
  title,
  children,
}: {
  stepLabel: string;
  title: string;
  children: ReactNode;
}) {
  const stepNumber = Number(stepLabel.match(/\d/)?.[0] ?? 1);
  const progressPercent = (stepNumber / 4) * 100;

  return (
    <div className="flex flex-1 flex-col justify-center py-4">
      <div className="mb-5">
        <p className="text-sm font-semibold text-[#8b7a6f]">{stepLabel}</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eadfce]">
          <div
            className="h-full rounded-full bg-[#5a7a4d] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-[#ded2c0] bg-white p-5 shadow-[0_4px_18px_rgba(61,47,31,0.10)]">
        <h1 className="mb-5 text-2xl font-bold text-[#3d2f1f]">{title}</h1>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder: string;
  autoComplete?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  className?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#3d2f1f]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        className={`w-full rounded-2xl border border-[#ded2c0] bg-white px-4 py-4 text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] ${className}`}
      />
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl bg-[#5a7a4d] py-4 font-semibold text-white shadow-[0_3px_10px_rgba(61,47,31,0.18)] active:bg-[#4a6a3d] disabled:bg-[#c7bdb0]"
    >
      {children}
    </button>
  );
}

function CompleteScreen({
  headline,
  copy,
  fullName,
  email,
  ranchName,
  roleName,
  onContinue,
}: {
  headline: string;
  copy: string;
  fullName: string;
  email: string;
  ranchName?: string;
  roleName: string;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center py-8">
      <div className="rounded-[2rem] bg-[#5a7a4d] p-6 text-white shadow-[0_6px_20px_rgba(61,47,31,0.18)]">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
          <CheckCircle2 size={36} />
        </div>
        <h1 className="text-3xl font-bold">{headline}</h1>
        <p className="mt-3 text-base leading-relaxed text-white/90">
          {copy}
        </p>
      </div>

      <div className="my-5 rounded-3xl border border-[#ded2c0] bg-white p-5 shadow-[0_4px_18px_rgba(61,47,31,0.10)]">
        <h2 className="mb-4 text-lg font-bold text-[#3d2f1f]">Account summary</h2>
        {ranchName && <SummaryRow label="Ranch" value={ranchName} />}
        <SummaryRow label="Name" value={fullName || 'Not entered'} />
        <SummaryRow label="Email" value={email || 'Not entered'} />
        <SummaryRow label="Role" value={roleName} />
      </div>

      <PrimaryButton onClick={onContinue}>Back to login</PrimaryButton>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#f0e8dc] py-3 last:border-b-0">
      <span className="text-sm font-semibold text-[#8b7a6f]">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-bold text-[#3d2f1f]">{value}</span>
    </div>
  );
}
