const pick = (item: Record<string, unknown>, keys: string[]) =>
  Object.fromEntries(keys.filter((key) => key in item).map((key) => [key, item[key]]));

const getUnitIdsByFloorplanId = (floorplans: any[]) =>
  Object.fromEntries(
    floorplans.map((fp) => [
      fp.floorplan_id,
      (fp.units ?? []).map((unit: { unitId: number }) => unit.unitId),
    ]),
  );

const buildUnitsList = (
  entry: { floorplans?: { floorplan_id: number }[]; units?: { unitId: number }[] },
  unitIdsByFloorplanId: Record<number, number[]>,
) => {
  const fromFloorplans = (entry.floorplans ?? []).flatMap(
    (fp) => unitIdsByFloorplanId[fp.floorplan_id] ?? [],
  );
  const fromUnits = (entry.units ?? []).map((unit) => unit.unitId);

  return [...new Set([...fromFloorplans, ...fromUnits])].map((unitId) => ({ unitId }));
};

const parseAmenity = (entry: any, unitIdsByFloorplanId: Record<number, number[]>) => ({
  floorLevel: entry.floorLevel,
  amenitiesList: (entry.amenitiesList ?? []).map((item: Record<string, unknown>) =>
    pick(item, ['list']),
  ),
  floorplans: (entry.floorplans ?? []).map((fp: Record<string, unknown>) =>
    pick(fp, ['floorplan_id']),
  ),
  unitsList: buildUnitsList(entry, unitIdsByFloorplanId),
});

const parseVirtualTour = (entry: any, unitIdsByFloorplanId: Record<number, number[]>) => ({
  virtualTourLink: entry.virtualTourLink,
  floorplans: (entry.floorplans ?? []).map((fp: Record<string, unknown>) =>
    pick(fp, ['floorplan_id']),
  ),
  units: (entry.units ?? []).map((unit: Record<string, unknown>) => pick(unit, ['unitId'])),
  unitsList: buildUnitsList(entry, unitIdsByFloorplanId),
});

const parseSpecial = (entry: any) => ({
  ...pick(entry, ['special_id', 'special_type', 'floorplanTypes', 'isOverRide']),
  floorplans: (entry.floorplans ?? []).map((fp: Record<string, unknown>) =>
    pick(fp, ['floorplan_id']),
  ),
  units: (entry.units ?? []).map((unit: Record<string, unknown>) => pick(unit, ['unitId'])),
  customFloorplans: (entry.customFloorplans ?? []).map((fp: Record<string, unknown>) =>
    pick(fp, ['floorplan_id']),
  ),
  specials: entry.specials
    ? {
        ...pick(entry.specials, [
          'specialTitle',
          'specialDescription',
          'isOverRide',
          'showSpecials',
          'overRideText',
          'overRideDescription',
        ]),
        links: (entry.specials.links ?? []).map((link: Record<string, unknown>) =>
          pick(link, ['text', 'href', 'target']),
        ),
      }
    : null,
});

const parseFeedDetail = (entry?: Record<string, any>) => ({
  enableEngrainPricing: entry?.enableEngrainPricing,
  engrainPrice: entry?.engrainPrice,
});

const parseFeedDetails = (
  {
    specials,
    amenities,
    virtualTours,
    feedDetails,
  }: {
    specials?: unknown;
    amenities?: unknown;
    virtualTours?: unknown;
    feedDetails?: unknown;
  },
  floorplans: any[] = [],
) => {
  const unitIdsByFloorplanId = getUnitIdsByFloorplanId(floorplans);

  return {
    specials: Array.isArray(specials) ? specials.map(parseSpecial) : [],
    amenities: Array.isArray(amenities)
      ? amenities.map((entry) => parseAmenity(entry, unitIdsByFloorplanId))
      : [],
    virtualTours: Array.isArray(virtualTours)
      ? virtualTours.map((entry) => parseVirtualTour(entry, unitIdsByFloorplanId))
      : [],
    feedDetails: parseFeedDetail(
      feedDetails && typeof feedDetails === 'object'
        ? (feedDetails as Record<string, any>)
        : undefined,
    ),
  };
};
export default parseFeedDetails;
