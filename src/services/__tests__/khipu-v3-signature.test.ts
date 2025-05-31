/**
 * Tests para el servicio de Khipu v3 con x-signature
 * Implementando TDD (Test-Driven Development)
 */

import { KhipuV3Service } from '../khipu-v3-signature'

// Mock fetch para las pruebas
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('KhipuV3Service', () => {
  let khipuService: KhipuV3Service

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.KHIPU_API_KEY = 'test_api_key_123'
    process.env.KHIPU_SECRET_KEY = 'test_secret_key'
    khipuService = new KhipuV3Service()
  })

  describe('createPayment', () => {
    const validPaymentData = {
      amount: 10000,
      currency: 'CLP',
      subject: 'Test Payment',
      transaction_id: 'test_txn_123',
      payer_email: 'test@example.com'
    }

    it('should create payment successfully with valid data', async () => {
      // Arrange
      const mockResponse = {
        payment_id: 'khipu_123456',
        payment_url: 'https://payment.khipu.com/payment/123456',
        simplified_transfer_url: 'https://khipu.com/payment/123456',
        transfer_url: 'https://khipu.com/payment/123456',
        app_url: 'khipu://payment/123456',
        ready_for_terminal: false
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      // Act
      const result = await khipuService.createPayment(validPaymentData)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should handle API errors gracefully', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request'
      })

      // Act & Assert
      await expect(khipuService.createPayment(validPaymentData)).rejects.toThrow()
    })

    it('should handle network errors', async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      // Act & Assert
      await expect(khipuService.createPayment(validPaymentData)).rejects.toThrow('Network error')
    })
  })

  describe('constructor', () => {
    it('should initialize with environment variables', () => {
      // Act & Assert
      expect(() => new KhipuV3Service()).not.toThrow()
    })
  })
})
