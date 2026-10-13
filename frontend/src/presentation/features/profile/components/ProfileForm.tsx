import {
  Calendar,
  Fingerprint,
  Mail,
  Phone,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import type { useProfilePage } from '../hooks/useProfilePage';
type Props = {
  handleSaveProfile: NonNullable<ReturnType<typeof useProfilePage>>['handleSaveProfile'];
  fullNameRef: NonNullable<ReturnType<typeof useProfilePage>>['fullNameRef'];
  fullName: NonNullable<ReturnType<typeof useProfilePage>>['fullName'];
  setFullName: NonNullable<ReturnType<typeof useProfilePage>>['setFullName'];
  emailRef: NonNullable<ReturnType<typeof useProfilePage>>['emailRef'];
  email: NonNullable<ReturnType<typeof useProfilePage>>['email'];
  setEmail: NonNullable<ReturnType<typeof useProfilePage>>['setEmail'];
  phoneRef: NonNullable<ReturnType<typeof useProfilePage>>['phoneRef'];
  phoneNumber: NonNullable<ReturnType<typeof useProfilePage>>['phoneNumber'];
  setPhoneNumber: NonNullable<ReturnType<typeof useProfilePage>>['setPhoneNumber'];
  user: NonNullable<ReturnType<typeof useProfilePage>>['user'];
  isDirty: NonNullable<ReturnType<typeof useProfilePage>>['isDirty'];
  handleDiscard: NonNullable<ReturnType<typeof useProfilePage>>['handleDiscard'];
  updateProfile: NonNullable<ReturnType<typeof useProfilePage>>['updateProfile'];
};
export function ProfileForm({ handleSaveProfile, fullNameRef, fullName, setFullName, emailRef, email, setEmail, phoneRef, phoneNumber, setPhoneNumber, user, isDirty, handleDiscard, updateProfile }: Props) {
  return (<div className="lg:col-span-2">
    <form onSubmit={handleSaveProfile} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Full Name */}
        <div
          onClick={() => fullNameRef.current?.focus()}
          className="p-5 rounded-2xl shadow-sm space-y-2 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-text"
          style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest">FULL NAME</span>
            <UserIcon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="relative group/field pt-0.5 pb-1">
            <input
              ref={fullNameRef}
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-transparent text-base font-bold focus:outline-none placeholder-zinc-300 dark:placeholder-zinc-600 font-sans pb-1 cursor-text"
              style={{ color: 'var(--text-primary)' }}
              placeholder="Enter full name..."
            />
            <span className="underline-taper-line" />
          </div>
        </div>

        {/* Card 2: Email Address */}
        <div
          onClick={() => emailRef.current?.focus()}
          className="p-5 rounded-2xl shadow-sm space-y-2 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-text"
          style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest">EMAIL ADDRESS</span>
            <Mail className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="relative group/field pt-0.5 pb-1">
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-base font-bold focus:outline-none placeholder-zinc-300 dark:placeholder-zinc-600 font-sans pb-1 cursor-text truncate"
              style={{ color: 'var(--text-primary)' }}
              placeholder="Enter email address..."
            />
            <span className="underline-taper-line" />
          </div>
        </div>

        {/* Card 3: Phone Contact */}
        <div
          onClick={() => phoneRef.current?.focus()}
          className="p-5 rounded-2xl shadow-sm space-y-2 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-text"
          style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest">PHONE CONTACT</span>
            <Phone className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="relative group/field pt-0.5 pb-1">
            <input
              ref={phoneRef}
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-transparent text-base font-bold focus:outline-none placeholder-zinc-300 dark:placeholder-zinc-600 font-sans pb-1 cursor-text"
              style={{ color: 'var(--text-primary)' }}
              placeholder="Enter phone number..."
            />
            <span className="underline-taper-line" />
          </div>
        </div>

        {/* Card 4: Access Role */}
        <div className="p-5 rounded-2xl shadow-sm space-y-2"
          style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)', opacity: 0.8 }}
        >
          <div className="flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest">SYSTEM ACCESS ROLE</span>
            <ShieldCheck className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{user.role}</p>
        </div>

        {/* Card 5: Studio Member ID */}
        <div className="p-5 rounded-2xl shadow-sm space-y-2"
          style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)', opacity: 0.8 }}
        >
          <div className="flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest">STUDIO MEMBER ID</span>
            <Fingerprint className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-xs font-mono font-bold truncate" style={{ color: 'var(--text-secondary)' }}>{user.id}</p>
        </div>

        {/* Card 6: Membership Since */}
        <div className="p-5 rounded-2xl shadow-sm space-y-2"
          style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)', opacity: 0.8 }}
        >
          <div className="flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest">MEMBERSHIP SINCE</span>
            <Calendar className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Frameless & Delicate Bottom Save Panel */}
      {isDirty && (
        <div className="pt-6 flex items-center justify-between gap-4 animate-fade-in" style={{ borderTop: '1px solid var(--border-default)' }}>
          {/* Yellow Pulsing Indicator Dot */}
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span>Unsaved changes</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDiscard}
              className="text-[10px] font-mono font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                color: 'var(--text-muted)',
                backgroundColor: 'transparent',
                border: '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.backgroundColor = 'var(--surface-raised)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="text-[10px] font-mono font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                color: 'var(--btn-primary-text)',
                backgroundColor: 'var(--btn-primary-bg)',
                border: '1px solid var(--btn-primary-border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg)';
              }}
            >
              Save changes
            </button>
          </div>
        </div>
      )}
    </form>
  </div>);
}
