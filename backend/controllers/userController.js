const User = require('../models/User');
const Task = require('../models/Task');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
};

exports.getMeWithScore = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    const approvedTasks = await Task.find({
      candidates: {
        $elemMatch: { user: user._id, status: 'approved' }
      }
    }).lean();

    const totalScore = approvedTasks.reduce((acc, task) => acc + (task.score || 0), 0);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      score: totalScore,
    });
  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
};

exports.getRanking = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).lean();
    const usersWithScore = await Promise.all(users.map(async (user) => {
      const approvedTasks = await Task.find({
        candidates: {
          $elemMatch: { user: user._id, status: 'approved' }
        }
      }).lean();

      const totalScore = approvedTasks.reduce((acc, task) => acc + (task.score || 0), 0);

      return {
        _id: user._id,
        name: user.name,
        score: totalScore,
      };
    }));

    usersWithScore.sort((a, b) => b.score - a.score);
    const topUsers = usersWithScore.slice(0, 100);

    res.json(topUsers);
  } catch (err) {
    console.error('Erro ao buscar ranking:', err);
    res.status(500).json({ message: 'Erro ao buscar ranking' });
  }
};
