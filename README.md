# Contenido Rapido

Aplicacion web para gestionar contenido, canales y publicaciones, con frontend en Vite/React y backend en Express/Prisma.

## Opcion recomendada para mostrar avance a clientes

La opcion mas profesional para compartir el estado del desarrollo es un entorno de `staging`:

- frontend desplegado con URL publica
- backend desplegado por separado
- base de datos de prueba con datos demo
- credenciales demo para que el cliente navegue sin tocar tu entorno local

Este repositorio ya incluye una base para desplegar staging en Render con `render.yaml`.

## Variables de entorno

Frontend (`.env` basado en `.env.example`):

```bash
VITE_API_URL=http://localhost:4002/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

Backend (`backend/.env` basado en `backend/.env.example`):

```bash
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/pcms
JWT_SECRET=replace_with_long_random_secret
CORS_ORIGIN=http://localhost:8080
APP_BASE_URL=http://localhost:4000
FRONTEND_APP_URL=http://localhost:8080
VIDEO_PROVIDER=mock
VIDEO_AUTO_GENERATE_ON_APPROVAL=false
```

## Deploy de staging en Render

1. Subi el repo a GitHub.
2. En Render, crea un nuevo `Blueprint` y selecciona este repositorio.
3. Render va a detectar `render.yaml` y crear:
   - una base PostgreSQL
   - un backend `contenido-rapido-api-staging`
   - un frontend `contenido-rapido-web-staging`
4. Antes del primer uso, completa en Render las variables marcadas con `sync: false`.
   Usa las URLs publicas reales que te asigne Render, por ejemplo:
   - `APP_BASE_URL=https://contenido-rapido-api-staging.onrender.com`
   - `FRONTEND_APP_URL=https://contenido-rapido-web-staging.onrender.com`
   - `CORS_ORIGIN=https://contenido-rapido-web-staging.onrender.com`
   - `VITE_API_URL=https://contenido-rapido-api-staging.onrender.com/api`
5. En el backend, corre las migraciones de Prisma y el seed demo:

```bash
cd backend
npx prisma migrate deploy
npm run seed
```

## Variables que tenes que completar en Render

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `OPENAI_API_KEY` si queres probar generacion real
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `LINKEDIN_REDIRECT_URI`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_REDIRECT_URI`

Para una demo con cliente, te conviene dejar:

- `VIDEO_PROVIDER=mock`
- `VIDEO_AUTO_GENERATE_ON_APPROVAL=false`
- OAuth social desactivado hasta tener URLs finales confirmadas

## Checklist antes de compartir el link

- usar base de datos de staging, no la de trabajo
- ejecutar `npm run seed` en `backend`
- entrar con el usuario demo `demo@pcms.local`
- cambiar la password demo si vas a compartir el link fuera de un entorno controlado
- verificar `https://tu-backend.onrender.com/health`
- verificar login y las pantallas principales

## Desarrollo local

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev
```
