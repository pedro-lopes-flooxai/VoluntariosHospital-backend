const express = require('express');
const router = express.Router();
const Task = require('../models/Task'); 
const taskController = require('../controllers/tasksController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/applied', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ message: 'Usuário não autenticado' });
    }

    const tasks = await Task.find({
      $or: [
        { status: 'active' },
        { status: 'inactive', candidates: { $elemMatch: { user: userId, status: 'approved' } } }
      ],
      candidates: { $elemMatch: { user: userId } }
    }).lean();

    const filtered = tasks.map(task => {
      const candidate = task.candidates.find(
        c => String(c.user) === String(userId)
      );

      return {
        _id: task._id,
        title: task.title,
        status: candidate?.status || 'unknown',
        score: Number(task.score) || 0,
      };
    });

    res.json(filtered);
  } catch (err) {
    console.error('Erro ao buscar tarefas candidatas:', err);
    res.status(500).json({ message: 'Erro ao buscar tarefas candidatas' });
  }
});

router.post('/', verifyToken, isAdmin, taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/:id/apply', verifyToken, taskController.applyToTask);
router.patch('/:taskId/candidates/:candidateId', verifyToken, isAdmin, taskController.updateCandidateStatus);
router.delete('/:id/unapply', verifyToken, taskController.unapplyFromTask);

module.exports = router;
