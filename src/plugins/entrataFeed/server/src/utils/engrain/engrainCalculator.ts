import { FEED_SETTING_UID } from '../../constants/api-constants';

const pushEngrainPrice = async (
  documentId: string,
  engrainPriceData: string | number,
) => {
  await strapi.documents(FEED_SETTING_UID).update({
    documentId,
    data: {
      engrainPrice: '$' + engrainPriceData.toString(),
    } as never,
    status: 'published',
  });
};

const getEngrainData = async (responseData: {
  engrainApiUrl?: string;
  documentId?: string;
}) => {
  const res = await fetch(`${responseData?.engrainApiUrl || process.env.ENGRAIN_API_URL}`, {
    headers: {
      'api-key': process.env.API_KEY,
      'Experimental-Flags': process.env.EXPERIMENTAL_FLAGS,
    },
  });
  const response = (await res.json()) as { data?: unknown[] };

  const data = Array.isArray(response?.data) ? response.data : [];
  let amount = 0;
  let minAmount = 0;
  let maxAmount = 0;
  data.map((el: any) => {
    if (el.is_required && el.is_enabled && el.frequency === 'monthly' && el.value_type !== 'text') {
      if (el.value_type === 'amount') {
        amount = parseFloat(el.amount) + amount;
      }
      if (el.value_type === 'range') {
        minAmount = parseFloat(el.min_amount) + minAmount;
        maxAmount = parseFloat(el.max_amount) + maxAmount;
      }
    }
  });

  const engrainPriceData = buildEngrainPrice(amount, minAmount, maxAmount);

  if (responseData.documentId) {
    await pushEngrainPrice(responseData.documentId, engrainPriceData);
  }

  return engrainPriceData;
};

const buildEngrainPrice = (amount: number, minAmount: number, maxAmount: number) => {
  if (minAmount && maxAmount) {
    const min = minAmount + amount;
    const max = maxAmount + amount;
    return `${min} - ${max}`;
  }
  return amount ? Number(amount) : 0;
};

export { getEngrainData };
