import {
  Component,
  Injector,
  Input,
  OnChanges,
  Optional,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CallFuncService,
  DataRequest,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
  Util,
  ViewModel,
} from 'codx-core';
import { QuotationsComponent } from '../quotations.component';
import { Observable, finalize, map } from 'rxjs';
import { PopupAddQuotationsComponent } from '../popup-add-quotations/popup-add-quotations.component';
import { CodxCmService } from '../../codx-cm.service';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';

@Component({
  selector: 'codx-quotations-tab-view',
  templateUrl: './quotations-tab-view.component.html',
  styleUrls: ['./quotations-tab-view.component.css'],
})
export class QuotationsTabViewComponent
  extends UIComponent
  implements OnChanges
{
  @ViewChild('itemViewList') itemViewList?: TemplateRef<any>;
  @ViewChild('tempHeader') tempHeader?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail?: TemplateRef<any>;
  @ViewChild('popDetail') popDetail?: TemplateRef<any>;
  @Input() funcID: string = 'CM0202';
  @Input() predicates: any; //
  @Input() dataValues: any; //= '
  @Input() customerID: string;
  // @Input() refType: string;
  @Input() dealID: string;
  @Input() recID: string;
  @Input() salespersonID: string;
  @Input() consultantID: string;
  @Input() disableDealID = false;
  @Input() disableCusID = false;
  @Input() disableContactsID = false;
  @Input() typeModel = 'custormmers' || 'deals' || 'contracts';
  @Input() showButton = false;

  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  entityName = 'CM_Quotations';
  className = 'QuotationsBusiness';
  methodLoadData = 'GetListQuotationsAsync';

  views: Array<ViewModel> = [];
  //test
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  grvSetup: any;
  vllStatus = '';
  formModel: FormModel = {
    entityName: 'CM_Quotations',
    formName: 'CMQuotations',
    gridViewName: 'grvCMQuotations',
    funcID: 'CM0202',
  };
  customerIDCrr = '';
  dealIDCrr = '';
  recIDCrr = '';
  requestData = new DataRequest();
  listQuotations = [];

  quotation: any;
  titleAction: any = '';
  titleActionAdd: any = '';
  loaded = false;
  itemSelected: any;
  popupView: DialogRef;
  isNewVersion: boolean;

  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private notiServer: NotificationsService,
    private codxShareService: CodxShareService,
    private routerActive: ActivatedRoute,
    private notiService: NotificationsService,
    private codxCM: CodxCmService,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.cache
      .gridViewSetup('CMQuotations', 'grvCMQuotations')
      .subscribe((res) => {
        if (res) {
          this.grvSetup = res;
          this.vllStatus = res['Status'].referedValue;
        }
      });

    this.cache.moreFunction('CoDXSystem', null).subscribe((mf) => {
      if (mf) {
        var mfAdd = mf.find((f) => f.functionID == 'SYS01');
        if (mfAdd) this.titleActionAdd = mfAdd?.customName;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    switch (this.typeModel) {
      case 'custormmers':
        if (changes['customerID']) {
          if (changes['customerID'].currentValue === this.customerIDCrr) return;
          this.customerIDCrr = changes['customerID']?.currentValue;
        } else return;
        break;
      case 'deals':
        if (changes['dealID']) {
          if (changes['dealID'].currentValue === this.dealIDCrr) return;
          this.dealIDCrr = changes['dealID'].currentValue;
        } else return;
        break;
      // case 'contracts':
      //   if (changes['recID']) {
      //     if (changes['recID'].currentValue === this.recIDCrr) return;
      //     this.recIDCrr = changes['recID'].currentValue;
      //   } else return;
      //break;
    }
    this.getQuotations();
  }

  onInit(): void {}

  ngAfterViewInit() {}

  getQuotations() {
    this.requestData.predicates = this.predicates;
    this.requestData.dataValues = this.dataValues;
    this.requestData.entityName = this.entityName;
    this.requestData.funcID = this.funcID;
    this.requestData.pageLoading = false;

    this.fetch().subscribe((res) => {
      this.listQuotations = res;
      this.loaded = true;
    });
  }

  fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.service,
        this.assemblyName,
        this.className,
        this.methodLoadData,
        this.requestData
      )
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response[0];
        })
      );
  }

  changeItemDetail(e) {}

  changeDataMF(e, data) {
    if (e != null && data != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'CM0202_1':
            if (data.status != 0 && data.status != 4) {
              res.disabled = true;
            }
            break;
          case 'CM0202_2':
            if (data.status != 1) {
              res.disabled = true;
            }
            break;
          case 'CM0202_3':
            if (data.status != 2) {
              res.isblur = true;
            }
            break;
          case 'CM0202_4':
            if (data.status < 2) {
              res.isblur = true;
            }
            break;
        }
      });
    }
  }

  clickMF(e, data) {
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'CM0202_1':
        this.approvalTrans(data);
        break;
      case 'CM0202_2':
        this.cancelApprover(data);
        break;
      case 'CM0202_3':
        this.createContract(data);
        break;
      case 'CM0202_4':
        this.createNewVersion(data);
        break;
      case 'CM0202_5':
        this.viewDetail(data);
        break;
    }
  }

  add() {
    this.getDefault().subscribe((res) => {
      if (res) {
        let data = res.data;
        data['_uuid'] = data['quotationsID'] ?? Util.uid();
        data['idField'] = 'quotationsID';
        this.quotation = data;
        if (!this.quotation.quotationsID) {
          this.api
            .execSv<any>(
              'SYS',
              'AD',
              'AutoNumbersBusiness',
              'GenAutoNumberAsync',
              [this.formModel.funcID, this.formModel.entityName, 'QuotationsID']
            )
            .subscribe((id) => {
              this.quotation.quotationID = id;
              this.openPopup(this.quotation, 'add');
            });
        } else this.openPopup(this.quotation, 'add');
      }
    });
  }

  openPopup(res, action, copyToRecID = null) {
    res.status = res.status ?? '0';
    res.customerID = res.customerID ?? this.customerID;
    res.dealID = res.dealID ?? this.dealID;
    res.salespersonID = res.salespersonID ?? this.salespersonID;
    res.consultantID = res.consultantID ?? this.consultantID;
    res.totalAmt = res.totalAmt ?? 0;
    res.exchangeRate = res.exchangeRate ?? 1;
    res.currencyID = res.currencyID ?? 'VND';
    res.versionNo = res.versionNo ?? 'V1';
    res.revision = res.revision ?? 0;
    res.versionName = res.versionNo + '.' + res.revision;

    var obj = {
      data: res,
      disableDealID: this.disableDealID,
      disableCusID: this.disableCusID,
      disableContactsID: this.disableContactsID,
      action: action,
      headerText: action == 'add' ? this.titleActionAdd : this.titleAction,
      copyToRecID: copyToRecID,
    };
    let option = new DialogModel();
    option.IsFull = true;
    // option.DataService = this.view.dataService;
    option.FormModel = this.formModel;
    let dialog = this.callfc.openForm(
      PopupAddQuotationsComponent,
      '',
      null,
      null,
      '',
      obj,
      '',
      option
    );
    dialog.closed.subscribe((e) => {
      if (e?.event) {
        this.listQuotations.push(e.event);
        if (this.isNewVersion) this.isNewVersion = false;
      }
    });
  }

  edit(data) {
    let quotation = JSON.parse(JSON.stringify(data));

    var obj = {
      data: quotation,
      action: 'edit',
      headerText: this.titleAction,
      disableDealID: this.disableDealID,
      disableCusID: this.disableCusID,
      disableContactsID: this.disableContactsID,
    };
    let option = new DialogModel();
    option.IsFull = true;

    option.FormModel = this.formModel;
    let dialog = this.callfc.openForm(
      PopupAddQuotationsComponent,
      '',
      null,
      null,
      '',
      obj,
      '',
      option
    );
    dialog.closed.subscribe((e) => {
      if (e?.event) {
        let dataUp = e?.event;
        let idxUp = this.listQuotations.findIndex(
          (x) => x.recID == dataUp?.recID
        );
        if (idxUp != -1) this.listQuotations[idxUp] = dataUp;
      }
    });
  }

  copy(dataCopy) {
    //gọi alow copy
    let copyToRecID = dataCopy?.recID;
    this.getDefault().subscribe((res) => {
      let data = res.data;
      data['_uuid'] = data['quotationsID'] ?? Util.uid();
      data['idField'] = 'quotationsID';
      let arrField = Object.values(this.grvSetup).filter(
        (x: any) => x.allowCopy
      );
      if (Array.isArray(arrField)) {
        arrField.forEach((v: any) => {
          let field = Util.camelize(v.fieldName);
          data[field] = dataCopy[field];
        });
      }
      this.quotation = data;
      if (!this.quotation.quotationsID) {
        this.api
          .execSv<any>(
            'SYS',
            'AD',
            'AutoNumbersBusiness',
            'GenAutoNumberAsync',
            [this.formModel.funcID, this.formModel.entityName, 'QuotationsID']
          )
          .subscribe((id) => {
            res.quotationID = id;
            this.openPopup(this.quotation, 'copy', copyToRecID);
          });
      } else this.openPopup(this.quotation, 'copy', copyToRecID);
    });
  }

  delete(data) {
    this.notiServer.alertCode('SYS030').subscribe((res) => {
      if (res.event.status === 'Y') {
        this.api
          .exec<any>(
            'CM',
            'QuotationsBusiness',
            'DeleteQuotationsByRecIDAsync',
            data.recID
          )
          .subscribe((res) => {
            if (res) {
              let idxDeleted = this.listQuotations.findIndex(
                (x) => x.recID == data.recID
              );
              if (idxDeleted != -1) this.listQuotations.splice(idxDeleted, 1);
              this.notiServer.notifyCode('SYS008');
            } else {
              this.notiServer.notifyCode('SYS022');
            }
          });
      }
    });
  }

  getIndex(recID) {
    return (
      this.view.dataService.data.findIndex((obj) => obj.recID == recID) + 1
    );
  }

  getDefault() {
    return this.api.execSv<any>(
      'CM',
      'Core',
      'DataBusiness',
      'GetDefaultAsync',
      [this.formModel.funcID, this.formModel.entityName, 'quotationsID']
    );
    // .subscribe((response: any) => {
    //   if (response) {
    //     var data = response.data;
    //     data['_uuid'] = data['quotationsID'] ?? Util.uid();
    //     data['idField'] = 'quotationsID';
    //     this.quotation = data;
    //   }
    //   return this.quotation
    // });
  }
  viewDetail(data) {
    this.itemSelected = data;
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 999;
    this.popupView = this.callfc.openForm(
      this.popDetail,
      '',
      0,
      0,
      '',
      null,
      '',
      option
    );
  }

  //function More
  // tạo phiên bản mới
  createNewVersion(data) {
    this.isNewVersion = true;
    let dt = JSON.parse(JSON.stringify(data));
    switch (dt.status) {
      case '4':
      case '2':
        dt.versionNo =
          dt.versionNo[0] + (Number.parseInt(dt.versionNo.slice(1)) + 1);
        dt.revision = 0;
        dt.versionName = dt.versionNo + '.' + dt.revision;
        this.copy(dt);
        break;
      case '3':
        dt.status = '0';
        dt.revision += 1;
        dt.versionName = dt.versionNo + '.' + dt.revision;
        this.edit(dt);
        break;
    }
  }

  // tạo hợp đồng
  createContract(dt) {
    //viet vao day thuan
  }
  // end

  //------------------------- Ký duyệt  ----------------------------------------//
  approvalTrans(dt) {
    this.codxCM.getDeals(dt.dealID).subscribe((deals) => {
      if (deals) {
        this.codxCM.getProcess(deals.processID).subscribe((process) => {
          if (process) {
            this.codxCM
              .getESCategoryByCategoryID(process.processNo)
              .subscribe((res) => {
                if (res.eSign) {
                  //kys soos
                } else {
                  this.release(dt, res.processID);
                }
              });
          } else {
            this.notiService.notify(
              'Quy trình không tồn tại hoặc đã bị xóa ! Vui lòng liên hê "Khanh" để xin messcode',
              '3'
            );
          }
        });
      } else {
        this.notiService.notify(
          'Cơ hội không tồn tại hoặc đã bị xóa ! Vui lòng liên hê "Khanh" để xin messcode',
          '3'
        );
      }
    });
  }
  //Gửi duyệt
  release(data: any, processID: any) {
    this.codxShareService
      .codxRelease(
        this.view.service,
        data?.recID,
        processID,
        this.view.formModel.entityName,
        this.view.formModel.funcID,
        '',
        data?.title,
        ''
      )
      .subscribe((res2: any) => {
        if (res2?.msgCodeError) this.notiService.notify(res2?.msgCodeError);
        else {
          this.itemSelected.approveStatus = '3';
          this.view.dataService.update(this.itemSelected).subscribe();
          // if (this.kanban) this.kanban.updateCard(this.itemSelected);
          this.codxCM
            .updateApproveStatus('DealsBusiness', data?.recID, '3')
            .subscribe();
          this.notiService.notifyCode('ES007');
        }
      });
  }

  //Huy duyet
  cancelApprover(dt) {
    this.notiService.alertCode('ES016').subscribe((x) => {
      if (x.event.status == 'Y') {
        this.codxCM.getProcess(dt.processID).subscribe((process) => {
          if (process) {
            this.codxCM
              .getESCategoryByCategoryID(process.processNo)
              .subscribe((res2: any) => {
                if (res2) {
                  if (res2?.eSign == true) {
                    //trình ký
                  } else if (res2?.eSign == false) {
                    //kí duyet
                    this.codxShareService
                      .codxCancel(
                        'CM',
                        dt?.recID,
                        this.view.formModel.entityName,
                        ''
                      )
                      .subscribe((res3) => {
                        if (res3) {
                          this.itemSelected.approveStatus = '0';
                          this.codxCM
                            .updateApproveStatus(
                              'QuotationsBusiness',
                              dt?.recID,
                              '0'
                            )
                            .subscribe();
                          this.notiService.notifyCode('SYS007');
                        } else this.notiService.notifyCode('SYS021');
                      });
                  }
                }
              });
          } else {
            this.notiService.notify(
              'Quy trình không tồn tại hoặc đã bị xóa ! Vui lòng liên hê "Khanh" để xin messcode',
              '3'
            );
          }
        });
      }
    });
  }
  //end duyet
  //--------------------------------------------------------------------//
}
