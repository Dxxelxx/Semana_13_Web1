const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors()); // permitir conexiones desde frontend
app.use(express.static('public'));

// Archivo para persistencia simple
const DB_PATH = path.join(__dirname, 'tasks.json');

// Cargar tareas desde archivo (si existe), sino usar ejemplo por defecto
let tasks = [];
try {
  if (fs.existsSync(DB_PATH)) {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    tasks = JSON.parse(raw);
  } else {
    tasks = [
      { id: 1, title: 'Task 1', description: 'Do homework', status: 'todo' },
      { id: 2, title: 'Task 2', description: 'Check API', status: 'doing' },
      { id: 3, title: 'Task 3', description: 'Submit project', status: 'done' }
    ];
    fs.writeFileSync(DB_PATH, JSON.stringify(tasks, null, 2));
  }
} catch (err) {
  console.error('Error leyendo/escribiendo tasks.json:', err);
  tasks = [];
}

// Helper: guardar al archivo
function saveTasksToFile() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(tasks, null, 2));
  } catch (err) {
    console.error('Error guardando tasks.json:', err);
  }
}

// RUTA: resumen — DEBE IR ANTES de /tasks/:id
app.get('/tasks/summary', (req, res) => {
  const summary = {
    todo: tasks.filter(t => t.status === 'todo').length,
    doing: tasks.filter(t => t.status === 'doing').length,
    done: tasks.filter(t => t.status === 'done').length
  };
  res.json(summary);
});

// RUTA: listar (con filtro por status opcional)
app.get('/tasks', (req, res) => {
  const { status } = req.query;
  const filtered = status ? tasks.filter(t => t.status === status) : tasks;
  res.json(filtered);
});

// RUTA: buscar por id
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

// RUTA: crear
app.post('/tasks', (req, res) => {
  const { title, description } = req.body;
  if (!title || title.toString().trim() === '') {
    return res.status(400).json({ message: 'Title is required' });
  }

  // id robusto: buscar max actual + 1
  const nextId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  const newTask = { id: nextId, title, description: description || '', status: 'todo' };
  tasks.push(newTask);
  saveTasksToFile();
  res.status(201).json(newTask);
});

// RUTA: reemplazar (PUT)
app.put('/tasks/:id', (req, res) => {
  const { title, description, status } = req.body;
  const task = tasks.find(t => t.id == req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  // Validar status
  if (status && !['todo', 'doing', 'done'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  task.title = title ?? task.title;
  task.description = description ?? task.description;
  task.status = status ?? task.status;
  saveTasksToFile();
  res.json(task);
});

// RUTA: actualizar solo estado (PATCH)
app.patch('/tasks/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['todo', 'doing', 'done'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const task = tasks.find(t => t.id == req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  task.status = status;
  saveTasksToFile();
  res.json(task);
});

// RUTA: eliminar
app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Task not found' });

  const removed = tasks.splice(index, 1)[0];
  saveTasksToFile();
  res.json({ message: 'Task deleted successfully', removed });
});

// Servir frontend estático (opcional)
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all para rutas no encontradas (opcional)
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ API running on port ${PORT}`);
});

