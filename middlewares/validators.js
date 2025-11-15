const { body, validationResult } = require('express-validator');

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', message: 'Invalid request parameters', errors: errors.array() });
  }
  next();
};

const categoryCreate = [
  body('name').exists().withMessage('name is required').bail().isString().trim().notEmpty(),
  body('description').optional().isString(),
  checkValidation,
];

const categoryUpdate = [
  body('name').optional().isString().trim().notEmpty(),
  body('description').optional().isString(),
  checkValidation,
];

const tagCreate = [
  body('name').exists().withMessage('name is required').bail().isString().trim().notEmpty(),
  checkValidation,
];

const tagUpdate = [
  body('name').optional().isString().trim().notEmpty(),
  checkValidation,
];

const gameCreate = [
  body('name').exists().withMessage('name is required').bail().isString().trim().notEmpty(),
  body('developer').optional().isString().trim(),
  body('publisher').optional().isString().trim(),
  body('releaseDate').optional().isISO8601().toDate(),
  body('price').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('categoryId').optional().isInt({ min: 1 }),
  body('tags').optional().isArray(),
  checkValidation,
];

const gameUpdate = [
  body('name').optional().isString().trim().notEmpty(),
  body('developer').optional().isString().trim(),
  body('publisher').optional().isString().trim(),
  body('releaseDate').optional().isISO8601().toDate(),
  body('price').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('categoryId').optional().isInt({ min: 1 }),
  body('tags').optional().isArray(),
  checkValidation,
];

module.exports = {
  categoryCreate,
  categoryUpdate,
  tagCreate,
  tagUpdate,
  gameCreate,
  gameUpdate,
};
