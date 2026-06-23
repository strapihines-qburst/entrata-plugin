import type { Core } from '@strapi/strapi';

import {
  SPECIAL_UID,
  VIRTUAL_TOUR_UID,
  AMENITY_UID,
  ENGRAIN_PRICING_UID,
} from '../../constants/api-constants';

type FeedDetailFetcher = (strapi: Core.Strapi) => Promise<unknown>;

const specials: FeedDetailFetcher = async (strapi) =>
  strapi.documents(SPECIAL_UID).findMany({
    status: 'published',
    populate: {
      floorplans: {
        fields: ['floorplan_id'],
      },
      units: {
        fields: [ 'unitId'],
      },
      specials: {
        populate: {
          links: true,
        },
      },
      customFloorplans: true,
    },
    fields: ['special_id', 'special_type', 'floorplanTypes','isOverRide'],
  });

const amenities: FeedDetailFetcher = async (strapi) =>
  strapi.documents(AMENITY_UID).findMany({
    status: 'published',
    populate: {
      floorplans: {
        fields: ['floorplan_id'],
      },
      units: {
        fields: ['unitId'],
      },
      amenitiesList: true,
    },
    fields: [ 'floorLevel'],
  });

const virtualTours: FeedDetailFetcher = async (strapi) =>
  strapi.documents(VIRTUAL_TOUR_UID).findMany({
    status: 'published',
    populate: {
      floorplans: {
        fields: ['floorplan_id'],
      },
      units: {
        fields: ['unitId'],
      },
    },
    // fields: ['floorplans', 'units', 'virtualTourUrl'],
  });


const engrainPricings: FeedDetailFetcher = async (strapi) =>
  strapi.documents(ENGRAIN_PRICING_UID).findFirst({
    status: 'published',
    fields: [ 'engrainPrice'],
  });

const feedDetailFetchers: Record<string, FeedDetailFetcher>[] = [
  { specials },
  { amenities },
  { virtualTours },
  { engrainPricings },
];

const getFeedDetails = async (strapi: Core.Strapi) => {
  const entries = await Promise.all(
    feedDetailFetchers.map(async (entry) => {
      const [key, fetcher] = Object.entries(entry)[0];

      return [key, await fetcher(strapi)];
    })
  );

  return Object.fromEntries(entries);
};


export default getFeedDetails;
