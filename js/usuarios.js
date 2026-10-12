// =============================================================
// CRUD DE USUARIOS (solo lo usa admin.html)
// =============================================================
// Los usuarios NO se "crean" desde aquí con un formulario de registro
// clásico: se crean automáticamente la primera vez que alguien inicia
// sesión con su cuenta de Gmail (ver verificarOCrearPerfilUsuario en
// auth.js). Desde este archivo, el administrador puede:
//   - LEER la lista completa de usuarios registrados
//   - ACTUALIZAR el rol de un usuario (estudiante / profesor / admin)
//   - ELIMINAR el perfil de un usuario (esto NO borra su cuenta de
//     Gmail, solo su perfil dentro de nuestra biblioteca)

// -------------------------------------------------------------
// READ: escucha en tiempo real la colección de usuarios.
// -------------------------------------------------------------
function escucharUsuarios(callback) {
  return db.collection(COLECCION_USUARIOS)
    .orderBy("nombre")
    .onSnapshot((snapshot) => {
      const usuarios = [];
      snapshot.forEach((doc) => {
        usuarios.push({ id: doc.id, ...doc.data() });
      });
      callback(usuarios);
    });
}

// -------------------------------------------------------------
// UPDATE: cambia el rol de un usuario. Aquí es donde el
// administrador convierte a alguien en "admin", "profesor" o
// lo regresa a "estudiante".
// -------------------------------------------------------------
function actualizarRolUsuario(idUsuario, nuevoRol) {
  return db.collection(COLECCION_USUARIOS).doc(idUsuario).update({
    rol: nuevoRol
  });
}

// -------------------------------------------------------------
// DELETE: elimina el perfil del usuario de Firestore.
// -------------------------------------------------------------
function eliminarUsuario(idUsuario) {
  return db.collection(COLECCION_USUARIOS).doc(idUsuario).delete();
}
