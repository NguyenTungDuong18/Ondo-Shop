import { Database, Server, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../../../../shared/config/environment';
export function BackendStatus() {
  return (<div className="onda-modal p-6 rounded-3xl space-y-4 flex flex-col justify-between">
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Server className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
        <h3 className="font-serif-hero text-base">System Architecture</h3>
      </div>
      <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        Frontend application directly connected to ASP.NET Core 3-Layer Backend architecture.
      </p>

      <div className="space-y-2 pt-2">
        {[
          { icon: Database, label: 'Database', value: 'PostgreSQL / EF Core', color: 'var(--text-primary)' },
          { icon: ShieldCheck, label: 'Authentication', value: 'Bearer / refresh cookie', color: 'var(--text-success)' },
          { icon: Server, label: 'API Host', value: API_BASE_URL, color: 'var(--text-primary)', mono: true },
        ].map(({ icon: Icon, label, value, color, mono }) => (
          <div
            key={label}
            className="p-3 rounded-2xl flex items-center justify-between text-xs font-semibold"
            style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-default)' }}
          >
            <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <Icon className="w-3.5 h-3.5" style={{ color }} />
              {label}
            </span>
            <span className={`font-bold ${mono ? 'font-mono' : ''}`} style={{ color: 'var(--text-primary)' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>

    <div
      className="p-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider"
      style={{
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-primary)',
      }}
    >
      ✅ Backend endpoint configured
    </div>
  </div>);
}
