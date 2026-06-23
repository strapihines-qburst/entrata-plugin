import type { Core } from "@strapi/strapi";

import externalApi from "../utils/shared/externalApi";
import floorplanUnits from "../utils/floorplan/parseFp";
import mitsPropertyUnit from "../utils/floorplan/parseMits";
import unitsProperty from "../utils/floorplan/parseUnits";
import pushToDb from "../utils/shared/pushToDb";
import importSpecials from "../utils/specials";
import getFeedDetails from "../utils/shared/dbCalls";
import s3Service from "./s3";

const ENTRATA_PROPERTY_ID = Number(process.env.ENTRATA_PROPERTY_ID || 100124923);

const DEFAULT_UNIT_PARAMS = {
  // availableUnitsOnly: "0",
  // unavailableUnitsOnly: "0",
  // skipPricing: "0",
  // showChildProperties: "1",
  includeDisabledFloorplans: '1',
  includeDisabledUnits: '1',
  showUnitSpaces: '1',
  useSpaceConfiguration: "1",
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async getFeedData() {
    try {
      const entrataUrl = process.env.ENTRATA_URL;
      const entrataApiKey = process.env.ENTRATA_API_KEY;

      const [availability, property, mits, specials] = await Promise.all([
        externalApi(
          "getUnitsAvailabilityAndPricing",
          { propertyId: ENTRATA_PROPERTY_ID, ...DEFAULT_UNIT_PARAMS },
          entrataUrl,
          entrataApiKey,
          "r1"
        ),
        externalApi(
          "getPropertyUnits",
          { propertyIds: ENTRATA_PROPERTY_ID, ...DEFAULT_UNIT_PARAMS },
          entrataUrl,
          entrataApiKey,
          "r1"
        ),
        externalApi(
          "getMitsPropertyUnits",
          { propertyIds: ENTRATA_PROPERTY_ID, ...DEFAULT_UNIT_PARAMS },
          entrataUrl,
          entrataApiKey,
          "r1"
        ),
        externalApi(
          "getSpecials",
          { propertyId: ENTRATA_PROPERTY_ID },
          entrataUrl,
          entrataApiKey,
          "r4"
        ),
      ]);

      const { parsedFp, parsedUnits } = await floorplanUnits(availability);

      const [units,  mitsUnits ] = await Promise.all([
        unitsProperty(property, parsedUnits),
        mitsPropertyUnit(mits),
      ]);

      const pushToDbResult = await pushToDb(
        parsedFp.flat(),
        mitsUnits.flat(),
        units.flat(),
      );
      await importSpecials(strapi, specials);

      const feedDetails = await getFeedDetails(strapi);
      const finalJson = {
      
        floorplans: pushToDbResult,
        ...feedDetails,
      };

     const url = await s3Service().uploadJson(finalJson, "entrata-feed.json");

      return {
        success: true,
        message: `floorplans synced successfully`,
        url,
      };
    } catch (error) {
      strapi.log.error("Entrata API Error", error);
      throw error;
    }
  },
});
