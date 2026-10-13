import React from 'react';

import { ProfileView } from '../components/ProfileView';
import { useProfilePage } from '../hooks/useProfilePage';
export const ProfilePage: React.FC = () => {
  const model = useProfilePage();
  return <ProfileView model={model} />;
};
