import { type ChangeEvent } from 'react';

import {
  Box,
  Checkbox,
  Field,
  Flex,
  Link,
  TextInput,
  Textarea,
  Typography,
} from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';

import { useEngrainCalculatorTab } from '../hooks/useEngrainCalculatorTab';
import { getTranslation } from '../utils/getTranslation';
import { ENGRAIN_PRICING_CM_PATH } from '../utils/engrainCalculator/constants';
import { FormCard } from './specials/FormCard';
import { SpecialsTabFooter } from './specials/SpecialsTabFooter';

const EngrainCalculatorTab = () => {
  const { formatMessage } = useIntl();
  const { form, setForm, isLoading, isBusy, handleRefresh, handlePublish } =
    useEngrainCalculatorTab();

  if (isLoading) {
    return (
      <Typography textColor="neutral600">
        {formatMessage({ id: getTranslation('engrainCalculator.loading') })}
      </Typography>
    );
  }

  return (
    <Flex direction="column" width="100%" height="calc(100vh - 14rem)">
      <Box flex="1" overflow="auto" paddingBottom={4} width="100%" style={{ minHeight: 0 }}>
        <Flex direction="column" gap={4} width="100%">
          <Box>
            <Typography variant="beta" tag="h2">
              {formatMessage({ id: getTranslation('engrainCalculator.title') })}
            </Typography>
            <Box paddingTop={2} paddingBottom={4}>
              <Typography textColor="neutral600">
                {formatMessage({
                  id: getTranslation('engrainCalculator.description'),
                })}
              </Typography>
            </Box>
          </Box>

          <FormCard
            title={formatMessage({
              id: getTranslation('engrainCalculator.section.settings'),
            })}
          >
            <Flex direction="column" gap={4} width="100%">
              <Flex gap={2} alignItems="center">
                <Checkbox
                  checked={form.enableEngrainPricing}
                  onCheckedChange={(checked: boolean | 'indeterminate') =>
                    setForm((current) => ({
                      ...current,
                      enableEngrainPricing: checked === true,
                    }))
                  }
                  disabled={isBusy}
                />
                <Typography variant="omega">
                  {formatMessage({
                    id: getTranslation('engrainCalculator.label.enable'),
                  })}
                </Typography>
              </Flex>
              <Field.Root name="engrainApiUrl" width="100%">
                <Field.Label>
                  {formatMessage({
                    id: getTranslation('engrainCalculator.label.apiUrl'),
                  })}
                </Field.Label>
                <TextInput
                  name="engrainApiUrl"
                  value={form.engrainApiUrl}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setForm((current) => ({
                      ...current,
                      engrainApiUrl: event.target.value,
                    }))
                  }
                  disabled={isBusy}
                />
              </Field.Root>
              <Field.Root name="engrainPrice" width="100%">
                <Field.Label>
                  {formatMessage({
                    id: getTranslation('engrainCalculator.label.price'),
                  })}
                </Field.Label>
                <TextInput name="engrainPrice" value={form.engrainPrice} disabled />
              </Field.Root>
            </Flex>
          </FormCard>

          <FormCard
            title={formatMessage({
              id: getTranslation('engrainCalculator.section.content'),
            })}
          >
            <Flex direction="column" gap={4} width="100%">
              <Field.Root name="engrainFeeCalculatorTitle" width="100%">
                <Field.Label>
                  {formatMessage({
                    id: getTranslation('engrainCalculator.label.title'),
                  })}
                </Field.Label>
                <TextInput
                  name="engrainFeeCalculatorTitle"
                  value={form.engrainFeeCalculatorTitle}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setForm((current) => ({
                      ...current,
                      engrainFeeCalculatorTitle: event.target.value,
                    }))
                  }
                  disabled={isBusy}
                />
              </Field.Root>
              <Field.Root name="description" width="100%">
                <Field.Label>
                  {formatMessage({
                    id: getTranslation('engrainCalculator.label.description'),
                  })}
                </Field.Label>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  disabled={isBusy}
                />
              </Field.Root>
              <Field.Root name="shortDisclaimer" width="100%">
                <Field.Label>
                  {formatMessage({
                    id: getTranslation('engrainCalculator.label.shortDisclaimer'),
                  })}
                </Field.Label>
                <TextInput
                  name="shortDisclaimer"
                  value={form.shortDisclaimer}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setForm((current) => ({
                      ...current,
                      shortDisclaimer: event.target.value,
                    }))
                  }
                  disabled={isBusy}
                />
              </Field.Root>
              <Field.Root name="longDisclaimer" width="100%">
                <Field.Label>
                  {formatMessage({
                    id: getTranslation('engrainCalculator.label.longDisclaimer'),
                  })}
                </Field.Label>
                <Textarea
                  name="longDisclaimer"
                  value={form.longDisclaimer}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    setForm((current) => ({
                      ...current,
                      longDisclaimer: event.target.value,
                    }))
                  }
                  disabled={isBusy}
                />
              </Field.Root>
            </Flex>
          </FormCard>

          <Link tag={RouterLink} to={ENGRAIN_PRICING_CM_PATH}>
            {formatMessage({ id: getTranslation('engrainCalculator.manage') })}
          </Link>
        </Flex>
      </Box>

      <SpecialsTabFooter
        isBusy={isBusy}
        onRefresh={handleRefresh}
        onPublish={handlePublish}
      />
    </Flex>
  );
};

export { EngrainCalculatorTab };
