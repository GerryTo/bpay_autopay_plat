/**
 * AES Counter mode implementation
 * Based on Chris Veness AES-CTR implementation
 * http://www.movable-type.co.uk/scripts/aes.html
 */

/**
 * AES class for basic AES operations
 */
const Aes = {
  cipher: function(input, w) {
    const Nb = 4;
    const Nr = w.length / Nb - 1;

    let state = [[], [], [], []];
    for (let i = 0; i < 4 * Nb; i++) state[i % 4][Math.floor(i / 4)] = input[i];

    state = this.addRoundKey(state, w, 0, Nb);

    for (let round = 1; round < Nr; round++) {
      state = this.subBytes(state, Nb);
      state = this.shiftRows(state, Nb);
      state = this.mixColumns(state, Nb);
      state = this.addRoundKey(state, w, round, Nb);
    }

    state = this.subBytes(state, Nb);
    state = this.shiftRows(state, Nb);
    state = this.addRoundKey(state, w, Nr, Nb);

    const output = new Array(4 * Nb);
    for (let i = 0; i < 4 * Nb; i++) output[i] = state[i % 4][Math.floor(i / 4)];

    return output;
  },

  keyExpansion: function(key) {
    const Nb = 4;
    const Nk = key.length / 4;
    const Nr = Nk + 6;

    const w = new Array(Nb * (Nr + 1));
    let temp = new Array(4);

    for (let i = 0; i < Nk; i++) {
      const r = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
      w[i] = r;
    }

    for (let i = Nk; i < (Nb * (Nr + 1)); i++) {
      w[i] = new Array(4);
      for (let t = 0; t < 4; t++) temp[t] = w[i - 1][t];

      if (i % Nk == 0) {
        temp = this.subWord(this.rotWord(temp));
        for (let t = 0; t < 4; t++) temp[t] ^= this.rCon[i / Nk][t];
      } else if (Nk > 6 && i % Nk == 4) {
        temp = this.subWord(temp);
      }

      for (let t = 0; t < 4; t++) w[i][t] = w[i - Nk][t] ^ temp[t];
    }

    return w;
  },

  subBytes: function(s, Nb) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < Nb; c++) s[r][c] = this.sBox[s[r][c]];
    }
    return s;
  },

  shiftRows: function(s, Nb) {
    const t = new Array(4);
    for (let r = 1; r < 4; r++) {
      for (let c = 0; c < 4; c++) t[c] = s[r][(c + r) % Nb];
      for (let c = 0; c < 4; c++) s[r][c] = t[c];
    }
    return s;
  },

  mixColumns: function(s, Nb) {
    for (let c = 0; c < 4; c++) {
      const a = new Array(4);
      const b = new Array(4);

      for (let i = 0; i < 4; i++) {
        a[i] = s[i][c];
        b[i] = s[i][c] & 0x80 ? s[i][c] << 1 ^ 0x011b : s[i][c] << 1;
      }

      s[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3];
      s[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3];
      s[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3];
      s[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3];
    }

    return s;
  },

  addRoundKey: function(state, w, rnd, Nb) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < Nb; c++) state[r][c] ^= w[rnd * 4 + c][r];
    }
    return state;
  },

  subWord: function(w) {
    for (let i = 0; i < 4; i++) w[i] = this.sBox[w[i]];
    return w;
  },

  rotWord: function(w) {
    const tmp = w[0];
    for (let i = 0; i < 3; i++) w[i] = w[i + 1];
    w[3] = tmp;
    return w;
  },

  sBox: [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
  ],

  rCon: [
    [0x00, 0x00, 0x00, 0x00],
    [0x01, 0x00, 0x00, 0x00],
    [0x02, 0x00, 0x00, 0x00],
    [0x04, 0x00, 0x00, 0x00],
    [0x08, 0x00, 0x00, 0x00],
    [0x10, 0x00, 0x00, 0x00],
    [0x20, 0x00, 0x00, 0x00],
    [0x40, 0x00, 0x00, 0x00],
    [0x80, 0x00, 0x00, 0x00],
    [0x1b, 0x00, 0x00, 0x00],
    [0x36, 0x00, 0x00, 0x00]
  ]
};

/**
 * AES Counter Mode
 */
