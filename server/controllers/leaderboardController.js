import User from '../models/User.js';
import ExamResult from '../models/ExamResult.js';
import Certificate from '../models/Certificate.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const { period = 'all' } = req.query;
    let dateFilter = {};

    if (period === 'week') {
      dateFilter = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (period === 'month') {
      dateFilter = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }

    const leaderboard = await User.find({ isActive: true })
      .select('name avatar stats')
      .sort({ 'stats.points': -1 })
      .limit(100);

    const leaderboardWithRank = leaderboard.map((user, index) => ({
      rank: index + 1,
      ...user.toObject()
    }));

    res.status(200).json({
      success: true,
      leaderboard: leaderboardWithRank
    });
  } catch (error) {
    next(error);
  }
};

export const getUserRank = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const usersAbove = await User.countDocuments({
      isActive: true,
      'stats.points': { $gt: (await User.findById(userId)).stats.points }
    });

    const rank = usersAbove + 1;
    const user = await User.findById(userId).select('name avatar stats');

    res.status(200).json({
      success: true,
      rank,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const getSkillLeaderboard = async (req, res, next) => {
  try {
    const { skillId } = req.params;

    const results = await ExamResult.find({ status: 'completed' })
      .populate('user', 'name avatar')
      .sort({ score: -1 })
      .limit(50);

    const leaderboard = results.map((result, index) => ({
      rank: index + 1,
      user: result.user,
      score: result.score,
      date: result.createdAt
    }));

    res.status(200).json({
      success: true,
      leaderboard
    });
  } catch (error) {
    next(error);
  }
};

export const getTopAchievers = async (req, res, next) => {
  try {
    const topAchievers = await User.find({ isActive: true })
      .select('name avatar stats achievements')
      .populate('achievements')
      .sort({ 'stats.masteredSkills': -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      achievers: topAchievers
    });
  } catch (error) {
    next(error);
  }
};
