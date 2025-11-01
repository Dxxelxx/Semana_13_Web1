const API_URL = "http://localhost:3000/tasks";

// Mostrar tareas separadas por columnas
async function obtenerTareas() {
  const res = await fetch(API_URL);
  const tareas = await res.json();

  // Limpia las tres columnas
  document.getElementById("todo").innerHTML = "";
  document.getElementById("doing").innerHTML = "";
  document.getElementById("done").innerHTML = "";

  tareas.forEach(t => {
    const card = document.createElement("div");
    card.className = "card mb-2 shadow-sm";
    card.innerHTML = `
      <div class="card-body">
        <h6>${t.title}</h6>
        <p>${t.description}</p>
        <div class="d-flex gap-2 justify-content-center">
          ${botonesEstado(t)}
          <button class="btn btn-danger btn-sm" onclick="eliminarTarea(${t.id})">❌</button>
        </div>
      </div>
    `;

    // Agrega la tarea a su columna correspondiente
    document.getElementById(t.status).appendChild(card);
  });
}

// Crear una nueva tarea
async function crearTarea() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!title || !description) {
    alert("Por favor, completa todos los campos");
    return;
  }

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description })
  });

  document.getElementById("title").value = "";
  document.getElementById("description").value = "";

  obtenerTareas();
}

// Cambiar estado de una tarea (todo → doing → done → todo)
async function cambiarEstado(id, nuevoEstado) {
  await fetch(`${API_URL}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: nuevoEstado })
  });

  obtenerTareas();
}

// Eliminar tarea
async function eliminarTarea(id) {
  if (confirm("¿Deseas eliminar esta tarea?")) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    obtenerTareas();
  }
}

// Botones según el estado actual
function botonesEstado(tarea) {
  if (tarea.status === "todo") {
    return `<button class="btn btn-warning btn-sm" onclick="cambiarEstado(${tarea.id}, 'doing')">➡️ Doing</button>`;
  } else if (tarea.status === "doing") {
    return `<button class="btn btn-success btn-sm" onclick="cambiarEstado(${tarea.id}, 'done')">✅ Done</button>`;
  } else {
    return `<button class="btn btn-secondary btn-sm" onclick="cambiarEstado(${tarea.id}, 'todo')">↩️ Reiniciar</button>`;
  }
}

// Cargar las tareas al iniciar
obtenerTareas();


