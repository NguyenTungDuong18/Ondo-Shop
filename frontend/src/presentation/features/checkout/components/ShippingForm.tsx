import { shippingFields } from '../config/shippingFields';
import type { useCheckoutPage } from '../hooks/useCheckoutPage';
type Props = {
  form: NonNullable<ReturnType<typeof useCheckoutPage>>['form'];
  setForm: NonNullable<ReturnType<typeof useCheckoutPage>>['setForm'];
};
export function ShippingForm({ form, setForm }: Props) {
  return (<div className="lg:col-span-3 space-y-5">
    <div className="onda-modal rounded-3xl p-6 space-y-4">
      <h2 className="nike-title text-base border-b pb-3" style={{ borderColor: 'var(--border-default)' }}>SHIPPING INFORMATION</h2>

      <div className="space-y-3">
        {shippingFields.map(({ label, key, type, placeholder, textarea }) => (
          <div key={key}>
            <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>
            {textarea ? (
              <textarea
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="nike-input w-full px-4 py-2.5 text-sm resize-none"
                rows={3} placeholder={placeholder} required={key === 'shippingAddress'} />
            ) : (
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="nike-input w-full px-4 py-2.5 text-sm"
                placeholder={placeholder} required={key !== 'shippingNote'} />
            )}
          </div>
        ))}
      </div>
    </div>
  </div>);
}
