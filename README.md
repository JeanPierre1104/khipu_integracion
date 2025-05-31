# 🚀 Integración de Pagos Khipu - Next.js

Una aplicación Next.js que integra el sistema de pagos Khipu con redirección directa y automática.

## ✨ Características

- ✅ **Integración completa con API Khipu**
- ✅ **Redirección automática** al portal de pagos
- ✅ **Manejo de respuestas** (éxito/cancelación)
- ✅ **Interfaz moderna** con Tailwind CSS
- ✅ **TypeScript** para mayor seguridad de tipos
- ✅ **Testing** con Jest
- ✅ **Linting** con ESLint

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta en Khipu con credenciales API

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/TU_USUARIO/khipu-nextjs-integration.git
cd khipu-nextjs-integration
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:
```env
KHIPU_RECEIVER_ID=tu_receiver_id
KHIPU_SECRET=tu_secret_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js 13+
│   ├── api/               # API Routes
│   │   └── payments/      # Endpoint de pagos Khipu
│   ├── payment/           # Páginas de retorno
│   │   ├── success/       # Pago exitoso
│   │   └── cancelled/     # Pago cancelado
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   └── KhipuWebPaymentForm.tsx  # Formulario de pago principal
├── services/              # Servicios y lógica de negocio
│   └── khipu.service.ts   # Integración con API Khipu
└── types/                 # Definiciones TypeScript
    └── khipu.ts          # Tipos para Khipu API
```

## 🔄 Flujo de Pago

1. **Usuario completa formulario** con monto y email
2. **Sistema crea pago** via API Khipu
3. **Redirección automática** al portal de Khipu
4. **Usuario realiza pago** en plataforma Khipu
5. **Retorno automático** al sitio según resultado

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting
npm run lint:fix     # Fix automático de linting
npm test             # Tests
```

## 📋 Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `KHIPU_RECEIVER_ID` | ID del receptor Khipu | ✅ |
| `KHIPU_SECRET` | Clave secreta Khipu | ✅ |
| `NEXT_PUBLIC_BASE_URL` | URL base de la aplicación | ✅ |

## 🚀 Despliegue

### Vercel (Recomendado)

1. Fork este repositorio
2. Conecta tu cuenta de Vercel
3. Configura las variables de entorno
4. Deploy automático

### Otros proveedores

El proyecto es compatible con cualquier proveedor que soporte Next.js:
- Netlify
- Railway
- Digital Ocean
- AWS

## 🔒 Seguridad

- ✅ Variables de entorno para credenciales sensibles
- ✅ Validación de firmas HMAC
- ✅ Sanitización de inputs
- ✅ HTTPS requerido en producción

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si encuentras algún problema:

1. Revisa los [Issues existentes](https://github.com/TU_USUARIO/khipu-nextjs-integration/issues)
2. Crea un nuevo Issue con detalles del problema
3. Incluye logs y pasos para reproducir

---

⭐ Si este proyecto te fue útil, ¡no olvides darle una estrella!