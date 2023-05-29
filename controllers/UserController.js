import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import UserModel from '../models/User.js';
import { keySecret } from '../private.js';

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash,
    });
    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'key89',
      {
        expiresIn: '30d', //перестанет быть валидным через 30 дней
      }
    );
    res.json({
      ...user._doc,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Регистрация пользователя не пройдена',
    });
  }
};

export const login = async (req, res) => {
  try {
    //чтобы сделать авторизацию необходимо найти пользователя в БД
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: 'User не существует',
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!isValidPass) {
      return res.status(400).json({
        message: 'Неправильный логин или же пароль',
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      keySecret,
      {
        expiresIn: '30d', //перестанет быть валидным через 30 дней
      }
    );

    res.json({
      ...user._doc,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Авторизация не пройдена',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const User = await UserModel.findById(req.userId);

    console.log(req);

    if (!User) {
      return res.status(404).json({
        message: 'No user',
      });
    }
    const { passwordHash, ...userData } = User._doc;
    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Нет пользователя',
    });
  }
};
