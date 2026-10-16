import React, { useEffect, useRef, useState } from 'react';
import { authService } from '../../../../application/services/authService';
import { useUpdateProfileMutation } from '../../../hooks/useAuthQueries';
import { useAuthStore } from '../../../state/authStore';
import { useUIStore } from '../../../state/uiStore';

export function useProfilePage() {

  const { user, setUser } = useAuthStore();
  const { addToast } = useUIStore();
  const updateProfile = useUpdateProfileMutation();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [avatarFile, setAvatarFile] = useState<File>();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);

  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview); }, [avatarPreview]);
  useEffect(() => () => { if (cropSource) URL.revokeObjectURL(cropSource); }, [cropSource]);

  if (!user) return null;

  const avatarUrl = avatarPreview || user.avatarUrl || null;

  const isDirty =
    fullName.trim() !== (user.fullName || '') ||
    email.trim() !== (user.email || '') ||
    phoneNumber.trim() !== (user.phoneNumber || '') ||
    dateOfBirth !== (user.dateOfBirth || '') || !!avatarFile;

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      addToast('error', 'Vui lòng chọn ảnh JPG, PNG, GIF hoặc WEBP.'); return;
    }
    if (!file.size || file.size > 5 * 1024 * 1024) {
      addToast('error', 'Ảnh phải có nội dung và không vượt quá 5 MB.'); return;
    }
    setCropSource(URL.createObjectURL(file));
  };

  const handleConfirmCrop = (file: File) => {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setCropSource(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (updateProfile.isPending || cropSource || !isDirty) return;
    if (!fullName.trim() || !email.trim()) {
      addToast('error', 'Full Name and Email Address cannot be empty.');
      return;
    }

    try {
      const response = await updateProfile.mutateAsync({
        fullName: fullName.trim(), email: email.trim(), phoneNumber: phoneNumber.trim() || null,
        dateOfBirth: dateOfBirth || null, avatarFile,
      });
      if (response.success && response.data) {
        setFullName(response.data.fullName); setEmail(response.data.email);
        setPhoneNumber(response.data.phoneNumber || ''); setDateOfBirth(response.data.dateOfBirth || '');
        setAvatarFile(undefined); setAvatarPreview(null);
      }
    } catch {
      // Details may have saved before an avatar failure. Keep the crop available for retry.
      try { const current = await authService.getProfile(); if (current.success && current.data) setUser(current.data); }
      catch { /* Preserve the form if the network is unavailable. */ }
    }
  };

  const handleDiscard = () => {
    if (updateProfile.isPending) return;
    setFullName(user.fullName || '');
    setEmail(user.email || '');
    setPhoneNumber(user.phoneNumber || '');
    setDateOfBirth(user.dateOfBirth || '');
    setAvatarFile(undefined); setAvatarPreview(null); setCropSource(null);
  };
  return { user, updateProfile, fullName, setFullName, email, setEmail, phoneNumber, setPhoneNumber,
    dateOfBirth, setDateOfBirth, avatarUrl, cropSource, setCropSource, handleConfirmCrop,
    fullNameRef, emailRef, phoneRef, avatarInputRef, isDirty, handleAvatarFileChange, handleSaveProfile, handleDiscard };
}
