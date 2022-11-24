import { CodxOmService } from './../../codx-om.service';
import { DataRequest, UIComponent, FormModel } from 'codx-core';

import { Component, Injector, Input } from '@angular/core';
@Component({
  selector: 'lib-okr-reviews',
  templateUrl: './okr-reviews.component.html',
  styleUrls: ['./okr-reviews.component.scss'],
})
export class OkrReviewsComponent extends UIComponent {
  @Input() formModel: FormModel;
  openAccordion = [];
  dataOKR = [];
  dtStatus = [];
  reviewType: any;

  constructor(private injector: Injector, private omServices: CodxOmService) {
    super(injector);
  }

  onInit(): void {
    this.cache.valueList('OM002').subscribe((item) => {
      if (item?.datas) this.dtStatus = item?.datas;
    });

    this.cache.valueList('OM010').subscribe((res) => {
      console.log(res);
      this.reviewType = res?.datas;
    });

    var dataRequest = new DataRequest();
    dataRequest.funcID = 'OMT01';
    dataRequest.entityName = 'OM_OKRs';
    dataRequest.page = 1;
    dataRequest.pageSize = 20;
    dataRequest.predicate = 'ParentID=null';
    this.omServices.getOKR(dataRequest).subscribe((item: any) => {
      if (item) this.dataOKR = this.dataOKR.concat(item);
    });
  }

  clickMF(e: any) {}

  getItemOKR(i: any, recID: any) {
    this.openAccordion[i] = !this.openAccordion[i];
    if (this.dataOKR[i].child && this.dataOKR[i].child.length <= 0)
      this.omServices.getKRByOKR(recID).subscribe((item: any) => {
        if (item) this.dataOKR[i].child = item;
      });
  }

  changeCalendar(event) {}
}
