// =============================================================
// LÓGICA DE admin.html
// =============================================================
// Igual que catalogo.js, este archivo solo dibuja tablas y maneja
// clics; toda la comunicación con Firestore vive en libros.js,
// usuarios.js y prestamos.js.

protegerPaginaAdmin((usuario) => {
  document.getElementById("nombre-usuario").textContent = usuario.displayName;
  document.getElementById("foto-usuario").src = usuario.photoURL || "img/usuario-generico.svg";

  escucharLibros(dibujarTablaLibros);
  escucharUsuarios(dibujarTablaUsuarios);
  escucharTodosLosPrestamos(dibujarTablaPrestamos);
});

// =========================== LIBROS ===========================

const formularioLibro = document.getElementById("formulario-libro");
formularioLibro.addEventListener("submit", function (evento) {
  evento.preventDefault(); // Evita que la página se recargue al enviar el formulario

  const idEdicion = document.getElementById("libro-id-edicion").value;
  const datosLibro = {
    titulo: document.getElementById("libro-titulo").value.trim(),
    autor: document.getElementById("libro-autor").value.trim(),
    categoria: document.getElementById("libro-categoria").value.trim(),
  };
  const cantidad = document.getElementById("libro-cantidad").value;

  if (idEdicion) {
    // Estamos EDITANDO un libro existente: no tocamos cuantosDisponibles
    // para no perder el conteo de copias que ya están prestadas.
    actualizarLibro(idEdicion, datosLibro).then(limpiarFormularioLibro);
  } else {
    // Estamos CREANDO un libro nuevo
    crearLibro(datosLibro.titulo, datosLibro.autor, datosLibro.categoria, cantidad)
      .then(limpiarFormularioLibro);
  }
});

function limpiarFormularioLibro() {
  formularioLibro.reset();
  document.getElementById("libro-id-edicion").value = "";
  document.getElementById("boton-guardar-libro").textContent = "Agregar libro";
}

function dibujarTablaLibros(libros) {
  const cuerpoTabla = document.getElementById("tabla-admin-libros");
  cuerpoTabla.innerHTML = "";

  libros.forEach((libro) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${libro.titulo}</td>
      <td>${libro.autor}</td>
      <td>${libro.categoria}</td>
      <td>${libro.cantidadDisponible}</td>
      <td>${libro.cantidadTotal}</td>
      <td>
        <button class="btn-accion btn-editar" onclick='clicEditarLibro(${JSON.stringify(libro)})'>Editar</button>
        <button class="btn-accion btn-eliminar" onclick="clicEliminarLibro('${libro.id}')">Eliminar</button>
      </td>
    `;
    cuerpoTabla.appendChild(fila);
  });
}

function clicEditarLibro(libro) {
  document.getElementById("libro-id-edicion").value = libro.id;
  document.getElementById("libro-titulo").value = libro.titulo;
  document.getElementById("libro-autor").value = libro.autor;
  document.getElementById("libro-categoria").value = libro.categoria;
  document.getElementById("libro-cantidad").value = libro.cantidadTotal;
  document.getElementById("boton-guardar-libro").textContent = "Guardar cambios";
}

function clicEliminarLibro(idLibro) {
  if (confirm("¿Seguro que deseas eliminar este libro?")) {
    eliminarLibro(idLibro);
  }
}

// =========================== USUARIOS ===========================

function dibujarTablaUsuarios(usuarios) {
  const cuerpoTabla = document.getElementById("tabla-admin-usuarios");
  cuerpoTabla.innerHTML = "";

  usuarios.forEach((usuario) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${usuario.nombre}</td>
      <td>${usuario.correo}</td>
      <td>
        <select onchange="clicCambiarRol('${usuario.id}', this.value)">
          <option value="estudiante" ${usuario.rol === "estudiante" ? "selected" : ""}>Estudiante</option>
          <option value="profesor" ${usuario.rol === "profesor" ? "selected" : ""}>Profesor</option>
          <option value="admin" ${usuario.rol === "admin" ? "selected" : ""}>Administrador</option>
        </select>
      </td>
      <td>
        <button class="btn-accion btn-eliminar" onclick="clicEliminarUsuario('${usuario.id}')">Eliminar</button>
      </td>
    `;
    cuerpoTabla.appendChild(fila);
  });
}

function clicCambiarRol(idUsuario, nuevoRol) {
  actualizarRolUsuario(idUsuario, nuevoRol);
}

function clicEliminarUsuario(idUsuario) {
  if (confirm("¿Seguro que deseas eliminar este perfil de usuario?")) {
    eliminarUsuario(idUsuario);
  }
}

// =========================== PRÉSTAMOS ===========================

function dibujarTablaPrestamos(prestamos) {
  const cuerpoTabla = document.getElementById("tabla-admin-prestamos");
  cuerpoTabla.innerHTML = "";

  prestamos.forEach((prestamo) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${prestamo.tituloLibro}</td>
      <td>${prestamo.nombreUsuario}</td>
      <td>${prestamo.correoUsuario}</td>
      <td>${formatearFecha(prestamo.fechaPrestamo)}</td>
      <td>${formatearFecha(prestamo.fechaDevolucionEsperada)}</td>
      <td><span class="badge badge-${prestamo.estado}">${prestamo.estado}</span></td>
    `;
    cuerpoTabla.appendChild(fila);
  });
}
