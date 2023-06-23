import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CodxCmService } from '../../../codx-cm.service';
import {
  ApiHttpService,
  CacheService,
  DataRequest,
  FormModel,
} from 'codx-core';
import { Observable, finalize, firstValueFrom, map, pipe } from 'rxjs';

@Component({
  selector: 'codx-list-deals',
  templateUrl: './codx-list-deals.component.html',
  styleUrls: ['./codx-list-deals.component.css'],
})
export class CodxListDealsComponent implements OnInit {
  @Input() customerID: any;
  lstDeals = [];
  formModel: FormModel;
  lstStep = [];
  loaded: boolean;
  request = new DataRequest();
  predicates = 'CustomerID=@0';
  dataValues = '';
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  className = 'DealsBusiness';
  method = 'GetListDealsByCustomerIDAsync';
  colorReasonSuccess: any;
  colorReasonFail: any;
  currentRecID = '';
  gridViewSetup: any;
  constructor(
    private cache: CacheService,
    private cmSv: CodxCmService,
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
  }

  async ngOnInit() {
    this.getListDealsByCustomerID();
    this.formModel = await this.cmSv.getFormModel('CM0201');
    this.gridViewSetup = await firstValueFrom(this.cache.gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName));
    this.getColorReason();
  }

  getListDealsByCustomerID() {
    this.loaded = false;
    this.request.predicates = 'CustomerID=@0';
    this.request.dataValues = this.customerID;
    this.request.entityName = 'CM_Deals';
    this.request.funcID = 'CM0201';
    this.className = 'DealsBusiness';
    this.fetch().subscribe((item) => {
      this.lstDeals = item;
      if(this.lstDeals != null && this.lstDeals.length > 0){
        this.changeContacts(this.lstDeals[0]);
      }
      var lstRef = this.lstDeals.map((x) => x.refID);
      var lstSteps = this.lstDeals.map((x) => x.stepID);
      if (lstRef != null && lstRef.length > 0)
        this.getStepsByListID(lstSteps, lstRef);

      this.loaded = true;
    });
  }
  private fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.service,
        this.assemblyName,
        this.className,
        this.method,
        this.request
      )
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response ? response[0] : [];
        })
      );
  }

  changeContacts(item) {
    this.currentRecID = item.recID;
    this.changeDetectorRef.detectChanges();
  }

  getStepsByListID(lstStepID, lstIns) {
    this.cmSv.getStepsByListID(lstStepID, lstIns).subscribe((res) => {
      if (res && res.length > 0) {
        this.lstStep = res;
      }
    });
  }

  getStep(stepID) {
    if (this.lstStep != null && this.lstStep.length > 0) {
      var step = this.lstStep.find((x) => x.stepID == stepID);
      return step;
    } else {
      return null;
    }
  }

  async getColorReason() {
    this.cache.valueList('DP036').subscribe((res) => {
      if (res.datas) {
        for (let item of res.datas) {
          if (item.value === 'S') {
            this.colorReasonSuccess = item;
          } else if (item.value === 'F') {
            this.colorReasonFail = item;
          }
        }
      }
    });
  }
  checkOverflow(event: any, popup: any) {
    let parent = event.currentTarget.parentElement;
    let child = event.currentTarget;
    if (child.scrollWidth >= parent.scrollWidth) {
      popup.open();
    }
  }
}
