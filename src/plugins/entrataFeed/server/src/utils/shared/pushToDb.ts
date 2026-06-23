import { FLOORPLAN_UID, UNIT_UID } from "../../constants/api-constants";

const pushToDb = async (
  floorplans: any[],
  mitsUnits: any[],
  units: any[],
) => {
  const strapi = (global as any).strapi;

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

  const unitsByFloorplan = new Map<number | string, any[]>();

  for (const unit of units) {
    if (!unitsByFloorplan.has(unit.floorplan_id)) {
      unitsByFloorplan.set(unit.floorplan_id, []);
    }

    unitsByFloorplan.get(unit.floorplan_id)!.push(unit);
  }

  const floorplansWithUnits = floorplanData.map((fp) => {
    const relatedUnits = unitsByFloorplan.get(fp.floorplan_id) || [];

    const prices = relatedUnits
      .map((u) => Number(u.best_price))
      .filter((p) => p > 0);

    return {
      ...fp,
      available_min_rent: prices.length > 0 ? Math.min(...prices) : 0,
      units: relatedUnits,
    };
  });

  const finalFloorplans = floorplansWithUnits.map(({ units: _units, ...rest }) => rest);

  const existingFloorplans = await strapi.documents(FLOORPLAN_UID).findMany({
    filters: {
      floorplan_id: {
        $in: finalFloorplans.map((fp) => fp.floorplan_id),
      },
    },
    status: "published",
  });

  const existingIds = new Set(existingFloorplans.map((fp) => fp.floorplan_id));

  await Promise.all(
    finalFloorplans.map((fp) => {
      if (existingIds.has(fp.floorplan_id)) {
        return strapi.documents(FLOORPLAN_UID).update({
          documentId: existingFloorplans.find(
            (e) => e.floorplan_id === fp.floorplan_id,
          ).documentId,
          data: fp,
          status: "published",
        });
      }

      return strapi.documents(FLOORPLAN_UID).create({
        data: fp,
        status: "published",
      });
    }),
  );

  const propertyUnits = await strapi.documents(UNIT_UID).findMany({
    filters: {
      unitId: {
        $in: units.map((u) => u.unitId),
      },
    },
    status: "published",
  });

  const existingUnitIds = new Set(propertyUnits.map((u) => u.unitId));

  await Promise.all(
    units.map((u) => {
      if (existingUnitIds.has(u.unitId)) {
        return strapi.documents(UNIT_UID).update({
          documentId: propertyUnits.find((p) => p.unitId === u.unitId).documentId,
          data: u,
          status: "published",
        });
      }

      return strapi.documents(UNIT_UID).create({
        data: u,
        status: "published",
      });
    }),
  );

  return floorplansWithUnits;
};

export default pushToDb;
