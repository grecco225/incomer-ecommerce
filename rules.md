# Reglas del proyecto Incomer eCommerce

## Stack
- Frontend: Next.js 15, TypeScript, Tailwind CSS 4, Framer Motion
- Backend: NestJS, TypeScript, Prisma ORM
- Base de datos: PostgreSQL (Neon Free)
- Cache: Redis (Upstash Free)
- Pagos: Stripe + PayPal (modo test)
- Monorepo: pnpm workspaces + Turborepo

## Estructura
- apps/web   → Next.js (frontend)
- apps/api   → NestJS (backend)
- packages/shared-types → tipos compartidos

## Convenciones
- Archivos: kebab-case
- Componentes: PascalCase
- Variables/funciones: camelCase
- Clases Tailwind: mobile-first siempre
- Commits: Conventional Commits (feat:, fix:, chore:)

## Reglas del agente
- Siempre muestra el plan antes de sobrescribir archivos
- No uses placeholders ni código ficticio
- Genera código real, tipado y funcional
- Incluye comentarios solo donde agreguen valor real