import type { Core } from "@strapi/strapi";

const ENGRAIN_PRICING_UID = "plugin::entratafeed.engrain-pricing";

const findDocumentId = async (strapi: Core.Strapi) => {
  const draft = await strapi.documents(ENGRAIN_PRICING_UID).findFirst({
    status: "draft",
  });

  if (draft) {
    return draft.documentId;
  }

  return (
    await strapi.documents(ENGRAIN_PRICING_UID).findFirst({
      status: "published",
    })
  )?.documentId;
};

export const findEngrainPricing = async (strapi: Core.Strapi) => {
  const draft = await strapi.documents(ENGRAIN_PRICING_UID).findFirst({
    status: "draft",
  });

  if (draft) {
    return draft;
  }

  return strapi.documents(ENGRAIN_PRICING_UID).findFirst({
    status: "published",
  });
};

export const saveEngrainPricingDraft = async (
  strapi: Core.Strapi,
  data: Record<string, unknown>,
) => {
  const documentId = await findDocumentId(strapi);

  if (documentId) {
    return strapi.documents(ENGRAIN_PRICING_UID).update({
      documentId,
      data: data as never,
      status: "draft",
    });
  }

  return strapi.documents(ENGRAIN_PRICING_UID).create({
    data,
    status: "draft",
  });
};

export const publishEngrainPricing = async (strapi: Core.Strapi) => {
  const documentId = await findDocumentId(strapi);

  if (!documentId) {
    throw new Error("No engrain pricing document to publish");
  }

  return strapi.documents(ENGRAIN_PRICING_UID).publish({ documentId });
};

export const saveAndPublishEngrainPricing = async (
  strapi: Core.Strapi,
  data: Record<string, unknown>,
) => {
  await saveEngrainPricingDraft(strapi, data);
  return publishEngrainPricing(strapi);
};
