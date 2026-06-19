const floorplanUnits = async (availabilitySettingsApi) => {
  const propertyUnits = Array.isArray(
    availabilitySettingsApi?.response?.result?.PropertyUnits?.PropertyUnit
  )
    ? availabilitySettingsApi.response.result.PropertyUnits.PropertyUnit
    : [];
    

  const unitTypeIds = {};
  propertyUnits.forEach((unit) => {
    const attr = unit['@attributes'] || {};
    if (attr.FloorplanId && attr.UnitTypeId) {
      unitTypeIds[attr.FloorplanId] = attr.UnitTypeId;
    }
  });
  const fpUnits = await Promise.all(
    availabilitySettingsApi.response.result.Properties.Property[0].Floorplans.Floorplan.map(
      async (item) => {
        let bedrooms = 0;
        let bathrooms = 0;

        (item.Room || []).forEach((room) => {
          if (room['@attributes']?.RoomType === 'Bedroom') bedrooms = room.Count || 0;
          if (room['@attributes']?.RoomType === 'Bathroom') bathrooms = room.Count || 0;
        });

        return {
          data: {
            floorplan_id: item.Identification?.IDValue || '',
            floorplan_name: item.Name || '',
            bed_count: bedrooms,
            bath_count: bathrooms,
            minSqFt:parseInt(item.SquareFeet?.['@attributes']?.Min || 0, 10),
            maxSqFt: parseInt(item.SquareFeet?.['@attributes']?.Max || 0, 10),
            minRent: parseFloat(item.MarketRent?.['@attributes']?.Min || 0) || 0,
            maxRent: parseFloat(item.MarketRent?.['@attributes']?.Max || 0) || 0,
            minDeposit:
              parseFloat(item.Deposit?.Amount?.ValueRange?.['@attributes']?.Min || 0) || 0,
            maxDeposit:
              parseFloat(item.Deposit?.Amount?.ValueRange?.['@attributes']?.Max || 0) || 0,
            available_unit_count: item.UnitsAvailable || 0,

            sort_order: item.Name?.toLowerCase().startsWith('ph') ? 99 : bedrooms,

            unit_type_mapping: '',

            availability_url: '',
            unit_type_id: unitTypeIds[item.Identification?.IDValue] || null,
          },
        };
      }
    )
  );
  return fpUnits;
};

export default floorplanUnits;
