/**
 * Self-contained QR Code Generator (Byte Mode, Version 1-5, Error Correction Level M)
 * Generates standard QR matrices and SVG elements for URLs and verification strings.
 */

// GF(256) with primitive polynomial x^8 + x^4 + x^3 + x^2 + 1 (0x11d)
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_EXP[i + 255] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d;
  }
})();

function gfMul(x, y) {
  if (x === 0 || y === 0) return 0;
  return GF_EXP[GF_LOG[x] + GF_LOG[y]];
}

function rsGeneratorPoly(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    const root = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], root);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function rsCalculate(data, ecCount) {
  const gen = rsGeneratorPoly(ecCount);
  const remainder = new Array(ecCount).fill(0);

  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    remainder.shift();
    remainder.push(0);
    if (factor !== 0) {
      for (let j = 0; j < ecCount; j++) {
        remainder[j] ^= gfMul(gen[j], factor);
      }
    }
  }
  return remainder;
}

// Table for versions 1 to 5 (Byte Mode, EC Level M)
const VERSION_TABLE_M = {
  1: { size: 21, dataCap: 14, totalCw: 26, ecCw: 10, align: [] },
  2: { size: 25, dataCap: 26, totalCw: 44, ecCw: 16, align: [6, 18] },
  3: { size: 29, dataCap: 42, totalCw: 70, ecCw: 26, align: [6, 22] },
  4: { size: 33, dataCap: 62, totalCw: 100, ecCw: 36, align: [6, 26] },
  5: { size: 37, dataCap: 84, totalCw: 134, ecCw: 48, align: [6, 30] },
};

function selectVersion(textLength) {
  for (let v = 1; v <= 5; v++) {
    const { dataCap } = VERSION_TABLE_M[v];
    if (textLength + 3 <= dataCap) {
      return v;
    }
  }
  return 5;
}

export function generateQRCodeMatrix(text) {
  const bytes = new TextEncoder().encode(text);
  const version = selectVersion(bytes.length);
  const config = VERSION_TABLE_M[version];
  const { size, dataCap, ecCw, align } = config;

  // 1. Bit Stream
  const bits = [];
  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  // Byte mode indicator: 0100
  pushBits(0b0100, 4);
  // Character count (8 bits for v1-9)
  pushBits(bytes.length, 8);
  // Data bytes
  for (const b of bytes) {
    pushBits(b, 8);
  }
  // Terminator
  const maxBits = dataCap * 8;
  const termLen = Math.min(4, maxBits - bits.length);
  pushBits(0, termLen);

  // Pad to byte
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Pad bytes 0xEC, 0x11
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Codewords
  const dataCodewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bits[i + j];
    }
    dataCodewords.push(b);
  }

  // Error Correction
  const ecCodewords = rsCalculate(dataCodewords, ecCw);
  const allCodewords = [...dataCodewords, ...ecCodewords];

  // 2. Matrix Init
  const matrix = Array.from({ length: size }, () => Array(size).fill(null));
  const isFunction = Array.from({ length: size }, () => Array(size).fill(false));

  function setFunction(r, c, val) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val;
      isFunction[r][c] = true;
    }
  }

  // Finder pattern
  function placeFinder(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            setFunction(nr, nc, 1);
          } else {
            setFunction(nr, nc, 0);
          }
        } else {
          setFunction(nr, nc, 0);
        }
      }
    }
  }

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!isFunction[6][i]) setFunction(6, i, i % 2 === 0 ? 1 : 0);
    if (!isFunction[i][6]) setFunction(i, 6, i % 2 === 0 ? 1 : 0);
  }

  // Alignment patterns
  if (align.length > 0) {
    const coords = align;
    for (const ar of coords) {
      for (const ac of coords) {
        if (isFunction[ar][ac]) continue;
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
            const isCenter = r === 0 && c === 0;
            setFunction(ar + r, ac + c, isBorder || isCenter ? 1 : 0);
          }
        }
      }
    }
  }

  // Dark module
  setFunction(4 * version + 9, 8, 1);

  // Format info area reservation
  for (let i = 0; i < 9; i++) {
    if (!isFunction[8][i]) setFunction(8, i, 0);
    if (!isFunction[i][8]) setFunction(i, 8, 0);
  }
  for (let i = size - 8; i < size; i++) {
    if (!isFunction[8][i]) setFunction(8, i, 0);
    if (!isFunction[i][8]) setFunction(i, 8, 0);
  }

  // 3. Place Data Bits
  const fullBits = [];
  for (const cw of allCodewords) {
    for (let i = 7; i >= 0; i--) {
      fullBits.push((cw >> i) & 1);
    }
  }

  let bitIdx = 0;
  let upward = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing column
    const left = right - 1;

    const rowStart = upward ? size - 1 : 0;
    const rowEnd = upward ? -1 : size;
    const rowStep = upward ? -1 : 1;

    for (let r = rowStart; r !== rowEnd; r += rowStep) {
      for (const c of [right, left]) {
        if (!isFunction[r][c]) {
          const bit = bitIdx < fullBits.length ? fullBits[bitIdx++] : 0;
          // Apply standard mask 0: (row + col) % 2 === 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = mask ? bit ^ 1 : bit;
        }
      }
    }
    upward = !upward;
  }

  // 4. Format information: EC level M (00) + Mask 0 (000) = 00000 -> Format string 101010000010010
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  for (let i = 0; i < 6; i++) matrix[8][i] = formatBits[i];
  matrix[8][7] = formatBits[6];
  matrix[8][8] = formatBits[7];
  matrix[7][8] = formatBits[8];
  for (let i = 9; i < 15; i++) matrix[14 - i][8] = formatBits[i];

  for (let i = 0; i < 8; i++) matrix[size - 1 - i][8] = formatBits[i];
  for (let i = 8; i < 15; i++) matrix[8][size - 15 + i] = formatBits[i];

  return matrix;
}
