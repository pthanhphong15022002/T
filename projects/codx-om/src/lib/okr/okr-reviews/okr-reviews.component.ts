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
  }

  clickMF(e: any) {}

  changeCalendar(event) {}

  addReview(data) {
    let type = data.value;
    switch (type) {
      case '1':
        break;
      case '2':
        break;
      case '3':
        break;
      case '4':
        break;
      default:
        break;
    }
  }
}
