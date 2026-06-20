export default () => ({
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/property-setting",
      handler: "propertySettingController.find",
      config: {
        policies: [],
      },
    },
    {
      method: "PUT",
      path: "/property-setting",
      handler: "propertySettingController.update",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/community-cost-guide",
      handler: "communityCostGuideController.find",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/community-cost-guide/publish",
      handler: "communityCostGuideController.publish",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/engrain-pricing",
      handler: "engrainCalculatorController.find",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/engrain-pricing/updateEngrainPrice",
      handler: "engrainCalculatorController.updateEngrainPrice",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/engrain-pricing/publish",
      handler: "engrainCalculatorController.publish",
      config: {
        policies: [],
      },
    },
  ],
});
