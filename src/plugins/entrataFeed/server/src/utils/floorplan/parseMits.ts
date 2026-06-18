const mitsPropertyUnit = async (mitsSettingsApi) => {
  const mitsUnits = mitsSettingsApi.response.result.PhysicalProperty.Property[0].Floorplan.map(
    (item) => {
      return {
        availability_url: item.FloorplanAvailabilityURL,
        floorplan_image: item.File?.[0]?.Src || null,
        floorplanId: item.Identification.IDValue,
      };
    }
  );
  const amenities = mitsSettingsApi.response.result.PhysicalProperty.Property[0].ILS_Unit.map(
    (item) => {
      return {
        unitsId: item.Units.Unit.Identification?.IDValue,
        amenities:
          item.Amenity?.map((amenity) => ({
            name: amenity["@attributes"]?.AmenityType,
            description: amenity.Description,
          })) || [],
      };
    }
  );
  return { mitsUnits, amenities };
};

export default mitsPropertyUnit;
