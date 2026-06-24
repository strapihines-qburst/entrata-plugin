import type { Core } from '@strapi/strapi';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  async generate(ctx) {
    const result = await strapi.plugin('entratafeed').service('floorplan').getFeedData();

    ctx.body = result;
  },

  async getFeed(ctx) {
    const result = await strapi.plugin('entratafeed').service('floorplan').getFeed(ctx.query);

    ctx.body = result;
  },
});
export default controller;
