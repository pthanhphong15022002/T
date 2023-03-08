export interface ItemsProduction {
  recID: string;
  itemID: string;
  umid: string;
  leadtime: number;
  batchSize: number;
  scheduleColor: string;
  scrapPct: number;
  scrapIssue: string;
  yield: number | null;
  autoIssue: boolean | null;
}
