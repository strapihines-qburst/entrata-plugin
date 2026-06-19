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
    ctx.body = await strapi
      .plugin('entratafeed')
      .service('communityCostGuide')
      .getCommunityCostGuide();
  },

  async update(ctx) {
    try {
      const body = ctx.request.body as Record<string, unknown>;
      const shouldPublish = body.publish === true;
      const { publish: _publish, ...data } = body;

      ctx.body = await strapi
        .plugin('entratafeed')
        .service('communityCostGuide')
        .updateCommunityCostGuide(data, { publish: shouldPublish });
    } catch (error) {
      handleError(ctx, 'community-cost-guide update', error);
    }
  },
};
