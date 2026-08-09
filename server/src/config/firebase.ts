import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import dotenv from 'dotenv';
dotenv.config();

if (!getApps().length) {
  initializeApp({
    storageBucket: 'sparkcelebrationsbh.firebasestorage.app'
  });
}

export const bucket = getStorage().bucket();
