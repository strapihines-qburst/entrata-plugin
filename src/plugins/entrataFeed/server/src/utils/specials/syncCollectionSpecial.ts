const syncCollectionSpecial = async (strapi, special) => {
  const associatedType = special.associations;
  console.log(associatedType);
console.log(special);
  if (!["Space", "Floor Plan","Unit Type"].includes(associatedType)) {
    return;
  }

  let specialType;
  let relationField;
  let relationDocumentIds = [];
  let floorplanTypes = [];
  if (associatedType === "Space") {
    const unitIds = special.association_references.map((item) => item.id);

    const units = await strapi
      .documents("plugin::entratafeed.unit")
      .findMany({
        filters: {
          unit_space_id: {
            $in: unitIds,
          },
        },
        status: "published",
      });

    relationDocumentIds = units.map((unit) => unit.documentId);
    specialType = "unit";
    relationField = "units";
  }

  if (associatedType === "Floor Plan") {
    const floorplanIds = special.association_references.map(
      (item) => item.id
    );

    const floorplans = await strapi
      .documents("plugin::entratafeed.floorplan")
      .findMany({
        filters: {
          floorplan_id: {
            $in: floorplanIds,
          },
        },
        status: "published",
      });

    relationDocumentIds = floorplans.map(
      (floorplan) => floorplan.documentId
    );
    specialType = "floorplan";
    relationField = "floorplans";
  }

  if (associatedType === "Unit Type") {
    floorplanTypes = special.association_references;
    specialType = "floorplanType"
  }

  const existingSpecial = await strapi
    .documents("plugin::entratafeed.special")
    .findFirst({
      filters: {
        special_id: special.special_id,
      },
      populate: ["specials"],
      status: "published",
    });

  const specialData = {
    special_id: special.special_id,
    special_type: specialType,
    [relationField]: relationDocumentIds,
    floorplanTypes: floorplanTypes,
    specials: {
      specialTitle: special.special_name,
      specialDescription: special.description,
      isOverRide: existingSpecial?.specials?.isOverRide ?? false,
      overRideText: existingSpecial?.specials?.overRideText ?? "",
      overRideDescription:
        existingSpecial?.specials?.overRideDescription ?? "",
    },
  };

  if (existingSpecial) {
    await strapi.documents("plugin::entratafeed.special").update({
      documentId: existingSpecial.documentId,
      data: specialData,
      status: "published",
    });
  } else {
    await strapi.documents("plugin::entratafeed.special").create({
      data: specialData,
      status: "published",
    });
  }
};

export default syncCollectionSpecial;