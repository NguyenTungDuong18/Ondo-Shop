import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUpdateProfileMutation } from '../hooks/useAuthQueries';
import { useUIStore } from '../store/uiStore';
import { Badge } from '../components/common/Badge';
import { LiquidAvatar } from '../components/common/LiquidAvatar';
import {
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Fingerprint,
  Pencil,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const updateProfile = useUpdateProfileMutation();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);

  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const isDirty =
    fullName.trim() !== (user.fullName || '') ||
    email.trim() !== (user.email || '') ||
    phoneNumber.trim() !== (user.phoneNumber || '') ||
    avatarUrl !== (user.avatarUrl || null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      addToast('info', 'Avatar photo updated! Click "Save changes" to confirm.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      addToast('error', 'Full Name and Email Address cannot be empty.');
      return;
    }

    await updateProfile.mutateAsync({
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim() || null,
      // Browser object URLs are only previews; persist a real URL already stored for the user.
      avatarUrl: avatarUrl?.startsWith('blob:') ? user.avatarUrl || null : avatarUrl || null,
    });
  };

  const handleDiscard = () => {
    setFullName(user.fullName || '');
    setEmail(user.email || '');
    setPhoneNumber(user.phoneNumber || '');
    setAvatarUrl(user.avatarUrl || null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16 pt-4">
      {/* Page Title & Hero Header */}
      <div className="pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Onda Studio · Member Credentials
            </span>
          </div>
          <h1 className="font-serif-hero text-4xl sm:text-5xl tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
            Studio Account.
          </h1>
          <p className="text-xs font-sans mt-2 max-w-lg" style={{ color: 'var(--text-secondary)' }}>
            Personal details are directly editable below. Click any card field to modify.
          </p>
        </div>
      </div>

      {/* Main Profile Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Member Card Summary */}
        <div className="lg:col-span-1 rounded-3xl shadow-sm p-6 flex flex-col items-center text-center space-y-6 self-start relative overflow-hidden"
          style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          {/* Hidden Avatar File Input */}
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Avatar Container with Pen Edit Icon Badge */}
          <div
            onClick={() => avatarInputRef.current?.click()}
            className="relative cursor-pointer group mt-2"
            title="Click to change avatar photo"
          >
            <div
              className="transition-transform duration-300 group-hover:scale-105 rounded-full shadow-lg"
              style={{ boxShadow: '0 0 0 4px var(--border-default)' }}
            >
              <LiquidAvatar
                name={fullName || user.username}
                avatarUrl={avatarUrl}
                size={96}
              />
            </div>

            {/* Pen Edit Icon Floating Badge */}
            <div
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{
                backgroundColor: 'var(--surface-card)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-default)',
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* User Identifiers */}
          <div className="space-y-1 w-full pt-1">
            <h2 className="font-serif italic text-2xl font-normal" style={{ color: 'var(--text-primary)' }}>
              {fullName || user.username}
            </h2>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>@{user.username}</p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-3 w-full" style={{ borderTop: '1px solid var(--border-default)' }}>
            <Badge variant={user.role === 'Admin' ? 'purple' : 'neutral'} className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider">
              {user.role} Privilege
            </Badge>
          </div>

          {/* Member Status Detail Box */}
          <div className="rounded-2xl p-4 w-full space-y-2.5" style={{ border: '1px solid var(--border-default)' }}>
            <div className="flex items-center justify-between text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
              <span>ACCOUNT STATUS</span>
              <span className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--text-success)' }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
              <span>TIER STATUS</span>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Verified Member</span>
            </div>
          </div>
        </div>

        {/* Right Column: Direct Click-to-Edit Parameter Cards */}
        <div className="lg:col-span-2">
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
        </div>
      </div>
    </div>
  );
};
