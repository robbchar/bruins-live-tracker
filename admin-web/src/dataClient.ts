import type { FirebaseOptions } from 'firebase/app'
import { initializeApp } from 'firebase/app'
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
  type Firestore,
} from 'firebase/firestore/lite'
import type { PublicConfig, TodayState } from './types'

export type SetChannelOverrideInput = {
  dateKey: string
  channelOverride: string
  channelOverrideNote: string | null
  effectiveChannel: string
}

export type ClearChannelOverrideInput = {
  dateKey: string
  effectiveChannel: string
}

export type DataClient = {
  getPublicConfig: () => Promise<PublicConfig>
  getTodayState: (dateKey: string) => Promise<TodayState>
  setChannelOverride: (input: SetChannelOverrideInput) => Promise<void>
  clearChannelOverride: (input: ClearChannelOverrideInput) => Promise<void>
}

const getRequiredEnv = (key: string) => {
  const value = import.meta.env[key] as string | undefined
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

const getFirebaseConfig = (): FirebaseOptions => ({
  apiKey: getRequiredEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getRequiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getRequiredEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getRequiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getRequiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getRequiredEnv('VITE_FIREBASE_APP_ID'),
  measurementId: getRequiredEnv('VITE_FIREBASE_MEASUREMENT_ID'),
})

let firestore: Firestore | null = null

const getDb = () => {
  if (!firestore) {
    const app = initializeApp(getFirebaseConfig())
    firestore = getFirestore(app)
  }
  return firestore
}

export const dataClient: DataClient = {
  async getPublicConfig() {
    const db = getDb()
    const snapshot = await getDoc(
      doc(db, 'bruinsLive', 'app', 'config', 'public'),
    )
    if (!snapshot.exists()) {
      throw new Error('Missing /bruinsLive/app/config/public')
    }
    return snapshot.data() as PublicConfig
  },
  async getTodayState(dateKey) {
    const db = getDb()
    const snapshot = await getDoc(
      doc(db, 'bruinsLive', 'app', 'today', dateKey),
    )
    if (!snapshot.exists()) {
      throw new Error(`Missing /bruinsLive/app/today/${dateKey}`)
    }
    return snapshot.data() as TodayState
  },
  async setChannelOverride({
    dateKey,
    channelOverride,
    channelOverrideNote,
    effectiveChannel,
  }) {
    const db = getDb()
    await setDoc(
      doc(db, 'bruinsLive', 'app', 'today', dateKey),
      {
        channelOverride,
        channelOverrideNote,
        effectiveChannel,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    )
  },
  async clearChannelOverride({ dateKey, effectiveChannel }) {
    const db = getDb()
    await setDoc(
      doc(db, 'bruinsLive', 'app', 'today', dateKey),
      {
        channelOverride: null,
        channelOverrideNote: null,
        effectiveChannel,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    )
  },
}
