const floorplanUnits = async (availabilitySettingsApi) => {
  const fpUnits = await Promise.all(
    availabilitySettingsApi.response.result.Properties.Property[0].Floorplans.Floorplan.map(
      async (item) => {
        let bedrooms = 0;
        let bathrooms = 0;

        (item.Room || []).forEach((room) => {
          if (room["@attributes"]?.RoomType === "Bedroom")
            bedrooms = room.Count || 0;
          if (room["@attributes"]?.RoomType === "Bathroom")
            bathrooms = room.Count || 0;
        });

        return {
          data: {
            floorplan_id: item.Identification?.IDValue || "",
            floorplan_name: item.Name || "",
            bed_count: bedrooms,
            bath_count: bathrooms,
            minSqFt: item.SquareFeet?.["@attributes"]?.Min || 0,
            maxSqFt: item.SquareFeet?.["@attributes"]?.Max || 0,
            minRent: item.MarketRent?.["@attributes"]?.Min || 0,
            maxRent: item.MarketRent?.["@attributes"]?.Max || 0,
            // minDeposit:
            //   item.Deposit?.Amount?.ValueRange?.["@attributes"]?.Min || 0,
            // maxDeposit:
            //   item.Deposit?.Amount?.ValueRange?.["@attributes"]?.Max || 0,
            available_unit_count: item.UnitsAvailable || 0,
            sort_order: item.Name?.toLowerCase().startsWith("ph")
              ? 99
              : bedrooms,

            unit_type_mapping: "",

            availability_url: "",
          },
        };
      }
    )
  );
  return fpUnits;
};

export default floorplanUnits;