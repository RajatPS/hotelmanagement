import { useMemo } from 'react';
import { generateQRCodeMatrix } from '../utils/qrCode.js';

export default function BookingQRCode({ bookingId, size = 160 }) {
  const verificationUrl = useMemo(() => {
    if (typeof window === 'undefined') return `/verify-booking?id=${bookingId}`;
    return `${window.location.origin}/verify-booking?id=${encodeURIComponent(bookingId)}`;
  }, [bookingId]);

  const matrix = useMemo(() => {
    try {
      return generateQRCodeMatrix(verificationUrl);
    } catch (e) {
      console.error('Failed to generate QR matrix:', e);
      return [];
    }
  }, [verificationUrl]);

  if (!matrix.length) return null;

  const matrixSize = matrix.length;
  const padding = 2;
  const totalUnits = matrixSize + padding * 2;
  const cellSize = size / totalUnits;

  let pathData = '';
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c] === 1) {
        const x = (c + padding) * cellSize;
        const y = (r + padding) * cellSize;
        pathData += `M${x.toFixed(1)},${y.toFixed(1)}h${cellSize.toFixed(1)}v${cellSize.toFixed(1)}h-${cellSize.toFixed(1)}z `;
      }
    }
  }

  return (
    <div className="flex flex-col items-center rounded-xl border border-[#e9e4d7] bg-[#faf8f3] p-5 text-center">
      <div className="rounded-lg bg-white p-3 shadow-sm">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          role="img"
          aria-label={`QR verification code for reservation ${bookingId}`}
          className="block"
        >
          <rect width="100%" height="100%" fill="#ffffff" />
          <path d={pathData} fill="#292821" />
        </svg>
      </div>

      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8b7242]">
        Official Digital Voucher
      </p>
      <p className="mt-1 text-xs text-[#77746c]">
        Scan to verify reservation authenticity on our secure portal
      </p>

      <a
        href={verificationUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#8b7242] underline decoration-[#8b7242]/40 transition-colors hover:text-[#292821]"
      >
        <span>Open Verification Page</span>
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
