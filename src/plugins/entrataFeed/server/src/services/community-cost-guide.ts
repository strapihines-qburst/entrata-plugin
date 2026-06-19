import {
  findCommunityCostGuide,
  publishCommunityCostGuide,
  saveAndPublishCommunityCostGuide,
  saveCommunityCostGuideDraft,
} from '../utils/communityCostGuideDocument';

export default {
  async getCommunityCostGuide() {
    const guide = await findCommunityCostGuide(strapi);

    return (
      guide || {
        totalCostClarityTitle: '',
        totalCostClarityDescription: [],
        communityCostGuideTitle: '',
        communityCostGuideDescription: [],
        iframeUrl: '',
      }
    );
  },

  async updateCommunityCostGuide(
    data: Record<string, unknown>,
    options: { publish?: boolean } = {}
  ) {
    if (options.publish) {
      return saveAndPublishCommunityCostGuide(strapi, data);
    }

    return saveCommunityCostGuideDraft(strapi, data);
  },

  async publishCommunityCostGuide() {
    return publishCommunityCostGuide(strapi);
  },
};
