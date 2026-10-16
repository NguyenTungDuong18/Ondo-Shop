import {
  Sparkles
} from 'lucide-react';
import { MemberCard } from './MemberCard';
import { ProfileForm } from './ProfileForm';
import { AvatarCropDialog } from './AvatarCropDialog';

import type { useProfilePage } from '../hooks/useProfilePage';
export function ProfileView({ model }: { model: ReturnType<typeof useProfilePage> }) {
  if (!model) return null;
  const { user, updateProfile, fullName, setFullName, email, setEmail, phoneNumber, setPhoneNumber, avatarUrl, fullNameRef, emailRef, phoneRef, avatarInputRef, isDirty, handleAvatarFileChange, handleSaveProfile, handleDiscard } = model;

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
      <fieldset disabled={updateProfile.isPending || !!model.cropSource} className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-w-0">
        {/* Left Column: Member Card Summary */}
        <MemberCard avatarInputRef={avatarInputRef} handleAvatarFileChange={handleAvatarFileChange} fullName={fullName} user={user} avatarUrl={avatarUrl} />

        {/* Right Column: Direct Click-to-Edit Parameter Cards */}
        <ProfileForm dateOfBirth={model.dateOfBirth} setDateOfBirth={model.setDateOfBirth} handleSaveProfile={handleSaveProfile} fullNameRef={fullNameRef} fullName={fullName} setFullName={setFullName} emailRef={emailRef} email={email} setEmail={setEmail} phoneRef={phoneRef} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} user={user} isDirty={isDirty} handleDiscard={handleDiscard} updateProfile={updateProfile} />
      </fieldset>
      {model.cropSource && <AvatarCropDialog key={model.cropSource} source={model.cropSource}
        onCancel={() => model.setCropSource(null)} onConfirm={model.handleConfirmCrop} />}
    </div>
  );

}
