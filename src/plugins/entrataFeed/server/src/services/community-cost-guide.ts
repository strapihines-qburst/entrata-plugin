import { COMMUNITY_COST_GUIDE_UID } from '../constants/api-constants';

const findCommunityCostGuide = async () => {
  const published = await strapi.documents(COMMUNITY_COST_GUIDE_UID).findFirst({
    status: 'published',
  });

  if (published) {
    return published;
  }

  return strapi.documents(COMMUNITY_COST_GUIDE_UID).findFirst({
    status: 'draft',
  });
};

const savePublishedCommunityCostGuide = async (data: Record<string, unknown>) => {
  const existing = await findCommunityCostGuide();

  if (existing) {
    return strapi.documents(COMMUNITY_COST_GUIDE_UID).update({
      documentId: existing.documentId,
      data: data as never,
      status: 'published',
    });
  }

  return strapi.documents(COMMUNITY_COST_GUIDE_UID).create({
    data,
    status: 'published',
  });
};

const find = async () => {
  const guide = await findCommunityCostGuide();

  return guide;
};

const publish = async (data: Record<string, unknown>) => {
  return savePublishedCommunityCostGuide(data);
};

export default {
  find,
  publish,
};
