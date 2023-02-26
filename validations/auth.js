import { body } from 'express-validator';

export const registerValidator = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Пароль должен быть минимум 5 символов').isLength({
    min: 5,
  }),
  body('fullName', 'Укажите корректное имя').isLength({ min: 3 }),
  body('avatarUrl', 'Неверная ссылка на аватарку').optional().isURL(),
];
