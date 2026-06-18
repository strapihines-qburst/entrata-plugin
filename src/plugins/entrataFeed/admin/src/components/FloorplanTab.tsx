import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Link,
  Typography,
} from "@strapi/design-system";
import { useFetchClient, useNotification } from "@strapi/strapi/admin";
import { useIntl } from "react-intl";
import { Link as RouterLink } from "react-router-dom";

import { getTranslation } from "../utils/getTranslation";

const FLOORPLANS_PATH =
  "/content-manager/collection-types/plugin::entratafeed.floorplan";

const FloorplanTab = () => {
  const { formatMessage } = useIntl();
  const { post } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  const handleGenerate = async () => {
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
  };

  const handlePushToAws = async () => {
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
  };

  return (
    <Box>
      <Typography variant="beta" tag="h2">
        {formatMessage({ id: getTranslation("floorplan.title") })}
      </Typography>
      <Box paddingTop={2} paddingBottom={6}>
        <Typography textColor="neutral600">
          {formatMessage({ id: getTranslation("floorplan.description") })}
        </Typography>
      </Box>
      <Flex gap={2}>
        <Button onClick={handleGenerate} loading={isGenerating}>
          {formatMessage({ id: getTranslation("floorplan.generate") })}
        </Button>
        <Button
          variant="secondary"
          onClick={handlePushToAws}
          loading={isPushing}
        >
          {formatMessage({ id: getTranslation("floorplan.push") })}
        </Button>
      </Flex>
      <Box paddingTop={4}>
        <Link tag={RouterLink} to={FLOORPLANS_PATH}>
          {formatMessage({ id: getTranslation("floorplan.manage") })}
        </Link>
      </Box>
    </Box>
  );
};

export { FloorplanTab };
