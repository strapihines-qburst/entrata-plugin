import { FLOORPLAN_UID, UNIT_UID } from "../../constants/api-constants";
import getFeedDetails from "./dbCalls";
type FloorplanDoc = {
  documentId: string;
  floorplan_id: number;
};
type UnitDoc = {
  documentId: string;
  unit_space_id: number;
};

// import type { Core } from "@strapi/strapi";
// import buildFp from "./buildFp";

// const FLOORPLAN_UID = "plugin::entratafeed.floorplan";
// const UNIT_UID = "plugin::entratafeed.unit";
// const SPECIAL_UID = "plugin::entratafeed.special";
// const PROPERTY_SETTING_UID = "plugin::entratafeed.property-setting";

// const asArray = <T>(value: T | T[] | null | undefined): T[] =>
//   !value ? [] : Array.isArray(value) ? value : [value];

// const formatSpecialForExport = (special: Record<string, unknown>) => ({
//   special_id: special.special_id,
//   special_type: special.special_type,
//   floorplanTypes: special.floorplanTypes ?? null,
//   ...(typeof special.specials === "object" && special.specials
//     ? (special.specials as Record<string, unknown>)
//     : {}),
// });

// const appendSpecial = (
//   map: Map<number | string, ReturnType<typeof formatSpecialForExport>[]>,
//   key: number | string | null | undefined,
//   special: Record<string, unknown>,
// ) => {
//   if (key == null || key === "") {
//     return;
//   }

//   const formatted = formatSpecialForExport(special);

//   if (!map.has(key)) {
//     map.set(key, []);
//   }

//   const existing = map.get(key)!;
//   if (
//     !existing.some(
//       (item) =>
//         item.special_id === formatted.special_id &&
//         item.special_type === formatted.special_type,
//     )
//   ) {
//     existing.push(formatted);
//   }
// };

// const buildSpecialsMaps = (
//   specials: Record<string, unknown>[],
//   floorplans: Record<string, unknown>[],
// ) => {
//   const specialsByFloorplanId = new Map<
//     number | string,
//     ReturnType<typeof formatSpecialForExport>[]
//   >();
//   const specialsByUnitSpaceId = new Map<
//     number | string,
//     ReturnType<typeof formatSpecialForExport>[]
//   >();

//   for (const special of specials) {
//     if (special.special_type === "floorplan") {
//       for (const floorplan of asArray(
//         special.floorplans as Record<string, unknown>[],
//       )) {
//         appendSpecial(
//           specialsByFloorplanId,
//           floorplan.floorplan_id as number | string,
//           special,
//         );
//       }
//     }

//     if (special.special_type === "unit") {
//       for (const unit of asArray(special.units as Record<string, unknown>[])) {
//         appendSpecial(
//           specialsByUnitSpaceId,
//           unit.unit_space_id as number | string,
//           special,
//         );
//       }
//     }

//     if (special.special_type === "floorplanType") {
//       const typeIds = new Set(
//         asArray(special.floorplanTypes as { id?: number | string }[]).map(
//           (item) => String(item?.id ?? item),
//         ),
//       );

//       for (const floorplan of floorplans) {
//         if (typeIds.has(String(floorplan.unit_type_id))) {
//           appendSpecial(
//             specialsByFloorplanId,
//             floorplan.floorplan_id as number | string,
//             special,
//           );
//         }
//       }
//     }
//   }

//   return { specialsByFloorplanId, specialsByUnitSpaceId };
// };

// const pushToDb = async (
//   value1: any[],
//   value2: any[],
//   value3: any[],
//   amenities: any[],
// ) => {
//   const availableUnits = value1.flat();
//   const mitsUnits = value2.flat();
//   const unitsProperty = value3.flat();

//   if (!availableUnits.length || !mitsUnits.length) {
//     return {
//       floorplansCreated: 0,
//       floorplansUpdated: 0,
//       unitsCreated: 0,
//       unitsUpdated: 0,
//     };
//   }

//   const mitsByFloorplanId = new Map(
//     mitsUnits.map((unit) => [unit.floorplanId, unit]),
//   );
//   const amenitiesByUnitId = new Map(
//     amenities.map((item) => [item.unitsId, item.amenities || []]),
//   );

//   const merged = availableUnits.map((item) => {
//     const matchingUnit = mitsByFloorplanId.get(item.data.floorplan_id);

