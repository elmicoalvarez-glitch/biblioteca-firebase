// =============================================================
// PRÉSTAMOS DE LIBROS
// =============================================================
// Un "préstamo" conecta dos colecciones: un libro y un usuario.
// Guardamos también el título y el nombre ya escritos (no solo los
// IDs) para poder mostrar la lista de préstamos sin tener que ir a
// buscar cada libro/usuario por separado (esto se llama
// "desnormalizar" datos: se usa un poco más de espacio en la base
// de datos a cambio de lecturas más rápidas y sencillas).

// -------------------------------------------------------------
// CREATE (solicitar un préstamo): esta es la operación más
// delicada de todo el proyecto, porque DOS personas podrían
// intentar pedir la ÚLTIMA copia disponible de un libro al mismo
// tiempo. Para evitar que el contador de disponibles quede mal
// (por ejemplo en -1), usamos una TRANSACCIÓN de Firestore:
// runTransaction() lee el libro, verifica disponibilidad y
// descuenta una copia de forma ATÓMICA (todo o nada, sin que otra
// operación se cruce en la mitad).
// -------------------------------------------------------------
function solicitarPrestamo(libro, usuario) {
  const refLibro = db.collection(COLECCION_LIBROS).doc(libro.id);

  return db.runTransaction((transaccion) => {
    return transaccion.get(refLibro).then((snapLibro) => {
      const disponibles = snapLibro.data().cantidadDisponible;

      if (disponibles <= 0) {
        // Lanzar un error dentro de la transacción la cancela
        // por completo: no queda ningún cambio a medias.
        throw new Error("No quedan copias disponibles de este libro.");
      }

      // 1) Restamos una copia disponible del libro
      transaccion.update(refLibro, {
        cantidadDisponible: disponibles - 1
      });

      // 2) Calculamos la fecha de devolución esperada: hoy + 8 días
      const hoy = new Date();
      const fechaDevolucion = new Date(hoy);
      fechaDevolucion.setDate(hoy.getDate() + 8);

      // 3) Creamos el documento del préstamo
      const refNuevoPrestamo = db.collection(COLECCION_PRESTAMOS).doc();
      transaccion.set(refNuevoPrestamo, {
        idLibro: libro.id,
        tituloLibro: libro.titulo,
        idUsuario: usuario.uid,
        nombreUsuario: usuario.displayName,
        correoUsuario: usuario.email,
        fechaPrestamo: firebase.firestore.Timestamp.fromDate(hoy),
        fechaDevolucionEsperada: firebase.firestore.Timestamp.fromDate(fechaDevolucion),
        fechaDevolucionReal: null,
        estado: "prestado"
      });
    });
  });
}

// -------------------------------------------------------------
// UPDATE (devolver un libro): marca el préstamo como "devuelto"
// y le regresa una copia disponible al libro. También usamos una
// transacción por la misma razón que al solicitar el préstamo.
// -------------------------------------------------------------
function devolverPrestamo(idPrestamo, idLibro) {
  const refPrestamo = db.collection(COLECCION_PRESTAMOS).doc(idPrestamo);
  const refLibro = db.collection(COLECCION_LIBROS).doc(idLibro);

  return db.runTransaction((transaccion) => {
    return transaccion.get(refLibro).then((snapLibro) => {
      const disponibles = snapLibro.data().cantidadDisponible;

      transaccion.update(refLibro, {
        cantidadDisponible: disponibles + 1
      });

      transaccion.update(refPrestamo, {
        estado: "devuelto",
        fechaDevolucionReal: firebase.firestore.Timestamp.fromDate(new Date())
      });
    });
  });
}

// -------------------------------------------------------------
// READ: lista en tiempo real SOLO los préstamos de un usuario
// (para catalogo.html, sección "Mis préstamos").
// -------------------------------------------------------------
function escucharPrestamosDeUsuario(idUsuario, callback) {
  return db.collection(COLECCION_PRESTAMOS)
    .where("idUsuario", "==", idUsuario)
    .onSnapshot((snapshot) => {
      const prestamos = [];
      snapshot.forEach((doc) => prestamos.push({ id: doc.id, ...doc.data() }));
      callback(prestamos);
    });
}

// -------------------------------------------------------------
// READ: lista en tiempo real TODOS los préstamos (para admin.html).
// -------------------------------------------------------------
function escucharTodosLosPrestamos(callback) {
  return db.collection(COLECCION_PRESTAMOS)
    .orderBy("fechaPrestamo", "desc")
    .onSnapshot((snapshot) => {
      const prestamos = [];
      snapshot.forEach((doc) => prestamos.push({ id: doc.id, ...doc.data() }));
      callback(prestamos);
    });
}

// -------------------------------------------------------------
// Convierte un Timestamp de Firestore (el tipo de dato especial
// que usa para fechas) en un texto legible como "12/10/2026".
// La usan tanto catalogo.js como admin.js.
// -------------------------------------------------------------
function formatearFecha(timestampFirestore) {
  if (!timestampFirestore) return "-";
  const fecha = timestampFirestore.toDate();
  return fecha.toLocaleDateString("es-CO");
}
