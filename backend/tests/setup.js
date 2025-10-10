const mongoose = require('mongoose')

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'b13a3aba1ee43788f84f25f10758399a661e1a3be2b6e2f70900a71dfe84cec5b15bc2f1af46a1663f5d4bf9b8fd80067a9c45001d18154562e71c81f0200d84'
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://JosueLm7:2xuaJJErVN9faE0F@revidocuc.t8lo6ej.mongodb.net/?retryWrites=true&w=majority&appName=ReviDocUC'

let isConnected = false

beforeAll(async () => {
  if (!isConnected) {
    try {
      await mongoose.connect(process.env.MONGO_URI)
      isConnected = true
      console.log('✅ Conectado a MongoDB para testing')
    } catch (error) {
      console.error('❌ Error conectando a MongoDB:', error)
      throw error
    }
  }
})

// Limpiar BD después de cada test
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      const collections = mongoose.connection.collections
      for (const key in collections) {
        // Usar deleteMany con condición vacía en lugar de drop
        await collections[key].deleteMany({})
      }
    } catch (error) {
      console.error('Error limpiando BD:', error)
    }
  }
})

// Cerrar conexión
afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close()
    console.log('✅ Conexión a MongoDB cerrada')
  }
})