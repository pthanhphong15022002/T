import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CodxCmService } from '../../../codx-cm.service';
import {
  ApiHttpService,
  CacheService,
  DataRequest,
  FormModel,
} from 'codx-core';
import { X } from '@angular/cdk/keycodes';
import { Observable, finalize, firstValueFrom, map } from 'rxjs';

@Component({
  selector: 'codx-view-dealcompetitors',
  templateUrl: './view-dealcompetitors.component.html',
  styleUrls: ['./view-dealcompetitors.component.css'],
})
export class ViewDealcompetitorsComponent implements OnInit {
  @Input() competitorID: any;
  lstDealCompetitor = [];
  fromModelDeal: FormModel = {
    formName: 'CMDeals',
    gridViewName: 'grvCMDeals',
    entityName: 'CM_Deals',
  };
  fromModelDealCompetitor: FormModel = {
    formName: 'CMDealsCompetitors',
    gridViewName: 'grvCMDealsCompetitors',
    entityName: 'CM_DealsCompetitors',
  };
  loaded: boolean;
  lstStep = [];
  request = new DataRequest();
  predicates = 'CompetitorID=@0';
  dataValues = '';
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  className = 'DealsBusiness';
  method = 'GetListDealAndDealCompetitorAsync';
  colorReasonSuccess: any;
  colorReasonFail: any;
  currentRecID = '';
  gridViewSetup: any;
  id: any;
  constructor(
    private cache: CacheService,
    private cmSv: CodxCmService,
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['competitorID']) {
      if (
        changes['competitorID']?.currentValue != null &&
        changes['competitorID']?.currentValue?.trim() != ''
      ) {
        if (changes['competitorID']?.currentValue == this.id) return;
        this.id = changes['competitorID']?.currentValue;
        this.getListDealAndDealCompetitor();
      } else {
        if (!this.loaded) this.loaded = true;
      }
    }

  }
  async ngOnInit() {
    this.fromModelDealCompetitor = await this.cmSv.getFormModel('CM02011');
    this.fromModelDeal = await this.cmSv.getFormModel('CM0201');
    this.gridViewSetup = await firstValueFrom(this.cache.gridViewSetup(this.fromModelDeal?.formName, this.fromModelDeal?.gridViewName));

    this.getColorReason();
  }

  getListDealAndDealCompetitor() {
    this.loaded = false;
    this.request.predicates = 'CompetitorID=@0';
    this.request.dataValues = this.competitorID;
    this.request.entityName = 'CM_DealsCompetitors';
    this.request.funcID = 'CM0201';
    this.className = 'DealsBusiness';
    this.fetch().subscribe((item) => {
      this.lstDealCompetitor = item;
      if (this.lstDealCompetitor != null && this.lstDealCompetitor.length > 0) {
        this.changeContacts(this.lstDealCompetitor[0]);
      }
      var lstRef = this.lstDealCompetitor.map((x) => x.refID);
      var lstSteps = this.lstDealCompetitor.map((x) => x.stepID);
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
}
