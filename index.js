// ================================
//   IMPORTS Y CONFIGURACIÓN
// ================================
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Para servir el frontend

// ================================
//   BASE DE DATOS (EN MEMORIA)
// ================================
let tasks = [
  { id: 1, title: 'Task 1', description: 'Do homework', status: 'todo' },
  { id: 2, title: 'Task 2', description: 'Check API', status: 'doing' },
  { id: 3, title: 'Task 3', description: 'Submit project', status: 'done' }
];

// ================================
//   RUTAS DEL API
// ================================

// 🟢 Obtener todas las tareas o filtrar por estado
app.get('/tasks', (req, res) => {
  const { status } = req.query;
  const filtered = status ? tasks.filter(t => t.status === status) : tasks;
  res.json(filtered);
});

// 🟢 Obtener resumen de tareas (todo, doing, done)
app.get('/tasks/summary', (req, res) => {
  const summary = {
    todo: tasks.filter(t => t.status === 'todo').length,
    doing: tasks.filter(t => t.status === 'doing').length,
    done: tasks.filter(t => t.status === 'done').length
  };
  res.json(summary);
});

// 🟢 Obtener una tarea por ID
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

// 🟢 Crear una nueva tarea
app.post('/tasks', (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  const newTask = {
    id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
    title,
    description,
    status: 'todo'
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// 🟢 Actualizar una tarea completa
app.put('/tasks/:id', (req, res) => {
  const { title, description, status } = req.body;
  const task = tasks.find(t => t.id == req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  task.title = title || task.title;
  task.description = description || task.description;
  task.status = status || task.status;

  res.json(task);
});

// 🟢 Actualizar solo el estado (todo → doing → done)
app.patch('/tasks/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['todo', 'doing', 'done'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const task = tasks.find(t => t.id == req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  task.status = status;
  res.json(task);
});

// 🟢 Eliminar una tarea
app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Task not found' });

  tasks.splice(index, 1);
  res.json({ message: 'Task deleted successfully' });
});

// ================================
//   SERVIDOR
// ================================
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));

