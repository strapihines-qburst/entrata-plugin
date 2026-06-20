type ControllerError = {
  status?: number;
  message?: string;
  details?: unknown;
};

const handleError = (ctx: { status: number; body: unknown }, label: string, error: unknown) => {
  const err = error as ControllerError;
  strapi.log.error(`${label} failed`, error);
  ctx.status = err.status || 400;
  ctx.body = {
    error: err.message || `${label} failed`,
    details: err.details,
  };
};

export default {
  async find(ctx) {
    ctx.body = await strapi.plugin('entratafeed').service('communityCostGuide').find();
  },

  async publish(ctx) {
    try {
      ctx.body = await strapi
        .plugin('entratafeed')
        .service('communityCostGuide')
        .publish(ctx.request.body as Record<string, unknown>);
    } catch (error) {
      handleError(ctx, 'community-cost-guide publish', error);
    }
  },
};
