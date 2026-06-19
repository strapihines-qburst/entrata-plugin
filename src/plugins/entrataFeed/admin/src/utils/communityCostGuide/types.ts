export type CommunityCostGuideForm = {
  totalCostClarityTitle: string;
  totalCostClarityDescription: string;
  communityCostGuideTitle: string;
  communityCostGuideDescription: string;
  iframeUrl: string;
};

export type CommunityCostGuideResponse = CommunityCostGuideForm & {
  documentId?: string;
};
