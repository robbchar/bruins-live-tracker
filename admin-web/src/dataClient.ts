import type { FirebaseApp, FirebaseOptions } from 'firebase/app'
import { initializeApp } from 'firebase/app'
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
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
  onAuthStateChanged: (listener: (user: AuthUser | null) => void) => () => void
  signInWithEmailPassword: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
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

export type AuthUser = {
  email: string | null
}

let app: FirebaseApp | null = null
let firestore: Firestore | null = null
let authReady = false

const getApp = () => {
  if (!app) {
    app = initializeApp(getFirebaseConfig())
  }
  return app
}

const ensureAuthPersistence = async () => {
  if (authReady) return
  const auth = getAuth(getApp())
  await setPersistence(auth, browserLocalPersistence)
  authReady = true
}

const getDb = () => {
  if (!firestore) {
    firestore = getFirestore(getApp())
  }
  return firestore
}

export const dataClient: DataClient = {
  onAuthStateChanged(listener) {
    void ensureAuthPersistence()
    const auth = getAuth(getApp())
    return onAuthStateChanged(auth, (user) => {
      listener(user ? { email: user.email } : null)
    })
  },
  async signInWithEmailPassword(email, password) {
    await ensureAuthPersistence()
    const auth = getAuth(getApp())
    await signInWithEmailAndPassword(auth, email, password)
  },
  async signInWithGoogle() {
    await ensureAuthPersistence()
    const auth = getAuth(getApp())
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  },
  async signOut() {
    const auth = getAuth(getApp())
    await signOut(auth)
  },
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
