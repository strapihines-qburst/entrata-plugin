const ENGRAIN_PRICING_UID = "plugin::entratafeed.engrain-pricing";

const getEngrainData = async (responseData: any) => {
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
  // Calculate the sum of 'amount.amount' fields that meet the filter conditions
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
  await pushToDb(responseData, engrainPriceData);
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

const pushToDb = async (responseData: any, engrainPriceData: string | number) => {
  await strapi.documents(ENGRAIN_PRICING_UID).update({
    documentId: responseData.documentId,
    data: {
      engrainPrice: '$' + engrainPriceData.toString(),
    } as never,
    status: 'published',
  });
};
