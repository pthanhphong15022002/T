import { Component, Input, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ApiHttpService, CacheService, FormModel } from 'codx-core';
import { Observable, of, map } from 'rxjs';

@Component({
  selector: 'lib-org-emp-contact-detail-card',
  templateUrl: './org-emp-contact-detail-card.component.html',
  styleUrls: ['./org-emp-contact-detail-card.component.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class OrgEmpContactDetailCardComponent {

  @Input() orgUnitID: string = '';
  @Input() formModel: FormModel;

  onloading = true;
  lstData: any[] = [];
  grvSetup: any;
  constructor(private cache: CacheService,
    private api: ApiHttpService) {

  }
  ngOnInit(): void {
    this.getListDataEmpByOrgUnitID();
    if (this.formModel) {
      this.cache.gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
        .subscribe(res => {
          if (res) this.grvSetup = res;
        })
    }
  }


  ngOnChanges(changes: SimpleChanges): void {
    this.onloading = true;
    this.orgUnitID = changes.orgUnitID.currentValue;
    this.getListDataEmpByOrgUnitID();
  }
  getListDataEmpByOrgUnitID() {
    if (this.orgUnitID) {
      this.api
        .execSv<any>('HR', 'ERM.Business.HR', 'EmployeesBusiness', 'GetEmployeeListByOrgUnitID', [this.orgUnitID]).subscribe((res) => {
          if (res) {
            this.lstData = res[0];
          } else this.lstData = [];
          this.onloading = false;
        });
    }
  }

  placeholder(field: string) {
      var headerText = this.grvSetup[field].headerText as string;
      return `<span class="place-holder">${headerText}</span>`
  }
}