//     return {
//       data: {
//         ...item.data,
//         ...(matchingUnit && {
//           availability_url: matchingUnit.availability_url,
//           floorplan_image: matchingUnit.floorplan_image,
//         }),
//       },
//     };
//   });

//   const unitsWithAmenities = unitsProperty.map((unit) => ({
//     ...unit,
//     amenity: amenitiesByUnitId.get(unit.unitId) || [],
//   }));

//   const floorplans = merged.map(({ data }) => {
//     const { units, ...rest } = data;
//     return rest;
//   });

//   const strapi = (global as unknown as { strapi: Core.Strapi }).strapi;

//   const floorplanIds = floorplans
//     .map((fp) => fp.floorplan_id)
//     .filter((id) => id != null && id !== "");

//   const existingFloorplans = floorplanIds.length
//     ? await strapi.documents(FLOORPLAN_UID).findMany({
//         filters: { floorplan_id: { $in: floorplanIds } },
//         status: "published",
//         pagination: { pageSize: floorplanIds.length },
//       })
//     : [];

//   const existingFloorplanById = new Map(
//     existingFloorplans.map((fp) => [fp.floorplan_id, fp]),
//   );

//   let createdFloorplans = 0;
//   let updatedFloorplans = 0;
//   const floorplanMap = new Map<number | string, string>();

//   await Promise.all(
//     floorplans.map(async (floorplanData) => {
//       const existing = existingFloorplanById.get(floorplanData.floorplan_id);

//       const floorplan = existing
//         ? await strapi.documents(FLOORPLAN_UID).update({
//             documentId: existing.documentId,
//             data: floorplanData,
//             status: "published",
//           })
//         : await strapi.documents(FLOORPLAN_UID).create({
//             data: floorplanData,
//             status: "published",
//           });

//       if (existing) updatedFloorplans++;
//       else createdFloorplans++;

//       floorplanMap.set(floorplanData.floorplan_id, floorplan.documentId);
//     }),
//   );

//   const unitFloorplanIds = [
//     ...new Set(
//       unitsWithAmenities
//         .map((unit) => unit.floorplan_id)
//         .filter((id) => id != null && id !== ""),
//     ),
//   ];
//   const missingFloorplanIds = unitFloorplanIds.filter(
//     (id) => !floorplanMap.has(id),
//   );

//   if (missingFloorplanIds.length) {
//     const linkedFloorplans = await strapi.documents(FLOORPLAN_UID).findMany({
//       filters: { floorplan_id: { $in: missingFloorplanIds } },
//       status: "published",
//       pagination: { pageSize: missingFloorplanIds.length },
//     });

//     for (const floorplan of linkedFloorplans) {
//       floorplanMap.set(floorplan.floorplan_id, floorplan.documentId);
//     }
//   }

//   const unitSpaceIds = unitsWithAmenities
//     .map((unit) => unit.unit_space_id)
//     .filter((id) => id != null && id !== "");

//   const existingUnits = unitSpaceIds.length
//     ? await strapi.documents(UNIT_UID).findMany({
//         filters: { unit_space_id: { $in: unitSpaceIds } },
//         pagination: { pageSize: unitSpaceIds.length },
//       })
//     : [];

//   const existingUnitBySpaceId = new Map(
//     existingUnits.map((unit) => [unit.unit_space_id, unit]),
//   );

//   let createdUnits = 0;
//   let updatedUnits = 0;

//   await Promise.all(
//     unitsWithAmenities.map(async (unit) => {
//       const floorplanDocumentId = floorplanMap.get(unit.floorplan_id);
//       const { floorplan: _floorplan, ...unitFields } = unit;
//       const unitData = {
//         ...unitFields,
//         ...(floorplanDocumentId && {
//           floorplan: {
//             set: [{ documentId: floorplanDocumentId }],
//           },
//         }),
//       };

//       const existing = existingUnitBySpaceId.get(unit.unit_space_id);

//       if (existing) {
//         await strapi.documents(UNIT_UID).update({
//           documentId: existing.documentId,
//           data: unitData,
//           status: "published",
//         });
//         updatedUnits++;
//       } else {
//         const created = await strapi.documents(UNIT_UID).create({
//           data: unitData,
//           status: "published",
//         });
//         if (unit.unit_space_id != null) {
//           existingUnitBySpaceId.set(unit.unit_space_id, created);
//         }
//         createdUnits++;
//       }
//     }),
//   );

