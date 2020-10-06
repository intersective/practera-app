import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})

export class NativeStorageService {
  constructor(private storage: Storage) {}

  async setObject(key, value) {
    try {
      const result = await this.storage.set(key, value);
      return result;
    } catch (err) {
      return err;
    }
  }

  async getObject(key) {
    try {
      const result = await this.storage.get(key);
      return result;
    } catch (err) {
      return err;
    }
  }

  async remove(key) {
    try {
      const result = await this.storage.remove(key);
      return result;
    } catch (err) {
      return err;
    }
  }

  async keys() {
    try {
      const { keys } = await this.storage.keys();
      console.log('Got keys: ', keys);
    } catch (err) {
      return err;
    }
  }

  async clear() {
    try {
      const cleared = await this.storage.clear();
      return cleared;
    } catch (err) {
      return err;
    }
  }
}
