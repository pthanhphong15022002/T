export class LayoutModel {
    isChange: boolean = false;
    title: string = '';
    asideDisplay: boolean = true;
    toolbarDisplay: boolean = true;
    constructor(isChange, title, asideDisplay, toolbarDisplay) {
      this.isChange = isChange;
      this.title = title;
      this.asideDisplay = asideDisplay;
      this.toolbarDisplay = toolbarDisplay;
    }
}