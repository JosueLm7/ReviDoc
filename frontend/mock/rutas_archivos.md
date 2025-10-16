# Mock API Server

Este directorio contiene la configuración del servidor mock para desarrollo frontend sin depender del backend completo.

## Características

- **JSON Server**: Servidor REST completo basado en `db.json`
- **Datos realistas**: Usuarios, documentos, análisis de IA, revisiones y estadísticas
- **Relaciones**: Los datos están relacionados entre sí (documentos → usuarios, análisis → documentos)
- **Endpoints personalizados**: Autenticación, upload de documentos, análisis de IA
- **Latencia simulada**: 300ms de delay para simular red real

## Uso

### Iniciar solo el servidor mock:
\`\`\`bash
npm run mock:api
\`\`\`

### Iniciar frontend + mock API simultáneamente:
\`\`\`bash
npm run dev:mock
\`\`\`

## Endpoints Disponibles

### Autenticación
- `POST /api/auth/login` - Login (email: admin@example.com, password: password123)
- `POST /api/auth/register` - Registro de nuevo usuario
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Obtener usuario actual

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Documentos
- `GET /api/documents` - Listar documentos
- `GET /api/documents/:id` - Obtener documento por ID
- `POST /api/documents` - Subir nuevo documento
- `PUT /api/documents/:id` - Actualizar documento
- `DELETE /api/documents/:id` - Eliminar documento

### Análisis de IA
- `POST /api/ai/analyze` - Analizar texto
- `POST /api/ai/plagiarism` - Verificar plagio
- `POST /api/ai/suggestions` - Generar sugerencias
- `GET /api/ai/models` - Listar modelos disponibles

### Revisiones
- `GET /api/reviews` - Listar revisiones
- `GET /api/reviews/:id` - Obtener revisión por ID
- `POST /api/reviews/:documentId` - Crear nueva revisión

### Estadísticas
- `GET /api/statistics/dashboard` - Estadísticas del dashboard
- `GET /api/statistics/trends` - Tendencias temporales

## Credenciales de Prueba

### Admin
- Email: `admin@example.com`
- Password: `password123`
- Role: `admin`

### Usuario Regular
- Email: `user@example.com`
- Password: `password123`
- Role: `user`

### Revisor
- Email: `reviewer@example.com`
- Password: `password123`
- Role: `reviewer`

## Estructura de Datos

### Usuario
\`\`\`json
{
  "id": "1",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "avatar": "https://...",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "lastLogin": "2025-01-16T14:30:00.000Z",
  "isActive": true
}
\`\`\`

### Documento
\`\`\`json
{
  "id": "1",
  "title": "Título del documento",
  "filename": "documento.pdf",
  "userId": "2",
  "status": "completed",
  "uploadedAt": "2025-01-10T10:30:00.000Z",
  "content": "Contenido del documento...",
  "metadata": {
    "pages": 45,
    "wordCount": 8500,
    "language": "es"
  }
}
\`\`\`

## Modificar Datos

Puedes editar directamente `mock/db.json` para agregar, modificar o eliminar datos. El servidor se reiniciará automáticamente con los cambios.

## Notas

- Los cambios en los datos se persisten en `db.json` mientras el servidor está corriendo
- Al reiniciar el servidor, los datos vuelven al estado original del archivo
- La autenticación es simulada (cualquier password "password123" funciona)
- Los tokens JWT son mock y no tienen validación real
