import { getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { NhlApiProvider } from '../providers/NhlApiProvider.js'
import { createFirestoreStore } from './firestoreClient.js'
import { pollTodayGame } from './pollTodayGame.js'

const app = getApps().length > 0 ? getApps()[0] : initializeApp()
const db = getFirestore(app)

export const bruinsLivePollTodayGame = onSchedule(
  { schedule: 'every 5 minutes', timeZone: 'America/New_York' },
  async () => {
    const provider = new NhlApiProvider()
    const store = createFirestoreStore(db)
    await pollTodayGame({ provider, store })
  },
)
