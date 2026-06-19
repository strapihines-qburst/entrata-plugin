import { type ChangeEvent } from 'react';

import { Box, Field, Flex, Link, TextInput, Textarea, Typography } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';

import { useCommunityCostGuideTab } from '../hooks/useCommunityCostGuideTab';
import { getTranslation } from '../utils/getTranslation';
import { COMMUNITY_COST_GUIDE_CM_PATH } from '../utils/communityCostGuide/constants';
import { FormCard } from './specials/FormCard';
import { SpecialsTabFooter } from './specials/SpecialsTabFooter';

const CommunityCostGuideTab = () => {
  const { formatMessage } = useIntl();
  const { form, setForm, isLoading, isBusy, loadGuide, handleSave, handlePublish } =
    useCommunityCostGuideTab();

  if (isLoading) {
    return (
      <Typography textColor="neutral600">
        {formatMessage({ id: getTranslation('communityCostGuide.loading') })}
      </Typography>
    );
  }

  return (
    <Flex direction="column" width="100%" height="calc(100vh - 14rem)">
      <Box flex="1" overflow="auto" paddingBottom={4} width="100%" style={{ minHeight: 0 }}>
        <Flex direction="column" gap={4} width="100%">
          <Box>
            <Typography variant="beta" tag="h2">
              {formatMessage({ id: getTranslation('communityCostGuide.title') })}
            </Typography>
            <Box paddingTop={2} paddingBottom={4}>
              <Typography textColor="neutral600">
                {formatMessage({
                  id: getTranslation('communityCostGuide.description'),
                })}
              </Typography>
            </Box>
          </Box>

          <FormCard
            title={formatMessage({
              id: getTranslation('communityCostGuide.totalCostClarity.title'),
            })}
          >
            <Flex direction="column" gap={4} width="100%">
              <Field.Root name="totalCostClarityTitle" width="100%">
                <Field.Label>
                  {formatMessage({
                    id: getTranslation('communityCostGuide.label.title'),
                  })}
                </Field.Label>
                <TextInput
                  name="totalCostClarityTitle"
                  value={form.totalCostClarityTitle}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setForm((current) => ({
                      ...current,
                      totalCostClarityTitle: event.target.value,
                    }))
                  }
                  disabled={isBusy}
                />
              </Field.Root>
              <Field.Root name="totalCostClarityDescription" width="100%">
                <Field.Label>
                  {formatMessage({
                    id: getTranslation('communityCostGuide.label.description'),
                  })}
                </Field.Label>
                <Textarea
                  name="totalCostClarityDescription"
                  value={form.totalCostClarityDescription}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    setForm((current) => ({
                      ...current,
                      totalCostClarityDescription: event.target.value,
                    }))
                  }
                  disabled={isBusy}
                />
              </Field.Root>
            </Flex>
          </FormCard>

          <FormCard
            title={formatMessage({
              id: getTranslation('communityCostGuide.section.title'),
            })}
          >
            <Flex direction="column" gap={4} width="100%">
              <Field.Root name="communityCostGuideTitle" width="100%">
                <Field.Label>
                  {formatMessage({
                    id: getTranslation('communityCostGuide.label.title'),
                  })}
                </Field.Label>
                <TextInput
                  name="communityCostGuideTitle"
                  value={form.communityCostGuideTitle}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setForm((current) => ({
                      ...current,
                      communityCostGuideTitle: event.target.value,
                    }))
                  }
                  disabled={isBusy}
                />
              </Field.Root>
              <Field.Root name="communityCostGuideDescription" width="100%">
                <Field.Label>
                  {formatMessage({
                    id: getTranslation('communityCostGuide.label.description'),
                  })}
                </Field.Label>
                <Textarea
                  name="communityCostGuideDescription"
                  value={form.communityCostGuideDescription}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    setForm((current) => ({
                      ...current,
                      communityCostGuideDescription: event.target.value,
                    }))
                  }
                  disabled={isBusy}
                />
              </Field.Root>
              <Field.Root name="iframeUrl" width="100%">
                <Field.Label>
                  {formatMessage({
                    id: getTranslation('communityCostGuide.label.iframeUrl'),
                  })}
                </Field.Label>
                <TextInput
                  name="iframeUrl"
                  value={form.iframeUrl}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setForm((current) => ({
                      ...current,
                      iframeUrl: event.target.value,
                    }))
                  }
                  disabled={isBusy}
                />
              </Field.Root>
            </Flex>
          </FormCard>

          <Link tag={RouterLink} to={COMMUNITY_COST_GUIDE_CM_PATH}>
            {formatMessage({ id: getTranslation('communityCostGuide.manage') })}
          </Link>
        </Flex>
      </Box>

      <SpecialsTabFooter
        isBusy={isBusy}
        onRefresh={loadGuide}
        onSave={handleSave}
        onPublish={handlePublish}
      />
    </Flex>
  );
};

export { CommunityCostGuideTab };
