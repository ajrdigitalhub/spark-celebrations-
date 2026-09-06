import { initializeApp, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import dotenv from 'dotenv';
dotenv.config();

export function getBucket() {
  if (!getApps().length) {
    initializeApp({
      storageBucket: 'sparkcelebrationsbh.firebasestorage.app'
    });
  }
  return getStorage().bucket();
}

export const bucket = new Proxy({} as ReturnType<typeof getStorage>['prototype']['bucket'], {
  get(_target, prop) {
    const b = getBucket();
    const val = (b as any)[prop];
    return typeof val === 'function' ? val.bind(b) : val;
  }
});

