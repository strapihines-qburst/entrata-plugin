import { useCallback, useEffect, useRef, useState } from "react";
import { useFetchClient, useNotification } from "@strapi/strapi/admin";
import { useIntl } from "react-intl";

import { getTranslation } from "../utils/getTranslation";
import { FEED_SETTING_PATH } from "../utils/feedSetting/constants";
import {
  emptyFeedSettingForm,
  toFeedSettingForm,
  toFeedSettingPayload,
} from "../utils/feedSetting/transforms";
import type {
  ApiParamField,
  FeedSettingForm,
  FeedSettingResponse,
  FeedSettingSectionKey,
} from "../utils/feedSetting/types";

export const useFloorplanTab = () => {
  const { formatMessage } = useIntl();
  const { get, put, post } = useFetchClient();
  const { toggleNotification } = useNotification();

  const [form, setForm] = useState<FeedSettingForm>(emptyFeedSettingForm());
  const formRef = useRef(form);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const syncForm = useCallback((next: FeedSettingForm) => {
    formRef.current = next;
    setForm(next);
  }, []);

  const loadFeedSettings = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (!options.silent) {
        setIsLoading(true);
      }

      try {
        const { data } = await get<FeedSettingResponse>(FEED_SETTING_PATH);
        const setting = (data as { data?: FeedSettingResponse }).data ?? data;

        syncForm(toFeedSettingForm(setting));
      } catch {
        if (!options.silent) {
          toggleNotification({
            type: "danger",
            message: formatMessage({
              id: getTranslation("floorplan.settings.load.error"),
            }),
          });
        }
      } finally {
        if (!options.silent) {
          setIsLoading(false);
        }
      }
    },
    [formatMessage, get, syncForm, toggleNotification],
  );

  useEffect(() => {
    loadFeedSettings();
  }, [loadFeedSettings]);

  const handlePublish = useCallback(async () => {
    setIsBusy(true);

    try {
      const { data } = await put<FeedSettingResponse>(
        FEED_SETTING_PATH,
        toFeedSettingPayload(formRef.current),
      );
      const setting = (data as { data?: FeedSettingResponse }).data ?? data;

      syncForm(toFeedSettingForm(setting));
      toggleNotification({
        type: "success",
        message: formatMessage({
          id: getTranslation("floorplan.settings.publish.success"),
        }),
      });
    } catch {
      toggleNotification({
        type: "danger",
        message: formatMessage({
          id: getTranslation("floorplan.settings.publish.error"),
        }),
      });
    } finally {
      setIsBusy(false);
    }
  }, [formatMessage, put, syncForm, toggleNotification]);

  const updateApiParam = useCallback(
    (section: FeedSettingSectionKey, field: ApiParamField, checked: boolean) => {
      syncForm({
        ...formRef.current,
        [section]: {
          ...formRef.current[section],
          [field]: checked,
        },
      });
    },
    [syncForm],
  );

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);

    try {
      await post("/entratafeed/floorplans/generate");
      toggleNotification({
        type: "success",
        message: formatMessage({
          id: getTranslation("floorplan.generate.success"),
        }),
      });
    } catch {
      toggleNotification({
        type: "danger",
        message: formatMessage({
          id: getTranslation("floorplan.generate.error"),
        }),
      });
    } finally {
      setIsGenerating(false);
    }
  }, [formatMessage, post, toggleNotification]);

  const handlePushToAws = useCallback(async () => {
    setIsPushing(true);

    try {
      await post("/entratafeed/floorplans/pushToAws");
      toggleNotification({
        type: "success",
        message: formatMessage({
          id: getTranslation("floorplan.push.success"),
        }),
      });
    } catch {
      toggleNotification({
        type: "danger",
        message: formatMessage({
          id: getTranslation("floorplan.push.error"),
        }),
      });
    } finally {
      setIsPushing(false);
    }
  }, [formatMessage, post, toggleNotification]);

  return {
    form,
    setForm,
    isLoading,
    isBusy,
    isGenerating,
    isPushing,
    loadFeedSettings,
    updateApiParam,
    handlePublish,
    handleGenerate,
    handlePushToAws,
  };
};
