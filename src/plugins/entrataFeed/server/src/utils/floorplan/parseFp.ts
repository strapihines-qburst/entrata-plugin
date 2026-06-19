// const asArray = <T>(value: T | T[] | null | undefined): T[] =>
//   !value ? [] : Array.isArray(value) ? value : [value];

// const formatDate = (date?: string) => {
//   if (!date) {
//     return null;
//   }

//   const [month, day, year] = date.split("/");

//   if (!month || !day || !year) {
//     return date;
//   }

//   return `${year}/${month.padStart(2, "0")}/${day.padStart(2, "0")}`;
// };

// const formatFloat = (value: unknown) => {
//   const num = parseFloat(String(value ?? 0));
//   return Number.isNaN(num) ? 0 : num;
// };

// const toBoolean = (value: unknown) =>
//   value === true || value === "true" || value === "1" || value === 1;

// const parseUnits = (units: Record<string, unknown>[]) => {
//   const parsedUnits: Record<string | number, Record<string, unknown>> = {};

//   units.forEach((unit) => {
//     const unitDetails = (unit["@attributes"] || {}) as Record<string, unknown>;
//     const unitSpaces = asArray(unit.UnitSpace as Record<string, unknown>);
//     const unitId = unitDetails.Id;
//     const webVisible = unitDetails.WebVisible;

//     unitSpaces.forEach((rawSpace) => {
//       const space = rawSpace as Record<string, unknown>;
//       const spaceDetails = (space["@attributes"] || {}) as Record<string, unknown>;
//       const rentDetails = (space.Rent || {}) as Record<string, unknown>;
//       const rentAttributes = (rentDetails["@attributes"] || {}) as Record<
//         string,
//         unknown
//       >;
//       const termRent = asArray(
//         (rentDetails.TermRent || []) as Record<string, unknown>[]
//       );

//       let bestPrice: unknown = null;

//       termRent.forEach((term) => {
//         const termAttributes = (term["@attributes"] || {}) as Record<
//           string,
//           unknown
//         >;

//         if (termAttributes.IsBestPrice === "true" || termAttributes.IsBestPrice === true) {
//           bestPrice = termAttributes.Rent;
//         }
//       });

//       if (bestPrice == null) {
//         bestPrice = 0;
//       }

//       parsedUnits[String(unitId)] = {
//         unit_space_id: spaceDetails.Id ? Number(spaceDetails.Id) : null,
//         unitId: unitId ? Number(unitId) : null,
//         unit_number: unitId != null ? String(unitId) : null,
//         marketing_name: unitDetails.UnitNumber ?? null,
//         floorplan_id: unitDetails.FloorplanId
//           ? Number(unitDetails.FloorplanId)
//           : null,
//         floorplan_name: unitDetails.FloorPlanName ?? null,
//         floor_number: unitDetails.FloorNumber
//           ? Number(unitDetails.FloorNumber)
//           : null,
//         apartment_id: unitDetails.PropertyId
//           ? Number(unitDetails.PropertyId)
//           : null,
//         availabilityStatus: spaceDetails.Status ?? null,
//         is_web_visible: toBoolean(webVisible),
//         availability_date: formatDate(String(spaceDetails.AvailableOn ?? "")),
//         sqft: spaceDetails.Area ? parseInt(String(spaceDetails.Area), 10) : null,
//         term_rents: { term_rents: termRent },
//         best_price: formatFloat(bestPrice),
//         min_rent: formatFloat(rentAttributes.MinRent),
//         max_rent: formatFloat(rentAttributes.MaxRent),
//       };
//     });
//   });

//   return Object.values(parsedUnits);
// };

// const floorplanUnits = async (availabilitySettingsApi) => {
//   const propertyUnits = asArray(
//     availabilitySettingsApi?.response?.result?.PropertyUnits?.PropertyUnit
//   );

//   const unitTypeIds: Record<string | number, unknown> = {};

//   propertyUnits.forEach((unit) => {
//     const attr = (unit["@attributes"] || {}) as Record<string, unknown>;

//     if (attr.FloorplanId && attr.UnitTypeId) {
//       unitTypeIds[String(attr.FloorplanId)] = attr.UnitTypeId;
//     }
//   });

//   const floorplans = asArray(
//     availabilitySettingsApi?.response?.result?.Properties?.Property?.[0]
//       ?.Floorplans?.Floorplan
//   );

//   const parsedFp = floorplans.map((item) => {
//     let bedrooms = 0;
//     let bathrooms = 0;

//     asArray(item.Room).forEach((room) => {
//       const roomType = room["@attributes"]?.RoomType;

//       if (roomType === "Bedroom") {
//         bedrooms = room.Count || 0;
//       }

//       if (roomType === "Bathroom") {
//         bathrooms = room.Count || 0;
//       }
//     });

//     const floorplanId = item.Identification?.IDValue || "";

//     return {
//       data: {
//         floorplan_id: floorplanId,
//         floorplan_name: item.Name || "",
//         bed_count: bedrooms,
//         bath_count: bathrooms,
//         minSqFt: parseInt(item.SquareFeet?.["@attributes"]?.Min || 0, 10),
//         maxSqFt: parseInt(item.SquareFeet?.["@attributes"]?.Max || 0, 10),
//         minRent:
//           parseFloat(item.MarketRent?.["@attributes"]?.Min || 0) || 0,
//         maxRent:
//           parseFloat(item.MarketRent?.["@attributes"]?.Max || 0) || 0,
//         minDeposit:
//           parseFloat(
//             item.Deposit?.Amount?.ValueRange?.["@attributes"]?.Min || 0
//           ) || 0,
//         maxDeposit:
//           parseFloat(
//             item.Deposit?.Amount?.ValueRange?.["@attributes"]?.Max || 0
//           ) || 0,
//         available_unit_count: item.UnitsAvailable || 0,
//         sort_order: item.Name?.toLowerCase().startsWith("ph") ? 99 : bedrooms,
//         unit_type_mapping: "",
//         availability_url: "",
//         unit_type_id: unitTypeIds[String(floorplanId)] ?? null,
//       },
//     };
//   });

//   const parsedUnits = parseUnits(propertyUnits);

//   return { parsedFp, parsedUnits };
// };


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
