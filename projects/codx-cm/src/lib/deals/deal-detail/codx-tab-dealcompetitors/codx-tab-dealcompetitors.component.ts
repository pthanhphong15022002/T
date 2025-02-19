import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CodxCmService } from '../../../codx-cm.service';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  CacheService,
  CallFuncService,
  DataRequest,
  DialogModel,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { PopupAddDealcompetitorComponent } from './popup-add-dealcompetitor/popup-add-dealcompetitor.component';
import { CM_DealsCompetitors } from '../../../models/cm_model';
import { Observable, finalize, map } from 'rxjs';
import { PopupStatusCompetitorComponent } from './popup-status-competitor/popup-status-competitor.component';

@Component({
  selector: 'codx-tab-dealcompetitors',
  templateUrl: './codx-tab-dealcompetitors.component.html',
  styleUrls: ['./codx-tab-dealcompetitors.component.css'],
})
export class CodxTabDealcompetitorsComponent implements OnInit {
  @Input() dealID: any;
  @Input() funcID: any;
  @Input() hidenMF = true;
  @Input() hidenMFAdd = false;
  lstDealCompetitors = [];
  moreFuncAdd = '';
  formModel: FormModel = {
    formName: 'CMDealsCompetitors',
    gridViewName: 'grvCMDealsCompetitors',
    entityName: 'CM_DealsCompetitors',
    funcID: 'CM02011',
  };
  loaded: boolean;
  lstCompetitorAddress = [];
  request = new DataRequest();
  predicates = 'DealID=@0';
  dataValues = '';
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  className = 'DealsCompetitorsBusiness';
  method = 'GetListDealAndDealCompetitorAsync';
  vllStatus = '';
  currentRecID = '';
  id: any;
  formModelAddress: any;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private callFc: CallFuncService,
    private notiService: NotificationsService,
    private cache: CacheService,
    private cmSv: CodxCmService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dealID']) {
      if (changes['dealID'].currentValue != null) {
        if (changes['dealID'].currentValue == this.id) return;
        this.id = changes['dealID'].currentValue;
        this.getListDealAndDealCompetitor();
      }
    }
  }
  async ngOnInit() {
    let dataModel = new FormModel();
    dataModel.formName = 'CMCompetitors';
    dataModel.gridViewName = 'grvCMCompetitors';
    dataModel.entityName = 'CM_Competitors';
    this.formModelAddress = dataModel;

    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncAdd = m.defaultName;
      }
    });
  }

  ngAfterViewInit(): void {
    this.cache
      .gridViewSetup('CMDealsCompetitors', 'grvCMDealsCompetitors')
      .subscribe((res) => {
        this.vllStatus = res?.Status?.ReferedValue;
      });
  }

  getListDealAndDealCompetitor() {
    this.loaded = false;
    this.request.predicates = 'DealID=@0';
    this.request.dataValues = this.dealID;
    this.request.entityName = 'CM_DealsCompetitors';
    this.request.funcID = 'CM02011';
    this.fetch().subscribe((item) => {
      this.lstDealCompetitors = item;
      var lstID = this.lstDealCompetitors.map((x) => x.competitorID);
      this.getAddressCompetitors(lstID);
      if (
        this.lstDealCompetitors != null &&
        this.lstDealCompetitors.length > 0
      ) {
        this.changeComeptitor(this.lstDealCompetitors[0]);
      }
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

  changeComeptitor(item) {
    this.currentRecID = item.recID;
    this.changeDetectorRef.detectChanges();
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
        ?.competitorName;
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
      case 'CM02011_1':
        this.setStatus(e.text, data);
        break;
    }
  }

  changeDataMF(e, data) {}

  setStatus(title, data) {
    data.dealID = this.dealID;
    var obj = {
      title: title,
      data: data,
    };
    let opt = new DialogModel();
    opt.FormModel = this.formModel;
    var dialog = this.callFc.openForm(
      PopupStatusCompetitorComponent,
      '',
      500,
      350,
      '',
      obj,
      '',
      opt
    );
    dialog.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        if (e?.event?.recID) {
          if (e?.event?.status == '1') {
            if (this.lstDealCompetitors != null) {
              this.lstDealCompetitors.forEach((res) => {
                if (res.recID != e?.event?.recID) {
                  res.status = '2';
                }
              });
            }
          }
          this.lstDealCompetitors = this.cmSv.loadList(
            e?.event,
            this.lstDealCompetitors,
            'update'
          );
          var index = this.lstDealCompetitors.findIndex(
            (x) => x.recID == e.event?.recID
          );
          this.changeComeptitor(this.lstDealCompetitors[index]);
        }
      }
    });
  }

  clickAddCompetitor(titleMore, action, data) {
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
          800,
          800,
          '',
          obj,
          '',
          opt
        );
        dialog.closed.subscribe((e) => {
          if (e && e.event != null) {
            if (e?.event?.recID) {
              if (
                !this.lstDealCompetitors.some(
                  (x) => x.recID == e.event.recID
                ) &&
                this.getCompetitorName(e?.event?.competitorID) == null
              ) {
                this.cmSv
                  .getOneCompetitor(e?.event?.competitorID)
                  .subscribe((res) => {
                    if (res) {
                      var address = res?.address;
                      if (address) {
                        var tmp = {};
                        tmp['recID'] = e.event.competitorID;
                        tmp['address'] = address;
                        tmp['competitorName'] = e.competitorName;
                        this.lstCompetitorAddress.push(Object.assign({}, tmp));
                      }
                    }
                  });
              }
              this.lstDealCompetitors = this.cmSv.loadList(
                e?.event,
                this.lstDealCompetitors,
                action
              );
              var index = this.lstDealCompetitors.findIndex(
                (x) => x.recID == e.event?.recID
              );
              this.changeComeptitor(this.lstDealCompetitors[index]);

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
      if (x.event && x.event?.status) {
        if (x?.event?.status == 'Y') {
          this.cmSv.deleteDealCompetitorAsync(data?.recID).subscribe((res) => {
            if (res) {
              this.lstDealCompetitors = this.cmSv.loadList(
                data,
                this.lstDealCompetitors,
                'delete'
              );
              if (this.lstDealCompetitors?.length > 0) {
                this.changeComeptitor(this.lstDealCompetitors[0]);
              }

              this.notiService.notifyCode('SYS008');
              this.changeDetectorRef.detectChanges();
            }
          });
        }
      }
    });
  }
}
