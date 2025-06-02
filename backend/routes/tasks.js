const express = require('express');
const router = express.Router();
const taskController = require('../controllers/tasksController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/:id/apply', verifyToken, taskController.applyToTask);
router.patch('/:taskId/candidates/:candidateId', verifyToken, taskController.updateCandidateStatus);

module.exports = router;
