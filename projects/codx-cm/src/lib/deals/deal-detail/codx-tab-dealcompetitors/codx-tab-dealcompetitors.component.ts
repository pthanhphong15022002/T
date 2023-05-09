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
import { CM_DealsCompetitors } from '../../../models/cm_model';

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
  formModel: FormModel;
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
    this.getFormModel();
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

  getFormModel() {
    var formModel = new FormModel();
    formModel.formName = 'CMDealsCompetitors';
    formModel.gridViewName = 'grvCMDealsCompetitors';
    formModel.entityName = 'CM_DealsCompetitors';
    this.formModel = formModel;
  }

  clickAddCompetitor(titleMore, action, data = new CM_DealsCompetitors()) {
    this.cache
      .gridViewSetup('CMDealsCompetitors', 'grvCMDealsCompetitors')
      .subscribe((res) => {
        let opt = new DialogModel();
        opt.FormModel = this.formModel;
        var obj = {
          title: titleMore,
          gridViewSetup: res,
          action: action,
          dealID: this.dealID,
          data: data
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
        dialog.closed.subscribe((e) => {
          if (e && e.event != null) {
            if (e?.event?.recID) {
              this.getListDealCompetitors(this.dealID);
              this.changeDetectorRef.detectChanges();
            }
          }
        });
      });
  }
}
