import { useCallback, useEffect, useRef, useState } from "react";
import { useFetchClient, useNotification } from "@strapi/strapi/admin";
import { useIntl } from "react-intl";

import { getTranslation } from "../utils/getTranslation";
import { COMMUNITY_COST_GUIDE_PATH } from "../utils/communityCostGuide/constants";
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
  const { get, put } = useFetchClient();
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

  const persistGuide = useCallback(
    async (nextForm: CommunityCostGuideForm, publish = false) => {
      await put(
        COMMUNITY_COST_GUIDE_PATH,
        toCommunityCostGuidePayload(nextForm, publish),
      );
    },
    [put],
  );

  const runAction = useCallback(
    async (
      action: () => Promise<void>,
      successMessageId: string,
      errorMessageId: string,
    ) => {
      setIsBusy(true);

      try {
        await action();
        toggleNotification({
          type: "success",
          message: formatMessage({ id: getTranslation(successMessageId) }),
        });
        await loadGuide();
      } catch {
        toggleNotification({
          type: "danger",
          message: formatMessage({ id: getTranslation(errorMessageId) }),
        });
      } finally {
        setIsBusy(false);
      }
    },
    [formatMessage, loadGuide, toggleNotification],
  );

  const handleSave = useCallback(() => {
    return runAction(
      () => persistGuide(formRef.current),
      "communityCostGuide.save.success",
      "communityCostGuide.save.error",
    );
  }, [persistGuide, runAction]);

  const handlePublish = useCallback(() => {
    return runAction(
      () => persistGuide(formRef.current, true),
      "communityCostGuide.publish.success",
      "communityCostGuide.publish.error",
    );
  }, [persistGuide, runAction]);

  return {
    form,
    setForm,
    isLoading,
    isBusy,
    loadGuide,
    handleSave,
    handlePublish,
  };
};
