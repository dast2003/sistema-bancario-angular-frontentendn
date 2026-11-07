# Sistema Bancario - Frontend

Frontend en **Angular 20 + Tailwind CSS 4** para el sistema bancario basico. Proyecto de practica de programacion web.

Backend (Spring Boot + JWT + Swagger + H2): https://github.com/dast2003/sistema-bancario-backend

## Pantallas

- **Login**: email y contrasena; si el token expira, vuelve aqui con un aviso.
- **Registro**: nombre, apellido, documento, email y contrasena (mismas validaciones que el backend).
- **Panel**: saldo total, mis cuentas, abrir cuenta, depositar, retirar, transferir e historial de movimientos.

## Ejecutar

Requisitos: Node.js 20.19+ o 22 LTS, y el backend corriendo en `http://localhost:8080`.

```bash
npm install
npm start
```

Abre http://localhost:4200. La URL del backend se cambia en `src/environments/environment.ts`.

Build de produccion: `npm run build` (sale en `dist/banco-frontend`).

## Estructura

```
src/app
├── core/
│   ├── auth.service.ts      Sesion con signals (token en localStorage, controla expiracion)
│   ├── banco.service.ts     Llamadas a cuentas, operaciones y transferencias
│   ├── auth.interceptor.ts  Agrega "Authorization: Bearer <token>" y maneja el 401
│   ├── auth.guards.ts       authGuard (rutas privadas) e invitadoGuard (login/registro)
│   ├── errores.ts           Convierte errores del backend en mensajes legibles
│   └── models.ts            Interfaces de la API
└── pages/
    ├── login/
    ├── registro/
    └── panel/
```

Los estilos reutilizables (`.input`, `.btn-primary`, `.card`...) estan en `src/styles.css` con `@apply` de Tailwind.
