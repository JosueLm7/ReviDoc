# 📚 Academic Writing Reviewer

Plataforma colaborativa para revisión automática de escritura académica con Inteligencia Artificial y automatización de flujos.

## 🚀 Características Principales

- **Análisis de Texto con IA**: Corrección automática de gramática, coherencia y estilo
- **Detección de Plagio**: Identificación de similitudes usando embeddings
- **Automatización con n8n**: Flujos automatizados de revisión y notificaciones
- **Roles de Usuario**: Estudiante, Docente y Administrador
- **Dashboard Analítico**: Estadísticas y métricas de uso
- **API REST**: Backend escalable con Node.js y Express
- **Interfaz Moderna**: Frontend responsive con React y Tailwind CSS

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **Redux Toolkit** - Gestión de estado
- **React Router** - Enrutamiento
- **Tailwind CSS** - Framework de estilos
- **Framer Motion** - Animaciones
- **Chart.js** - Gráficos y visualizaciones

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **Multer** - Carga de archivos

### IA y Automatización
- **OpenAI API** - Análisis de texto avanzado
- **Hugging Face** - Modelos de NLP
- **Natural.js** - Procesamiento de lenguaje natural
- **n8n** - Automatización de flujos

### DevOps
- **Docker** - Contenerización
- **Docker Compose** - Orquestación de servicios
- **Jest** - Pruebas unitarias
- **Cypress** - Pruebas E2E
- **ESLint** - Linting de código

## 📋 Requisitos Previos

- Node.js 18+ 
- Docker y Docker Compose
- MongoDB (local o Atlas)
- Claves API de OpenAI y Hugging Face

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
\`\`\`bash
git clone https://github.com/tu-usuario/academic-writing-reviewer.git
cd academic-writing-reviewer
\`\`\`

### 2. Configurar Variables de Entorno
\`\`\`bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus configuraciones

# Frontend  
cp frontend/.env.example frontend/.env
# Editar frontend/.env con tus configuraciones
\`\`\`

### 3. Instalación con Docker (Recomendado)
\`\`\`bash
# Construir y levantar todos los servicios
npm run docker:up

# Ver logs
docker-compose logs -f

# Detener servicios
npm run docker:down
\`\`\`

### 4. Instalación Manual
\`\`\`bash
# Instalar dependencias del proyecto principal
npm install

# Instalar dependencias del backend
cd backend && npm install

# Instalar dependencias del frontend
cd ../frontend && npm install

# Volver al directorio raíz
cd ..

# Ejecutar en modo desarrollo
npm run dev
\`\`\`

## 🌐 Acceso a los Servicios

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **n8n Automation**: http://localhost:5678
- **MongoDB**: localhost:27017

## 🧪 Pruebas

\`\`\`bash
# Ejecutar todas las pruebas
npm test

# Pruebas con cobertura
npm run test:backend
npm run test:frontend

# Pruebas E2E con Cypress
cd frontend && npm run cypress:run
\`\`\`

## 📊 Estructura del Proyecto

\`\`\`

academic-writing-reviewer/

├── backend/                 # API Node.js + Express

│   ├── controllers/         # Controladores de rutas

│   ├── models/             # Modelos de MongoDB

│   ├── routes/             # Definición de rutas

│   ├── middleware/         # Middleware personalizado

│   ├── services/           # Lógica de negocio

│   ├── utils/              # Utilidades

│   ├── tests/              # Pruebas unitarias

│   └── uploads/            # Archivos subidos

├── frontend/               # Aplicación React

│   ├── src/

│   │   ├── components/     # Componentes reutilizables

│   │   ├── pages/          # Páginas de la aplicación

│   │   ├── store/          # Configuración Redux

│   │   ├── services/       # Servicios API

│   │   ├── hooks/          # Custom hooks

│   │   └── utils/          # Utilidades

│   ├── public/             # Archivos estáticos

│   └── cypress/            # Pruebas E2E

├── n8n/                    # Flujos de automatización

│   └── workflows/          # Definiciones de workflows

├── docs/                   # Documentación

│   ├── architecture/       # Diagramas de arquitectura

│   ├── api/               # Documentación API

│   └── user-guide/        # Guía de usuario

└── docker-compose.yml     # Configuración Docker

\`\`\`

## 🔧 Configuración de IA

### OpenAI API
1. Obtener clave API en https://platform.openai.com/
2. Agregar `OPENAI_API_KEY` en `.env`

### Hugging Face
1. Crear cuenta en https://huggingface.co/
2. Generar token de acceso
3. Agregar `HUGGINGFACE_API_KEY` en `.env`

## 🤖 Automatización con n8n

Los flujos de automatización incluyen:
- Procesamiento automático de documentos
- Notificaciones por email
- Generación de reportes
- Sincronización de datos

Acceder a n8n en http://localhost:5678 con:
- Usuario: `admin`
- Contraseña: `password123`

## 📈 Funcionalidades de IA

### 1. Análisis de Texto
- Corrección gramatical
- Mejora de coherencia
- Sugerencias de estilo
- Verificación de formato APA/IEEE

### 2. Detección de Plagio
- Comparación con base de datos
- Análisis de similitud semántica
- Generación de reportes detallados

### 3. Chatbot Académico
- Asistencia en tiempo real
- Respuestas contextuales
- Guías de escritura

## 👥 Roles de Usuario

### Estudiante
- Subir documentos para revisión
- Ver reportes de análisis
- Recibir sugerencias de mejora
- Acceso al chatbot

### Docente
- Revisar trabajos de estudiantes
- Configurar parámetros de evaluación
- Ver estadísticas de clase
- Gestionar notificaciones

### Administrador
- Gestión completa del sistema
- Análisis de uso y estadísticas
- Configuración de IA
- Administración de usuarios

## 🔒 Seguridad

- Autenticación JWT
- Validación de entrada
- Rate limiting
- Sanitización de archivos
- Headers de seguridad
- Logs de auditoría

## 📊 Monitoreo y Logs

- Logs estructurados con Winston
- Métricas de rendimiento
- Monitoreo de errores
- Dashboards de uso

## 🌍 Impacto Ambiental

El uso de Docker y la arquitectura optimizada reduce aproximadamente un 30% el consumo energético comparado con entornos de desarrollo locales tradicionales, contribuyendo a prácticas de desarrollo sostenible.

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para mejorar la escritura académica**
\`\`\`
