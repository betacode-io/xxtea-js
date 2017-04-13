export default class XXTEA {
  static DELTA = 0x9E3779B9;
  btoa = (str: string) => {
    const base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
    let buf, i, j, len, r, l, c;
    i = j = 0;
    len = str.length;
    r = len % 3;
    len = len - r;
    l = (len / 3) << 2;
    if (r > 0) {
      l += 4;
    }
    buf = new Array(l);

    while (i < len) {
      c = str.charCodeAt(i++) << 16 |
        str.charCodeAt(i++) << 8 |
        str.charCodeAt(i++);
      buf[j++] = base64EncodeChars[c >> 18] +
        base64EncodeChars[c >> 12 & 0x3f] +
        base64EncodeChars[c >> 6 & 0x3f] +
        base64EncodeChars[c & 0x3f];
    }
    if (r == 1) {
      c = str.charCodeAt(i++);
      buf[j++] = base64EncodeChars[c >> 2] +
        base64EncodeChars[(c & 0x03) << 4] +
        "==";
    }
    else if (r == 2) {
      c = str.charCodeAt(i++) << 8 |
        str.charCodeAt(i++);
      buf[j++] = base64EncodeChars[c >> 10] +
        base64EncodeChars[c >> 4 & 0x3f] +
        base64EncodeChars[(c & 0x0f) << 2] +
        "=";
    }
    return buf.join('');
  }

  atob = (str: string) => {
    const base64DecodeChars = [
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
      52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
      -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
      15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
      -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
      41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
    ];

    let c1, c2, c3, c4;
    let i, j, len, r, l, out;

    len = str.length;
    if (len % 4 !== 0) {
      return '';
    }
    if (/[^ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789\+\/\=]/.test(str)) {
      return '';
    }
    if (str.charAt(len - 2) == '=') {
      r = 1;
    }
    else if (str.charAt(len - 1) == '=') {
      r = 2;
    }
    else {
      r = 0;
    }
    l = len;
    if (r > 0) {
      l -= 4;
    }
    l = (l >> 2) * 3 + r;
    out = new Array(l);

    i = j = 0;
    while (i < len) {
      // c1
      c1 = base64DecodeChars[str.charCodeAt(i++)];
      if (c1 == -1) break;

      // c2
      c2 = base64DecodeChars[str.charCodeAt(i++)];
      if (c2 == -1) break;

      out[j++] = String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

      // c3
      c3 = base64DecodeChars[str.charCodeAt(i++)];
      if (c3 == -1) break;

      out[j++] = String.fromCharCode(((c2 & 0x0f) << 4) | ((c3 & 0x3c) >> 2));

      // c4
      c4 = base64DecodeChars[str.charCodeAt(i++)];
      if (c4 == -1) break;

      out[j++] = String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out.join('');
  }

  toBinaryString(v, includeLength: boolean) {
    const length = v.length;
    let n = length << 2;
    if (includeLength) {
      const m = v[length - 1];
      n -= 4;
      if ((m < n - 3) || (m > n)) {
        return null;
      }
      n = m;
    }
    for (let i = 0; i < length; i++) {
      v[i] = String.fromCharCode(
        v[i] & 0xFF,
        v[i] >>> 8 & 0xFF,
        v[i] >>> 16 & 0xFF,
        v[i] >>> 24 & 0xFF
      );
    }
    const result = v.join('');
    if (includeLength) {
      return result.substring(0, n);
    }
    return result;
  }

  toUint32Array(bs, includeLength: boolean) {
    const length = bs.length;
    let n = length >> 2;
    if ((length & 3) !== 0) {
      ++n;
    }
    let v;
    if (includeLength) {
      v = new Array(n + 1);
      v[n] = length;
    }
    else {
      v = new Array(n);
    }
    for (let i = 0; i < length; ++i) {
      v[i >> 2] |= bs.charCodeAt(i) << ((i & 3) << 3);
    }
    return v;
  }

  int32(i) {
    return i & 0xFFFFFFFF;
  }

  mx(sum, y, z, p, e, k) {
    return ((z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4)) ^ ((sum ^ y) + (k[p & 3 ^ e] ^ z));
  }

  fixk(k) {
    if (k.length < 4) k.length = 4;
    return k;
  }

  encryptUint32Array(v, k) {
    const length = v.length;
    const n = length - 1;
    let y, z, sum, e, p, q;
    z = v[n];
    sum = 0;
    for (q = Math.floor(6 + 52 / length) | 0; q > 0; --q) {
      sum = this.int32(sum + XXTEA.DELTA);
      e = sum >>> 2 & 3;
      for (p = 0; p < n; ++p) {
        y = v[p + 1];
        z = v[p] = this.int32(v[p] + this.mx(sum, y, z, p, e, k));
      }
      y = v[0];
      z = v[n] = this.int32(v[n] + this.mx(sum, y, z, n, e, k));
    }
    return v;
  }
  decryptUint32Array(v, k) {
    const length = v.length;
    const n = length - 1;
    let y, z, sum, e, p, q;
    y = v[0];
    q = Math.floor(6 + 52 / length);
    for (sum = this.int32(q * XXTEA.DELTA); sum !== 0; sum = this.int32(sum - XXTEA.DELTA)) {
      e = sum >>> 2 & 3;
      for (p = n; p > 0; --p) {
        z = v[p - 1];
        y = v[p] = this.int32(v[p] - this.mx(sum, y, z, p, e, k));
      }
      z = v[n];
      y = v[0] = this.int32(v[0] - this.mx(sum, y, z, 0, e, k));
    }
    return v;
  }
  utf8Encode(str: string) {
    if (/^[\x00-\x7f]*$/.test(str)) {
      return str;
    }
    const buf = [];
    const n = str.length;
    for (let i = 0, j = 0; i < n; ++i, ++j) {
      const codeUnit = str.charCodeAt(i);
      if (codeUnit < 0x80) {
        buf[j] = str.charAt(i);
      }
      else if (codeUnit < 0x800) {
        buf[j] = String.fromCharCode(0xC0 | (codeUnit >> 6),
          0x80 | (codeUnit & 0x3F));
      }
      else if (codeUnit < 0xD800 || codeUnit > 0xDFFF) {
        buf[j] = String.fromCharCode(0xE0 | (codeUnit >> 12),
          0x80 | ((codeUnit >> 6) & 0x3F),
          0x80 | (codeUnit & 0x3F));
      }
      else {
        if (i + 1 < n) {
          const nextCodeUnit = str.charCodeAt(i + 1);
          if (codeUnit < 0xDC00 && 0xDC00 <= nextCodeUnit && nextCodeUnit <= 0xDFFF) {
            const rune = (((codeUnit & 0x03FF) << 10) | (nextCodeUnit & 0x03FF)) + 0x010000;
            buf[j] = String.fromCharCode(0xF0 | ((rune >> 18) & 0x3F),
              0x80 | ((rune >> 12) & 0x3F),
              0x80 | ((rune >> 6) & 0x3F),
              0x80 | (rune & 0x3F));
            ++i;
            continue;
          }
        }
        throw new Error('Malformed string');
      }
    }
    return buf.join('');
  }

  utf8DecodeShortString(bs, n) {
    const charCodes = new Array(n);
    let i = 0, off = 0;
    for (const len = bs.length; i < n && off < len; i++) {
      const unit = bs.charCodeAt(off++);
      switch (unit >> 4) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
          charCodes[i] = unit;
          break;
        case 12:
        case 13:
          if (off < len) {
            charCodes[i] = ((unit & 0x1F) << 6) |
              (bs.charCodeAt(off++) & 0x3F);
          }
          else {
            throw new Error('Unfinished UTF-8 octet sequence');
          }
          break;
        case 14:
          if (off + 1 < len) {
            charCodes[i] = ((unit & 0x0F) << 12) |
              ((bs.charCodeAt(off++) & 0x3F) << 6) |
              (bs.charCodeAt(off++) & 0x3F);
          }
          else {
            throw new Error('Unfinished UTF-8 octet sequence');
          }
          break;
        case 15:
          if (off + 2 < len) {
            const rune = (((unit & 0x07) << 18) |
              ((bs.charCodeAt(off++) & 0x3F) << 12) |
              ((bs.charCodeAt(off++) & 0x3F) << 6) |
              (bs.charCodeAt(off++) & 0x3F)) - 0x10000;
            if (0 <= rune && rune <= 0xFFFFF) {
              charCodes[i++] = (((rune >> 10) & 0x03FF) | 0xD800);
              charCodes[i] = ((rune & 0x03FF) | 0xDC00);
            }
            else {
              throw new Error('Character outside valid Unicode range: 0x' + rune.toString(16));
            }
          }
          else {
            throw new Error('Unfinished UTF-8 octet sequence');
          }
          break;
        default:
          throw new Error('Bad UTF-8 encoding 0x' + unit.toString(16));
      }
    }
    if (i < n) {
      charCodes.length = i;
    }
    return String.fromCharCode.apply(String, charCodes);
  }

  utf8DecodeLongString(bs, n) {
    const buf = [];
    const charCodes = new Array(0x8000);
    let i = 0, off = 0;
    for (const len = bs.length; i < n && off < len; i++) {
      const unit = bs.charCodeAt(off++);
      switch (unit >> 4) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
          charCodes[i] = unit;
          break;
        case 12:
        case 13:
          if (off < len) {
            charCodes[i] = ((unit & 0x1F) << 6) |
              (bs.charCodeAt(off++) & 0x3F);
          }
          else {
            throw new Error('Unfinished UTF-8 octet sequence');
          }
          break;
        case 14:
          if (off + 1 < len) {
            charCodes[i] = ((unit & 0x0F) << 12) |
              ((bs.charCodeAt(off++) & 0x3F) << 6) |
              (bs.charCodeAt(off++) & 0x3F);
          }
          else {
            throw new Error('Unfinished UTF-8 octet sequence');
          }
          break;
        case 15:
          if (off + 2 < len) {
            const rune = (((unit & 0x07) << 18) |
              ((bs.charCodeAt(off++) & 0x3F) << 12) |
              ((bs.charCodeAt(off++) & 0x3F) << 6) |
              (bs.charCodeAt(off++) & 0x3F)) - 0x10000;
            if (0 <= rune && rune <= 0xFFFFF) {
              charCodes[i++] = (((rune >> 10) & 0x03FF) | 0xD800);
              charCodes[i] = ((rune & 0x03FF) | 0xDC00);
            }
            else {
              throw new Error('Character outside valid Unicode range: 0x' + rune.toString(16));
            }
          }
          else {
            throw new Error('Unfinished UTF-8 octet sequence');
          }
          break;
        default:
          throw new Error('Bad UTF-8 encoding 0x' + unit.toString(16));
      }
      if (i >= 0x7FFF - 1) {
        const size = i + 1;
        charCodes.length = size;
        buf[buf.length] = String.fromCharCode.apply(String, charCodes);
        n -= size;
        i = -1;
      }
    }
    if (i > 0) {
      charCodes.length = i;
      buf[buf.length] = String.fromCharCode.apply(String, charCodes);
    }
    return buf.join('');
  }

  // n is UTF16 length
  utf8Decode(bs, n) {
    if (n === undefined || n === null || (n < 0)) n = bs.length;
    if (n === 0) return '';
    if (/^[\x00-\x7f]*$/.test(bs) || !(/^[\x00-\xff]*$/.test(bs))) {
      if (n === bs.length) return bs;
      return bs.substr(0, n);
    }
    return ((n < 0xFFFF) ?
      this.utf8DecodeShortString(bs, n) :
      this.utf8DecodeLongString(bs, n));
  }

  encrypt(data, key: string) {
    if (data === undefined || data === null || data.length === 0) {
      return data;
    }
    data = this.utf8Encode(data);
    key = this.utf8Encode(key);
    return this.toBinaryString(this.encryptUint32Array(this.toUint32Array(data, true), this.fixk(this.toUint32Array(key, false))), false);
  }

  encryptToBase64(data, key: string) {
    return this.btoa(this.encrypt(data, key));
  }

  decrypt(data, key) {
    if (data === undefined || data === null || data.length === 0) {
      return data;
    }
    key = this.utf8Encode(key);
    return this.utf8Decode(this.toBinaryString(this.decryptUint32Array(this.toUint32Array(data, false), this.fixk(this.toUint32Array(key, false))), true), null);
  }

  decryptFromBase64(data, key) {
    if (data === undefined || data === null || data.length === 0) {
      return data;
    }
    return this.decrypt(this.atob(data), key);
  }
}
