import { Component, Injector, Input, ViewChild } from '@angular/core';
import { UIComponent, ViewsComponent } from 'codx-core';

@Component({
  selector: 'view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss'],
})
export class ViewDetailComponent extends UIComponent {
  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  @Input() itemDetail: any;
  @Input() funcID;
  @Input() formModel;
  @Input() override view: ViewsComponent;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  itemDetailDataStt: any;
  itemDetailStt: any;

  constructor(private injector: Injector) {
    super(injector);
  }

  onInit(): void {
    this.itemDetailStt = 1;
  }

  openFormFuncID(event) {}

  changeDataMF(event, data: any) {}

  clickChangeItemDetailDataStatus(stt) {
    this.itemDetailDataStt = stt;
  }

  setStyles(color): any {
    let styles = {
      backgroundColor: color,
      color: 'white',
    };
    return styles;
  }
}
