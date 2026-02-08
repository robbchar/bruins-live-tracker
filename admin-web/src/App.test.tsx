import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the admin heading and message', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /bruins live admin/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/channel override coming soon/i),
    ).toBeInTheDocument()
  })
})
