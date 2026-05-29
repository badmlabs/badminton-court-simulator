const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function bytesToBase64(bytes: Uint8Array): string {
  let output = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triple = (a << 16) | (b << 8) | c;
    output += BASE64_CHARS[(triple >> 18) & 63];
    output += BASE64_CHARS[(triple >> 12) & 63];
    output += i + 1 < bytes.length ? BASE64_CHARS[(triple >> 6) & 63] : '=';
    output += i + 2 < bytes.length ? BASE64_CHARS[triple & 63] : '=';
  }
  return output;
}

function base64ToBytes(base64: string): Uint8Array {
  const normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0;
  const length = Math.floor((normalized.length * 3) / 4) - padding;
  const bytes = new Uint8Array(length);
  let byteIndex = 0;

  for (let i = 0; i < normalized.length; i += 4) {
    const enc1 = BASE64_CHARS.indexOf(normalized[i]);
    const enc2 = BASE64_CHARS.indexOf(normalized[i + 1]);
    const enc3 = normalized[i + 2] === '=' ? 0 : BASE64_CHARS.indexOf(normalized[i + 2]);
    const enc4 = normalized[i + 3] === '=' ? 0 : BASE64_CHARS.indexOf(normalized[i + 3]);
    const triple = (enc1 << 18) | (enc2 << 12) | (enc3 << 6) | enc4;
    if (byteIndex < length) bytes[byteIndex++] = (triple >> 16) & 255;
    if (byteIndex < length) bytes[byteIndex++] = (triple >> 8) & 255;
    if (byteIndex < length) bytes[byteIndex++] = triple & 255;
  }
  return bytes;
}

export function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function decodeBase64Url(value: string): string {
  const bytes = base64ToBytes(value);
  return new TextDecoder().decode(bytes);
}
