const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    const { title, patient, type, hours, requirements, daysLeft, score, photo } = req.body;
    const createdBy = req.userId;

    if (!title || !patient || !type || !hours || !requirements || daysLeft == null || score == null) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
    }

    const task = new Task({
      title,
      patient,
      type,
      hours,
      requirements,
      daysLeft,
      score,
      photo,
      createdBy,
      status: 'active',
      candidates: [],
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error('Erro ao criar tarefa:', err);
    res.status(500).json({ message: 'Erro interno ao criar tarefa' });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'active' }).lean();
    res.json(tasks);
  } catch (err) {
    console.error('Erro ao buscar tarefas:', err);
    res.status(500).json({ message: 'Erro ao buscar tarefas' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('candidates.user')
      .lean();

    if (!task) return res.status(404).json({ message: 'Tarefa não encontrada' });

    res.json(task);
  } catch (err) {
    console.error('Erro ao buscar tarefa por ID:', err);
    res.status(500).json({ message: 'Erro ao buscar tarefa' });
  }
};
exports.applyToTask = async (req, res) => {
  try {
    const userId = req.userId;
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    const alreadyApplied = task.candidates.some(c => c.user.toString() === userId.toString());
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Você já se candidatou a essa tarefa.' });
    }

    task.candidates.push({ user: userId });
    await task.save();

    res.status(200).json({ message: 'Candidatura enviada com sucesso' });
  } catch (err) {
    console.error('Erro ao candidatar-se na tarefa:', err);
    res.status(500).json({ message: 'Erro interno ao se candidatar' });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  try {
    const { taskId, candidateId } = req.params;
    const { status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Tarefa não encontrada' });

    const candidate = task.candidates.id(candidateId);
    if (!candidate) return res.status(404).json({ message: 'Candidato não encontrado' });

    candidate.status = status;
    if (status === 'approved') {
      task.status = 'inactive';
    }

    await task.save();

    res.json({ message: 'Status do candidato atualizado', task });
  } catch (err) {
    console.error('Erro ao atualizar status do candidato:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
