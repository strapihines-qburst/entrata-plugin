import type { EngrainCalculatorForm, EngrainCalculatorResponse } from "./types";

export const emptyEngrainCalculatorForm = (): EngrainCalculatorForm => ({
  enableEngrainPricing: false,
  engrainApiUrl: "",
  engrainPrice: "",
  engrainFeeCalculatorTitle: "",
  description: "",
  shortDisclaimer: "",
  longDisclaimer: "",
});

export const toEngrainCalculatorForm = (
  pricing: EngrainCalculatorResponse | null | undefined,
): EngrainCalculatorForm => ({
  enableEngrainPricing: pricing?.enableEngrainPricing ?? false,
  engrainApiUrl: pricing?.engrainApiUrl ?? "",
  engrainPrice: pricing?.engrainPrice ?? "",
  engrainFeeCalculatorTitle: pricing?.engrainFeeCalculatorTitle ?? "",
  description: pricing?.description ?? "",
  shortDisclaimer: pricing?.shortDisclaimer ?? "",
  longDisclaimer: pricing?.longDisclaimer ?? "",
});

export const toEngrainCalculatorPayload = (form: EngrainCalculatorForm) => ({
  enableEngrainPricing: form.enableEngrainPricing,
  engrainApiUrl: form.engrainApiUrl,
  engrainPrice: form.engrainPrice,
  engrainFeeCalculatorTitle: form.engrainFeeCalculatorTitle,
  description: form.description,
  shortDisclaimer: form.shortDisclaimer,
  longDisclaimer: form.longDisclaimer,
});
