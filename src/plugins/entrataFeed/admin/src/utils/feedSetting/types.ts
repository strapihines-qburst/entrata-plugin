import type { API_PARAM_FIELDS, FEED_SETTING_SECTIONS } from "./constants";

export type ApiParamField = (typeof API_PARAM_FIELDS)[number];

export type ApiParams = Record<ApiParamField, boolean>;

export type FeedSettingSectionKey = (typeof FEED_SETTING_SECTIONS)[number]["key"];

export type FeedSettingForm = Record<FeedSettingSectionKey, ApiParams>;

export type FeedSettingResponse = FeedSettingForm;
