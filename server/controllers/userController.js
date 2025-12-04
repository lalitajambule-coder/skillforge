import User from '../models/User.js';
import Certificate from '../models/Certificate.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('achievements');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, location, phone, website, linkedin, github } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        bio,
        location,
        phone,
        website,
        linkedin,
        github
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const certificates = await Certificate.countDocuments({ user: req.user.id });

    const stats = {
      ...user.stats.toObject(),
      certificates
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('name bio avatar location linkedin github stats');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const certificates = await Certificate.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        certificates
      }
    });
  } catch (error) {
    next(error);
  }
};
