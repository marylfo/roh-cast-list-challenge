import express, { Express } from 'express';
import dotenv from 'dotenv';
import { AppController } from './controllers/AppController';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);

app.get('/', AppController.render);

app.listen(port, () => {
  console.log(`Application is running at http://localhost:${port}`);
});
