import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { password, auth } from './private.js';
import fs from 'fs';
import cors from 'cors';
import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from './validations.js';
import { UserController, PostController } from './controllers/index.js';
import { handleValidationErrors, checkAuth } from './utils/index.js';

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

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

//авторизация
app.post(
  '/auth/login',
  loginValidation,
  handleValidationErrors,
  UserController.login
);
//Авторизован ли пользователь
app.get('/auth/me', checkAuth, UserController.getMe);
//регистрация пользователя
app.post(
  '/auth/register',
  registerValidation,
  handleValidationErrors,
  UserController.register
);
app.get('/posts', PostController.getAll);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

//обновление
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Сервер запущен на localhost:4444');
});
