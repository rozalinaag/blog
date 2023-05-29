import PostModel from '../models/Vacation.js';

export const getLastDepartaments = async (req, res) => {
 try {
  const posts = await PostModel.find().limit(5).exec();

  const tags = posts
   .map((obj) => obj.tags)
   .flat()
   .slice(0, 5);

  res.json(tags);
 } catch (err) {
  console.log(err);
  res.status(500).json({
   message: 'Не удалось получить departaments',
  });
 }
};