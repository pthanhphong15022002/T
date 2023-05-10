import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CodxCmService } from '../../../codx-cm.service';
import {
  AlertConfirmInputConfig,
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
  loaded: boolean;
  lstCompetitorAddress = [];
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
    this.loaded = false;
    this.cmSv.getDealCompetitors(dealID).subscribe((res) => {
      if (res) {
        this.lstDealCompetitors = res;
        var lstID = this.lstDealCompetitors.map((x) => x.competitorID);
        this.getAddressCompetitors(lstID);
      }
      this.loaded = true;

    });
  }

  getAddressCompetitors(lstId) {
    this.cmSv.getListAddressByListID(lstId).subscribe((res) => {
      if (res && res.length > 0) {
        this.lstCompetitorAddress = res[0];
      }
    });
  }

  getAddress(competitorID) {
    if (
      this.lstCompetitorAddress != null &&
      this.lstCompetitorAddress.length > 0
    ) {
      return this.lstCompetitorAddress.find((x) => x.recID == competitorID)
        ?.address;
    } else {
      return null;
    }
  }

  getCompetitorName(competitorID) {
    if (
      this.lstCompetitorAddress != null &&
      this.lstCompetitorAddress.length > 0
    ) {
      return this.lstCompetitorAddress.find((x) => x.recID == competitorID)
        ?.address;
    } else {
      return null;
    }
  }

  getFormModel() {
    var formModel = new FormModel();
    formModel.formName = 'CMDealsCompetitors';
    formModel.gridViewName = 'grvCMDealsCompetitors';
    formModel.entityName = 'CM_DealsCompetitors';
    this.formModel = formModel;
  }

  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS03':
        this.clickAddCompetitor(e.text, 'edit', data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS04':
        this.clickAddCompetitor(e.text, 'copy', data);
        break;
    }
  }

  changeDataMF(e) {
    if (e != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS04':
            res.disabled = false;
            break;
        }
      });
    }
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
          data: data,
          lstDealCompetitors: this.lstDealCompetitors,
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
              if(!this.lstDealCompetitors.some(x => x.recID == e.event.recID) && this.getCompetitorName(e?.event?.competitorID) == null){
                this.api.exec<any>('CM','CustomersBusiness','GetOneAsync',[e?.event?.competitorID, 'CM0104']).subscribe(res =>{
                  if(res){
                    var address = res?.address;
                    if(address){
                      var tmp = {};
                      tmp['recID'] = e.event.competitorID;
                      tmp['address'] = address;
                      this.lstCompetitorAddress.push(Object.assign({}, tmp));
                    }
                  }
                })
              }
              this.lstDealCompetitors = this.cmSv.loadList(
                e?.event,
                this.lstDealCompetitors,
                action
              );
              this.changeDetectorRef.detectChanges();
            }
          }
        });
      });
  }

  delete(data) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event.status == 'Y') {
        this.cmSv.deleteDealCompetitorAsync(data?.recID).subscribe((res) => {
          if (res) {
            this.lstDealCompetitors = this.cmSv.loadList(
              data,
              this.lstDealCompetitors,
              'delete'
            );
            this.notiService.notifyCode('SYS008');
            this.changeDetectorRef.detectChanges();
          }
        });
      }
    });
  }
}
