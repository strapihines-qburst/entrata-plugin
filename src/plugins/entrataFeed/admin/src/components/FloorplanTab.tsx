import {
  Box,
  Button,
  Flex,
  Link,
  Typography,
} from "@strapi/design-system";
import { useIntl } from "react-intl";
import { Link as RouterLink } from "react-router-dom";

import { useFloorplanTab } from "../hooks/useFloorplanTab";
import { getTranslation } from "../utils/getTranslation";
import { FEED_SETTING_CM_PATH } from "../utils/feedSetting/constants";
import { FeedSettingsTable } from "./FeedSettingsTable";
import { SpecialsTabFooter } from "./specials/SpecialsTabFooter";

const FLOORPLANS_PATH =
  "/content-manager/collection-types/plugin::entratafeed.floorplan";

const FloorplanTab = () => {
  const { formatMessage } = useIntl();
  const {
    form,
    isLoading,
    isBusy,
    isGenerating,
    isPushing,
    loadFeedSettings,
    updateApiParam,
    handlePublish,
    handleGenerate,
    handlePushToAws,
  } = useFloorplanTab();

  if (isLoading) {
    return (
      <Typography textColor="neutral600">
        {formatMessage({ id: getTranslation("floorplan.loading") })}
      </Typography>
    );
  }

  return (
    <Flex direction="column" width="100%" height="calc(100vh - 14rem)">
      <Box flex="1" overflow="auto" paddingBottom={4} width="100%" style={{ minHeight: 0 }}>
        <Flex direction="column" gap={4} width="100%">
          <Box>
            <Typography variant="beta" tag="h2">
              {formatMessage({ id: getTranslation("floorplan.title") })}
            </Typography>
            <Box paddingTop={2} paddingBottom={4}>
              <Typography textColor="neutral600">
                {formatMessage({ id: getTranslation("floorplan.description") })}
              </Typography>
            </Box>
          </Box>

          <FeedSettingsTable
            form={form}
            isBusy={isBusy}
            onUpdate={updateApiParam}
          />

          <Flex gap={2}>
            <Button
              onClick={handleGenerate}
              loading={isGenerating}
              disabled={isBusy}
            >
              {formatMessage({ id: getTranslation("floorplan.generate") })}
            </Button>
            <Button
              variant="secondary"
              onClick={handlePushToAws}
              loading={isPushing}
              disabled={isBusy}
            >
              {formatMessage({ id: getTranslation("floorplan.push") })}
            </Button>
          </Flex>

          <Flex direction="column" gap={2}>
            <Link tag={RouterLink} to={FLOORPLANS_PATH}>
              {formatMessage({ id: getTranslation("floorplan.manage") })}
            </Link>
            <Link tag={RouterLink} to={FEED_SETTING_CM_PATH}>
              {formatMessage({ id: getTranslation("floorplan.settings.manage") })}
            </Link>
          </Flex>
        </Flex>
      </Box>

      <SpecialsTabFooter
        isBusy={isBusy}
        onRefresh={loadFeedSettings}
        onPublish={handlePublish}
      />
    </Flex>
  );
};

export { FloorplanTab };
