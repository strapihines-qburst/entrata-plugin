export default {
  async updateEngrainPrice(ctx) {
    ctx.body = await strapi
      .plugin('entratafeed')
      .service('engrainCalculator')
      .updateEngrainPrice(ctx.request.body as Record<string, unknown>);
  },
};
