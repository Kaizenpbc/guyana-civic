import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import { registerRoutes } from '../routes'

// Mock storage
const mockStorage = {
  listJurisdictions: vi.fn(),
  getJurisdiction: vi.fn(),
  listIssues: vi.fn(),
  createIssue: vi.fn(),
  listAnnouncements: vi.fn(),
  getUserByUsername: vi.fn(),
}

// Mock the storage module
vi.mock('../storage', () => ({
  storage: mockStorage,
}))

describe('API Endpoints', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use(express.json())
    // Add session middleware for auth tests
    app.use((req, res, next) => {
      req.session = {} as any
      next()
    })
    registerRoutes(app)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/jurisdictions', () => {
    it('returns list of jurisdictions', async () => {
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

      mockStorage.listJurisdictions.mockResolvedValue(mockJurisdictions)

      const response = await request(app)
        .get('/api/jurisdictions')
        .expect(200)

      expect(response.body).toEqual(mockJurisdictions)
      expect(mockStorage.listJurisdictions).toHaveBeenCalled()
    })

    it('handles errors when fetching jurisdictions', async () => {
      mockStorage.listJurisdictions.mockRejectedValue(new Error('Database error'))

      await request(app)
        .get('/api/jurisdictions')
        .expect(500)
    })
  })

  describe('GET /api/jurisdictions/:id', () => {
    it('returns specific jurisdiction', async () => {
      const mockJurisdiction = {
        id: 'metro-central',
        name: 'Metro Central District',
        description: 'Central business district',
        contactEmail: 'info@metrocentral.gov',
        contactPhone: '+1 (555) 123-4567',
        address: '100 City Hall Plaza',
        createdAt: '2024-01-01T00:00:00.000Z',
      }

      mockStorage.getJurisdiction.mockResolvedValue(mockJurisdiction)

      const response = await request(app)
        .get('/api/jurisdictions/metro-central')
        .expect(200)

      expect(response.body).toEqual(mockJurisdiction)
      expect(mockStorage.getJurisdiction).toHaveBeenCalledWith('metro-central')
    })

    it('returns 404 for non-existent jurisdiction', async () => {
      mockStorage.getJurisdiction.mockResolvedValue(null)

      await request(app)
        .get('/api/jurisdictions/non-existent')
        .expect(404)
    })
  })

  describe('GET /api/jurisdictions/:id/issues', () => {
    it('returns issues for a jurisdiction', async () => {
      const mockIssues = [
        {
          id: 'issue-1',
          title: 'Pothole on Main Street',
          description: 'Large pothole causing traffic delays',
          category: 'roads',
          priority: 'high',
          status: 'in_progress',
          location: 'Main Street & Oak Avenue',
          citizenId: 'citizen-1',
          jurisdictionId: 'metro-central',
          assignedToId: 'user-1',
          resolutionNotes: null,
          createdAt: '2024-01-15T00:00:00.000Z',
          updatedAt: '2024-01-15T00:00:00.000Z',
        },
      ]

      mockStorage.listIssues.mockResolvedValue(mockIssues)

      const response = await request(app)
        .get('/api/jurisdictions/metro-central/issues')
        .expect(200)

      expect(response.body).toEqual(mockIssues)
      expect(mockStorage.listIssues).toHaveBeenCalledWith('metro-central', {})
    })

    it('filters issues by status', async () => {
      const mockIssues = []
      mockStorage.listIssues.mockResolvedValue(mockIssues)

      await request(app)
        .get('/api/jurisdictions/metro-central/issues?status=in_progress')
        .expect(200)

      expect(mockStorage.listIssues).toHaveBeenCalledWith('metro-central', { status: 'in_progress' })
    })
  })

  describe('POST /api/jurisdictions/:id/issues', () => {
    it('creates a new issue', async () => {
      const issueData = {
        title: 'Test Issue',
        description: 'Test description',
        category: 'roads',
        priority: 'medium',
        location: 'Test Location',
      }

      const mockCreatedIssue = {
        id: 'new-issue-id',
        ...issueData,
        status: 'submitted',
        citizenId: 'citizen-1',
        jurisdictionId: 'metro-central',
        assignedToId: null,
        resolutionNotes: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      mockStorage.createIssue.mockResolvedValue(mockCreatedIssue)

      const response = await request(app)
        .post('/api/jurisdictions/metro-central/issues')
        .send(issueData)
        .expect(201)

      expect(response.body).toEqual(mockCreatedIssue)
      expect(mockStorage.createIssue).toHaveBeenCalledWith({
        ...issueData,
        jurisdictionId: 'metro-central',
        citizenId: 'citizen-1',
      })
    })

    it('validates required fields', async () => {
      const invalidData = {
        title: '', // Empty title
        description: 'Test description',
        category: 'roads',
        priority: 'medium',
        location: 'Test Location',
      }

      await request(app)
        .post('/api/jurisdictions/metro-central/issues')
        .send(invalidData)
        .expect(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('authenticates user with valid credentials', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'jdoe',
        email: 'jdoe@example.com',
        fullName: 'John Doe',
        role: 'staff',
        jurisdictionId: 'metro-central',
      }

      mockStorage.getUserByUsername.mockResolvedValue(mockUser)

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'jdoe', password: 'password' })
        .expect(200)

      expect(response.body.user).toEqual(mockUser)
      expect(response.body.message).toBe('Login successful')
    })

    it('rejects invalid credentials', async () => {
      mockStorage.getUserByUsername.mockResolvedValue(null)

      await request(app)
        .post('/api/auth/login')
        .send({ username: 'invalid', password: 'password' })
        .expect(401)
    })

    it('requires username and password', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ username: 'jdoe' }) // Missing password
        .expect(400)
    })
  })
})
