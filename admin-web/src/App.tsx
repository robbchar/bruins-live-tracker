import { useEffect, useState } from 'react'
import './App.css'
import { dataClient as defaultClient } from './dataClient'
import type { PublicConfig, TodayState } from './types'
import type { DataClient } from './dataClient'

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
  const [channelOverride, setChannelOverride] = useState('')
  const [channelOverrideNote, setChannelOverrideNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
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
  }, [client])

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
      <h1>Bruins Live Admin</h1>
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
