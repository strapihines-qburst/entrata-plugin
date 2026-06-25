import type { Core } from '@strapi/strapi';
import { fetchEntrataFeed, fetchEntrataSpecials } from '../utils/entrata/fetchEntrataData';
import syncToStrapi from '../utils/persist/syncToStrapi';
import importSpecials from '../utils/specials';
import getFeedDetails from '../utils/shared/dbCalls';
import s3Service from './s3';
import { LRUCache } from 'lru-cache';

const MOVE_IN_DATE_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const moveInDateCache = new LRUCache<string, unknown>({
  max: 1000,
  ttl: MOVE_IN_DATE_CACHE_TTL_MS,
});

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

    const cacheKey = `floorplans-${moveInDate}`;

    const cachedData = moveInDateCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const floorplansWithUnits = await fetchEntrataFeed({ moveInDate });

    moveInDateCache.set(cacheKey, floorplansWithUnits, {
      ttl: MOVE_IN_DATE_CACHE_TTL_MS,
    });

    return floorplansWithUnits;
  },
});
