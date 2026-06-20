import { blocksToPlainText, plainTextToBlocks } from "./blocks";
import type {
  CommunityCostGuideForm,
  CommunityCostGuideResponse,
} from "./types";

export const emptyCommunityCostGuideForm = (): CommunityCostGuideForm => ({
  totalCostClarityTitle: "",
  totalCostClarityDescription: "",
  communityCostGuideTitle: "",
  communityCostGuideDescription: "",
  iframeUrl: "",
});

export const toCommunityCostGuideForm = (
  guide: CommunityCostGuideResponse | null | undefined,
): CommunityCostGuideForm => ({
  totalCostClarityTitle: guide?.totalCostClarityTitle ?? "",
  totalCostClarityDescription: blocksToPlainText(
    guide?.totalCostClarityDescription,
  ),
  communityCostGuideTitle: guide?.communityCostGuideTitle ?? "",
  communityCostGuideDescription: blocksToPlainText(
    guide?.communityCostGuideDescription,
  ),
  iframeUrl: guide?.iframeUrl ?? "",
});

export const toCommunityCostGuidePayload = (form: CommunityCostGuideForm) => ({
  totalCostClarityTitle: form.totalCostClarityTitle,
  totalCostClarityDescription: plainTextToBlocks(
    form.totalCostClarityDescription,
  ),
  communityCostGuideTitle: form.communityCostGuideTitle,
  communityCostGuideDescription: plainTextToBlocks(
    form.communityCostGuideDescription,
  ),
  iframeUrl: form.iframeUrl,
});
