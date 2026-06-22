import { Box, Checkbox, Flex, Typography } from "@strapi/design-system";
import { useIntl } from "react-intl";

import { getTranslation } from "../utils/getTranslation";
import { API_PARAM_FIELDS, FEED_SETTING_SECTIONS } from "../utils/feedSetting/constants";
import type { ApiParamField, FeedSettingForm, FeedSettingSectionKey } from "../utils/feedSetting/types";
import { FormCard } from "./specials/FormCard";

const GRID_COLUMNS = "minmax(220px, 1.5fr) repeat(3, minmax(120px, 1fr))";

type FeedSettingsTableProps = {
  form: FeedSettingForm;
  isBusy: boolean;
  onUpdate: (
    section: FeedSettingSectionKey,
    field: ApiParamField,
    checked: boolean,
  ) => void;
};

const FeedSettingsTable = ({ form, isBusy, onUpdate }: FeedSettingsTableProps) => {
  const { formatMessage } = useIntl();

  return (
    <FormCard
      title={formatMessage({
        id: getTranslation("floorplan.settings.title"),
      })}
    >
      <Box width="100%">
        <Box
          width="100%"
          paddingBottom={3}
          borderColor="neutral200"
          borderStyle="solid"
          borderWidth="0 0 1px 0"
          style={{
            display: "grid",
            gridTemplateColumns: GRID_COLUMNS,
            gap: "8px 16px",
            alignItems: "center",
          }}
        >
          <Typography variant="sigma" textColor="neutral600">
            {formatMessage({
              id: getTranslation("floorplan.settings.column.parameter"),
            })}
          </Typography>
          {FEED_SETTING_SECTIONS.map((section) => (
            <Typography
              key={section.key}
              variant="sigma"
              textColor="neutral600"
              textAlign="center"
            >
              {formatMessage({
                id: getTranslation(section.translationKey),
              })}
            </Typography>
          ))}
        </Box>

        {API_PARAM_FIELDS.map((field, index) => (
          <Box
            key={field}
            width="100%"
            paddingTop={3}
            paddingBottom={3}
            borderColor="neutral200"
            borderStyle="solid"
            borderWidth={index < API_PARAM_FIELDS.length - 1 ? "0 0 1px 0" : "0"}
            style={{
              display: "grid",
              gridTemplateColumns: GRID_COLUMNS,
              gap: "8px 16px",
              alignItems: "center",
            }}
          >
            <Typography variant="omega">
              {formatMessage({
                id: getTranslation(`floorplan.settings.label.${field}`),
              })}
            </Typography>

            {FEED_SETTING_SECTIONS.map((section) => (
              <Flex key={section.key} justifyContent="center" alignItems="center">
                <Checkbox
                  checked={form[section.key][field]}
                  onCheckedChange={(checked: boolean | "indeterminate") =>
                    onUpdate(section.key, field, checked === true)
                  }
                  disabled={isBusy}
                />
              </Flex>
            ))}
          </Box>
        ))}
      </Box>
    </FormCard>
  );
};

export { FeedSettingsTable };
