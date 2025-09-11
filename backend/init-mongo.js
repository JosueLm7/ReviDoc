// MongoDB initialization script for Docker
const db = db.getSiblingDB("academic_writing")

// Create collections
db.createCollection("users")
db.createCollection("documents")
db.createCollection("reviews")
db.createCollection("statistics")

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.documents.createIndex({ userId: 1 })
db.documents.createIndex({ status: 1 })
db.documents.createIndex({ createdAt: -1 })
db.reviews.createIndex({ documentId: 1 })
db.reviews.createIndex({ createdAt: -1 })

// Insert default admin user
db.users.insertOne({
  name: "Administrador",
  email: "admin@academic.com",
  password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
})

print("Database initialized successfully")
