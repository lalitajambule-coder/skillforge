import ExamResult from '../models/ExamResult.js';
import User from '../models/User.js';
import Certificate from '../models/Certificate.js';

export const getUserAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const examResults = await ExamResult.find({ user: userId }).populate('exam');
    const certificates = await Certificate.countDocuments({ user: userId });

    const totalExams = examResults.length;
    const passedExams = examResults.filter(r => r.passed).length;
    const averageScore = totalExams > 0
      ? Math.round(examResults.reduce((sum, r) => sum + r.score, 0) / totalExams)
      : 0;

    const recentResults = examResults.slice(-10).map(r => ({
      exam: r.exam.title,
      score: r.score,
      date: r.createdAt
    }));

    const categoryStats = {};
    examResults.forEach(result => {
      const category = result.exam.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { attempts: 0, passed: 0, avgScore: 0 };
      }
      categoryStats[category].attempts++;
      if (result.passed) categoryStats[category].passed++;
      categoryStats[category].avgScore = Math.round(
        (categoryStats[category].avgScore * (categoryStats[category].attempts - 1) + result.score) / categoryStats[category].attempts
      );
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalExams,
        passedExams,
        passRate: totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0,
        averageScore,
        certificates,
        recentResults,
        categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalExams = await ExamResult.countDocuments({ status: 'completed' });
    const totalCertificates = await Certificate.countDocuments({ isActive: true });

    const averageScore = await ExamResult.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);

    const passRate = await ExamResult.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          passed: { $sum: { $cond: ['$passed', 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalExams,
        totalCertificates,
        averageScore: averageScore[0]?.avgScore || 0,
        passRate: passRate[0] ? Math.round((passRate[0].passed / passRate[0].total) * 100) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProgressChart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const progressData = await ExamResult.find({ user: userId, status: 'completed' })
      .sort({ createdAt: 1 });

    const chartData = progressData.map(result => ({
      date: result.createdAt.toISOString().split('T')[0],
      score: result.score,
      passed: result.passed
    }));

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    next(error);
  }
};
