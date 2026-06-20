import { getEngrainData } from '../utils/engrain/engrainCalculator';
import { ENGRAIN_PRICING_UID } from '../constants/api-constants';

const findEngrainPricing = async () => {
  const published = await strapi.documents(ENGRAIN_PRICING_UID).findFirst({
    status: 'published',
  });

  if (published) {
    return published;
  }

  return strapi.documents(ENGRAIN_PRICING_UID).findFirst({
    status: 'draft',
  });
};

const savePublishedEngrainPricing = async (data: Record<string, unknown>) => {
  const existing = await findEngrainPricing();

  if (existing) {
    return strapi.documents(ENGRAIN_PRICING_UID).update({
      documentId: existing.documentId,
      data: data as never,
      status: 'published',
    });
  }

  return strapi.documents(ENGRAIN_PRICING_UID).create({
    data,
    status: 'published',
  });
};

const find = async () => {
  const pricing = await findEngrainPricing();

  return pricing ;
};

const publish = async (data: Record<string, unknown>) => {
  return savePublishedEngrainPricing(data);
};

const updateEngrainPrice = async (data: Record<string, unknown> = {}) => {
  if (Object.keys(data).length > 0) {
    await savePublishedEngrainPricing(data);
  }

  const pricing = await findEngrainPricing();

  if (!pricing) {
    throw new Error('No engrain pricing document found');
  }

  const engrainPrice = await getEngrainData(pricing);

  return { message: 'Engrain price synced', engrainPrice };
};

export default {
  find,
  publish,
  updateEngrainPrice,
};
