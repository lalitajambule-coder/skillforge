import Exam from '../models/Exam.js';
import ExamResult from '../models/ExamResult.js';

export const getAllExams = async (req, res, next) => {
  try {
    const { skill, difficulty } = req.query;
    let query = { status: 'active' };

    if (skill) {
      query.skill = skill;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    const exams = await Exam.find(query)
      .populate('skill', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: exams.length,
      exams
    });
  } catch (error) {
    next(error);
  }
};

export const getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('skill', 'title')
      .populate('creator', 'name email');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.status(200).json({
      success: true,
      exam
    });
  } catch (error) {
    next(error);
  }
};

export const createExam = async (req, res, next) => {
  try {
    const exam = await Exam.create({
      ...req.body,
      creator: req.user.id
    });

    await exam.populate('skill', 'title');

    res.status(201).json({
      success: true,
      exam
    });
  } catch (error) {
    next(error);
  }
};

export const submitExam = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { answers, timeSpent } = req.body;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    let correctCount = 0;
    const processedAnswers = answers.map((answer, index) => {
      const question = exam.questions[index];
      const isCorrect = answer.selectedAnswer === question.correctAnswer;

      if (isCorrect) correctCount++;

      return {
        questionId: question._id,
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      };
    });

    const score = Math.round((correctCount / exam.questions.length) * 100);
    const passed = score >= exam.passingScore;

    const result = await ExamResult.create({
      user: req.user.id,
      exam: examId,
      answers: processedAnswers,
      score,
      totalQuestions: exam.questions.length,
      correctAnswers: correctCount,
      timeSpent,
      passed,
      status: 'completed'
    });

    exam.attempts += 1;
    exam.averageScore = ((exam.averageScore * (exam.attempts - 1)) + score) / exam.attempts;
    await exam.save();

    res.status(200).json({
      success: true,
      result: {
        score,
        passed,
        correctAnswers: correctCount,
        totalQuestions: exam.questions.length
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getExamResults = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const results = await ExamResult.find({
      user: req.user.id,
      exam: examId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    next(error);
  }
};

export const getUserExamResults = async (req, res, next) => {
  try {
    const results = await ExamResult.find({ user: req.user.id })
      .populate('exam', 'title skillName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    next(error);
  }
};
