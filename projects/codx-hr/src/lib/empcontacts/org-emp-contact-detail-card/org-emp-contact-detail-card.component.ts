import { Component, Input, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ApiHttpService, CacheService, FormModel } from 'codx-core';

@Component({
  selector: 'lib-org-emp-contact-detail-card',
  templateUrl: './org-emp-contact-detail-card.component.html',
  styleUrls: ['./org-emp-contact-detail-card.component.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class OrgEmpContactDetailCardComponent {

  @Input() orgUnitID: string = '';
  @Input() formModel: FormModel;
  @Input() grvSetup: any;
  @Input() pageSize: number = 20;
  pageIndex: number = 1;
  onloading = true;
  lstData: any[] = [];
  total: number = 0;
  scrolling: boolean = false;
  constructor(private cache: CacheService,
    private api: ApiHttpService) {

  }
  ngOnInit(): void {
    this.getListDataEmpByOrgUnitID();
    if (this.formModel && !this.grvSetup) {
      this.cache.gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
        .subscribe(res => {
          if (res) this.grvSetup = res;
        })
    }
  }


  ngOnChanges(changes: SimpleChanges): void {
    this.onloading = true;
    this.orgUnitID = changes.orgUnitID.currentValue;
    this.scrolling = true;
    this.lstData = [];
    this.pageIndex = 1;
    this.total = 0;
    this.getListDataEmpByOrgUnitID();
  }
  getListDataEmpByOrgUnitID() {
    if (this.orgUnitID) {
      this.api
        .execSv<any>('HR', 'ERM.Business.HR', 'EmployeesBusiness', 'GetEmployeeListByOrgUnitID', [this.orgUnitID, this.pageSize, this.pageIndex]).subscribe((res) => {
          if (res) {
            if (res[0])
              this.lstData = this.lstData.concat(res[0]);
            this.total = res[1];
            if (this.lstData.length < this.total) {
              this.pageIndex = this.pageIndex + 1;
              this.scrolling = true;
            }
            else {
              this.scrolling = false;
            }
          }
          this.onloading = false;
        });
    }
  }

  placeholder(field: string) {
    var headerText = this.grvSetup[field].headerText as string;
    return `<span class="place-holder">${headerText}</span>`
  }
  // load data when scroll
  scroll(ele: HTMLDivElement) {
    var totalScroll = ele.offsetHeight + ele.scrollTop;
    if (this.scrolling && !this.onloading && (totalScroll <= ele.scrollHeight + 2)
      && (totalScroll >= ele.scrollHeight - 2)) {
      this.scrolling = false;
      this.getListDataEmpByOrgUnitID();
    }
  }
}
