import {
  findFeedSetting,
  saveAndPublishFeedSetting,
} from '../utils/feedSettingDocument';

const find = async () => {
  return findFeedSetting(strapi);
};

const update = async (data: Record<string, unknown>) => {
  await saveAndPublishFeedSetting(strapi, data);

  return findFeedSetting(strapi);
};

export default {
  find,
  update,
};
