import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxGridviewV2Component,
  CodxService,
  DataRequest,
  DialogModel,
  FormModel,
  NotificationsService,
  SidebarModel,
  Util,
} from 'codx-core';
import { Observable, finalize, firstValueFrom, map } from 'rxjs';
import { PopupAddCampaignContactComponent } from './popup-add-campaign-contact/popup-add-campaign-contact.component';
import { CodxCmService } from '../../../codx-cm.service';
import { PopupAddLeadComponent } from '../../../leads/popup-add-lead/popup-add-lead.component';
import { PopupConvertLeadComponent } from '../../../leads/popup-convert-lead/popup-convert-lead.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'codx-campaign-contacts',
  templateUrl: './campaign-contacts.component.html',
  styleUrls: ['./campaign-contacts.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CampaignContactsComponent implements OnInit {
  @Input() transID: any;
  @Input() objectType: any;
  @Input() dataSelected: any;
  @Input() isShow: boolean;
  @Input() isDoubleClick: boolean = false;
  @ViewChild('headerCustomerName') headerCustomerName: TemplateRef<any>;
  @ViewChild('tempCustomerName') tempCustomerName: TemplateRef<any>;
  @ViewChild('headerIndustries') headerIndustries: TemplateRef<any>;
  @ViewChild('tempIndustries') tempIndustries: TemplateRef<any>;
  @ViewChild('headerContact') headerContact: TemplateRef<any>;
  @ViewChild('tempContact') tempContact: TemplateRef<any>;
  @ViewChild('headerOwner') headerOwner: TemplateRef<any>;
  @ViewChild('tempOwner') tempOwner: TemplateRef<any>;
  @ViewChild('headerStatus') headerStatus: TemplateRef<any>;
  @ViewChild('tempStatus') tempStatus: TemplateRef<any>;
  @ViewChild('headerStatusCusLead') headerStatusCusLead: TemplateRef<any>;
  @ViewChild('tempStatusCusLead') tempStatusCusLead: TemplateRef<any>;
  @ViewChild('headerHistory') headerHistory: TemplateRef<any>;
  @ViewChild('tempHistory') tempHistory: TemplateRef<any>;
  @ViewChild('grid') grid: CodxGridviewV2Component;

  lstCampContacts = [];
  formModel: FormModel = {
    formName: 'CMCampaignsContacts',
    gridViewName: 'grvCMCampaignsContacts',
    entityName: 'CM_CampaignsContacts',
  };
  request = new DataRequest();
  predicates = 'TransID=@0 && ObjectType=@1';
  dataValues = '';
  service = 'CM';
  currentRecID = '';
  assemblyName = 'ERM.Business.CM';
  className = 'CampaignsContactsBusiness';
  method = 'GetListCampaignContactsAsync';
  id: any;
  objectTypeOld: any;
  loaded: boolean;
  columnsGrid = [];
  gridViewSetup: any;
  moreFuncAdd = '';
  url = '';
  titleAction = '';
  lstProcesss = [];
  lstLeads = [];
  statusSearch = [];

  constructor(
    private api: ApiHttpService,
    private detector: ChangeDetectorRef,
    private cache: CacheService,
    private callFc: CallFuncService,
    private codxService: CodxService,
    private cmSv: CodxCmService,
    private notiSv: NotificationsService,
    private codxShareService: CodxShareService
  ) {}
  async ngOnInit() {
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncAdd = m.customName;
      }
    });
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.getGridViewSetuup();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['transID']) {
      if (
        changes['transID'].currentValue != null &&
        changes['transID']?.currentValue?.trim() != ''
      ) {
        this.id = changes['transID']?.currentValue;
        this.objectTypeOld = changes['objectType']?.currentValue;
        this.formModel.funcID =
          this.objectType == '1' ? 'CM0301_2' : 'CM0301_1';
        let funcID = this.objectType == '1' ? 'CM0101' : 'CM0205';
        this.statusSearch = [];
        this.getFunctionList(funcID);
        this.dataValues = this.transID + ';' + this.objectType;

        this.getList(this.predicates, this.dataValues);
      } else {
        if (!this.loaded) this.loaded = true;
      }
    }
  }

  getList(predicates = '', dataValues = '') {
    this.loaded = false;
    this.request.predicates = predicates;
    this.request.dataValues = dataValues;
    this.request.entityName = 'CM_CampaignsContacts';
    this.request.pageLoading = false;
    this.request.funcID = this.formModel.funcID;
    this.fetch().subscribe(async (item) => {
      this.loaded = true;
      this.lstCampContacts = item ?? [];
      if (
        this.objectType == '3' &&
        this.lstCampContacts != null &&
        this.lstCampContacts.length > 0
      ) {
        var lstIds = this.lstCampContacts.map((x) => x.objectID);
        if (lstIds != null && lstIds.length > 0) {
          const ele = await firstValueFrom(this.getListLeadBylstIDs(lstIds));
          if (ele) {
            this.lstLeads = ele[0] ?? [];
            this.lstProcesss = ele[1] ?? [];
          }
        }
      }
      if (this.grid) {
        this.grid.dataSource = this.lstCampContacts;
      }
      // this.grid.showRowNumber = false;
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

  getGridViewSetuup() {
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
          let arrField = Object.values(this.gridViewSetup).filter(
            (x: any) => x.isVisible
          );
          if (Array.isArray(arrField)) {
            let arrFieldIsVisible = arrField
              .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
              .map((x: any) => x.fieldName);
            this.getColumnGrid(this.gridViewSetup, arrFieldIsVisible);
          }
          this.detector.detectChanges();
        }
      });
  }

  getColumnGrid(grid, arrFieldIsVisible) {
    this.columnsGrid = [];

    arrFieldIsVisible.forEach((key) => {
      let field = Util.camelize(key);
      let template: any;
      let colums: any;
      switch (key) {
        case 'ObjectName':
          template = this.tempCustomerName;
          break;
        case 'Industries':
          template = this.tempIndustries;
          break;
        case 'ContactName':
          template = this.tempContact;
          break;
        case 'Owner':
          template = this.tempOwner;
          break;
        case 'Status':
          template = this.tempStatus;
          break;
        case 'CustomerStatus':
          if (this.objectType == '1') template = this.tempStatusCusLead;
          break;
        case 'LeadStatus':
          if (this.objectType == '3') template = this.tempStatusCusLead;
          break;
      }
      if (template) {
        colums = {
          field: field,
          headerText: grid[key].headerText,
          template: template,
          width: grid[key].width,
        };
      } else {
        colums = {
          field: field,
          headerText: grid[key].headerText,
          width: grid[key].width,
        };
      }

      this.columnsGrid.push(colums);
    });
    const field = this.objectType == '1' ? 'CustomerStatus' : 'LeadStatus';
    let columTemp = [
      {
        field: field,
        headerTemplate: this.headerStatusCusLead,
        template: this.tempStatusCusLead,
        width: grid?.field?.width > 0? grid?.field?.width : 150,
      },
      {
        field: 'Called',
        headerTemplate: this.headerHistory,
        template: this.tempHistory,
        width: !this.isDoubleClick ? 150 : 250,
      },
    ];
    this.columnsGrid = [...this.columnsGrid, ...columTemp];
  }

  getListLeadBylstIDs(lstIDs = []) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'LeadsBusiness',
      'GetListLeadByLstIDsAsync',
      [lstIDs]
    );
  }

  getFunctionList(funcID) {
    this.cache.functionList(funcID).subscribe((res) => {
      if (res) {
        this.url = res?.url;
      }
    });
  }

  //#region filter status
  valueChange(e) {
    console.log(e);
    let predicates = 'TransID=@0 && ObjectType=@1';
    let dataValues = this.transID + ';' + this.objectType;
    if (e && e?.data) {
      if (e?.data?.length > 0) {
        predicates += ' && Status=@2';
        dataValues += ';' + e?.data[0];
      }
    }
    this.predicates = predicates;
    this.dataValues = dataValues;
    this.getList(this.predicates, this.dataValues);
    this.detector.detectChanges();
  }
  //#endregion

  //#region  more
  clickMF(e, data) {
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'CM0301_2_1':
        this.convertCustomerToLeads(data);
        break;
      case 'CM0301_2_2':
        this.convertLead(data);
        break;
      default: {
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          null,
          this.formModel,
          null,
          this
        );
        // this.df.detectChanges();
        break;
      }
    }
  }

  changeDataMF(e, data) {
    if (e != null && data != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS03':
          case 'SYS04':
            res.disabled = true;
            break;
          case 'CM0301_2_1':
            if (this.objectType == '3') res.disabled = true;
            break;
          case 'CM0301_2_2':
            if (
              this.objectType == '1' ||
              !['13', '3', '2'].includes(data.leadStatus)
            )
              res.disabled = true;
            break;
        }
      });
    }
  }
  //#endregion

  //#region navigate
  clickNavigate(data) {
    // this.cmSv.navigateCampaign.next({recID: data.recID});
    this.codxService.navigate('', this.url, {
      recID: data?.rowData?.objectID,
    });
  }
  //#endregion

  //#region crud
  //add campaign contacts

  addCampaignContact(action) {
    let dialogModel = new DialogModel();
    dialogModel.zIndex = 1010;
    dialogModel.FormModel = this.formModel;
    this.cache.functionList(this.formModel?.funcID).subscribe((func) => {
      this.cache
        .gridViewSetup('CMCampaignsContacts', 'grvCMCampaignsContacts')
        .subscribe((res) => {
          if (res) {
            let obj = {
              title: this.moreFuncAdd + ' ' + func?.defaultName?.toLowerCase(),
              transID: this.transID,
              objectType: this.objectType,
              gridViewSetup: res,
              lstCampContacts: this.lstCampContacts,
              titleName: func?.defaultName ?? func?.customName,
            };
            this.callFc
              .openForm(
                PopupAddCampaignContactComponent,
                '',
                600,
                700,
                '',
                obj,
                '',
                dialogModel
              )
              .closed.subscribe((e) => {
                if (e && e?.event) {
                  this.lstCampContacts = [...this.lstCampContacts, ...e?.event];
                  if (this.objectType == '3') {
                    this.cmSv.countLeadsBehavior.next(
                      this.lstCampContacts.length
                    );
                  }
                  this.detector.detectChanges();
                }
              });
          }
        });
    });
  }

  delete(data) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiSv.alertCode('SYS030').subscribe((x) => {
      if (x.event.status == 'Y') {
        this.api
          .execSv<any>(
            'CM',
            'ERM.Business.CM',
            'CampaignsContactsBusiness',
            'DeleteCampaignContactsAsync',
            [data?.recID]
          )
          .subscribe((res) => {
            if (res) {
              let idx = this.lstCampContacts.findIndex(
                (x) => x.recID == data.recID
              );
              if (idx != -1) {
                this.lstCampContacts.splice(idx, 1);
                this.lstCampContacts = JSON.parse(
                  JSON.stringify(this.lstCampContacts)
                );
                if (this.objectType == '3') {
                  this.cmSv.countLeadsBehavior.next(
                    this.lstCampContacts.length
                  );
                }
              }
              this.notiSv.notifyCode('SYS008');
            }
            this.detector.detectChanges();
          });
      }
    });
  }
  //#endregion

  //convert Customer To Lead
  async convertCustomerToLeads(data) {
    var isCheck = await firstValueFrom(
      this.api.execSv<any>(
        'CM',
        'ERM.Business.CM',
        'CustomersBusiness',
        'CheckConvertCustomerAsync',
        [data.objectID]
      )
    );
    if (isCheck) {
      var config = new AlertConfirmInputConfig();
      config.type = 'YesNo';
      this.notiSv.alertCode('CM052').subscribe((x) => {
        if (x.event && x.event?.status) {
          if (x?.event?.status == 'Y') {
            this.openFormConvert(data);
          }
        }
      });
    } else {
      this.openFormConvert(data);
    }
  }

  //open form convert
  openFormConvert(data) {
    this.api
      .execSv<any>(
        'CM',
        'ERM.Business.CM',
        'CustomersBusiness',
        'GetLeadDefaultAsync',
        [null, data?.objectID]
      )
      .subscribe((ele) => {
        if (ele) {
          let lead = ele[0];
          let lstCategory = ele[1];
          let option = new SidebarModel();
          let formModel = new FormModel();
          formModel.funcID = 'CM0205';
          formModel.formName = 'CMLeads';
          formModel.entityName = 'CM_Leads';
          formModel.gridViewName = 'grvCMLeads';
          option.FormModel = formModel;
          option.Width = '800px';
          option.zIndex = 1001;
          this.cache
            .gridViewSetup(formModel.formName, formModel.gridViewName)
            .subscribe((res) => {
              if (res) {
                let gridViewSetup = res;
                var obj = {
                  action: 'add',
                  formMD: formModel,
                  titleAction: this.titleAction,
                  leadIdOld: '',
                  contactIdOld: '',
                  applyFor: '5',
                  processId: null,
                  gridViewSetup: gridViewSetup,
                  applyProcess: false,
                  listCategory: lstCategory,
                  dataConvert: lead,
                  convertCustomerToLead: true,
                  transIDCamp: this.transID,
                };
                let dialogCustomDeal = this.callFc.openSide(
                  PopupAddLeadComponent,
                  obj,
                  option
                );
                dialogCustomDeal.closed.subscribe((e) => {
                  if (e && e.event != null) {
                    let count = this.dataSelected?.counts + 1;
                    this.cmSv.countLeadsBehavior.next(count);
                    this.detector.detectChanges();
                  }
                });
              }
            });
        }
      });
  }

  //convert Lead
  async convertLead(data) {
    const lead = await firstValueFrom(
      this.api.execSv<any>(
        'CM',
        'ERM.Business.CM',
        'LeadsBusiness',
        'GetOneLeadByObjectIDAsync',
        [data?.objectID]
      )
    );
    if (lead) {
      if (lead?.closed) {
        this.notiSv.notifyCode('CM053');
        return;
      }
      lead.campaignID = this.transID;
      this.cache.gridViewSetup('CMLeads', 'grvCMLeads').subscribe((res) => {
        let option = new SidebarModel();
        var formMD = new FormModel();
        formMD.entityName = 'CM_Leads';
        formMD.formName = 'CMLeads';
        formMD.gridViewName = 'grvCMLeads';
        formMD.funcID = 'CM0205';
        option.FormModel = JSON.parse(JSON.stringify(formMD));
        option.Width = '800px';
        var obj = {
          title: this.titleAction,
          gridViewSetup: res,
          applyFor: '5',
          data: lead,
          transIDCamp: this.transID,
        };
        var dialog = this.callFc.openSide(
          PopupConvertLeadComponent,
          obj,
          option
        );
        dialog.closed.subscribe((e) => {
          if (e && e.event) {
            var idx = this.lstCampContacts.findIndex(
              (x) => x.recID == data.recID
            );
            if (idx != -1) {
              this.lstCampContacts[idx].leadStatus = '11';
            }
            this.lstCampContacts = JSON.parse(
              JSON.stringify(this.lstCampContacts)
            );

            this.detector.detectChanges();
          }
        });
      });
    }
  }

  //#region scroll heigt
  rollHeight() {
    let classViewDetail =
      document.getElementsByClassName('codx-detail-main')[0];
  }
  //#region
}