// //   const unitsByFloorplan = new Map<number | string, any[]>();

// //   for (const unit of unitsWithAmenities) {
// //     if (!unitsByFloorplan.has(unit.floorplan_id)) {
// //       unitsByFloorplan.set(unit.floorplan_id, []);
// //     }
// //     unitsByFloorplan.get(unit.floorplan_id)!.push(unit);
// //   }

// //   const specials = await strapi.documents(SPECIAL_UID).findMany({
// //     populate: ["floorplans", "units", "specials"],
// //     status: "published",
// //     pagination: { pageSize: 1000 },
// //   });

// //   const { specialsByFloorplanId, specialsByUnitSpaceId } = buildSpecialsMaps(
// //     specials,
// //     floorplans,
// //   );

// //   const floorplansWithUnits = floorplans.map((floorplan) => {
// //     const units = (unitsByFloorplan.get(floorplan.floorplan_id) || []).map(
// //       (unit) => ({
// //         ...unit,
// //         specials: specialsByUnitSpaceId.get(unit.unit_space_id) || [],
// //       }),
// //     );

// //     return {
// //       ...floorplan,
// //       specials: specialsByFloorplanId.get(floorplan.floorplan_id) || [],
// //       units,
// //     };
// //   });
// // console.log(floorplansWithUnits);
//   // const propertySetting = await strapi
//   //   .documents(PROPERTY_SETTING_UID)
//   //   .findFirst({
//   //     populate: ["topSpecial", "popupSpecial"],
//   //     status: "published",
//   //   });

//   // const s3 = strapi.plugin("entratafeed").service("s3");
//   // const [url] = await Promise.all([
//   //   s3.uploadJson(floorplansWithUnits, "feeds/floorplans.json"),
//     // s3.uploadJson(propertySetting, "feeds/property-generic-details.json"),
//   // ]);
//   // await buildFp();
//   return {
//     // floorplansWithUnits,
//     // url,
//     // propertySettingUrl,
//   };
// };

// // const pushToDb = async (fpUnits: any[]) => {
// //   console.log(fpUnits);
// //   for (const fpUnit of fpUnits) {
// //  await strapi.documents(FLOORPLAN_UID).create({
// //     data: fpUnit.data,
// //     status: "published",
// //   });
// //   }
// //   };

// export default pushToDb;


const pushToDb = async (
  floorplans: any[],
  mitsUnits: any[],
  units: any[]
) => {
  const strapi = (global as any).strapi;

  // 1. Merge MITS data into floorplans
  const mitsByFloorplanId = new Map(mitsUnits.map((u) => [u.floorplanId, u]));

  const floorplanData = floorplans.map((item) => {
    const mits = mitsByFloorplanId.get(item.data.floorplan_id);
    return {
      ...item.data,
      ...(mits && {
        availability_url: mits.availability_url,
        floorplan_image: mits.floorplan_image,
      }),
    };
  });

  // 2. Group units by floorplan_id
  const unitsByFloorplan = new Map<number | string, any[]>();
  for (const unit of units) {
    if (!unitsByFloorplan.has(unit.floorplan_id)) {
      unitsByFloorplan.set(unit.floorplan_id, []);
    }
    unitsByFloorplan.get(unit.floorplan_id)!.push(unit);
  }

  // 3. Add available_min_rent AND nest matching units together
  const floorplansWithUnits = floorplanData.map((fp) => {
    // Look up the units array matching this floorplan's ID
    const relatedUnits = unitsByFloorplan.get(fp.floorplan_id) || [];

    // Calculate minimum rent from the grouped units
    const prices = relatedUnits
      .map((u) => Number(u.best_price))
      .filter((p) => p > 0);

    return {
        ...fp,
        available_min_rent: prices.length > 0 ? Math.min(...prices) : 0,
        units: relatedUnits, // <--- This pairs the units directly into the floorplan object
       };
  });

  // Output format will be: [{ floorplan_id: 1146929, ..., units: [...] }, ...]
  const feedDetails = await getFeedDetails(strapi);

  return {
    floorplans: floorplansWithUnits,
    feedDetails,
  };
};
export default pushToDb;
