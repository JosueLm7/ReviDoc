const mongoose = require('mongoose')
const Document = require('../../../models/Document')

describe('Document Model', () => {
  beforeEach(async () => {
    await Document.deleteMany({})
  })

  describe('Document Creation', () => {
    it('should create a valid document', async () => {
      const documentData = {
        title: 'Test Document',
        content: 'This is test content for the document',
        originalFileName: 'test.pdf',
        filePath: '/uploads/test.pdf',
        fileSize: 1024,
        fileType: 'pdf',
        userId: new mongoose.Types.ObjectId(),
        category: 'essay',
        academicLevel: 'undergraduate',
        subject: 'Computer Science',
        citationStyle: 'apa',
        language: 'es'
      }

      const document = new Document(documentData)
      const savedDocument = await document.save()

      expect(savedDocument._id).toBeDefined()
      expect(savedDocument.title).toBe(documentData.title)
      expect(savedDocument.status).toBe('pending')
      expect(savedDocument.wordCount).toBeGreaterThan(0)
    })

    it('should require title, content, and userId', async () => {
      const document = new Document({
        originalFileName: 'test.pdf',
        filePath: '/uploads/test.pdf',
        fileSize: 1024,
        fileType: 'pdf'
      })

      await expect(document.save()).rejects.toThrow(mongoose.Error.ValidationError)
    })

    it('should calculate word count automatically', async () => {
      const documentData = {
        title: 'Word Count Test',
        content: 'This is a test document with multiple words',
        originalFileName: 'test.pdf',
        filePath: '/uploads/test.pdf',
        fileSize: 1024,
        fileType: 'pdf',
        userId: new mongoose.Types.ObjectId()
      }

      const document = new Document(documentData)
      await document.save()

      expect(document.wordCount).toBe(8) // "This is a test document with multiple words"
    })

    it('should validate fileType enum', async () => {
      const documentData = {
        title: 'Test Document',
        content: 'Test content',
        originalFileName: 'test.xyz',
        filePath: '/uploads/test.xyz',
        fileSize: 1024,
        fileType: 'invalid-type',
        userId: new mongoose.Types.ObjectId()
      }

      const document = new Document(documentData)
      await expect(document.save()).rejects.toThrow(mongoose.Error.ValidationError)
    })
  })

  describe('Document Defaults', () => {
    it('should set default values', async () => {
      const documentData = {
        title: 'Test Document',
        content: 'Test content',
        originalFileName: 'test.pdf',
        filePath: '/uploads/test.pdf',
        fileSize: 1024,
        fileType: 'pdf',
        userId: new mongoose.Types.ObjectId()
      }

      const document = new Document(documentData)
      await document.save()

      expect(document.status).toBe('pending')
      expect(document.category).toBe('essay')
      expect(document.academicLevel).toBe('undergraduate')
      expect(document.citationStyle).toBe('apa')
      expect(document.language).toBe('es')
      expect(document.isPublic).toBe(false)
    })
  })
})