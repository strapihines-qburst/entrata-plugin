import { API_PARAM_FIELDS, FEED_SETTING_SECTIONS } from "./constants";
import type { ApiParams, FeedSettingForm, FeedSettingResponse } from "./types";

const emptyApiParams = (): ApiParams =>
  Object.fromEntries(
    API_PARAM_FIELDS.map((field) => [field, field === "showUnitSpaces"]),
  ) as ApiParams;

export const emptyFeedSettingForm = (): FeedSettingForm =>
  Object.fromEntries(
    FEED_SETTING_SECTIONS.map((section) => [section.key, emptyApiParams()]),
  ) as FeedSettingForm;

const toBooleanField = (value: unknown, defaultValue: boolean): boolean => {
  if (value === true || value === false) {
    return value;
  }

  return defaultValue;
};

const toApiParams = (params: Partial<ApiParams> | null | undefined): ApiParams =>
  Object.fromEntries(
    API_PARAM_FIELDS.map((field) => [
      field,
      toBooleanField(params?.[field], field === "showUnitSpaces"),
    ]),
  ) as ApiParams;

export const toFeedSettingForm = (
  setting: FeedSettingResponse | null | undefined,
): FeedSettingForm => ({
  availabilitySettings: toApiParams(setting?.availabilitySettings),
  mitsSettings: toApiParams(setting?.mitsSettings),
  propertyUnitSettings: toApiParams(setting?.propertyUnitSettings),
});

export const toFeedSettingPayload = (form: FeedSettingForm): FeedSettingForm => ({
  availabilitySettings: { ...form.availabilitySettings },
  mitsSettings: { ...form.mitsSettings },
  propertyUnitSettings: { ...form.propertyUnitSettings },
});
