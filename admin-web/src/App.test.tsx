import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'
import type {
  ClearChannelOverrideInput,
  DataClient,
  SetChannelOverrideInput,
} from './dataClient'
import type { PublicConfig, TodayState } from './types'

describe('App', () => {
  it('renders default and effective channels', async () => {
    const mockClient = {
      getPublicConfig: vi.fn<() => Promise<PublicConfig>>(),
      getTodayState: vi.fn<(dateKey: string) => Promise<TodayState>>(),
      setChannelOverride:
        vi.fn<(input: SetChannelOverrideInput) => Promise<void>>(),
      clearChannelOverride:
        vi.fn<(input: ClearChannelOverrideInput) => Promise<void>>(),
    } satisfies DataClient
    mockClient.getPublicConfig.mockResolvedValue({
      teamId: 'bruins',
      defaultChannel: '91',
      channelLabel: 'SiriusXM',
      timezone: 'America/New_York',
    })
    mockClient.getTodayState.mockResolvedValue({
      dateKey: '2026-02-08',
      gameId: null,
      effectiveChannel: '92',
      channelOverride: null,
      channelOverrideNote: null,
    })

    render(<App client={mockClient} />)

    expect(await screen.findByText(/Default channel:/i)).toBeInTheDocument()
    expect(screen.getByText(/SiriusXM 91/i)).toBeInTheDocument()
    expect(screen.getByText(/SiriusXM 92/i)).toBeInTheDocument()
  })

  it('saves channel override and note', async () => {
    const user = userEvent.setup()
    const mockClient = {
      getPublicConfig: vi.fn<() => Promise<PublicConfig>>(),
      getTodayState: vi.fn<(dateKey: string) => Promise<TodayState>>(),
      setChannelOverride:
        vi.fn<(input: SetChannelOverrideInput) => Promise<void>>(),
      clearChannelOverride:
        vi.fn<(input: ClearChannelOverrideInput) => Promise<void>>(),
    } satisfies DataClient
    mockClient.getPublicConfig.mockResolvedValue({
      teamId: 'bruins',
      defaultChannel: '91',
      channelLabel: 'SiriusXM',
      timezone: 'America/New_York',
    })
    mockClient.getTodayState.mockResolvedValue({
      dateKey: '2026-02-08',
      gameId: null,
      effectiveChannel: '91',
      channelOverride: null,
      channelOverrideNote: null,
    })

    render(<App client={mockClient} />)

    await screen.findByRole('heading', { name: /override/i })

    await user.type(screen.getByLabelText(/Channel override/i), '92')
    await user.type(screen.getByLabelText(/Override note/i), 'National feed')
    await user.click(screen.getByRole('button', { name: /save override/i }))

    await waitFor(() => {
      expect(mockClient.setChannelOverride).toHaveBeenCalledWith({
        dateKey: '2026-02-08',
        channelOverride: '92',
        channelOverrideNote: 'National feed',
        effectiveChannel: '92',
      })
    })
  })

  it('clears channel override', async () => {
    const user = userEvent.setup()
    const mockClient = {
      getPublicConfig: vi.fn<() => Promise<PublicConfig>>(),
      getTodayState: vi.fn<(dateKey: string) => Promise<TodayState>>(),
      setChannelOverride:
        vi.fn<(input: SetChannelOverrideInput) => Promise<void>>(),
      clearChannelOverride:
        vi.fn<(input: ClearChannelOverrideInput) => Promise<void>>(),
    } satisfies DataClient
    mockClient.getPublicConfig.mockResolvedValue({
      teamId: 'bruins',
      defaultChannel: '91',
      channelLabel: 'SiriusXM',
      timezone: 'America/New_York',
    })
    mockClient.getTodayState.mockResolvedValue({
      dateKey: '2026-02-08',
      gameId: null,
      effectiveChannel: '92',
      channelOverride: '92',
      channelOverrideNote: 'Note',
    })

    render(<App client={mockClient} />)
    await screen.findByRole('heading', { name: /override/i })

    await user.click(screen.getByRole('button', { name: /clear override/i }))

    await waitFor(() => {
      expect(mockClient.clearChannelOverride).toHaveBeenCalledWith({
        dateKey: '2026-02-08',
        effectiveChannel: '91',
      })
    })

    expect(screen.getByLabelText(/Channel override/i)).toHaveValue('')
    expect(screen.getByLabelText(/Override note/i)).toHaveValue('')
  })
})
