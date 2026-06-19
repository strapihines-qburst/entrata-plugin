import type { Core } from "@strapi/strapi";
import buildFp from "./buildFp";

const FLOORPLAN_UID = "plugin::entratafeed.floorplan";
const UNIT_UID = "plugin::entratafeed.unit";
const PROPERTY_SETTING_UID = "plugin::entratafeed.property-setting";

const pushToDb = async (
  value1: any[],
  value2: any[],
  value3: any[],
  amenities: any[],
) => {
  const availableUnits = value1.flat();
  const mitsUnits = value2.flat();
  const unitsProperty = value3.flat();

  if (!availableUnits.length || !mitsUnits.length) {
    return {
      floorplansCreated: 0,
      floorplansUpdated: 0,
      unitsCreated: 0,
      unitsUpdated: 0,
    };
  }

  const mitsByFloorplanId = new Map(
    mitsUnits.map((unit) => [unit.floorplanId, unit]),
  );
  const amenitiesByUnitId = new Map(
    amenities.map((item) => [item.unitsId, item.amenities || []]),
  );

  const merged = availableUnits.map((item) => {
    const matchingUnit = mitsByFloorplanId.get(item.data.floorplan_id);

    return {
      data: {
        ...item.data,
        ...(matchingUnit && {
          availability_url: matchingUnit.availability_url,
          floorplan_image: matchingUnit.floorplan_image,
        }),
      },
    };
  });

  const unitsWithAmenities = unitsProperty.map((unit) => ({
    ...unit,
    amenity: amenitiesByUnitId.get(unit.unitId) || [],
  }));

  const floorplans = merged.map(({ data }) => {
    const { units, ...rest } = data;
    return rest;
  });

  const strapi = (global as unknown as { strapi: Core.Strapi }).strapi;

  const floorplanIds = floorplans
    .map((fp) => fp.floorplan_id)
    .filter((id) => id != null && id !== "");

  const existingFloorplans = floorplanIds.length
    ? await strapi.documents(FLOORPLAN_UID).findMany({
        filters: { floorplan_id: { $in: floorplanIds } },
        status: "published",
        pagination: { pageSize: floorplanIds.length },
      })
    : [];

  const existingFloorplanById = new Map(
    existingFloorplans.map((fp) => [fp.floorplan_id, fp]),
  );

  let createdFloorplans = 0;
  let updatedFloorplans = 0;
  const floorplanMap = new Map<number | string, string>();

  await Promise.all(
    floorplans.map(async (floorplanData) => {
      const existing = existingFloorplanById.get(floorplanData.floorplan_id);

      const floorplan = existing
        ? await strapi.documents(FLOORPLAN_UID).update({
            documentId: existing.documentId,
            data: floorplanData,
            status: "published",
          })
        : await strapi.documents(FLOORPLAN_UID).create({
            data: floorplanData,
            status: "published",
          });

      if (existing) updatedFloorplans++;
      else createdFloorplans++;

      floorplanMap.set(floorplanData.floorplan_id, floorplan.documentId);
    }),
  );

  const unitSpaceIds = unitsWithAmenities
    .map((unit) => unit.unit_space_id)
    .filter((id) => id != null && id !== "");

  const existingUnits = unitSpaceIds.length
    ? await strapi.documents(UNIT_UID).findMany({
        filters: { unit_space_id: { $in: unitSpaceIds } },
        pagination: { pageSize: unitSpaceIds.length },
      })
    : [];

  const existingUnitBySpaceId = new Map(
    existingUnits.map((unit) => [unit.unit_space_id, unit]),
  );

  let createdUnits = 0;
  let updatedUnits = 0;

  await Promise.all(
    unitsWithAmenities.map(async (unit) => {
      const floorplanDocumentId = floorplanMap.get(unit.floorplan_id);
      const unitData = {
        ...unit,
        ...(floorplanDocumentId && { floorplan: floorplanDocumentId }),
      };

      const existing = existingUnitBySpaceId.get(unit.unit_space_id);

      if (existing) {
        await strapi.documents(UNIT_UID).update({
          documentId: existing.documentId,
          data: unitData,
          status: "published",
        });
        updatedUnits++;
      } else {
        const created = await strapi.documents(UNIT_UID).create({
          data: unitData,
          status: "published",
        });
        if (unit.unit_space_id != null) {
          existingUnitBySpaceId.set(unit.unit_space_id, created);
        }
        createdUnits++;
      }
    }),
  );

  const unitsByFloorplan = new Map<number | string, any[]>();

  for (const unit of unitsWithAmenities) {
    if (!unitsByFloorplan.has(unit.floorplan_id)) {
      unitsByFloorplan.set(unit.floorplan_id, []);
    }
    unitsByFloorplan.get(unit.floorplan_id)!.push(unit);
  }

  const floorplansWithUnits = floorplans.map((floorplan) => ({
    ...floorplan,
    units: unitsByFloorplan.get(floorplan.floorplan_id) || [],
  }));

  // const propertySetting = await strapi
  //   .documents(PROPERTY_SETTING_UID)
  //   .findFirst({
  //     populate: ["topSpecial", "popupSpecial"],
  //     status: "published",
  //   });

  const s3 = strapi.plugin("entratafeed").service("s3");
  const [url] = await Promise.all([
    s3.uploadJson(floorplansWithUnits, "feeds/floorplans.json"),
    // s3.uploadJson(propertySetting, "feeds/property-generic-details.json"),
  ]);
  await buildFp();
  return {
    floorplansCreated: createdFloorplans,
    floorplansUpdated: updatedFloorplans,
    unitsCreated: createdUnits,
    unitsUpdated: updatedUnits,
    url,
    // propertySettingUrl,
  };
};

// const pushToDb = async (fpUnits: any[]) => {
//   console.log(fpUnits);
//   for (const fpUnit of fpUnits) {
//  await strapi.documents(FLOORPLAN_UID).create({
//     data: fpUnit.data,
//     status: "published",
//   });
//   }
//   };

export default pushToDb;
