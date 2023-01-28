import { Request, Response } from 'express';
import axios from 'axios';
import Jsona from 'jsona';
import _ from 'lodash';
import moment from 'moment';

export class AppController {

  static async getApiData() {
    const API_ENDPOINT: string = process.env.API_ENDPOINT || 'https://www.roh.org.uk/api/event-details?slug=turandot-by-andrei-serban';

    try {
      const { data } = await axios.get(API_ENDPOINT);
      const dataFormatter = new Jsona();
      const eventDetail = dataFormatter.deserialize(data);

      const creativesArr = _.flatten(
        _.chain(eventDetail)
          .get('productions', [])
          .map('creatives')
          .forEach(ele => _.pick(ele, 'role, name'))
          .value()
      );

      const creatives = _.reduce(creativesArr, (result, obj) => {
        const role = _.get(obj, 'role', null);
        const name = _.get(obj, 'name', null);
        if (role != null && name != null) {
          result[name] = role;
        }
        return result;
      }, {});

      const runs = _.flatten(
        _.chain(eventDetail)
          .get('runs', [])
          .map('activities')
          .value()
      );

      const casts = _.chain(runs)
        .map(run => {
          let castObjs: {}[] = _.get(run, 'cast', []);
          let castRoles: Partial<{}>[] = [];

          castObjs.forEach(castRole => {
            const role = _.get(castRole, 'role', null);
            const name = _.get(castRole, 'name', null);
            if (role != null && name != null) {
              let temp = {};
              temp[name] = role;
              castRoles.push(temp);
            }
          });

          return {
            'date': moment.parseZone(_.get(run, 'date', '')).format("Do MMMM YYYY, dddd, h:mm a"),
            'conductedBy': _.keys(_.head(castRoles)),
            'cast': _.tail(castRoles),
          };
        })
        .value();

      return {
        title: _.get(eventDetail, 'title', ''),
        shortDescription: _.get(eventDetail, 'shortDescription', ''),
        creatives,
        casts,
      };
    } catch(error) {
      throw new Error(`Fail to fetch data from ${API_ENDPOINT}`);
    }
  }

  static async render(req: Request, res: Response) {
    try {
      const { title, shortDescription, creatives, casts } = await AppController.getApiData();
      res.render('index', { title, shortDescription, creatives, casts });
    } catch(error) {
      res.render('error', { error });
    }
  }
}
