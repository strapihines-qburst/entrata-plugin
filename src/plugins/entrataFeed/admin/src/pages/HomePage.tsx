import { Box, Tabs } from "@strapi/design-system";
import { Page } from "@strapi/strapi/admin";
import { useIntl } from "react-intl";

import { FloorplanTab } from "../components/FloorplanTab";
import { EngrainCalculatorTab } from "../components/EngrainCalculatorTab";
import { CommunityCostGuideTab } from "../components/CommunityCostGuideTab";
import { SpecialsTab } from "../components/specials/SpecialsTab";
import { getTranslation } from "../utils/getTranslation";

const HomePage = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Page.Title>
        {formatMessage({ id: getTranslation("plugin.name") })}
      </Page.Title>
      <Page.Main>
        <Box padding={8} minHeight="calc(100vh - 10rem)" width="100%">
          <Tabs.Root defaultValue="specials">
            <Tabs.List aria-label="Entrata feed">
              <Tabs.Trigger value="specials">
                {formatMessage({ id: getTranslation("tabs.specials") })}
              </Tabs.Trigger>
              <Tabs.Trigger value="floorplan">
                {formatMessage({ id: getTranslation("tabs.floorplan") })}
              </Tabs.Trigger>
              <Tabs.Trigger value="engrainCalculator">
                {formatMessage({ id: getTranslation("tabs.engrainCalculator") })}
              </Tabs.Trigger>
              <Tabs.Trigger value="communityCostGuide">
                {formatMessage({ id: getTranslation("tabs.communityCostGuide") })}
              </Tabs.Trigger>
            </Tabs.List>
            <Box paddingTop={4} width="100%">
              <Tabs.Content value="specials">
                <SpecialsTab />
              </Tabs.Content>
              <Tabs.Content value="floorplan">
                <FloorplanTab />
              </Tabs.Content>
              <Tabs.Content value="engrainCalculator">
                <EngrainCalculatorTab />
              </Tabs.Content>
              <Tabs.Content value="communityCostGuide">
                <CommunityCostGuideTab />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Box>
      </Page.Main>
    </>
  );
};

export { HomePage };
