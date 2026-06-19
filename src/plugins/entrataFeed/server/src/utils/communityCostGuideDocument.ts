import type { Core } from "@strapi/strapi";

const COMMUNITY_COST_GUIDE_UID = "plugin::entratafeed.community-cost-guide";

const findDocumentId = async (strapi: Core.Strapi) => {
  const draft = await strapi.documents(COMMUNITY_COST_GUIDE_UID).findFirst({
    status: "draft",
  });

  if (draft) {
    return draft.documentId;
  }

  return (
    await strapi.documents(COMMUNITY_COST_GUIDE_UID).findFirst({
      status: "published",
    })
  )?.documentId;
};

export const findCommunityCostGuide = async (strapi: Core.Strapi) => {
  const draft = await strapi.documents(COMMUNITY_COST_GUIDE_UID).findFirst({
    status: "draft",
  });

  if (draft) {
    return draft;
  }

  return strapi.documents(COMMUNITY_COST_GUIDE_UID).findFirst({
    status: "published",
  });
};

export const saveCommunityCostGuideDraft = async (
  strapi: Core.Strapi,
  data: Record<string, unknown>,
) => {
  const documentId = await findDocumentId(strapi);

  if (documentId) {
    return strapi.documents(COMMUNITY_COST_GUIDE_UID).update({
      documentId,
      data: data as never,
      status: "draft",
    });
  }

  return strapi.documents(COMMUNITY_COST_GUIDE_UID).create({
    data,
    status: "draft",
  });
};

export const publishCommunityCostGuide = async (strapi: Core.Strapi) => {
  const documentId = await findDocumentId(strapi);

  if (!documentId) {
    throw new Error("No community cost guide document to publish");
  }

  return strapi.documents(COMMUNITY_COST_GUIDE_UID).publish({ documentId });
};

export const saveAndPublishCommunityCostGuide = async (
  strapi: Core.Strapi,
  data: Record<string, unknown>,
) => {
  await saveCommunityCostGuideDraft(strapi, data);
  return publishCommunityCostGuide(strapi);
};
