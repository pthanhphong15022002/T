import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CodxCmService } from '../../../codx-cm.service';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogModel,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { PopupAddDealcompetitorComponent } from './popup-add-dealcompetitor/popup-add-dealcompetitor.component';

@Component({
  selector: 'codx-tab-dealcompetitors',
  templateUrl: './codx-tab-dealcompetitors.component.html',
  styleUrls: ['./codx-tab-dealcompetitors.component.css'],
})
export class CodxTabDealcompetitorsComponent implements OnInit {
  @Input() dealID: any;
  @Input() funcID: any;
  lstDealCompetitors = [];
  moreFuncAdd = '';

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private callFc: CallFuncService,
    private notiService: NotificationsService,
    private cache: CacheService,
    private cmSv: CodxCmService
  ) {}
  ngOnInit(): void {
    this.getListDealCompetitors(this.dealID);
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncAdd = m.defaultName;
      }
    });
  }

  getListDealCompetitors(dealID) {
    this.cmSv.getDealCompetitors(dealID).subscribe((res) => {
      if (res) {
        this.lstDealCompetitors = res;
      }
    });
  }

  clickAddCompetitor(titleMore, action) {
    this.cache
      .gridViewSetup('CMDealsCompetitors', 'grvCMDealsCompetitors')
      .subscribe((res) => {
        let opt = new DialogModel();
        let dataModel = new FormModel();
        dataModel.formName = 'CMDealsCompetitors';
        dataModel.gridViewName = 'grvCMDealsCompetitors';
        dataModel.entityName = 'CM_DealsCompetitors';
        dataModel.funcID = this.funcID;
        opt.FormModel = dataModel;
        var obj = {
          title: titleMore,
          gridViewSetup: res,
          action: action,
        };
        var dialog = this.callFc.openForm(
          PopupAddDealcompetitorComponent,
          '',
          470,
          450,
          '',
          obj,
          '',
          opt
        );
      });
  }
}
