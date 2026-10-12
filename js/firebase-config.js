// =============================================================
// CONFIGURACIÓN DE FIREBASE
// =============================================================
// Este archivo conecta nuestra página web con el proyecto de Firebase.
// Los datos de abajo (apiKey, projectId, etc.) NO son contraseñas secretas:
// son identificadores públicos que Firebase necesita para saber a qué
// proyecto pertenece esta página. Google los protege con las "Reglas de
// seguridad" de Firestore (ver firestore.rules), no ocultándolos.
//
// ¿DE DÓNDE SE SACAN ESTOS VALORES?
// Firebase Console -> (ícono de engranaje) Configuración del proyecto
// -> pestaña "General" -> sección "Tus apps" -> app web -> "SDK de Firebase"
// Ahí Firebase te muestra un bloque de código igual a este, ya con tus
// propios valores. Debes copiar y pegar ESE bloque reemplazando el de abajo.
const firebaseConfig = {
  apiKey: "AIzaSyDsd9i_ND-VmHVvnYcuaBlVf4lieOA8jUk",
  authDomain: "biblioteca-escolar-firebase.firebaseapp.com",
  projectId: "biblioteca-escolar-firebase",
  storageBucket: "biblioteca-escolar-firebase.firebasestorage.app",
  messagingSenderId: "716495078452",
  appId: "1:716495078452:web:c96b058daf5f32098d7661"
};

// Inicializamos (encendemos) la conexión con Firebase usando la
// configuración de arriba. A partir de esta línea, "firebase" ya
// sabe con qué proyecto hablar en toda la página.
firebase.initializeApp(firebaseConfig);

// Creamos dos atajos que vamos a reutilizar en TODOS los demás archivos .js:
// - auth: el módulo encargado de iniciar/cerrar sesión (login con Google)
// - db:   el módulo encargado de leer y escribir en la base de datos Firestore
const auth = firebase.auth();
const db = firebase.firestore();

// Nombres de las "colecciones" (tablas) que vamos a usar en Firestore.
// Guardarlos en constantes evita errores de tipeo al escribir el nombre
// de la colección en varios archivos distintos.
const COLECCION_USUARIOS = "usuarios";
const COLECCION_LIBROS = "libros";
const COLECCION_PRESTAMOS = "prestamos";
