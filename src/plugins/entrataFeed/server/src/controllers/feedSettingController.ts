const find = async (ctx) => {
  ctx.body = await strapi.plugin('entratafeed').service('feedSetting').find();
};

const update = async (ctx) => {
  ctx.body = await strapi.plugin('entratafeed').service('feedSetting').update(ctx.request.body);
};

export default {
  find,
  update,
};