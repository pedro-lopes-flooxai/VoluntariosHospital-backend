const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    const task = new Task({ ...req.body, createdBy: req.user.id });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar tarefa', details: err.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar tarefa' });
  }
};

exports.applyToTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });

    if (task.candidates.includes(req.user.id)) {
      return res.status(400).json({ error: 'Você já se candidatou a esta tarefa' });
    }

    task.candidates.push(req.user.id);
    await task.save();

    res.status(200).json({ message: 'Candidatura registrada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar candidatura', details: err.message });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  const { taskId, candidateId } = req.params;
  const { status } = req.body; 

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });

    const candidate = task.candidates.find(c => c.user.toString() === candidateId);
    if (!candidate) return res.status(404).json({ error: 'Candidato não encontrado' });

    candidate.status = status;
    await task.save();

    res.status(200).json({ message: `Candidato ${status} com sucesso.` });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status', details: err.message });
  }
};