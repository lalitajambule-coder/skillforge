import Certificate from '../models/Certificate.js';
import { generateCredentialId } from '../utils/tokenUtils.js';

export const getUserCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ user: req.user.id })
      .populate('skill', 'title')
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      certificates
    });
  } catch (error) {
    next(error);
  }
};

export const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('user', 'name email')
      .populate('skill', 'title');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.status(200).json({
      success: true,
      certificate
    });
  } catch (error) {
    next(error);
  }
};

export const createCertificate = async (req, res, next) => {
  try {
    const credentialId = generateCredentialId();

    const certificate = await Certificate.create({
      ...req.body,
      user: req.user.id,
      credentialId
    });

    await certificate.populate('skill', 'title');

    res.status(201).json({
      success: true,
      certificate
    });
  } catch (error) {
    next(error);
  }
};

export const verifyCertificate = async (req, res, next) => {
  try {
    const { credentialId } = req.params;

    const certificate = await Certificate.findOne({ credentialId })
      .populate('user', 'name email')
      .populate('skill', 'title');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.status(200).json({
      success: true,
      certificate
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ isActive: true })
      .populate('user', 'name')
      .populate('skill', 'title')
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      certificates
    });
  } catch (error) {
    next(error);
  }
};
