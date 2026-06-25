type ParsedFloorplan = Record<string, unknown> & {
  floorplan_id: number | string;
};

const buildFloorplansWithUnits = (
  floorplans: { data: Record<string, unknown> }[],
  mitsUnits: {
    floorplanId: number | string;
    availability_url?: string;
    floorplan_image?: string;
  }[],
  units: { floorplan_id: number | string; best_price?: number | string }[]
) => {
  const mitsByFloorplanId = new Map(mitsUnits.map((u) => [u.floorplanId, u]));

  const floorplanData = floorplans.map((item): ParsedFloorplan => {
    const floorplanId = item.data.floorplan_id as number | string;
    const mits = mitsByFloorplanId.get(floorplanId);

    return {
      ...item.data,
      floorplan_id: floorplanId,
      ...(mits
        ? {
            availability_url: mits.availability_url,
            floorplan_image: mits.floorplan_image,
          }
        : {}),
    };
  });

  const unitsByFloorplan = new Map<number | string, typeof units>();

  for (const unit of units) {
    if (!unitsByFloorplan.has(unit.floorplan_id)) {
      unitsByFloorplan.set(unit.floorplan_id, []);
    }

    unitsByFloorplan.get(unit.floorplan_id)!.push(unit);
  }

  return floorplanData.map((fp) => {
    const relatedUnits = unitsByFloorplan.get(fp.floorplan_id) || [];

    const prices = relatedUnits.map((u) => Number(u.best_price)).filter((p) => p > 0);

    return {
      ...fp,
      available_min_rent: prices.length > 0 ? Math.min(...prices) : 0,
      units: relatedUnits,
    };
  });
};

export default buildFloorplansWithUnits;
