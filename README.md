# 📚 ReviDocUC

**Plataforma colaborativa de revisión automática de escritura académica con Inteligencia Artificial y flujos automatizados.**  

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
![Node](https://img.shields.io/badge/Node.js-18+-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

---

## 🚀 Características Principales

- ✍️ **Análisis de Texto con IA**: Corrección automática de gramática, coherencia y estilo.  
- 🔎 **Detección de Plagio**: Identificación de similitudes mediante embeddings.  
- 🤖 **Automatización con n8n**: Flujos automatizados de revisión y notificaciones.  
- 👥 **Roles de Usuario**: Estudiante, Docente y Administrador.  
- 📊 **Dashboard Analítico**: Estadísticas y métricas de uso.  
- 🔌 **API REST**: Backend escalable con Node.js y Express.  
- 🎨 **Interfaz Moderna**: Frontend responsive con React y Tailwind CSS.  

---

## 🛠️ Stack Tecnológico

### 🖥️ Frontend
- React 18 (UI)
- Redux Toolkit (Gestión de estado)
- React Router (Enrutamiento)
- Tailwind CSS (Estilos)
- Framer Motion (Animaciones)
- Chart.js (Gráficas y visualizaciones)

### ⚙️ Backend
- Node.js (Entorno de ejecución)
- Express.js (Framework web)
- MongoDB + Mongoose (Base de datos NoSQL + ODM)
- JWT (Autenticación)
- Multer (Carga de archivos)

### 🤖 IA y Automatización
- OpenAI API (Análisis avanzado de texto)
- Hugging Face (Modelos NLP)
- Natural.js (Procesamiento de lenguaje natural)
- n8n (Automatización de flujos)

### 🚀 DevOps
- Docker & Docker Compose (Contenerización y orquestación)
- Jest (Pruebas unitarias)
- Cypress (Pruebas end-to-end)
- ESLint (Linting de código)

---

## 📋 Requisitos Previos

- Node.js **18+**  
- Docker & Docker Compose  
- MongoDB (local o Atlas)  
- Claves API de OpenAI y Hugging Face  

---

## ⚡ Instalación y Configuración

### 1️⃣ Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/ReviDoc.git
cd ReviDoc
```

### 2️⃣ Configurar Variables de Entorno
```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus configuraciones

# Frontend
cp frontend/.env.example frontend/.env
# Editar frontend/.env con tus configuraciones
```

### 3️⃣ Instalación con Docker (Recomendado)
```bash
# Construir y levantar todos los servicios
npm run docker:up

# Ver logs
docker-compose logs -f

# Detener servicios
npm run docker:down
```

### 4️⃣ Instalación Manual
```bash
# Instalar dependencias principales
npm install

# Instalar dependencias backend
cd backend && npm install

# Instalar dependencias frontend
cd ../frontend && npm install

# Volver al directorio raíz
cd ..

# Ejecutar en modo desarrollo
npm run dev
```

---

## 🌐 Acceso a los Servicios

- **Frontend** → [http://localhost:3001](http://localhost:3001)  
- **Backend API** → [http://localhost:5001](http://localhost:5001)  
- **n8n Automation** → [http://localhost:5678](http://localhost:5678)  
- **MongoDB** → `localhost:27017`  

---

## 🧪 Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Pruebas con cobertura
npm run test:backend
npm run test:frontend

# Pruebas E2E con Cypress
cd frontend && npm run cypress:run
```

---

## 📊 Estructura del Proyecto

```bash
ReviDocUC/
├── backend/                 # API Node.js + Express
│   ├── controllers/         # Controladores de rutas
│   ├── models/              # Modelos de MongoDB
│   ├── routes/              # Definición de rutas
│   ├── middleware/          # Middleware personalizado
│   ├── services/            # Lógica de negocio
│   ├── utils/               # Utilidades
│   ├── tests/               # Pruebas unitarias
│   └── uploads/             # Archivos subidos
├── frontend/                # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── store/           # Configuración Redux
│   │   ├── services/        # Servicios API
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utilidades
│   ├── public/              # Archivos estáticos
│   └── cypress/             # Pruebas E2E
├── n8n/                     # Flujos de automatización
│   └── workflows/           # Definiciones de workflows
├── docs/                    # Documentación
│   ├── architecture/        # Diagramas de arquitectura
│   ├── api/                 # Documentación API
│   └── user-guide/          # Guía de usuario
└── docker-compose.yml       # Configuración Docker
```

---

## 🔧 Configuración de IA

### OpenAI API
1. Obtener clave en [OpenAI](https://platform.openai.com/)  
2. Agregar `OPENAI_API_KEY` en `.env`  

### Hugging Face
1. Crear cuenta en [Hugging Face](https://huggingface.co/)  
2. Generar token de acceso  
3. Agregar `HUGGINGFACE_API_KEY` en `.env`  

---

## 🤖 Automatización con n8n

Los flujos incluyen:  
- 📑 Procesamiento automático de documentos  
- 📧 Notificaciones por email  
- 📊 Generación de reportes  
- 🔄 Sincronización de datos  

Enlace del Webhook: [https://josuelm7.app.n8n.cloud/webhook/notificacion)

---

## 📈 Funcionalidades de IA

### 🔹 Análisis de Texto
- Corrección gramatical  
- Mejora de coherencia  
- Sugerencias de estilo  
- Verificación de normas APA/IEEE  

### 🔹 Detección de Plagio
- Comparación con base de datos  
- Análisis de similitud semántica  
- Reportes detallados  

### 🔹 Chatbot Académico
- Asistencia en tiempo real  
- Respuestas contextuales  
- Guías de escritura  

---

## 👥 Roles de Usuario

### 👨‍🎓 Estudiante
- Subir documentos para revisión  
- Ver reportes y sugerencias  
- Acceso al chatbot  

### 👩‍🏫 Docente
- Revisar trabajos de estudiantes  
- Configurar parámetros de evaluación  
- Ver estadísticas de clase  

### 👨‍💻 Administrador
- Gestión del sistema  
- Configuración de IA  
- Administración de usuarios  

---

## 🔒 Seguridad

- 🔑 Autenticación JWT  
- 🛡️ Validación de entrada  
- 📉 Rate limiting  
- 🧹 Sanitización de archivos  
- 📝 Logs de auditoría  

---

## 📊 Monitoreo y Logs

- Logs estructurados con Winston  
- Métricas de rendimiento  
- Monitoreo de errores  
- Dashboards de uso  

---

## 🌍 Impacto Ambiental

El uso de **Docker** y una arquitectura optimizada reduce en ~30% el consumo energético frente a entornos tradicionales, contribuyendo a un desarrollo más sostenible.  

---

## 🤝 Contribución

1. Haz un **fork** del repositorio  
2. Crea una nueva rama → `git checkout -b feature/nueva-funcionalidad`  
3. Realiza commits → `git commit -m 'feat: agregar nueva funcionalidad'`  
4. Push de la rama → `git push origin feature/nueva-funcionalidad`  
5. Abre un **Pull Request**  

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.  

---

**Desarrollado con ❤️ para mejorar la escritura académica.**
