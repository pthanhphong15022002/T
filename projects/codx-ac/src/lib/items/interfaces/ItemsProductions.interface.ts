export interface ItemsProduction {
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
