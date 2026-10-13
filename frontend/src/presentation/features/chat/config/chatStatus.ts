import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
export function getChatStatusConfig(connectionStatus: string) {
  switch (connectionStatus) {
    case 'Connected':
      return { bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500 animate-pulse', icon: Wifi, label: 'Đã kết nối' };
    case 'Connecting':
    case 'Reconnecting':
      return { bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500 animate-ping', icon: RefreshCw, label: 'Đang kết nối...' };
    case 'Disconnected':
    default:
      return { bg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800', dot: 'bg-rose-500', icon: WifiOff, label: 'Offline' };
  }
}
