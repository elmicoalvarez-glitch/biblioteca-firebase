// =============================================================
// CRUD DE LIBROS (Crear, Leer, Actualizar, Eliminar)
// =============================================================
// "CRUD" son las 4 operaciones básicas de cualquier base de datos:
//   C = Create  (agregar un libro nuevo)
//   R = Read    (leer/mostrar la lista de libros)
//   U = Update  (modificar un libro existente)
//   D = Delete  (eliminar un libro)
// En Firestore, la "tabla" se llama "colección" y cada "fila" se
// llama "documento". Aquí la colección es COLECCION_LIBROS
// (definida en firebase-config.js como "libros").

// -------------------------------------------------------------
// CREATE: agrega un nuevo libro al catálogo.
// Recibe un objeto con los datos del formulario y crea un
// documento nuevo en Firestore. Firestore genera automáticamente
// un ID único para el documento (addDoc / .add).
// -------------------------------------------------------------
function crearLibro(titulo, autor, categoria, cantidadTotal) {
  return db.collection(COLECCION_LIBROS).add({
    titulo: titulo,
    autor: autor,
    categoria: categoria,
    cantidadTotal: Number(cantidadTotal),
    // Al crear el libro, todas las copias están disponibles
    cantidadDisponible: Number(cantidadTotal)
  });
}

// -------------------------------------------------------------
// READ: trae TODOS los libros de la colección y, por cada uno,
// ejecuta la función "callback" que recibimos como parámetro.
// Usamos onSnapshot en vez de get() para que la lista se actualice
// SOLA en pantalla cada vez que algo cambia en la base de datos
// (por ejemplo, cuando alguien presta un libro y baja la cantidad
// disponible), sin necesidad de recargar la página.
// -------------------------------------------------------------
function escucharLibros(callback) {
  return db.collection(COLECCION_LIBROS)
    .orderBy("titulo")
    .onSnapshot((snapshot) => {
      const libros = [];
      snapshot.forEach((doc) => {
        // doc.id = identificador único del documento en Firestore
        // doc.data() = objeto con los campos (titulo, autor, etc.)
        libros.push({ id: doc.id, ...doc.data() });
      });
      callback(libros);
    });
}

// -------------------------------------------------------------
// UPDATE: modifica los campos de un libro ya existente,
// identificado por su "idLibro" (el id del documento en Firestore).
// -------------------------------------------------------------
function actualizarLibro(idLibro, datosNuevos) {
  return db.collection(COLECCION_LIBROS).doc(idLibro).update(datosNuevos);
}

// -------------------------------------------------------------
// DELETE: elimina por completo el documento del libro.
// -------------------------------------------------------------
function eliminarLibro(idLibro) {
  return db.collection(COLECCION_LIBROS).doc(idLibro).delete();
}
