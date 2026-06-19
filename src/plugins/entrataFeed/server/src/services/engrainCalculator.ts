import { getEngrainData } from '../utils/engrain/engrainCalculator';
import {
  findEngrainPricing,
  saveAndPublishEngrainPricing,
} from '../utils/engrainPricingDocument';

const defaultEngrainPricing = () => ({
  enableEngrainPricing: false,
  engrainApiUrl: '',
  engrainPrice: '',
  engrainFeeCalculatorTitle: '',
  description: '',
  shortDisclaimer: '',
  longDisclaimer: '',
});

export default {
  async find() {
    const pricing = await findEngrainPricing(strapi);

    return pricing || defaultEngrainPricing();
  },

  async publish(data: Record<string, unknown>) {
    return saveAndPublishEngrainPricing(strapi, data);
  },

  async updateEngrainPrice(data: Record<string, unknown> = {}) {
    if (Object.keys(data).length > 0) {
      await saveAndPublishEngrainPricing(strapi, data);
    }

    const pricing = await findEngrainPricing(strapi);

    if (!pricing) {
      throw new Error('No engrain pricing document found');
    }

    const engrainPrice = await getEngrainData(pricing);

    return { message: 'Engrain price synced', engrainPrice };
  },
};
