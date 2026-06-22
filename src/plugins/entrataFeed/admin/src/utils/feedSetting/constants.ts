export const FEED_SETTING_PATH = "/entratafeed/feed-setting";

export const FEED_SETTING_CM_PATH =
  "/content-manager/single-types/plugin::entratafeed.feed-setting";

export const API_PARAM_FIELDS = [
  "availableUnitsOnly",
  "unavailableUnitsOnly",
  "skipPricing",
  "includeDisabledFloorplans",
  "includeDisabledUnits",
  "showUnitSpaces",
  "useSpaceConfiguration",
  "allowLeaseExpirationOverride",
] as const;

export const FEED_SETTING_SECTIONS = [
  {
    key: "availabilitySettings",
    translationKey: "floorplan.settings.section.availability",
  },
  {
    key: "mitsSettings",
    translationKey: "floorplan.settings.section.mits",
  },
  {
    key: "propertyUnitSettings",
    translationKey: "floorplan.settings.section.propertyUnits",
  },
] as const;
