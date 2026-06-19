import { useCallback, useEffect, useRef, useState } from "react";
import { useFetchClient, useNotification } from "@strapi/strapi/admin";
import { useIntl } from "react-intl";

import { getTranslation } from "../utils/getTranslation";
import {
  ENGRAIN_PRICING_PATH,
  ENGRAIN_PRICING_PUBLISH_PATH,
  ENGRAIN_PRICING_UPDATE_PATH,
} from "../utils/engrainCalculator/constants";
import {
  emptyEngrainCalculatorForm,
  toEngrainCalculatorForm,
  toEngrainCalculatorPayload,
} from "../utils/engrainCalculator/transforms";
import type {
  EngrainCalculatorForm,
  EngrainCalculatorResponse,
} from "../utils/engrainCalculator/types";

const formatEngrainPrice = (engrainPrice: string | number) =>
  typeof engrainPrice === "string" && engrainPrice.startsWith("$")
    ? engrainPrice
    : `$${engrainPrice.toString()}`;

export const useEngrainCalculatorTab = () => {
  const { formatMessage } = useIntl();
  const { get, post } = useFetchClient();
  const { toggleNotification } = useNotification();

  const [form, setForm] = useState<EngrainCalculatorForm>(emptyEngrainCalculatorForm());
  const formRef = useRef(form);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const loadPricing = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (!options.silent) {
        setIsLoading(true);
      }

      try {
        const { data } = await get<EngrainCalculatorResponse>(ENGRAIN_PRICING_PATH);
        const pricing = (data as { data?: EngrainCalculatorResponse }).data ?? data;

        setForm(toEngrainCalculatorForm(pricing));
      } catch {
        if (!options.silent) {
          toggleNotification({
            type: "danger",
            message: formatMessage({
              id: getTranslation("engrainCalculator.load.error"),
            }),
          });
        }
      } finally {
        if (!options.silent) {
          setIsLoading(false);
        }
      }
    },
    [formatMessage, get, toggleNotification],
  );

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  const handleRefresh = useCallback(async () => {
    setIsBusy(true);

    try {
      const { data } = await post<{ engrainPrice?: string | number }>(
        ENGRAIN_PRICING_UPDATE_PATH,
        toEngrainCalculatorPayload(formRef.current),
      );
      const engrainPrice = (data as { engrainPrice?: string | number }).engrainPrice;

      if (engrainPrice !== undefined) {
        setForm((current) => ({
          ...current,
          engrainPrice: formatEngrainPrice(engrainPrice),
        }));
      }

      toggleNotification({
        type: "success",
        message: formatMessage({
          id: getTranslation("engrainCalculator.refresh.success"),
        }),
      });
    } catch {
      toggleNotification({
        type: "danger",
        message: formatMessage({
          id: getTranslation("engrainCalculator.refresh.error"),
        }),
      });
    } finally {
      setIsBusy(false);
    }
  }, [formatMessage, post, toggleNotification]);

  const handlePublish = useCallback(async () => {
    setIsBusy(true);

    try {
      await post(ENGRAIN_PRICING_PUBLISH_PATH, toEngrainCalculatorPayload(formRef.current));

      toggleNotification({
        type: "success",
        message: formatMessage({
          id: getTranslation("engrainCalculator.publish.success"),
        }),
      });
      await loadPricing({ silent: true });
    } catch {
      toggleNotification({
        type: "danger",
        message: formatMessage({
          id: getTranslation("engrainCalculator.publish.error"),
        }),
      });
    } finally {
      setIsBusy(false);
    }
  }, [formatMessage, loadPricing, post, toggleNotification]);

  return {
    form,
    setForm,
    isLoading,
    isBusy,
    handleRefresh,
    handlePublish,
  };
};
