import { useUIStore } from '../store/uiStore';

export const useTheme = () => {
  const { theme, setTheme } = useUIStore();
  return { theme, setTheme };
};
