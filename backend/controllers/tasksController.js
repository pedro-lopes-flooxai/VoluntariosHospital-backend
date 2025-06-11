const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    const { title, patient, type, hours, requirements, daysLeft, score, photo } = req.body;
    const createdBy = req.userId;
    if (
      !title || !patient || !type || !hours || !requirements ||
      daysLeft === undefined || daysLeft === null ||
      score === undefined || score === null
    ) {
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
    return res.status(201).json(task);

  } catch (err) {
    console.error('Erro ao criar tarefa:', err);
    return res.status(500).json({ message: 'Erro interno ao criar tarefa' });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'active' }).lean();
    return res.json(tasks);

  } catch (err) {
    console.error('Erro ao buscar tarefas:', err);
    return res.status(500).json({ message: 'Erro ao buscar tarefas' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('candidates.user')
      .lean();

    if (!task) return res.status(404).json({ message: 'Tarefa não encontrada' });

    return res.json(task);
  } catch (err) {
    console.error('Erro ao buscar tarefa por ID:', err);
    return res.status(500).json({ message: 'Erro ao buscar tarefa' });
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

    const existingCandidate = task.candidates.find(c => c.user.toString() === userId.toString());

    if (existingCandidate) {
      if (existingCandidate.status === 'rejected') {
        return res.status(400).json({
          message: 'Sua candidatura foi rejeitada. Você não pode se candidatar novamente.'
        });
      }
    }

    task.candidates.push({ user: userId, status: 'pending' });
    await task.save();

    return res.status(200).json({ message: 'Candidatura enviada com sucesso' });
  } catch (err) {
    console.error('Erro ao candidatar-se na tarefa:', err);
    return res.status(500).json({ message: 'Erro interno ao se candidatar' });
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

    return res.json({ message: 'Status do candidato atualizado', task });
  } catch (err) {
    console.error('Erro ao atualizar status do candidato:', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

exports.unapplyFromTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.userId;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Tarefa não encontrada' });

    const candidate = task.candidates.find(c => c.user.toString() === userId.toString());

    if (!candidate) {
      return res.status(400).json({ message: 'Você não está cadastrado nesta tarefa' });
    }

    if (candidate.status === 'rejected') {
      return res.status(400).json({ message: 'Candidatura rejeitada. Cancelamento não permitido.' });
    }
    if (candidate.status === 'approved') {
      return res.status(400).json({ message: 'Você foi aprovado nesta tarefa. Cancelamento não permitido.' });
    }
    task.candidates = task.candidates.filter(c => c.user.toString() !== userId.toString());
    await task.save();

    return res.json({ message: 'Candidatura cancelada com sucesso', applicationStatus: null });
  } catch (err) {
    console.error('Erro ao cancelar candidatura:', err);
    return res.status(500).json({ message: 'Erro ao cancelar candidatura' });
  }
};
