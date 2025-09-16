import { existsSync, promises } from "fs";

const OFFSET_LENGTH = 4;
const FILEPATH_DAFAULT = "data.db";

export class LunaDB {
  #file = FILEPATH_DAFAULT;
  #index = new Map();

  constructor(file = FILEPATH_DAFAULT) {
    this.#file = file;
    this.#index = new Map();
  }

  async load() {
    if (!this.#fileExists()) return;

    const data = await promises.readFile(this.#file);
    let offset = 0;

    while (offset < data.length) {
      const tomb = data.readUInt8(offset); offset += 1;

      const keyLen = data.readUInt32BE(offset); offset += OFFSET_LENGTH;
      const key = data.subarray(offset, offset + keyLen).toString();
      offset += keyLen;

      const valLen = data.readUInt32BE(offset); offset += OFFSET_LENGTH;
      const value = data.subarray(offset, offset + valLen).toString();
      offset += valLen;

      if (tomb === 1) this.#index.delete(key);
      else this.#index.set(key, value);
    }
  }

  async put(key, value) {
    const buf = this.#write(key, value);

    await promises.appendFile(this.#file, buf);
    this.#index.set(key, value);
  }

  async del(key) {
    this.#index.delete(key);
  }

  get(key) {
    return this.#index.get(key) ?? null;
  }

  listAll() {
    return Array.from(this.#index.values());
  }

  async compact() {
    if (!this.#fileExists()) return;

    const tempFile = this.#file + ".tmp";
    const file = await promises.open(tempFile, "w");

    for (const [key, value] of this.#index) {
      const buf = this.#write(key, value);
      await file.write(buf);
    }

    await file.close();
    await promises.rename(tempFile, this.#file);
  }

  #fileExists() {
    return existsSync(this.#file);
  }

  #write(key, value) {
    const keyBuf = Buffer.from(key);
    const valBuf = Buffer.from(value);

    const buf = Buffer.alloc(1 + OFFSET_LENGTH + keyBuf.length + OFFSET_LENGTH + valBuf.length);
    buf.writeUInt8(0, 0);
    buf.writeUInt32BE(keyBuf.length, 1);
    keyBuf.copy(buf, OFFSET_LENGTH + 1);
    buf.writeUInt32BE(valBuf.length, OFFSET_LENGTH + 1 + keyBuf.length);
    valBuf.copy(buf, OFFSET_LENGTH * 2 + 1 + keyBuf.length);

    return buf;
  }
}
