import type { Core } from "@strapi/strapi";

import externalApi from "../utils/externalApi";
import floorplanUnits from "../utils/floorplan/parseFp";
import mitsPropertyUnit from "../utils/floorplan/parseMits";
import unitsProperty from "../utils/floorplan/parseUnits";
import pushToDb from "../utils/pushToDb";
import importSpecials from "../utils/specials";

const ENTRATA_PROPERTY_ID = Number(process.env.ENTRATA_PROPERTY_ID || 100124923);

const DEFAULT_UNIT_PARAMS = {
  availableUnitsOnly: "0",
  unavailableUnitsOnly: "0",
  skipPricing: "0",
  showChildProperties: "1",
  includeDisabledFloorplans: "0",
  includeDisabledUnits: "1",
  showUnitSpaces: "1",
  useSpaceConfiguration: "0",
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async getFeedData() {
    try {
      const entrataUrl = process.env.ENTRATA_URL;
      const entrataApiKey = process.env.ENTRATA_API_KEY;

      const [availability, property,mits ] = await Promise.all([
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
        // externalApi(
        //   "getSpecials",
        //   { propertyId: ENTRATA_PROPERTY_ID },
        //   entrataUrl,
        //   entrataApiKey,
        //   "r4"
        // ),
      ]);

      const [fpUnits, units, { mitsUnits, amenities }] = await Promise.all([
        floorplanUnits(availability),
        unitsProperty(property),
        mitsPropertyUnit(mits),
      ]);

      // const fpUnits = await floorplanUnits(availability);

      const count = await pushToDb(fpUnits, mitsUnits, units, amenities);
      // await pushToDb(fpUnits);
      // await importSpecials(strapi, special);

      return {
        success: true,
        message: `floorplans synced successfully`,
        // count,
      };
    } catch (error) {
      strapi.log.error("Entrata API Error", error);
      throw error;
    }
  },

  // async getFeedData() {
  //   try {
  //    const specials = await externalApi("getSpecials", { propertyId: ENTRATA_PROPERTY_ID }, process.env.ENTRATA_URL, process.env.ENTRATA_API_KEY, "r4");
  //    await importSpecials(strapi, specials);
  //    return specials;
  //   } catch (error) {
  //     strapi.log.error("Error getting specials", error);
  //     throw error;
  //   }
  // }
});
