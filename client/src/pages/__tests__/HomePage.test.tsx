import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import HomePage from '../HomePage'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Test wrapper with QueryClient
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('HomePage', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('renders the homepage with header and search', () => {
    // Mock successful API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      })

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    )

    expect(screen.getByText('Local Government Portal')).toBeInTheDocument()
    expect(screen.getByText('Citizen Services & Administrative Management')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search jurisdictions/i)).toBeInTheDocument()
  })

  it('displays jurisdictions when loaded successfully', async () => {
    const mockJurisdictions = [
      {
        id: 'metro-central',
        name: 'Metro Central District',
        description: 'Central business district',
        contactEmail: 'info@metrocentral.gov',
        contactPhone: '+1 (555) 123-4567',
        address: '100 City Hall Plaza',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ]

    const mockAnnouncements = [
      {
        id: 'ann-1',
        title: 'Test Announcement',
        content: 'Test content',
        jurisdictionId: 'metro-central',
        authorId: 'user-1',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ]

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockJurisdictions,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnnouncements,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      })

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Metro Central District')).toBeInTheDocument()
    })

    expect(screen.getByText('Central business district')).toBeInTheDocument()
  })

  it('filters jurisdictions based on search query', async () => {
    const mockJurisdictions = [
      {
        id: 'metro-central',
        name: 'Metro Central District',
        description: 'Central business district',
        contactEmail: 'info@metrocentral.gov',
        contactPhone: '+1 (555) 123-4567',
        address: '100 City Hall Plaza',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'riverside',
        name: 'Riverside Municipal',
        description: 'Riverside area council',
        contactEmail: 'contact@riverside.gov',
        contactPhone: '+1 (555) 987-6543',
        address: '45 Riverside Center',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ]

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockJurisdictions,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      })

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Metro Central District')).toBeInTheDocument()
    })

    // Search for "metro"
    const searchInput = screen.getByPlaceholderText(/search jurisdictions/i)
    await user.type(searchInput, 'metro')

    await waitFor(() => {
      expect(screen.getByText('Metro Central District')).toBeInTheDocument()
      expect(screen.queryByText('Riverside Municipal')).not.toBeInTheDocument()
    })
  })

  it('shows loading state while fetching jurisdictions', async () => {
    // Mock a slow response
    mockFetch
      .mockImplementationOnce(() => new Promise(() => {})) // Never resolves
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      })

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    )

    // Should show loading skeletons - check for skeleton elements
    await waitFor(() => {
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  it('shows error state when jurisdictions fail to load', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      })

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/error loading jurisdictions/i)).toBeInTheDocument()
    })
  })

  it('shows login button when user is not authenticated', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      })

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })
  })

  it('shows user info and logout button when authenticated', async () => {
    const mockUser = {
      user: {
        id: 'user-1',
        username: 'jdoe',
        email: 'jdoe@example.com',
        fullName: 'John Doe',
        role: 'staff',
        jurisdictionId: 'metro-central',
      },
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument()
      expect(screen.getByText('staff')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
    })
  })
})
