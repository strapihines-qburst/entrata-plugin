import { useState } from 'react';
import { Button, Flex } from '@strapi/design-system';
import {
  useFetchClient,
  useForm,
  useNotification,
  unstable_useContentManagerContext,
} from '@strapi/strapi/admin';
import { useIntl } from 'react-intl';

import { getTranslation } from '../utils/getTranslation';
import {
  FEED_SETTING_MODEL,
  FEED_SETTING_SYNC_ENGRAIN_PATH,
  FEED_SETTING_SYNC_S3_PATH,
} from '../utils/feedSetting/constants';

const formatEngrainPrice = (engrainPrice: string | number) =>
  typeof engrainPrice === 'string' && engrainPrice.startsWith('$')
    ? engrainPrice
    : `$${engrainPrice.toString()}`;

type FeedSettingEntryActionsProps = {
  slug?: string;
};

const toFeedSettingPayload = (
  values: Record<string, unknown>,
  documentId?: string,
) => ({
  documentId,
  enableEngrainPricing: values.enableEngrainPricing,
  engrainApiUrl: values.engrainApiUrl,
  engrainPrice: values.engrainPrice,
});

const FeedSettingEntryActions = ({ slug }: FeedSettingEntryActionsProps) => {
  const { formatMessage } = useIntl();
  const { post } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [isSyncingEngrain, setIsSyncingEngrain] = useState(false);
  const [isSyncingS3, setIsSyncingS3] = useState(false);
  const { model, documentId } = unstable_useContentManagerContext() as {
    model?: string;
    documentId?: string;
  };
  const values = useForm('FeedSettingEntryActions', (state) => state.values);
  const onChange = useForm('FeedSettingEntryActions', (state) => state.onChange);
  const contentType = slug ?? model;

  if (contentType !== FEED_SETTING_MODEL) {
    return null;
  }

  const handleSyncEngrain = async () => {
    setIsSyncingEngrain(true);

    try {
      const { data } = await post<{ engrainPrice?: string | number }>(
        FEED_SETTING_SYNC_ENGRAIN_PATH,
        toFeedSettingPayload(values ?? {}, documentId),
      );
      const engrainPrice = (data as { engrainPrice?: string | number }).engrainPrice;

      if (engrainPrice !== undefined) {
        onChange('engrainPrice', formatEngrainPrice(engrainPrice));
      }

      toggleNotification({
        type: 'success',
        message: formatMessage({ id: getTranslation('feedSetting.sync.success') }),
      });
    } catch {
      toggleNotification({
        type: 'danger',
        message: formatMessage({ id: getTranslation('feedSetting.sync.error') }),
      });
    } finally {
      setIsSyncingEngrain(false);
    }
  };

  const handleSyncS3 = async () => {
    setIsSyncingS3(true);

    try {
      await post(FEED_SETTING_SYNC_S3_PATH);
      toggleNotification({
        type: 'success',
        message: formatMessage({ id: getTranslation('feedSetting.syncS3.success') }),
      });
    } catch {
      toggleNotification({
        type: 'danger',
        message: formatMessage({ id: getTranslation('feedSetting.syncS3.error') }),
      });
    } finally {
      setIsSyncingS3(false);
    }
  };

  const isBusy = isSyncingEngrain || isSyncingS3;

  return (
    <Flex direction="column" gap={2} width="100%">
      <Button
        variant="secondary"
        fullWidth
        onClick={handleSyncEngrain}
        loading={isSyncingEngrain}
        disabled={isBusy && !isSyncingEngrain}
      >
        {formatMessage({ id: getTranslation('feedSetting.sync') })}
      </Button>
      <Button
        variant="secondary"
        fullWidth
        onClick={handleSyncS3}
        loading={isSyncingS3}
        disabled={isBusy && !isSyncingS3}
      >
        {formatMessage({ id: getTranslation('feedSetting.syncS3') })}
      </Button>
    </Flex>
  );
};

export { FeedSettingEntryActions };
