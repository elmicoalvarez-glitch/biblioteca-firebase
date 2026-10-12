// =============================================================
// AUTENTICACIÓN (INICIO DE SESIÓN CON CUENTA DE GMAIL)
// =============================================================
// Este archivo se usa en index.html (la pantalla de login).
// Usa el "proveedor" de Google que trae Firebase Authentication:
// el usuario hace clic en un botón, aparece la ventana de Google,
// elige su cuenta de Gmail y Firebase nos devuelve sus datos
// (nombre, correo, foto, un "uid" único) sin que nosotros tengamos
// que manejar contraseñas.

// Objeto que representa "quiero iniciar sesión con Google"
const proveedorGoogle = new firebase.auth.GoogleAuthProvider();

// Referencias a elementos del HTML de index.html
const btnLogin = document.getElementById("btn-login-google");
const divError = document.getElementById("mensaje-error");

if (btnLogin) {
  btnLogin.addEventListener("click", iniciarSesionConGoogle);
}

// -------------------------------------------------------------
// Paso 1: abrir la ventana emergente de Google y esperar que el
// usuario elija su cuenta.
// -------------------------------------------------------------
function iniciarSesionConGoogle() {
  auth.signInWithPopup(proveedorGoogle)
    .then((resultado) => {
      const usuarioGoogle = resultado.user;
      verificarOCrearPerfilUsuario(usuarioGoogle);
    })
    .catch((error) => {
      mostrarError("No se pudo iniciar sesión: " + error.message);
    });
}

// -------------------------------------------------------------
// Paso 2: la primera vez que alguien entra, no existe todavía su
// documento en la colección "usuarios" de Firestore, así que lo
// creamos con un rol por defecto ("estudiante"). Si ya existe,
// simplemente lo leemos para saber su rol y redirigir según
// corresponda (administrador -> admin.html, lo demás -> catalogo.html).
// -------------------------------------------------------------
function verificarOCrearPerfilUsuario(usuarioGoogle) {
  const refUsuario = db.collection(COLECCION_USUARIOS).doc(usuarioGoogle.uid);

  refUsuario.get().then((documento) => {
    if (documento.exists) {
      // Ya existía: solo revisamos su rol para redirigir
      redirigirSegunRol(documento.data().rol);
    } else {
      // Primera vez que entra esta persona: creamos su perfil.
      // Por seguridad, el rol "admin" NUNCA se asigna aquí de forma
      // automática; un rol admin se asigna manualmente desde la
      // consola de Firebase o desde admin.html por otro administrador.
      const nuevoPerfil = {
        nombre: usuarioGoogle.displayName,
        correo: usuarioGoogle.email,
        foto: usuarioGoogle.photoURL,
        rol: "estudiante",
        fechaRegistro: firebase.firestore.FieldValue.serverTimestamp()
      };

      refUsuario.set(nuevoPerfil).then(() => {
        redirigirSegunRol("estudiante");
      });
    }
  }).catch((error) => {
    mostrarError("Error leyendo tu perfil: " + error.message);
  });
}

function redirigirSegunRol(rol) {
  if (rol === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "catalogo.html";
  }
}

function mostrarError(texto) {
  if (divError) {
    divError.textContent = texto;
  }
}

// -------------------------------------------------------------
// Función de utilidad reutilizada por catalogo.html y admin.html:
// si no hay nadie con sesión iniciada, regresa al login.
// Si hay sesión, devuelve los datos del usuario mediante un callback.
// -------------------------------------------------------------
function protegerPagina(callback) {
  auth.onAuthStateChanged((usuario) => {
    if (!usuario) {
      window.location.href = "index.html";
    } else {
      callback(usuario);
    }
  });
}

function cerrarSesion() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}

// -------------------------------------------------------------
// Igual que protegerPagina, pero además comprueba en Firestore
// que el rol del usuario sea "admin". Si una persona con rol
// "estudiante" o "profesor" intenta entrar directamente a
// admin.html escribiendo la URL, la mandamos a catalogo.html.
// Esto es solo una protección de "interfaz" (para que no vea la
// pantalla); la protección real de los DATOS la dan las reglas
// de seguridad de Firestore (firestore.rules), que es lo que de
// verdad impide que alguien sin permiso escriba en la base de datos.
// -------------------------------------------------------------
function protegerPaginaAdmin(callback) {
  protegerPagina((usuario) => {
    db.collection(COLECCION_USUARIOS).doc(usuario.uid).get().then((doc) => {
      if (doc.exists && doc.data().rol === "admin") {
        callback(usuario);
      } else {
        window.location.href = "catalogo.html";
      }
    });
  });
}
