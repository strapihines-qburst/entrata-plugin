import type { Core } from '@strapi/strapi';

import { FEED_SETTING_UID } from '../constants/api-constants';

const populate = {
  availabilitySettings: true,
  mitsSettings: true,
  propertyUnitSettings: true,
} as const;

const COMPONENT_FIELDS = [
  'availabilitySettings',
  'mitsSettings',
  'propertyUnitSettings',
] as const;

const prepareComponent = (
  incoming: Record<string, unknown> | null | undefined,
  existing: Record<string, unknown> | null | undefined,
) => {
  if (!incoming) {
    return null;
  }

  const {
    documentId: _documentId,
    __component: _component,
    id,
    ...fields
  } = incoming;

  const existingId = existing?.id ?? id;

  return existingId != null ? { ...fields, id: existingId } : fields;
};

const prepareData = (
  data: Record<string, unknown>,
  existing?: Record<string, unknown> | null,
): Record<string, unknown> =>
  Object.fromEntries(
    COMPONENT_FIELDS.map((field) => [
      field,
      prepareComponent(
        data[field] as Record<string, unknown>,
        existing?.[field] as Record<string, unknown>,
      ),
    ]),
  );

const findDocumentId = async (strapi: Core.Strapi) => {
  const draft = await strapi.documents(FEED_SETTING_UID).findFirst({
    status: 'draft',
  });

  if (draft) {
    return draft.documentId;
  }

  return (
    await strapi.documents(FEED_SETTING_UID).findFirst({
      status: 'published',
    })
  )?.documentId;
};

export const findFeedSetting = async (strapi: Core.Strapi) => {
  const draft = await strapi.documents(FEED_SETTING_UID).findFirst({
    status: 'draft',
    populate,
  });

  if (draft) {
    return draft;
  }

  return strapi.documents(FEED_SETTING_UID).findFirst({
    status: 'published',
    populate,
  });
};

export const saveFeedSettingDraft = async (
  strapi: Core.Strapi,
  data: Record<string, unknown>,
) => {
  const existing = await findFeedSetting(strapi);
  const payload = prepareData(data, existing);
  const documentId = await findDocumentId(strapi);

  if (documentId) {
    return strapi.documents(FEED_SETTING_UID).update({
      documentId,
      data: payload as never,
      status: 'draft',
    });
  }

  return strapi.documents(FEED_SETTING_UID).create({
    data: payload,
    status: 'draft',
  });
};

export const publishFeedSetting = async (strapi: Core.Strapi) => {
  const documentId = await findDocumentId(strapi);

  if (!documentId) {
    throw new Error('No feed setting document to publish');
  }

  return strapi.documents(FEED_SETTING_UID).publish({ documentId });
};

export const saveAndPublishFeedSetting = async (
  strapi: Core.Strapi,
  data: Record<string, unknown>,
) => {
  await saveFeedSettingDraft(strapi, data);

  return publishFeedSetting(strapi);
};
