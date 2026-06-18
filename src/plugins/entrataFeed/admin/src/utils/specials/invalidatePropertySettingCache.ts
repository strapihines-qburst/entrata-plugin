import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { adminApi } from "@strapi/strapi/admin";

import { PROPERTY_SETTING_UID } from "./constants";

export const useInvalidatePropertySettingCache = () => {
  const dispatch = useDispatch();

  return useCallback(() => {
    dispatch(
      adminApi.util.invalidateTags([
        { type: "Document", id: PROPERTY_SETTING_UID },
        { type: "Document", id: `${PROPERTY_SETTING_UID}_LIST` },
        "CountDocuments",
        "RecentDocumentList",
      ] as never)
    );
  }, [dispatch]);
};
