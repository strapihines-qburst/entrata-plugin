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

const getPropertyFilters = (floorplans: any[]) => {
  const result = floorplans.reduce(
    (acc, item) => ({
      maxRent: Math.max(acc.maxRent, item.minRent),
      minRent: Math.min(acc.minRent, item.minRent),
      maxSqft: Math.max(acc.maxSqft, item.minSqFt),
      minSqft: Math.min(acc.minSqft, item.minSqFt),
    }),
    {
      maxRent: -Infinity,
      minRent: Infinity,
      maxSqft: -Infinity,
      minSqft: Infinity,
    },
  );

  return {
    minRent: Math.floor(result.minRent / 100) * 100,
    maxRent: Math.ceil(result.maxRent / 100) * 100,
    minSqft: Math.floor(result.minSqft / 100) * 100,
    maxSqft: Math.ceil(result.maxSqft / 100) * 100,
  };
};

const getBedFilter = (floorplans: any[]) =>
  [...new Set(
    floorplans
      .map((item) => Number(item.bed_count))
      .filter((count) => Number.isFinite(count)),
  )].sort((a, b) => a - b);

const getBedLabel = (count: number) => (count === 0 ? 'Studio' : `${count} Bed`);

const buildBedFilterLabels = (bedFilter: number[]) =>
  bedFilter.map((count) => getBedLabel(count));

const buildIncrementFilter = (min: number, max: number, increment: number) => {
  if (!Number.isFinite(min) || !Number.isFinite(max) || increment <= 0 || min > max) {
    return [];
  }

  const values = [];

  for (let value = min; value <= max; value += increment) {
    values.push(value);
  }

  if (values[values.length - 1] !== max) {
    values.push(max);
  }

  return values;
};

const parseFeedDetail = (
  entry?: Record<string, any>,
  floorplans: any[] = [],
) => {
  const priceIncrement = entry?.priceIncrement ?? 1000;
  const sqftIncrement = entry?.sqftIncrement ?? 500;
  const bounds = floorplans.length > 0 ? getPropertyFilters(floorplans) : null;
  const bedFilter = floorplans.length > 0 ? getBedFilter(floorplans) : [];

  return {
    enableEngrainPricing: entry?.enableEngrainPricing,
    engrainPrice: entry?.engrainPrice,
    priceIncrement,
    sqftIncrement,
    ...(bounds ?? {}),
    ...(bounds
      ? {
          rentFilter: buildIncrementFilter(bounds.minRent, bounds.maxRent, priceIncrement),
          sqftFilter: buildIncrementFilter(bounds.minSqft, bounds.maxSqft, sqftIncrement),
        }
      : {}),
    ...(bedFilter.length > 0
      ? {
          bedFilter,
          bedFilterLabels: buildBedFilterLabels(bedFilter),
        }
      : {}),
  };
};

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
    propertySpecifications: parseFeedDetail(
      feedDetails && typeof feedDetails === 'object'
        ? (feedDetails as Record<string, any>)
        : undefined,
      floorplans,
    ),
  };
};
export default parseFeedDetails;
