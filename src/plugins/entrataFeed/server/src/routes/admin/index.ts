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
    {
      method: "GET",
      path: "/feed-setting",
      handler: "feedSettingController.find",
      config: {
        policies: [],
      },
    },
    {
      method: "PUT",
      path: "/feed-setting",
      handler: "feedSettingController.update",
      config: {
        policies: [],
      },
    },
  ],
});
