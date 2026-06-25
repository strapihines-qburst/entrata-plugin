import type { Core } from '@strapi/strapi';

import { SPECIAL_UID, AMENITY_UID, VIRTUAL_TOUR_UID } from '../../constants/api-constants';
import parseFeedDetails from './parseFeedDetails';

type FeedDetailFetcher = (strapi: Core.Strapi) => Promise<unknown>;

const specials: FeedDetailFetcher = async (strapi) =>
  strapi.documents(SPECIAL_UID).findMany({
    status: 'published',
    populate: {
      floorplans: { fields: ['floorplan_id'] },
      units: { fields: ['unitId'] },
      specials: { populate: { links: true } },
      customFloorplans: { fields: ['floorplan_id'] },
    },
    fields: ['special_id', 'special_type', 'floorplanTypes', 'isOverRide'],
  });

const amenities: FeedDetailFetcher = async (strapi) =>
  strapi.documents(AMENITY_UID).findMany({
    status: 'published',
    populate: {
      floorplans: { fields: ['floorplan_id'] },
      units: { fields: ['unitId'] },
      amenitiesList: true,
    },
    fields: ['floorLevel'],
  });

const virtualTours: FeedDetailFetcher = async (strapi) =>
  strapi.documents(VIRTUAL_TOUR_UID).findMany({
    status: 'published',
    populate: {
      floorplans: { fields: ['floorplan_id'] },
      units: { fields: ['unitId'] },
    },
    fields: ['virtualTourLink'],
  });

const getFeedDetails = async (strapi: Core.Strapi, floorplans: any[] = []) => {
  const [specialsData, amenitiesData, virtualToursData] = await Promise.all([
    specials(strapi),
    amenities(strapi),
    virtualTours(strapi),
  ]);

  return parseFeedDetails(
    {
      specials: specialsData,
      amenities: amenitiesData,
      virtualTours: virtualToursData,
    },
    floorplans
  );
};

export default getFeedDetails;
