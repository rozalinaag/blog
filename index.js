import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { auth } from './private.js';
import { password } from './private.js';

import { registerValidator } from './validations/auth.js';
import { validationResult } from 'express-validator';

mongoose
  .connect(
    `mongodb+srv://${auth}:${password}@cluster0.vqazijs.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log('DB Ok');
  })
  .catch((err) => {
    console.log('DB error', err);
  });

const app = express();

app.use(express.json());

app.post('/auth/register', registerValidator, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  res.json({
    success: true,
  });
});

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Сервер запущен на localhost:4444');
});
