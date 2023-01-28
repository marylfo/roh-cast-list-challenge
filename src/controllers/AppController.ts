import { Request, Response } from 'express';

export class AppController {
  static render(req: Request, res: Response) {
    res.render('index');
  }
}
