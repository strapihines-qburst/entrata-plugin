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
  ],
});
