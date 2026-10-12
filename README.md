# Biblioteca Escolar — Firebase + GitHub Pages

Proyecto de ejemplo para la práctica de **Gestión y Mantenimiento de Bases
de Datos** (Media Técnica). Sistema de préstamo de libros con dos perfiles:

- **Estudiante / Profesor**: ve el catálogo de libros, solicita préstamos
  y puede devolverlos (`catalogo.html`).
- **Administrador**: agrega, edita y elimina libros; gestiona el rol de
  los usuarios; ve el historial completo de préstamos (`admin.html`).

El inicio de sesión se hace únicamente con una cuenta de **Gmail**, usando
Firebase Authentication (proveedor Google). La base de datos es
**Cloud Firestore** (NoSQL) y el sitio se publica con **GitHub Pages** o
**Firebase Hosting**.

## Estructura de archivos

```
biblioteca-firebase/
├── index.html          Pantalla de login (Google)
├── catalogo.html        Pantalla de estudiantes/profesores
├── admin.html            Pantalla de administrador
├── css/estilos.css       Estilos de las 3 páginas
├── js/
│   ├── firebase-config.js   Conexión con el proyecto de Firebase
│   ├── auth.js               Login con Google, roles, protección de páginas
│   ├── libros.js              CRUD de libros en Firestore
│   ├── usuarios.js            CRUD de usuarios en Firestore
│   ├── prestamos.js            Solicitar y devolver préstamos
│   ├── catalogo.js              Lógica visual de catalogo.html
│   └── admin.js                  Lógica visual de admin.html
├── firestore.rules      Reglas de seguridad de la base de datos
└── firebase.json        Configuración de Firebase Hosting
```

Guía paso a paso completa (con pantallazos): ver carpeta `../guia/`.
