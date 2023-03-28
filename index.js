import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { password, keySecret, auth } from './private.js';

import { registerValidator } from './validations/auth.js';
import { validationResult } from 'express-validator';
import UserModel from './models/User.js';
import checkAuth from './utils/checkAuth.js';
import User from './models/User.js';

mongoose
  .connect(
    `mongodb+srv://${auth}:${password}@cluster0.vqazijs.mongodb.net/vacation?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log('DB Ok');
  })
  .catch((err) => {
    console.log('DB error', err);
  });

const app = express();

app.use(express.json());

//авторизация
app.post('/auth/login', async (req, res) => {
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
});

//Авторизован ли пользователь
app.get('/auth/me', checkAuth, async (req, res) => {
  try {
    const User = await UserModel.findById(req.userId);

    if (!User) {
      return res.status(404).json({
        message: 'No user',
      });
    }
    res.json(User);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Нет пользователя',
    });
  }
});

//регистрация пользователя
app.post('/auth/register', registerValidator, async (req, res) => {
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
});

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Сервер запущен на localhost:4444');
});
