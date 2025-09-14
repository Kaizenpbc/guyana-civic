import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import IssueReportForm from '../IssueReportForm'

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

describe('IssueReportForm', () => {
  const user = userEvent.setup()
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('renders the form with all required fields', () => {
    render(
      <TestWrapper>
        <IssueReportForm 
          jurisdictionId="metro-central" 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </TestWrapper>
    )

    expect(screen.getByText('Report an Issue')).toBeInTheDocument()
    expect(screen.getByLabelText('Issue Title *')).toBeInTheDocument()
    expect(screen.getByLabelText('Category *')).toBeInTheDocument()
    expect(screen.getByLabelText('Priority Level')).toBeInTheDocument()
    expect(screen.getByLabelText('Location *')).toBeInTheDocument()
    expect(screen.getByLabelText('Detailed Description *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit report/i })).toBeInTheDocument()
  })

  it('shows validation errors for required fields', async () => {
    render(
      <TestWrapper>
        <IssueReportForm 
          jurisdictionId="metro-central" 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /submit report/i })
    await user.click(submitButton)

    // Check that required fields show validation errors
    expect(screen.getByLabelText('Issue Title *')).toBeInvalid()
    expect(screen.getByLabelText('Location *')).toBeInvalid()
    expect(screen.getByLabelText('Detailed Description *')).toBeInvalid()
  })

  it('submits the form with valid data', async () => {
    const mockResponse = {
      id: 'test-id',
      title: 'Test Issue',
      description: 'Test description',
      category: 'roads',
      priority: 'medium',
      status: 'submitted',
      location: 'Test Location',
      citizenId: 'citizen-1',
      jurisdictionId: 'metro-central',
      createdAt: '2024-01-01T00:00:00.000Z',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(
      <TestWrapper>
        <IssueReportForm 
          jurisdictionId="metro-central" 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </TestWrapper>
    )

    // Fill out the form
    await user.type(screen.getByLabelText('Issue Title *'), 'Test Issue')
    await user.type(screen.getByLabelText('Location *'), 'Test Location')
    await user.type(screen.getByLabelText('Detailed Description *'), 'Test description')
    
    // Select category
    await user.click(screen.getByRole('combobox', { name: /category/i }))
    await user.click(screen.getByText('Roads & Transportation'))

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit report/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/jurisdictions/metro-central/issues',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Test Issue'),
        })
      )
    })

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(mockResponse)
    })
  })

  it('shows success message after successful submission', async () => {
    const mockResponse = {
      id: 'test-id',
      title: 'Test Issue',
      description: 'Test description',
      category: 'roads',
      priority: 'medium',
      status: 'submitted',
      location: 'Test Location',
      citizenId: 'citizen-1',
      jurisdictionId: 'metro-central',
      createdAt: '2024-01-01T00:00:00.000Z',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(
      <TestWrapper>
        <IssueReportForm 
          jurisdictionId="metro-central" 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </TestWrapper>
    )

    // Fill out and submit the form
    await user.type(screen.getByLabelText('Issue Title *'), 'Test Issue')
    await user.type(screen.getByLabelText('Location *'), 'Test Location')
    await user.type(screen.getByLabelText('Detailed Description *'), 'Test description')
    
    await user.click(screen.getByRole('combobox', { name: /category/i }))
    await user.click(screen.getByText('Roads & Transportation'))

    await user.click(screen.getByRole('button', { name: /submit report/i }))

    await waitFor(() => {
      expect(screen.getByText(/issue submitted successfully/i)).toBeInTheDocument()
    })
  })

  it('shows error message when submission fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(
      <TestWrapper>
        <IssueReportForm 
          jurisdictionId="metro-central" 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </TestWrapper>
    )

    // Fill out and submit the form
    await user.type(screen.getByLabelText('Issue Title *'), 'Test Issue')
    await user.type(screen.getByLabelText('Location *'), 'Test Location')
    await user.type(screen.getByLabelText('Detailed Description *'), 'Test description')
    
    await user.click(screen.getByRole('combobox', { name: /category/i }))
    await user.click(screen.getByText('Roads & Transportation'))

    await user.click(screen.getByRole('button', { name: /submit report/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to submit issue/i)).toBeInTheDocument()
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    render(
      <TestWrapper>
        <IssueReportForm 
          jurisdictionId="metro-central" 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </TestWrapper>
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })
})
