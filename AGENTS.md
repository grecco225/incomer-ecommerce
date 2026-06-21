# Incomer E-Commerce

Plataforma de eCommerce moderna construida como monorepo con frontend, backend y paquetes compartidos.

## Overview

Proyecto eCommerce empresarial con:
- Frontend en `apps/web`
- Backend en `apps/api`
- Paquetes compartidos en `packages`
- Docker para PostgreSQL y Redis
- Turborepo + pnpm workspaces

## Estructura del repo

```bash
incomer-ecommerce/
├── apps/
│   ├── web/        # Frontend Next.js
│   └── api/        # Backend API
├── packages/       # Código compartido
├── .antigravity/   # Workflows y configuración del IDE
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## apps/web

Contiene el frontend principal del eCommerce.
Aquí se trabaja en:
- Home page
- Catálogo
- Carrito
- Checkout
- Login / Register
- UI / UX
- SEO y responsive design

## apps/api

Contiene el backend principal.
Aquí se trabaja en:
- Autenticación
- Usuarios
- Productos
- Órdenes
- Pagos
- Inventario
- Webhooks
- Seguridad

## packages

Código reutilizable entre frontend y backend:
- Tipos compartidos
- Utilidades
- Configuraciones comunes
- Componentes compartidos

## Variables de entorno

Archivo principal:
- `.env.example`

Copia para uso local:
```bash
copy .env.example .env
```

## Comandos rápidos

Instalar dependencias:
```bash
pnpm install
```

Levantar base de datos y Redis:
```bash
docker compose -f .antigravity/workflows/docker-compose.yml up -d
```

Levantar el proyecto:
```bash
pnpm dev
```

## Flujo de trabajo diario

1. Abrir el proyecto en la carpeta raíz.
2. Verificar Docker.
3. Levantar contenedores.
4. Ejecutar `pnpm dev`.
5. Trabajar solo en la carpeta necesaria.

## Convenciones de trabajo

- Si el cambio es visual, revisar `apps/web`.
- Si el cambio es de negocio o API, revisar `apps/api`.
- Si el cambio se comparte entre ambos, revisar `packages`.
- No recorrer todo el monorepo si no es necesario.

## Notas para agentes

Antes de editar código:
- Identificar el área exacta del cambio.
- Leer solo la carpeta relevante.
- Evitar abrir archivos no relacionados.
- Mantener la respuesta y la edición enfocadas en la ruta del trabajo.

## Estado actual

- Docker activo.
- PostgreSQL activo.
- Redis activo.
- Proyecto levantado con éxito.
