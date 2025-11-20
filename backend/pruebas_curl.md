# Ejemplos de Consultas para la API

Aquí tienes ejemplos de cómo interactuar con tu API usando `curl`. Asegúrate de que tu servidor esté corriendo antes de ejecutar estos comandos.

---

## Usuarios (Users)

### 1. Registro de Usuario

**Descripción:** Este comando prueba el endpoint de registro de usuarios, enviando datos básicos como nombre, email y contraseña. Verifica que el servidor responda con un token JWT y los datos del usuario creado exitosamente.

**Comando:**
\`\`\`bash
curl -X POST https://revidoc-backend.onrender.com/api/auth/register \
-H "Content-Type: application/json" \
-d '{
  "name": "Juan Perez",
  "email": "juan@ejemplo.com",
  "password": "secure123",
  "role": "student",
  "institution": "Universidad Nacional",
  "department": "Ingeniería"
}'
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Juan Perez",
    "email": "juan@ejemplo.com",
    "role": "student",
    "institution": "Universidad Nacional",
    "department": "Ingeniería",
    "isActive": true,
    "statistics": {
      "documentsUploaded": 0,
      "reviewsReceived": 0,
      "averageScore": 0
    },
    "createdAt": "2025-01-16T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
\`\`\`

---

### 2. Inicio de Sesión (Login)

**Descripción:** Autentica a un usuario existente con su email y contraseña. Retorna un token JWT que debe ser usado en las siguientes peticiones autenticadas.

**Comando:**
\`\`\`bash
curl -X POST https://revidoc-backend.onrender.com/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "juan@ejemplo.com",
  "password": "secure123"
}'
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "message": "Login exitoso",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Juan Perez",
    "email": "juan@ejemplo.com",
    "role": "student",
    "institution": "Universidad Nacional",
    "lastLogin": "2025-01-16T11:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
\`\`\`

---

### 3. Obtener Usuario Actual

**Descripción:** Obtiene la información del usuario autenticado actualmente. Requiere el token JWT en el header de autorización.

**Comando:**
\`\`\`bash
curl -X GET https://revidoc-backend.onrender.com/api/auth/me \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Juan Perez",
      "email": "juan@ejemplo.com",
      "role": "student",
      "institution": "Universidad Nacional",
      "department": "Ingeniería",
      "documents": [
        {
          "_id": "507f191e810c19729de860ea",
          "title": "Mi Ensayo",
          "status": "pending",
          "createdAt": "2025-01-16T09:00:00.000Z"
        }
      ],
      "statistics": {
        "documentsUploaded": 1,
        "reviewsReceived": 0,
        "averageScore": 0
      }
    }
  }
}
\`\`\`

---

### 4. Cerrar Sesión (Logout)

**Descripción:** Cierra la sesión del usuario actual. El token debe ser eliminado del lado del cliente.

**Comando:**
\`\`\`bash
curl -X POST https://revidoc-backend.onrender.com/api/auth/logout \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "message": "Logout exitoso"
}
\`\`\`

---

## Documentos (Documents)

### 1. Subir un Documento

**Descripción:** Sube uno o más documentos al sistema. Acepta archivos PDF, DOC, DOCX y TXT. El sistema extrae automáticamente el texto para análisis posterior.

**Comando:**
\`\`\`bash
curl -X POST https://revidoc-backend.onrender.com/api/documents \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
-F "documents=@/ruta/al/archivo.pdf" \
-F "title=Mi Ensayo Académico" \
-F "description=Ensayo sobre inteligencia artificial" \
-F "category=essay" \
-F "academicLevel=undergraduate" \
-F "subject=Ciencias de la Computación" \
-F "citationStyle=apa" \
-F "tags=IA,tecnología,educación"
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "message": "1 documento(s) subido(s) exitosamente",
  "data": {
    "documents": [
      {
        "_id": "507f191e810c19729de860ea",
        "title": "Mi Ensayo Académico",
        "description": "Ensayo sobre inteligencia artificial",
        "originalFileName": "archivo.pdf",
        "fileUrl": "https://revidoc-backend.onrender.com/api/documents/file/archivo-1234567890.pdf",
        "fileSize": 245678,
        "fileType": "pdf",
        "category": "essay",
        "academicLevel": "undergraduate",
        "subject": "Ciencias de la Computación",
        "citationStyle": "apa",
        "tags": ["IA", "tecnología", "educación"],
        "status": "pending",
        "userId": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Juan Perez",
          "email": "juan@ejemplo.com"
        },
        "createdAt": "2025-01-16T12:00:00.000Z"
      }
    ]
  },
  "errors": []
}
\`\`\`

---

### 2. Obtener Todos los Documentos

**Descripción:** Obtiene la lista de documentos del usuario autenticado (o todos los documentos si es admin). Soporta paginación, filtros y ordenamiento.

**Comando:**
\`\`\`bash
curl -X GET "https://revidoc-backend.onrender.com/api/documents?page=1&limit=10&sort=-createdAt&status=pending" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "data": {
    "documents": [
      {
        "_id": "507f191e810c19729de860ea",
        "title": "Mi Ensayo Académico",
        "description": "Ensayo sobre inteligencia artificial",
        "fileUrl": "https://revidoc-backend.onrender.com/api/documents/file/archivo-1234567890.pdf",
        "fileSize": 245678,
        "fileType": "pdf",
        "category": "essay",
        "status": "pending",
        "userId": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Juan Perez",
          "email": "juan@ejemplo.com"
        },
        "latestReview": null,
        "createdAt": "2025-01-16T12:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 1,
      "limit": 10
    }
  }
}
\`\`\`

---

### 3. Obtener un Documento por ID

**Descripción:** Obtiene los detalles completos de un documento específico, incluyendo todas sus revisiones. Solo el propietario o un admin pueden acceder.

**Comando:**
\`\`\`bash
curl -X GET https://revidoc-backend.onrender.com/api/documents/507f191e810c19729de860ea \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "data": {
    "document": {
      "_id": "507f191e810c19729de860ea",
      "title": "Mi Ensayo Académico",
      "description": "Ensayo sobre inteligencia artificial",
      "content": "Texto extraído del documento...",
      "originalFileName": "archivo.pdf",
      "fileUrl": "https://revidoc-backend.onrender.com/api/documents/file/archivo-1234567890.pdf",
      "fileSize": 245678,
      "fileType": "pdf",
      "category": "essay",
      "academicLevel": "undergraduate",
      "subject": "Ciencias de la Computación",
      "citationStyle": "apa",
      "tags": ["IA", "tecnología", "educación"],
      "status": "pending",
      "userId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Juan Perez",
        "email": "juan@ejemplo.com"
      },
      "reviews": [],
      "createdAt": "2025-01-16T12:00:00.000Z",
      "updatedAt": "2025-01-16T12:00:00.000Z"
    }
  }
}
\`\`\`

---

### 4. Actualizar un Documento

**Descripción:** Actualiza los metadatos de un documento existente. No se puede cambiar el archivo, solo la información descriptiva.

**Comando:**
\`\`\`bash
curl -X PUT https://revidoc-backend.onrender.com/api/documents/507f191e810c19729de860ea \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
-H "Content-Type: application/json" \
-d '{
  "title": "Mi Ensayo Académico Actualizado",
  "description": "Ensayo revisado sobre inteligencia artificial",
  "category": "research",
  "tags": "IA,tecnología,educación,machine learning"
}'
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "message": "Documento actualizado exitosamente",
  "data": {
    "document": {
      "_id": "507f191e810c19729de860ea",
      "title": "Mi Ensayo Académico Actualizado",
      "description": "Ensayo revisado sobre inteligencia artificial",
      "category": "research",
      "tags": ["IA", "tecnología", "educación", "machine learning"],
      "updatedAt": "2025-01-16T13:00:00.000Z"
    }
  }
}
\`\`\`

---

### 5. Eliminar un Documento

**Descripción:** Elimina permanentemente un documento del sistema, incluyendo el archivo físico del servidor. Solo el propietario o un admin pueden eliminar documentos.

**Comando:**
\`\`\`bash
curl -X DELETE https://revidoc-backend.onrender.com/api/documents/507f191e810c19729de860ea \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "message": "Documento eliminado exitosamente"
}
\`\`\`

---

### 6. Descargar Archivo Original

**Descripción:** Descarga el archivo original del documento. Requiere autenticación y permisos de acceso.

**Comando:**
\`\`\`bash
curl -X GET https://revidoc-backend.onrender.com/api/documents/file/archivo-1234567890.pdf \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
--output documento_descargado.pdf
\`\`\`

**Respuesta Esperada:**
El archivo se descarga directamente con el tipo MIME apropiado (application/pdf, application/msword, etc.)

---

## Revisiones (Reviews)

### 1. Crear una Revisión para un Documento

**Descripción:** Inicia el proceso de revisión automática de un documento usando IA. El sistema analiza gramática, ortografía, estilo, coherencia, citaciones y originalidad. Solo el propietario del documento, profesores o administradores pueden crear revisiones.

**Comando:**
\`\`\`bash
curl -X POST https://revidoc-backend.onrender.com/api/reviews/507f191e810c19729de860ea \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
-H "Content-Type: application/json"
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "message": "Revisión iniciada exitosamente",
  "data": {
    "review": {
      "_id": "507f1f77bcf86cd799439022",
      "documentId": "507f191e810c19729de860ea",
      "userId": "507f1f77bcf86cd799439011",
      "status": "pending",
      "overallScore": 0,
      "scores": {
        "grammar": 0,
        "spelling": 0,
        "style": 0,
        "coherence": 0,
        "citation": 0,
        "originality": 0
      },
      "issues": [],
      "summary": {
        "totalIssues": 0,
        "criticalIssues": 0,
        "resolvedIssues": 0,
        "improvementSuggestions": []
      },
      "aiAnalysis": {
        "model": "openai-gpt-4",
        "processingTime": 0,
        "confidence": 0
      },
      "createdAt": "2025-01-16T14:00:00.000Z"
    }
  }
}
\`\`\`

---

### 2. Obtener Todas las Revisiones

**Descripción:** Obtiene la lista de revisiones del usuario autenticado (o todas las revisiones si es admin). Soporta paginación, filtros por estado y ordenamiento.

**Comando:**
\`\`\`bash
curl -X GET "https://revidoc-backend.onrender.com/api/reviews?page=1&limit=10&sort=-createdAt&status=completed" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "507f1f77bcf86cd799439022",
        "documentId": {
          "_id": "507f191e810c19729de860ea",
          "title": "Mi Ensayo Académico",
          "category": "essay",
          "academicLevel": "undergraduate"
        },
        "userId": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Juan Perez",
          "email": "juan@ejemplo.com"
        },
        "status": "completed",
        "overallScore": 85,
        "scores": {
          "grammar": 90,
          "spelling": 95,
          "style": 80,
          "coherence": 85,
          "citation": 75,
          "originality": 88
        },
        "summary": {
          "totalIssues": 12,
          "criticalIssues": 2,
          "resolvedIssues": 0
        },
        "createdAt": "2025-01-16T14:00:00.000Z",
        "updatedAt": "2025-01-16T14:05:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 1,
      "limit": 10
    }
  }
}
\`\`\`

---

### 3. Obtener una Revisión por ID

**Descripción:** Obtiene los detalles completos de una revisión específica, incluyendo todos los problemas detectados, sugerencias y análisis de IA. Solo el propietario o un admin pueden acceder.

**Comando:**
\`\`\`bash
curl -X GET https://revidoc-backend.onrender.com/api/reviews/507f1f77bcf86cd799439022 \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "data": {
    "review": {
      "_id": "507f1f77bcf86cd799439022",
      "documentId": {
        "_id": "507f191e810c19729de860ea",
        "title": "Mi Ensayo Académico",
        "content": "Texto completo del documento...",
        "category": "essay",
        "academicLevel": "undergraduate"
      },
      "userId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Juan Perez",
        "email": "juan@ejemplo.com"
      },
      "status": "completed",
      "overallScore": 85,
      "scores": {
        "grammar": 90,
        "spelling": 95,
        "style": 80,
        "coherence": 85,
        "citation": 75,
        "originality": 88
      },
      "issues": [
        {
          "_id": "507f1f77bcf86cd799439033",
          "type": "grammar",
          "severity": "medium",
          "position": {
            "start": 145,
            "end": 167
          },
          "originalText": "Los estudiantes esta aprendiendo",
          "suggestion": "Los estudiantes están aprendiendo",
          "explanation": "Concordancia verbal incorrecta. El verbo debe estar en plural.",
          "confidence": 0.95,
          "isResolved": false
        },
        {
          "_id": "507f1f77bcf86cd799439034",
          "type": "citation",
          "severity": "high",
          "position": {
            "start": 523,
            "end": 580
          },
          "originalText": "Según estudios recientes...",
          "suggestion": "Según Smith (2023)...",
          "explanation": "Se requiere una cita específica para respaldar esta afirmación.",
          "confidence": 0.88,
          "isResolved": false
        }
      ],
      "summary": {
        "totalIssues": 12,
        "criticalIssues": 2,
        "resolvedIssues": 0,
        "improvementSuggestions": [
          "Mejorar la estructura de las citas bibliográficas",
          "Revisar la concordancia verbal en varios párrafos",
          "Fortalecer la coherencia entre secciones"
        ]
      },
      "aiAnalysis": {
        "model": "openai-gpt-4",
        "processingTime": 4523,
        "confidence": 0.92,
        "metadata": {
          "tokensUsed": 3456,
          "apiVersion": "2024-01"
        }
      },
      "plagiarismCheck": {
        "similarity": 12,
        "sources": [
          {
            "url": "https://ejemplo.com/articulo",
            "title": "Artículo sobre IA en educación",
            "similarity": 8,
            "matchedText": "La inteligencia artificial está transformando..."
          }
        ],
        "isOriginal": true
      },
      "feedback": {
        "isHelpful": null,
        "rating": null,
        "comments": null
      },
      "createdAt": "2025-01-16T14:00:00.000Z",
      "updatedAt": "2025-01-16T14:05:00.000Z"
    }
  }
}
\`\`\`

---

### 4. Agregar Feedback a una Revisión

**Descripción:** Permite al propietario de la revisión agregar retroalimentación sobre la utilidad y calidad de la revisión recibida. Esto ayuda a mejorar el sistema de IA.

**Comando:**
\`\`\`bash
curl -X PUT https://revidoc-backend.onrender.com/api/reviews/507f1f77bcf86cd799439022/feedback \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
-H "Content-Type: application/json" \
-d '{
  "isHelpful": true,
  "rating": 5,
  "comments": "Excelente revisión, muy detallada y útil para mejorar mi documento"
}'
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "message": "Feedback agregado exitosamente",
  "data": {
    "review": {
      "_id": "507f1f77bcf86cd799439022",
      "feedback": {
        "isHelpful": true,
        "rating": 5,
        "comments": "Excelente revisión, muy detallada y útil para mejorar mi documento"
      },
      "updatedAt": "2025-01-16T15:00:00.000Z"
    }
  }
}
\`\`\`

---

## Estadísticas (Statistics)

### 1. Obtener Estadísticas del Dashboard

**Descripción:** Obtiene un resumen completo de estadísticas del sistema incluyendo usuarios, documentos, revisiones y distribuciones. Solo accesible para administradores.

**Comando:**
\`\`\`bash
curl -X GET https://revidoc-backend.onrender.com/api/statistics/dashboard \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "data": {
    "statistics": {
      "overview": {
        "totalUsers": 150,
        "activeUsers": 87,
        "totalDocuments": 423,
        "totalReviews": 389,
        "pendingReviews": 12,
        "averageScore": 82.5
      },
      "growth": {
        "newUsersThisWeek": 8,
        "newDocumentsThisWeek": 34,
        "newReviewsThisWeek": 31
      },
      "distributions": {
        "issues": [
          {
            "_id": "grammar",
            "count": 234
          },
          {
            "_id": "citation",
            "count": 189
          },
          {
            "_id": "style",
            "count": 156
          },
          {
            "_id": "spelling",
            "count": 98
          },
          {
            "_id": "coherence",
            "count": 76
          }
        ],
        "userRoles": [
          {
            "_id": "student",
            "count": 120
          },
          {
            "_id": "teacher",
            "count": 25
          },
          {
            "_id": "admin",
            "count": 5
          }
        ],
        "documentCategories": [
          {
            "_id": "essay",
            "count": 198
          },
          {
            "_id": "thesis",
            "count": 87
          },
          {
            "_id": "article",
            "count": 76
          },
          {
            "_id": "report",
            "count": 45
          },
          {
            "_id": "other",
            "count": 17
          }
        ]
      }
    }
  }
}
\`\`\`

---

### 2. Obtener Tendencias Estadísticas

**Descripción:** Obtiene estadísticas históricas diarias para análisis de tendencias. Permite especificar el número de días a consultar. Solo accesible para administradores.

**Comando:**
\`\`\`bash
curl -X GET "https://revidoc-backend.onrender.com/api/statistics/trends?days=30" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "data": {
    "trends": [
      {
        "_id": "507f1f77bcf86cd799439044",
        "date": "2025-01-15T00:00:00.000Z",
        "users": {
          "total": 148,
          "active": 85,
          "new": 3,
          "byRole": {
            "students": 118,
            "teachers": 25,
            "admins": 5
          }
        },
        "documents": {
          "total": 415,
          "uploaded": 12,
          "processed": 11,
          "byCategory": {
            "essay": 195,
            "thesis": 85,
            "article": 74,
            "report": 44,
            "other": 17
          },
          "byLevel": {
            "undergraduate": 245,
            "graduate": 98,
            "postgraduate": 52,
            "phd": 20
          }
        },
        "reviews": {
          "total": 380,
          "completed": 11,
          "averageScore": 83.2,
          "averageProcessingTime": 4234,
          "issueTypes": {
            "grammar": 230,
            "spelling": 95,
            "style": 152,
            "coherence": 74,
            "citation": 185,
            "plagiarism": 8
          }
        },
        "system": {
          "apiCalls": 2456,
          "errors": 12,
          "uptime": 99.8,
          "averageResponseTime": 234
        },
        "createdAt": "2025-01-15T23:59:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439045",
        "date": "2025-01-16T00:00:00.000Z",
        "users": {
          "total": 150,
          "active": 87,
          "new": 2,
          "byRole": {
            "students": 120,
            "teachers": 25,
            "admins": 5
          }
        },
        "documents": {
          "total": 423,
          "uploaded": 8,
          "processed": 8,
          "byCategory": {
            "essay": 198,
            "thesis": 87,
            "article": 76,
            "report": 45,
            "other": 17
          },
          "byLevel": {
            "undergraduate": 250,
            "graduate": 100,
            "postgraduate": 53,
            "phd": 20
          }
        },
        "reviews": {
          "total": 389,
          "completed": 9,
          "averageScore": 82.5,
          "averageProcessingTime": 4156,
          "issueTypes": {
            "grammar": 234,
            "spelling": 98,
            "style": 156,
            "coherence": 76,
            "citation": 189,
            "plagiarism": 9
          }
        },
        "system": {
          "apiCalls": 2678,
          "errors": 8,
          "uptime": 99.9,
          "averageResponseTime": 218
        },
        "createdAt": "2025-01-16T23:59:00.000Z"
      }
    ]
  }
}
\`\`\`

---

### 3. Obtener Estadísticas de Usuarios

**Descripción:** Obtiene estadísticas detalladas sobre usuarios, incluyendo los más activos y tendencias de registro. Solo accesible para administradores.

**Comando:**
\`\`\`bash
curl -X GET https://revidoc-backend.onrender.com/api/statistics/users \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "data": {
    "mostActiveUsers": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Juan Perez",
        "email": "juan@ejemplo.com",
        "role": "student",
        "documentCount": 23,
        "lastLogin": "2025-01-16T10:30:00.000Z",
        "createdAt": "2024-09-15T08:00:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "María García",
        "email": "maria@ejemplo.com",
        "role": "student",
        "documentCount": 19,
        "lastLogin": "2025-01-16T09:15:00.000Z",
        "createdAt": "2024-10-03T14:20:00.000Z"
      }
    ],
    "registrationTrends": [
      {
        "_id": {
          "year": 2024,
          "month": 9
        },
        "count": 45
      },
      {
        "_id": {
          "year": 2024,
          "month": 10
        },
        "count": 38
      },
      {
        "_id": {
          "year": 2024,
          "month": 11
        },
        "count": 32
      },
      {
        "_id": {
          "year": 2024,
          "month": 12
        },
        "count": 27
      },
      {
        "_id": {
          "year": 2025,
          "month": 1
        },
        "count": 8
      }
    ]
  }
}
\`\`\`

---

### 4. Generar Estadísticas para un Rango de Fechas

**Descripción:** Genera estadísticas históricas para un rango de fechas específico. Útil para rellenar datos faltantes o regenerar estadísticas. Solo accesible para administradores.

**Comando:**
\`\`\`bash
curl -X POST https://revidoc-backend.onrender.com/api/statistics/generate \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
-H "Content-Type: application/json" \
-d '{
  "startDate": "2025-01-01",
  "endDate": "2025-01-16"
}'
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "message": "Estadísticas generadas exitosamente"
}
\`\`\`

---

## IA (Artificial Intelligence) - Gemini

### 1. Analizar Texto con IA

**Descripción:** Analiza un texto usando el modelo Gemini de Google. El sistema realiza análisis completo incluyendo gramática, estilo, coherencia y genera sugerencias de mejora. Requiere autenticación.

**Comando:**
\`\`\`bash
curl -X POST https://revidoc-backend.onrender.com/api/ai/analyze \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
-H "Content-Type: application/json" \
-d '{
  "text": "Los estudiantes esta aprendiendo sobre inteligencia artificial. Este tema es muy importante para el futuro de la educacion. La IA puede ayudar a los profesores a personalizar el aprendizaje.",
  "language": "es",
  "citationStyle": "apa"
}'
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "message": "Análisis completado exitosamente",
  "data": {
    "analysis": {
      "summary": "El texto contiene errores gramaticales y ortográficos que deben corregirse. La estructura es clara pero podría mejorarse la coherencia entre párrafos.",
      "grammar": {
        "score": 75,
        "issues": [
          {
            "text": "Los estudiantes esta aprendiendo",
            "suggestion": "Los estudiantes están aprendiendo",
            "explanation": "Concordancia verbal incorrecta"
          }
        ]
      },
      "style": {
        "score": 80,
        "suggestions": [
          "Usar vocabulario más académico en algunos puntos",
          "Mejorar la transición entre párrafos"
        ]
      },
      "coherence": {
        "score": 82,
        "feedback": "El texto mantiene una estructura lógica, pero podría fortalecer las conexiones entre ideas"
      },
      "recommendations": [
        "Revisar la ortografía de 'educacion' → 'educación'",
        "Agregar citas para respaldar las afirmaciones sobre IA",
        "Expandir la conclusión con ejemplos específicos"
      ]
    },
    "processingTime": 2345,
    "metadata": {
      "textLength": 187,
      "wordCount": 32,
      "language": "es",
      "citationStyle": "apa"
    }
  }
}
\`\`\`

---

### 2. Detectar Plagio

**Descripción:** Verifica la originalidad del texto comparándolo con fuentes disponibles usando Gemini. Detecta similitudes y proporciona un porcentaje de originalidad.

**Comando:**
\`\`\`bash
curl -X POST https://revidoc-backend.onrender.com/api/ai/plagiarism \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
-H "Content-Type: application/json" \
-d '{
  "text": "La inteligencia artificial es una rama de la informática que busca crear máquinas inteligentes capaces de realizar tareas que normalmente requieren inteligencia humana.",
  "language": "es"
}'
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "message": "Detección de plagio completada",
  "data": {
    "plagiarismResult": {
      "overallSimilarity": 18,
      "isOriginal": true,
      "confidence": 0.94,
      "sources": [
        {
          "url": "https://ejemplo.com/articulo-ia",
          "title": "Introducción a la Inteligencia Artificial",
          "similarity": 12,
          "matchedSegments": [
            {
              "original": "La inteligencia artificial es una rama de la informática",
              "source": "AI es una rama de la informática"
            }
          ]
        },
        {
          "url": "https://wikipedia.org/ia",
          "title": "Inteligencia Artificial - Wikipedia",
          "similarity": 6,
          "matchedSegments": [
            {
              "original": "máquinas inteligentes capaces de realizar tareas",
              "source": "máquinas capaces de realizar tareas inteligentes"
            }
          ]
        }
      ],
      "recommendations": [
        "El texto tiene un nivel de originalidad aceptable",
        "Considera parafrasear algunos segmentos para mayor originalidad",
        "Agrega citas apropiadas para las fuentes identificadas"
      ]
    },
    "processingTime": 3456,
    "metadata": {
      "textLength": 156,
      "wordCount": 28,
      "language": "es"
    }
  }
}
\`\`\`

---

### 3. Generar Sugerencias de Mejora

**Descripción:** Genera sugerencias específicas de mejora para un texto usando Gemini. Proporciona recomendaciones contextualizadas según el tipo de documento y nivel académico.

**Comando:**
\`\`\`bash
curl -X POST https://revidoc-backend.onrender.com/api/ai/suggestions \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
-H "Content-Type: application/json" \
-d '{
  "text": "El cambio climático es un problema importante. Muchas personas piensan que es real. Los científicos dicen que es causado por el ser humano. Debemos hacer algo al respecto.",
  "language": "es",
  "citationStyle": "apa",
  "category": "essay"
}'
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "message": "Sugerencias generadas exitosamente",
  "data": {
    "suggestions": {
      "structure": [
        {
          "issue": "Falta de introducción clara",
          "suggestion": "Comienza con una tesis clara que establezca tu posición sobre el cambio climático",
          "example": "El cambio climático representa uno de los desafíos más urgentes del siglo XXI, requiriendo acción inmediata a nivel global."
        },
        {
          "issue": "Párrafos muy cortos",
          "suggestion": "Desarrolla cada idea con más profundidad y evidencia",
          "example": "Expande cada párrafo con datos, estudios o ejemplos específicos"
        }
      ],
      "content": [
        {
          "issue": "Afirmaciones sin respaldo",
          "suggestion": "Respalda tus afirmaciones con citas y referencias",
          "example": "En lugar de 'Los científicos dicen', usa: 'Según el IPCC (2023), el 97% de los científicos climáticos concuerdan que...'"
        },
        {
          "issue": "Lenguaje vago",
          "suggestion": "Usa términos más específicos y académicos",
          "example": "Reemplaza 'Debemos hacer algo' con 'Se requieren políticas de reducción de emisiones de carbono y transición a energías renovables'"
        }
      ],
      "academicStyle": [
        {
          "issue": "Tono informal",
          "suggestion": "Mantén un tono más formal y académico",
          "priority": "high"
        },
        {
          "issue": "Falta de conclusión",
          "suggestion": "Agrega una conclusión que resuma tus puntos principales y refuerce tu tesis",
          "priority": "high"
        }
      ],
      "citations": [
        {
          "suggestion": "Agrega referencias a estudios científicos sobre cambio climático",
          "format": "APA",
          "example": "IPCC. (2023). Climate Change 2023: Synthesis Report. Cambridge University Press."
        }
      ]
    },
    "processingTime": 2876,
    "metadata": {
      "textLength": 198,
      "wordCount": 35,
      "language": "es",
      "citationStyle": "apa",
      "category": "essay"
    }
  }
}
\`\`\`

---

### 4. Obtener Modelos de IA Disponibles

**Descripción:** Obtiene la lista de modelos de IA disponibles en el sistema, incluyendo sus capacidades, idiomas soportados y descripción. Útil para entender qué modelos están disponibles para análisis.

**Comando:**
\`\`\`bash
curl -X GET https://revidoc-backend.onrender.com/api/ai/models \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
\`\`\`

**Respuesta Esperada:**
\`\`\`json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "gemini-pro",
        "name": "Gemini Pro",
        "provider": "Google",
        "capabilities": [
          "grammar",
          "style",
          "coherence",
          "suggestions",
          "plagiarism",
          "analysis"
        ],
        "languages": [
          "es",
          "en",
          "fr",
          "de",
          "pt"
        ],
        "description": "Modelo avanzado de Google para análisis completo de texto con soporte multiidioma",
        "maxTokens": 8000,
        "costPerRequest": "low"
      },
      {
        "id": "openai-gpt-4",
        "name": "GPT-4",
        "provider": "OpenAI",
        "capabilities": [
          "grammar",
          "style",
          "coherence",
          "suggestions"
        ],
        "languages": [
          "es",
          "en"
        ],
        "description": "Modelo avanzado para análisis completo de texto",
        "maxTokens": 8000,
        "costPerRequest": "medium"
      },
      {
        "id": "huggingface-bert",
        "name": "BERT",
        "provider": "Hugging Face",
        "capabilities": [
          "grammar",
          "classification"
        ],
        "languages": [
          "es",
          "en"
        ],
        "description": "Modelo especializado en análisis gramatical y clasificación",
        "maxTokens": 512,
        "costPerRequest": "low"
      }
    ]
  }
}
\`\`\`

---

## Notas Importantes

### Autenticación
- Todos los endpoints excepto `/api/auth/register` y `/api/auth/login` requieren autenticación
- El token JWT debe incluirse en el header: `Authorization: Bearer <token>`
- Los tokens expiran después de 7 días por defecto

### Roles de Usuario
- **student**: Puede subir y gestionar sus propios documentos
- **teacher**: Puede revisar documentos de estudiantes
- **admin**: Acceso completo a todos los recursos

### Límites y Restricciones
- Tamaño máximo de archivo: 10MB
- Formatos permitidos: PDF, DOC, DOCX, TXT
- Máximo 10 archivos por petición en subida múltiple

### Códigos de Estado HTTP
- `200`: Operación exitosa
- `201`: Recurso creado exitosamente
- `400`: Error en la petición (datos inválidos)
- `401`: No autenticado
- `403`: No autorizado (sin permisos)
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

### Estados de Revisión
- **pending**: Revisión en cola esperando procesamiento
- **processing**: Revisión siendo analizada por IA
- **completed**: Revisión completada exitosamente
- **failed**: Error durante el procesamiento

### Tipos de Problemas Detectados
- **grammar**: Errores gramaticales
- **spelling**: Errores ortográficos
- **style**: Problemas de estilo y redacción
- **coherence**: Falta de coherencia o cohesión
- **citation**: Problemas con citas y referencias
- **plagiarism**: Similitud con otras fuentes
- **structure**: Problemas de estructura del documento

### Niveles de Severidad
- **low**: Problema menor, sugerencia opcional
- **medium**: Problema que debería corregirse
- **high**: Problema importante que afecta la calidad
- **critical**: Problema grave que debe corregirse inmediatamente

### Permisos de Estadísticas
- Todos los endpoints de estadísticas requieren rol de **admin**
- Los usuarios regulares solo pueden ver sus propias métricas en su perfil
- Las estadísticas se generan automáticamente cada 24 horas

### Rendimiento
- Las revisiones pueden tardar entre 30 segundos y 5 minutos dependiendo del tamaño del documento
- El sistema procesa revisiones de forma asíncrona
- Se recomienda implementar polling o webhooks para obtener resultados

---

## Variables de Entorno Necesarias

Asegúrate de tener configuradas estas variables en tu archivo `.env`:

\`\`\`env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/academic-review
JWT_SECRET=tu_secreto_jwt_muy_seguro
JWT_EXPIRE=7d
MAX_FILE_SIZE=10485760
NEXT_PUBLIC_API_URL=https://revidoc-backend.onrender.com