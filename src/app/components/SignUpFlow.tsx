import { useMemo, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Check, CheckCircle2, ChevronLeft, Package, ShieldCheck, UserPlus, X } from 'lucide-react';

type Step = 'welcome' | 'joining' | 'details' | 'password' | 'invite' | 'role' | 'complete';

const stepOrder: Step[] = ['welcome', 'joining', 'details', 'password', 'invite', 'role', 'complete'];

const operatorAllowed = [
  'Record feed taken & create invoices',
  'Add incoming stock',
  'View inventory and activity',
];

const operatorUnavailable = [
  'Manage users or settings',
  'See cost & accounting fields',
];

export default function SignUpFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('welcome');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const currentStepIndex = stepOrder.indexOf(step);
  const roleName = 'Operator';
  const ranchName = 'C&C Feed';

  const passwordChecks = useMemo(
    () => [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'One number', met: /\d/.test(password) },
      { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    ],
    [password],
  );

  const isPasswordReady = passwordChecks.every((check) => check.met);
  const inviteCodeReady = inviteCode.length === 6;

  const goToStep = (nextStep: Step) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(nextStep);
  };

  const goBack = () => {
    const previousStep = stepOrder[Math.max(currentStepIndex - 1, 0)];
    goToStep(previousStep);
  };

  const handleInviteChange = (value: string) => {
    setInviteCode(value.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase());
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#3d2f1f]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-5">
        {step !== 'welcome' && step !== 'complete' && (
          <button
            type="button"
            onClick={goBack}
            className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ded2c0] bg-white text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)] active:bg-[#faf8f5]"
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
          <JoiningScreen onJoinExisting={() => goToStep('details')} />
        )}

        {step === 'details' && (
          <StepCard stepLabel="Step 1 of 4" title="Tell us who you are">
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
            <PrimaryButton
              disabled={!fullName.trim() || !email.trim()}
              onClick={() => goToStep('password')}
            >
              Continue
            </PrimaryButton>
          </StepCard>
        )}

        {step === 'password' && (
          <StepCard stepLabel="Step 2 of 4" title="Create a password">
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
            <PrimaryButton disabled={!isPasswordReady} onClick={() => goToStep('invite')}>
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
              maxLength={6}
              className="text-center text-xl font-bold uppercase tracking-[0.12em]"
            />
            <p className="text-sm leading-relaxed text-[#8b7a6f]">
              Your code connects you to the right ranch and sets what you’re allowed to do.
            </p>
            {inviteCodeReady && (
              <div className="flex items-center gap-2 rounded-2xl border border-[#cbd8c4] bg-[#e9f0e5] p-3 text-sm font-semibold text-[#5a7a4d]">
                <ShieldCheck size={18} />
                Code found. This invite assigns the Operator role.
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

        {step === 'role' && (
          <StepCard stepLabel="Step 4 of 4" title="Your role">
            <div className="rounded-2xl border border-[#ded2c0] bg-[#fffdf8] p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f0e5] text-[#5a7a4d]">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#8b7a6f]">Assigned by invite</p>
                  <h2 className="text-xl font-bold text-[#3d2f1f]">{roleName}</h2>
                </div>
              </div>
              <p className="mb-4 rounded-2xl bg-[#f7f4ed] p-3 text-sm leading-relaxed text-[#6f5f54]">
                Your role is set by your invite. An admin can change this later.
              </p>
              <PermissionList title="Allowed" items={operatorAllowed} tone="allowed" />
              <div className="mt-4">
                <PermissionList title="Unavailable" items={operatorUnavailable} tone="unavailable" />
              </div>
            </div>
            <PrimaryButton onClick={() => goToStep('complete')}>Create account</PrimaryButton>
          </StepCard>
        )}

        {step === 'complete' && (
          <CompleteScreen
            fullName={fullName}
            email={email}
            roleName={roleName}
            ranchName={ranchName}
            onContinue={() => navigate('/login')}
          />
        )}
      </div>
    </div>
  );
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

function JoiningScreen({ onJoinExisting }: { onJoinExisting: () => void }) {
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
            disabled
            className="w-full rounded-2xl border border-[#ded2c0] bg-[#faf8f5] p-4 text-left opacity-75"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f0e8dc] text-[#8b7a6f]">
                <Building2 size={23} />
              </span>
              <span>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#3d2f1f]">Set up a new ranch</span>
                  <span className="rounded-full bg-[#eadfce] px-2 py-1 text-xs font-bold text-[#6f5f54]">
                    Coming soon
                  </span>
                </span>
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

function PermissionList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'allowed' | 'unavailable';
}) {
  const Icon = tone === 'allowed' ? Check : X;

  return (
    <div>
      <h3 className="mb-2 text-sm font-bold text-[#3d2f1f]">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 text-sm leading-relaxed text-[#6f5f54]">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                tone === 'allowed' ? 'bg-[#e9f0e5] text-[#5a7a4d]' : 'bg-[#fff4f0] text-[#8b3f2f]'
              }`}
            >
              <Icon size={13} />
            </span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function CompleteScreen({
  fullName,
  email,
  roleName,
  ranchName,
  onContinue,
}: {
  fullName: string;
  email: string;
  roleName: string;
  ranchName: string;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center py-8">
      <div className="rounded-[2rem] bg-[#5a7a4d] p-6 text-white shadow-[0_6px_20px_rgba(61,47,31,0.18)]">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
          <CheckCircle2 size={36} />
        </div>
        <h1 className="text-3xl font-bold">You’re all set</h1>
        <p className="mt-3 text-base leading-relaxed text-white/90">
          Welcome to StockLog. Your account is ready to go.
        </p>
      </div>

      <div className="my-5 rounded-3xl border border-[#ded2c0] bg-white p-5 shadow-[0_4px_18px_rgba(61,47,31,0.10)]">
        <h2 className="mb-4 text-lg font-bold text-[#3d2f1f]">Account summary</h2>
        <SummaryRow label="Name" value={fullName || 'Not entered'} />
        <SummaryRow label="Email" value={email || 'Not entered'} />
        <SummaryRow label="Role" value={roleName} />
        <SummaryRow label="Ranch" value={ranchName} />
      </div>

      <PrimaryButton onClick={onContinue}>Go to StockLog</PrimaryButton>
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
