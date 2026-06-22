import type { Core } from '@strapi/strapi';

import {
  SPECIAL_UID,
  VIRTUAL_TOUR_UID,
  AMENITY_UID,
  COMMUNITY_COST_GUIDE_UID,
  ENGRAIN_PRICING_UID,
} from '../../constants/api-constants';

type FeedDetailFetcher = (strapi: Core.Strapi) => Promise<unknown>;

const specials: FeedDetailFetcher = async (strapi) =>
  strapi.documents(SPECIAL_UID).findMany({
    status: 'published',
    populate: {
      floorplans: {
        fields: ['floorplan_id', 'unit_type_id'],
      },
      units: {
        fields: ['unit_space_id', 'unitId'],
      },
      specials: {
        populate: {
          links: true,
        },
      },
    },
  });
const amenities: FeedDetailFetcher = async (strapi) =>
  strapi.documents(AMENITY_UID).findMany({
    status: 'published',
    populate: {
      floorplans: {
        fields: ['floorplan_id', 'unit_type_id'],
      },
      units: {
        fields: ['unit_space_id', 'unitId'],
      },
      amenitiesList: true,
    },
  });

const virtualTours: FeedDetailFetcher = async (strapi) =>
  strapi.documents(VIRTUAL_TOUR_UID).findMany({
    status: 'published',
    populate: {
      floorplans: {
        fields: ['floorplan_id', 'unit_type_id'],
      },
      units: {
        fields: ['unit_space_id', 'unitId'],
      },
    },
  });

const communityCostGuides: FeedDetailFetcher = async (strapi) =>
  strapi.documents(COMMUNITY_COST_GUIDE_UID).findMany({
    status: 'published',
  });

const engrainPricings: FeedDetailFetcher = async (strapi) =>
  strapi.documents(ENGRAIN_PRICING_UID).findMany({
    status: 'published',
  });

const feedDetailFetchers: Record<string, FeedDetailFetcher>[] = [
  { specials },
  { amenities },
  { virtualTours },
  { communityCostGuides },
  { engrainPricings },
];

const getFeedDetails = async (strapi: Core.Strapi) =>
  Promise.all(
    feedDetailFetchers.map(async (entry) => {
      const [key, fetcher] = Object.entries(entry)[0];

      return {
        [key]: await fetcher(strapi),
      };
    }),
  );

export default getFeedDetails;
