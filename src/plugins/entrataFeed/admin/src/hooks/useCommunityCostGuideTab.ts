import { useCallback, useEffect, useRef, useState } from "react";
import { useFetchClient, useNotification } from "@strapi/strapi/admin";
import { useIntl } from "react-intl";

import { getTranslation } from "../utils/getTranslation";
import {
  COMMUNITY_COST_GUIDE_PATH,
  COMMUNITY_COST_GUIDE_PUBLISH_PATH,
} from "../utils/communityCostGuide/constants";
import {
  emptyCommunityCostGuideForm,
  toCommunityCostGuideForm,
  toCommunityCostGuidePayload,
} from "../utils/communityCostGuide/transforms";
import type {
  CommunityCostGuideForm,
  CommunityCostGuideResponse,
} from "../utils/communityCostGuide/types";

export const useCommunityCostGuideTab = () => {
  const { formatMessage } = useIntl();
  const { get, post } = useFetchClient();
  const { toggleNotification } = useNotification();

  const [form, setForm] = useState<CommunityCostGuideForm>(
    emptyCommunityCostGuideForm(),
  );
  const formRef = useRef(form);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const loadGuide = useCallback(async () => {
    setIsLoading(true);

    try {
      const { data } = await get<CommunityCostGuideResponse>(
        COMMUNITY_COST_GUIDE_PATH,
      );
      const guide = (data as { data?: CommunityCostGuideResponse }).data ?? data;

      setForm(toCommunityCostGuideForm(guide));
    } catch {
      toggleNotification({
        type: "danger",
        message: formatMessage({
          id: getTranslation("communityCostGuide.load.error"),
        }),
      });
    } finally {
      setIsLoading(false);
    }
  }, [formatMessage, get, toggleNotification]);

  useEffect(() => {
    loadGuide();
  }, [loadGuide]);

  const handlePublish = useCallback(async () => {
    setIsBusy(true);

    try {
      await post(
        COMMUNITY_COST_GUIDE_PUBLISH_PATH,
        toCommunityCostGuidePayload(formRef.current),
      );
      toggleNotification({
        type: "success",
        message: formatMessage({
          id: getTranslation("communityCostGuide.publish.success"),
        }),
      });
      await loadGuide();
    } catch {
      toggleNotification({
        type: "danger",
        message: formatMessage({
          id: getTranslation("communityCostGuide.publish.error"),
        }),
      });
    } finally {
      setIsBusy(false);
    }
  }, [formatMessage, loadGuide, post, toggleNotification]);

  return {
    form,
    setForm,
    isLoading,
    isBusy,
    loadGuide,
    handlePublish,
  };
};
