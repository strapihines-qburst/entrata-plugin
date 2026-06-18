const asArray = <T>(value: T | T[] | null | undefined): T[] =>
  !value ? [] : Array.isArray(value) ? value : [value];

const unitsProperty = async (propertySettingsApi) => {
  const property = propertySettingsApi.response.result.properties.property;
  const propertyEntry = asArray(property)[0];
  const unitEntries = asArray(propertyEntry?.units?.unit);

  const units = unitEntries.flatMap((unit) => {
    const unitSpaces = asArray(unit.unitSpaces?.unitSpace);

    return unitSpaces.map((unitSpace) => {
      const rentAttributes = unitSpace.rent || {};
      const termRent = asArray(rentAttributes.termRent);
      const bestPrice =
        termRent.find((term) => term.isBestPrice == true)?.rent || 0;

      return {
        unitId: unit.id ? Number(unit.id) : null,
        unit_space_id: unitSpace.unitSpaceId
          ? Number(unitSpace.unitSpaceId)
          : null,
        unit_number: unitSpace.unitNumber || null,
        floorplan_id: unit.floorPlanId ? Number(unit.floorPlanId) : null,
        floorplan_name: unit.floorplanName || null,
        floor_number: unit.floorNumber ? Number(unit.floorNumber) : null,
        apartment_id: unit.buildingId ? Number(unit.buildingId) : null,
        availabilityStatus: unitSpace.availabilityStatus || null,
        availability_date:formatDate(unitSpace.availableDate) || null,
        sqft: unit.SquareFeet ? Number(unit.SquareFeet) : null,
        min_rent: String(rentAttributes.minRent || 0),
        max_rent: String(rentAttributes.maxRent || 0),
        best_price: String(bestPrice || 0),
        // min_deposit: unitSpace.minDeposit || 0,
        // max_deposit: unitSpace.maxDeposit || 0,
      };
    });
  });

  return units;
};

export default unitsProperty;

const formatDate = (date: string) => {
  const [month, day, year] = date.split("/");
  return `${year}/${month.padStart(2, "0")}/${day.padStart(2, "0")}`;
};