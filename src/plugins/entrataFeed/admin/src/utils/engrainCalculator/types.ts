export type EngrainCalculatorForm = {
  enableEngrainPricing: boolean;
  engrainApiUrl: string;
  engrainPrice: string;
  engrainFeeCalculatorTitle: string;
  description: string;
  shortDisclaimer: string;
  longDisclaimer: string;
};

export type EngrainCalculatorResponse = EngrainCalculatorForm & {
  documentId?: string;
};
