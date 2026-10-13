import React, { useEffect, useRef, useState } from 'react';
import { useUpdateProfileMutation } from '../../../hooks/useAuthQueries';
import { useAuthStore } from '../../../state/authStore';
import { useUIStore } from '../../../state/uiStore';

export function useProfilePage() {

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

  useEffect(() => () => { if (avatarUrl?.startsWith('blob:')) URL.revokeObjectURL(avatarUrl); }, [avatarUrl]);

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
  return { user, updateProfile, fullName, setFullName, email, setEmail, phoneNumber, setPhoneNumber, avatarUrl, fullNameRef, emailRef, phoneRef, avatarInputRef, isDirty, handleAvatarFileChange, handleSaveProfile, handleDiscard };
}
