import { useEffect, useRef, useState } from 'react';
import { cropGeometry } from '../avatarCrop';

type Props = { source: string; onCancel: () => void; onConfirm: (file: File) => void };

export function AvatarCropDialog({ source, onCancel, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const crop = cropGeometry(dimensions.width, dimensions.height, zoom, offset.x, offset.y);
  useEffect(() => { dialogRef.current?.showModal(); }, []);

  const confirm = async () => {
    if (!imageRef.current || !ready || saving) return;
    setSaving(true);
    setError('');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 512;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Không thể xử lý ảnh trên trình duyệt này.');
      context.drawImage(imageRef.current, crop.sourceX, crop.sourceY, crop.sourceSize, crop.sourceSize, 0, 0, 512, 512);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
        result => result ? resolve(result) : reject(new Error('Không thể tạo ảnh đại diện.')), 'image/png'));
      onConfirm(new File([blob], 'avatar.png', { type: 'image/png' }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể xử lý ảnh.');
      setSaving(false);
    }
  };

  return <dialog ref={dialogRef} onCancel={event => { event.preventDefault(); if (!saving) onCancel(); }}
    aria-labelledby="avatar-crop-title" className="m-auto w-[min(92vw,420px)] rounded-3xl p-6 shadow-2xl backdrop:bg-black/60"
    style={{ background: 'var(--surface-card)', color: 'var(--text-primary)' }}>
    <h2 id="avatar-crop-title" className="text-xl font-semibold">Căn chỉnh ảnh đại diện</h2>
    <p className="mt-2 mb-5 text-sm" style={{ color: 'var(--text-secondary)' }}>Kéo ảnh và phóng to để căn trong hình tròn.</p>
    <div tabIndex={0} aria-label="Vùng căn ảnh. Dùng phím mũi tên để di chuyển ảnh."
      className="relative aspect-square w-full overflow-hidden bg-zinc-900 cursor-grab active:cursor-grabbing touch-none select-none focus-visible:outline-2"
      onPointerDown={event => {
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { x: event.clientX, y: event.clientY, offsetX: crop.offsetX, offsetY: crop.offsetY };
      }}
      onPointerMove={event => {
        if (!drag.current) return;
        const size = event.currentTarget.getBoundingClientRect().width;
        const next = cropGeometry(dimensions.width, dimensions.height, zoom,
          drag.current.offsetX + (event.clientX - drag.current.x) / size,
          drag.current.offsetY + (event.clientY - drag.current.y) / size);
        setOffset({ x: next.offsetX, y: next.offsetY });
      }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
      onKeyDown={event => {
        const moves: Record<string, [number, number]> = { ArrowLeft: [-.02, 0], ArrowRight: [.02, 0], ArrowUp: [0, -.02], ArrowDown: [0, .02] };
        const move = moves[event.key];
        if (!move) return;
        event.preventDefault();
        const next = cropGeometry(dimensions.width, dimensions.height, zoom, crop.offsetX + move[0], crop.offsetY + move[1]);
        setOffset({ x: next.offsetX, y: next.offsetY });
      }}>
      <img ref={imageRef} src={source} alt="Ảnh đang căn chỉnh" draggable={false}
        onLoad={event => { setDimensions({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight }); setReady(true); }}
        onError={() => setError('Không đọc được ảnh. Vui lòng chọn ảnh khác.')}
        className="absolute pointer-events-none" style={{ maxWidth: 'none', width: `${crop.displayWidth * 100}%`, height: `${crop.displayHeight * 100}%`,
          left: `${50 + crop.offsetX * 100}%`, top: `${50 + crop.offsetY * 100}%`, transform: 'translate(-50%, -50%)' }} />
      <div aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-white pointer-events-none"
        style={{ boxShadow: '0 0 0 100px rgb(0 0 0 / .6)' }} />
      <div aria-hidden="true" className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
        {Array.from({ length: 9 }, (_, i) => <span key={i} className="border border-white/20" />)}
      </div>
    </div>
    <label className="mt-5 flex items-center gap-3 text-sm">Phóng to
      <input aria-label="Phóng to ảnh" className="flex-1" type="range" min="1" max="3" step="0.01" value={zoom}
        onChange={event => {
          const nextZoom = Number(event.target.value);
          const next = cropGeometry(dimensions.width, dimensions.height, nextZoom, crop.offsetX, crop.offsetY);
          setZoom(nextZoom); setOffset({ x: next.offsetX, y: next.offsetY });
        }} />
    </label>
    {error && <p role="alert" className="mt-3 text-sm text-red-500">{error}</p>}
    <div className="mt-6 flex justify-end gap-3">
      <button type="button" disabled={saving} onClick={onCancel} className="rounded-xl border px-4 py-2 cursor-pointer">Hủy</button>
      <button type="button" disabled={!ready || saving} onClick={() => { void confirm(); }}
        className="rounded-xl px-4 py-2 cursor-pointer disabled:opacity-50"
        style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}>{saving ? 'Đang xử lý…' : 'Dùng ảnh này'}</button>
    </div>
  </dialog>;
}
