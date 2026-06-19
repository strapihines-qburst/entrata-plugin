export default {
  async updateEngrainPrice(ctx) {
    ctx.body = await strapi
      .plugin('entratafeed')
      .service('engrainCalculator')
      .updateEngrainPrice(ctx.request.body as Record<string, unknown>);
  },

  async find(ctx) {
    ctx.body = await strapi.plugin('entratafeed').service('engrainCalculator').find();
  },

  async publish(ctx) {
    ctx.body = await strapi
      .plugin('entratafeed')
      .service('engrainCalculator')
      .publish(ctx.request.body as Record<string, unknown>);
  },
};
