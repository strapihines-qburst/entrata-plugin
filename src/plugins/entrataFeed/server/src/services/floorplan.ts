import type { Core } from '@strapi/strapi';
import { fetchEntrataFeed, fetchEntrataSpecials } from '../utils/entrata/fetchEntrataData';
import syncToStrapi from '../utils/persist/syncToStrapi';
import importSpecials from '../utils/specials';
import getFeedDetails from '../utils/shared/dbCalls';
import s3Service from './s3';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async getFeedData() {
    try {
      const [floorplansWithUnits, specials] = await Promise.all([
        fetchEntrataFeed(),
        fetchEntrataSpecials(),
      ]);

      await syncToStrapi(strapi, floorplansWithUnits);
      await importSpecials(strapi, specials);

      const feedDetails = await getFeedDetails(strapi, floorplansWithUnits);

      const finalJson = {
        floorplans: floorplansWithUnits,
        ...feedDetails,
      };

      const url = await s3Service().uploadJson(finalJson, 'feeds/floorplans.json');

      return {
        success: true,
        message: 'floorplans synced successfully',
        url,
      };
    } catch (error) {
      strapi.log.error('Entrata API Error', error);
      throw error;
    }
  },

  async getFeed(query: { moveInDate?: string }) {
    const { moveInDate } = query;

    if (!moveInDate) {
      return {
        success: false,
        message: 'Move in date is required',
      };
    }

    const floorplansWithUnits = await fetchEntrataFeed({ moveInDate });
    await syncToStrapi(strapi, floorplansWithUnits);


    const finalJson = {
      floorplans: floorplansWithUnits,
    };

    return finalJson;
  },
});
