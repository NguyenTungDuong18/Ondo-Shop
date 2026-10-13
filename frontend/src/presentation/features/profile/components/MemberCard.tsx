import {
  CheckCircle2,
  Pencil
} from 'lucide-react';
import { Badge } from '../../../shared/components/Badge';
import { LiquidAvatar } from '../../../shared/components/LiquidAvatar';
import type { useProfilePage } from '../hooks/useProfilePage';
type Props = {
  avatarInputRef: NonNullable<ReturnType<typeof useProfilePage>>['avatarInputRef'];
  handleAvatarFileChange: NonNullable<ReturnType<typeof useProfilePage>>['handleAvatarFileChange'];
  fullName: NonNullable<ReturnType<typeof useProfilePage>>['fullName'];
  user: NonNullable<ReturnType<typeof useProfilePage>>['user'];
  avatarUrl: NonNullable<ReturnType<typeof useProfilePage>>['avatarUrl'];
};
export function MemberCard({ avatarInputRef, handleAvatarFileChange, fullName, user, avatarUrl }: Props) {
  return (<div className="lg:col-span-1 rounded-3xl shadow-sm p-6 flex flex-col items-center text-center space-y-6 self-start relative overflow-hidden"
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
  </div>);
}
