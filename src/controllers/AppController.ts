import { Request, Response } from 'express';
import axios from 'axios';
import Jsona from 'jsona';
import _ from 'lodash';

export class AppController {

  static async getApiData() {
    const API_ENDPOINT: string = process.env.API_ENDPOINT || 'https://www.roh.org.uk/api/event-details?slug=turandot-by-andrei-serban';

    try {
      const { data } = await axios.get(API_ENDPOINT);
      const dataFormatter = new Jsona();
      const eventDetail = dataFormatter.deserialize(data);

      return {
        title: _.get(eventDetail, 'title', ''),
        shortDescription: _.get(eventDetail, 'shortDescription', ''),
      };

    } catch(error) {
      throw new Error(`Fail to fetch data from ${API_ENDPOINT}`);
    }

  }


  static async render(req: Request, res: Response) {
    try {
      const { title, shortDescription } = await AppController.getApiData();
      res.render('index', { title, shortDescription });
    } catch(error) {
      res.render('error', { error });
    }
  }
}
