export class Panel {
  id: string;
  row: number;
  col: number;
  sizeX: number;
  sizeY: number;
  minSizeX: number;
  minSizeY: number;
  maxSizeX: number;
  maxSizeY: number;
}
export class PanelOrder {
  panelId: string;
  data: string; //the order of panel
}
