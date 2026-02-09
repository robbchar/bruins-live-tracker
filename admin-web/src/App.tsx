import { type FormEvent, useEffect, useState } from 'react'
import './App.css'
import { dataClient as defaultClient } from './dataClient'
import type { PublicConfig, TodayState } from './types'
import type { AuthUser, DataClient } from './dataClient'

type LoadState = {
  config: PublicConfig | null
  today: TodayState | null
}

type AppProps = {
  client?: DataClient
}

const getTodayKey = (timezone: string, date: Date = new Date()) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = formatter.formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value
  if (!year || !month || !day) {
    throw new Error('Unable to compute date key')
  }
  return `${year}-${month}-${day}`
}

const computeEffectiveChannel = (
  defaultChannel: string,
  channelOverride: string | null,
) => channelOverride?.trim() || defaultChannel

function App({ client = defaultClient }: AppProps) {
  const [loadState, setLoadState] = useState<LoadState>({
    config: null,
    today: null,
  })
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [channelOverride, setChannelOverride] = useState('')
  const [channelOverrideNote, setChannelOverrideNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    const unsubscribe = client.onAuthStateChanged((user) => {
      setAuthUser(user)
      setAuthReady(true)
      setAuthError(null)
    })
    return () => unsubscribe()
  }, [client])

  useEffect(() => {
    if (!authUser) {
      setLoadState({ config: null, today: null })
      return
    }
    let isMounted = true
    const load = async () => {
      const config = await client.getPublicConfig()
      const dateKey = getTodayKey(config.timezone)
      const today = await client.getTodayState(dateKey)
      if (!isMounted) return
      setLoadState({ config, today })
      setChannelOverride(today.channelOverride ?? '')
      setChannelOverrideNote(today.channelOverrideNote ?? '')
    }
    void load()
    return () => {
      isMounted = false
    }
  }, [client, authUser])

  const handleEmailSignIn = async (event: FormEvent) => {
    event.preventDefault()
    setIsSigningIn(true)
    setAuthError(null)
    try {
      await client.signInWithEmailPassword(email, password)
    } catch {
      setAuthError('Unable to sign in with email and password.')
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true)
    setAuthError(null)
    try {
      await client.signInWithGoogle()
    } catch {
      setAuthError('Unable to sign in with Google.')
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSignOut = async () => {
    await client.signOut()
  }

  const handleSave = async () => {
    if (!loadState.config || !loadState.today) return
    const trimmedOverride = channelOverride.trim()
    if (!trimmedOverride) return
    const effectiveChannel = computeEffectiveChannel(
      loadState.config.defaultChannel,
      trimmedOverride,
    )

    setIsSaving(true)
    await client.setChannelOverride({
      dateKey: loadState.today.dateKey,
      channelOverride: trimmedOverride,
      channelOverrideNote: channelOverrideNote.trim() || null,
      effectiveChannel,
    })
    setLoadState((prev) =>
      prev.today
        ? {
            ...prev,
            today: {
              ...prev.today,
              channelOverride: trimmedOverride,
              channelOverrideNote: channelOverrideNote.trim() || null,
              effectiveChannel,
            },
          }
        : prev,
    )
    setIsSaving(false)
  }

  const handleClear = async () => {
    if (!loadState.config || !loadState.today) return
    const effectiveChannel = computeEffectiveChannel(
      loadState.config.defaultChannel,
      null,
    )
    setIsClearing(true)
    await client.clearChannelOverride({
      dateKey: loadState.today.dateKey,
      effectiveChannel,
    })
    setLoadState((prev) =>
      prev.today
        ? {
            ...prev,
            today: {
              ...prev.today,
              channelOverride: null,
              channelOverrideNote: null,
              effectiveChannel,
            },
          }
        : prev,
    )
    setChannelOverride('')
    setChannelOverrideNote('')
    setIsClearing(false)
  }

  if (!authReady) {
    return (
      <main className="app">
        <h1>Bruins Live Admin</h1>
        <p>Loading…</p>
      </main>
    )
  }

  if (!authUser) {
    return (
      <main className="app">
        <h1>Bruins Live Admin</h1>
        <section className="card">
          <h2>Sign in</h2>
          <p>Sign in to manage Bruins Live overrides.</p>
          <form className="auth-form" onSubmit={handleEmailSignIn}>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {authError ? <p className="error">{authError}</p> : null}
            <div className="actions">
              <button type="submit" disabled={isSigningIn}>
                {isSigningIn ? 'Signing in…' : 'Sign in'}
              </button>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
              >
                Sign in with Google
              </button>
            </div>
          </form>
        </section>
      </main>
    )
  }

  if (!loadState.config || !loadState.today) {
    return (
      <main className="app">
        <h1>Bruins Live Admin</h1>
        <p>Loading…</p>
      </main>
    )
  }

  return (
    <main className="app">
      <div className="header">
        <div>
          <h1>Bruins Live Admin</h1>
          <p className="subtitle">{authUser.email ?? 'Signed in'}</p>
        </div>
        <button type="button" className="link-button" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
      <section className="card">
        <h2>Channels</h2>
        <p>
          Default channel:{' '}
          <strong>
            {loadState.config.channelLabel} {loadState.config.defaultChannel}
          </strong>
        </p>
        <p>
          Effective channel:{' '}
          <strong>
            {loadState.config.channelLabel} {loadState.today.effectiveChannel}
          </strong>
        </p>
      </section>

      <section className="card">
        <h2>Override</h2>
        <label className="field">
          <span>Channel override</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="91"
            value={channelOverride}
            onChange={(event) => setChannelOverride(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Override note</span>
          <input
            type="text"
            placeholder="Optional note"
            value={channelOverrideNote}
            onChange={(event) => setChannelOverrideNote(event.target.value)}
          />
        </label>
        <div className="actions">
          <button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save override'}
          </button>
          <button type="button" onClick={handleClear} disabled={isClearing}>
            {isClearing ? 'Clearing…' : 'Clear override'}
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
