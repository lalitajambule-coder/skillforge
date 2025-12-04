import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';

export const getAllAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({ isActive: true });

    res.status(200).json({
      success: true,
      achievements
    });
  } catch (error) {
    next(error);
  }
};

export const getUserAchievements = async (req, res, next) => {
  try {
    const achievements = await UserAchievement.find({ user: req.user.id })
      .populate('achievement');

    res.status(200).json({
      success: true,
      achievements
    });
  } catch (error) {
    next(error);
  }
};

export const getAchievementById = async (req, res, next) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.status(200).json({
      success: true,
      achievement
    });
  } catch (error) {
    next(error);
  }
};

export const createAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.create(req.body);

    res.status(201).json({
      success: true,
      achievement
    });
  } catch (error) {
    next(error);
  }
};

export const unlockAchievement = async (req, res, next) => {
  try {
    const { achievementId } = req.params;

    let userAchievement = await UserAchievement.findOne({
      user: req.user.id,
      achievement: achievementId
    });

    if (!userAchievement) {
      userAchievement = await UserAchievement.create({
        user: req.user.id,
        achievement: achievementId,
        progress: 100,
        unlocked: true,
        unlockedDate: new Date()
      });
    } else if (!userAchievement.unlocked) {
      userAchievement.unlocked = true;
      userAchievement.progress = 100;
      userAchievement.unlockedDate = new Date();
      await userAchievement.save();
    }

    await userAchievement.populate('achievement');

    res.status(200).json({
      success: true,
      userAchievement
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const { achievementId } = req.params;
    const { progress } = req.body;

    let userAchievement = await UserAchievement.findOne({
      user: req.user.id,
      achievement: achievementId
    });

    if (!userAchievement) {
      userAchievement = await UserAchievement.create({
        user: req.user.id,
        achievement: achievementId,
        progress
      });
    } else {
      userAchievement.progress = progress;

      if (progress >= 100 && !userAchievement.unlocked) {
        userAchievement.unlocked = true;
        userAchievement.unlockedDate = new Date();
      }

      await userAchievement.save();
    }

    await userAchievement.populate('achievement');

    res.status(200).json({
      success: true,
      userAchievement
    });
  } catch (error) {
    next(error);
  }
};
