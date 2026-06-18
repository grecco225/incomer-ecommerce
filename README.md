# Incomer eCommerce 🛒

Monorrepisitorio para la plataforma Incomer eCommerce desarrollado con **pnpm workspaces** y **Turborepo**.

---

## 🛠️ Requisitos Previos

- **Node.js** (Versión 18 o superior recomendada)
- **pnpm** (Instalado globalmente o en las variables de entorno)

---

## 🚀 Comandos para Levantar el Proyecto

### 1. Instalar todas las dependencias
Desde la carpeta raíz del proyecto, ejecuta:
```bash
pnpm install
```

### 2. Configurar Variables de Entorno
Crea el archivo `.env` en la carpeta del backend:
- Copia el contenido de [.env.example](file:///c:/Users/TOSHIBA/Desktop/incomer-ecommerce/.env.example) en un nuevo archivo `apps/api/.env` y asegúrate de rellenar los datos de conexión de base de datos (Neon), JWT, Stripe, etc.

### 3. Levantar las aplicaciones (Frontend + Backend en simultáneo)
Turborepo gestiona la ejecución paralela del frontend (Next.js) y backend (NestJS) con el siguiente comando en la raíz:
```bash
pnpm dev
```

### 4. Levantar proyectos por separado (Opcional)
Si prefieres levantar solo una parte del monorrepisitorio:
* **Frontend (Next.js 15)**:
  ```bash
  pnpm --filter web dev
  ```
* **Backend (NestJS + Prisma)**:
  ```bash
  pnpm --filter api dev
  ```

---

## 🗄️ Comandos para la Base de Datos (Prisma 7)

Antes de levantar el backend, debes configurar la base de datos PostgreSQL en Neon. 
Navega a la carpeta del backend:
```bash
cd apps/api
```

- **Generar y aplicar migraciones:**
  ```bash
  npx prisma migrate dev --name init
  ```
- **Abrir el visor de base de datos (Prisma Studio):**
  ```bash
  npx prisma studio
  ```

---

## ⚠️ Errores Comunes y Soluciones

### 1. `El término 'pnpm' no se reconoce como nombre de un cmdlet...`
* **Causa:** El ejecutable de `pnpm` o `npm` no está registrado en las Variables de Entorno de Windows.
* **Solución:** Agrega las siguientes rutas a la variable de usuario **Path**:
  - `C:\Users\TOSHIBA\AppData\Roaming\npm`
  - `C:\Users\TOSHIBA\AppData\Local\pnpm`
  *(Reinicia tu terminal/consola después de realizar el cambio).*

### 2. `Error: Cannot find module 'dotenv/config'`
* **Causa:** `prisma.config.ts` utiliza `dotenv` para leer la base de datos del `.env`, pero la librería no está instalada en el backend.
* **Solución:** Ve a la carpeta `apps/api` e instala la dependencia:
  ```bash
  pnpm add -D dotenv
  ```

### 3. `Error: The datasource property 'url' is no longer supported in schema files (P1012)`
* **Causa:** Prisma 7 ya no permite definir la variable de conexión `url` dentro del archivo `schema.prisma`.
* **Solución:**
  - Asegúrate de tener el archivo [prisma.config.ts](file:///c:/Users/TOSHIBA/Desktop/incomer-ecommerce/apps/api/prisma.config.ts) en la raíz de `apps/api` configurado con la lectura de variables de entorno.
  - Verifica que en [schema.prisma](file:///c:/Users/TOSHIBA/Desktop/incomer-ecommerce/apps/api/prisma/schema.prisma) el bloque `datasource` solo contenga `provider = "postgresql"` y **no** la propiedad `url`.

### 4. `Can't reach database server at localhost... (P1001)`
* **Causa 1:** Estás en la ruta de terminal equivocada (ej. `C:\Users\TOSHIBA\incomer-ecommerce` en lugar de la versión de escritorio `C:\Users\TOSHIBA\Desktop\incomer-ecommerce`), por lo que Prisma lee un archivo `.env` vacío o local desconfigurado.
* **Causa 2:** La base de datos de Neon ha suspendido el proyecto gratuito por inactividad.
* **Solución:**
  - Asegúrate de situar tu consola exactamente en:
    ```bash
    cd C:\Users\TOSHIBA\Desktop\incomer-ecommerce\apps\api
    ```
  - Visita tu consola de Neon.tech para verificar que la base de datos esté activa y que tu cadena de conexión sea la correcta en `apps/api/.env`.