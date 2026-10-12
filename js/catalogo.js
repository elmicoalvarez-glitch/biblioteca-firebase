// =============================================================
// LÓGICA DE catalogo.html
// =============================================================
// Este archivo NO sabe cómo hablar con Firestore directamente:
// para eso usa las funciones que ya existen en libros.js y
// prestamos.js (crearLibro, escucharLibros, solicitarPrestamo...).
// Aquí solo nos encargamos de DIBUJAR la información en la
// pantalla (el HTML) y de reaccionar a los clics del usuario.

let usuarioActual = null;   // Guarda los datos de quien inició sesión
let listaLibrosActual = []; // Última copia de la lista de libros recibida

// 1) Protegemos la página: si no hay sesión, protegerPagina (en
//    auth.js) redirige a index.html. Si hay sesión, seguimos aquí.
protegerPagina((usuario) => {
  usuarioActual = usuario;

  document.getElementById("nombre-usuario").textContent = usuario.displayName;
  document.getElementById("foto-usuario").src = usuario.photoURL || "img/usuario-generico.svg";

  // 2) Empezamos a "escuchar" los libros y los préstamos de este
  //    usuario. Cada vez que algo cambie en Firestore, estas
  //    funciones vuelven a llamar automáticamente a dibujarCatalogo
  //    o dibujarMisPrestamos con los datos actualizados.
  escucharLibros(dibujarCatalogo);
  escucharPrestamosDeUsuario(usuario.uid, dibujarMisPrestamos);
});

// -------------------------------------------------------------
// Dibuja la tabla del catálogo de libros.
// -------------------------------------------------------------
function dibujarCatalogo(libros) {
  listaLibrosActual = libros;
  const cuerpoTabla = document.getElementById("tabla-catalogo");
  cuerpoTabla.innerHTML = "";

  libros.forEach((libro) => {
    const hayDisponibles = libro.cantidadDisponible > 0;
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${libro.titulo}</td>
      <td>${libro.autor}</td>
      <td>${libro.categoria}</td>
      <td>
        <span class="badge ${hayDisponibles ? "badge-disponible" : "badge-agotado"}">
          ${libro.cantidadDisponible} / ${libro.cantidadTotal}
        </span>
      </td>
      <td>
        <button class="btn-accion btn-prestar"
          onclick="clicSolicitarPrestamo('${libro.id}')"
          ${hayDisponibles ? "" : "disabled"}>
          Solicitar préstamo
        </button>
      </td>
    `;
    cuerpoTabla.appendChild(fila);
  });
}

// -------------------------------------------------------------
// Dibuja la tabla "Mis préstamos" del usuario actual.
// -------------------------------------------------------------
function dibujarMisPrestamos(prestamos) {
  const cuerpoTabla = document.getElementById("tabla-mis-prestamos");
  cuerpoTabla.innerHTML = "";

  prestamos.forEach((prestamo) => {
    const estaPrestado = prestamo.estado === "prestado";
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${prestamo.tituloLibro}</td>
      <td>${formatearFecha(prestamo.fechaPrestamo)}</td>
      <td>${formatearFecha(prestamo.fechaDevolucionEsperada)}</td>
      <td><span class="badge badge-${prestamo.estado}">${prestamo.estado}</span></td>
      <td>
        ${estaPrestado
          ? `<button class="btn-accion btn-devolver" onclick="clicDevolverPrestamo('${prestamo.id}', '${prestamo.idLibro}')">Devolver</button>`
          : "-"}
      </td>
    `;
    cuerpoTabla.appendChild(fila);
  });
}

// -------------------------------------------------------------
// Eventos de los botones (se llaman desde el HTML generado arriba)
// -------------------------------------------------------------
function clicSolicitarPrestamo(idLibro) {
  const libro = listaLibrosActual.find((l) => l.id === idLibro);
  solicitarPrestamo(libro, usuarioActual).catch((error) => {
    alert("No se pudo solicitar el préstamo: " + error.message);
  });
}

function clicDevolverPrestamo(idPrestamo, idLibro) {
  devolverPrestamo(idPrestamo, idLibro).catch((error) => {
    alert("No se pudo registrar la devolución: " + error.message);
  });
}