export const AesCtr = {
  encrypt: function(plaintext, password, nBits) {
    const blockSize = 16;
    if (!(nBits === 128 || nBits === 192 || nBits === 256)) return '';
    plaintext = String(plaintext);
    password = String(password);

    const nBytes = nBits / 8;
    const pwBytes = new Array(nBytes);
    for (let i = 0; i < nBytes; i++) {
      pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
    }
    let key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));
    key = key.concat(key.slice(0, nBytes - 16));

    const counterBlock = new Array(blockSize);
    const nonce = (new Date()).getTime();
    const nonceMs = nonce % 1000;
    const nonceSec = Math.floor(nonce / 1000);
    const nonceRnd = Math.floor(Math.random() * 0xffff);

    for (let i = 0; i < 2; i++) counterBlock[i] = (nonceMs >>> i * 8) & 0xff;
    for (let i = 0; i < 2; i++) counterBlock[i + 2] = (nonceRnd >>> i * 8) & 0xff;
    for (let i = 0; i < 4; i++) counterBlock[i + 4] = (nonceSec >>> i * 8) & 0xff;

    let ctrTxt = '';
    for (let i = 0; i < 8; i++) ctrTxt += String.fromCharCode(counterBlock[i]);

    const keySchedule = Aes.keyExpansion(key);

    const blockCount = Math.ceil(plaintext.length / blockSize);
    const ciphertxt = new Array(blockCount);

    for (let b = 0; b < blockCount; b++) {
      for (let c = 0; c < 4; c++) counterBlock[15 - c] = (b >>> c * 8) & 0xff;
      for (let c = 0; c < 4; c++) counterBlock[15 - c - 4] = (b / 0x100000000 >>> c * 8);

      const cipherCntr = Aes.cipher(counterBlock, keySchedule);

      const blockLength = b < blockCount - 1 ? blockSize : (plaintext.length - 1) % blockSize + 1;
      const cipherChar = new Array(blockLength);

      for (let i = 0; i < blockLength; i++) {
        cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b * blockSize + i);
        cipherChar[i] = String.fromCharCode(cipherChar[i]);
      }
      ciphertxt[b] = cipherChar.join('');
    }

    let ciphertext = ctrTxt + ciphertxt.join('');
    ciphertext = btoa(ciphertext);
    return ciphertext;
  },

  decrypt: function(ciphertext, password, nBits) {
    const blockSize = 16;

    if (!(nBits == 128 || nBits == 192 || nBits == 256)) return '';

    ciphertext = atob(ciphertext);

    const nBytes = nBits / 8;
    const pwBytes = new Array(nBytes);
    for (let i = 0; i < nBytes; i++) {
      pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
    }
    let key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));
    key = key.concat(key.slice(0, nBytes - 16));

    const counterBlock = new Array(blockSize);
    const ctrTxt = ciphertext.slice(0, 8);
    for (let i = 0; i < 8; i++) counterBlock[i] = ctrTxt.charCodeAt(i);

    const keySchedule = Aes.keyExpansion(key);

    const nBlocks = Math.ceil((ciphertext.length - 8) / blockSize);
    const ct = new Array(nBlocks);
    for (let b = 0; b < nBlocks; b++) ct[b] = ciphertext.slice(8 + b * blockSize, 8 + b * blockSize + blockSize);
    const ciphertext_arr = ct;

    const plaintxt = new Array(ciphertext_arr.length);

    for (let b = 0; b < nBlocks; b++) {
      for (let c = 0; c < 4; c++) counterBlock[15 - c] = (b >>> c * 8) & 0xff;
      for (let c = 0; c < 4; c++) counterBlock[15 - c - 4] = (((b + 1) / 0x100000000 - 1) >>> c * 8) & 0xff;

      const cipherCntr = Aes.cipher(counterBlock, keySchedule);

      const plaintxtByte = new Array(ciphertext_arr[b].length);
      for (let i = 0; i < ciphertext_arr[b].length; i++) {
        plaintxtByte[i] = cipherCntr[i] ^ ciphertext_arr[b].charCodeAt(i);
        plaintxtByte[i] = String.fromCharCode(plaintxtByte[i]);
      }
      plaintxt[b] = plaintxtByte.join('');
    }

    const plaintext = plaintxt.join('');

    return plaintext;
  }
};

export default AesCtr;
