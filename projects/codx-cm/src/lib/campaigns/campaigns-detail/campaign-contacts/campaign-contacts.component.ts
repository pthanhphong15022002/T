import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxService,
  DataRequest,
  DialogModel,
  FormModel,
  NotificationsService,
  SidebarModel,
} from 'codx-core';
import { Observable, finalize, firstValueFrom, map } from 'rxjs';
import { PopupAddCampaignContactComponent } from './popup-add-campaign-contact/popup-add-campaign-contact.component';
import { CodxCmService } from '../../../codx-cm.service';
import { PopupAddLeadComponent } from '../../../leads/popup-add-lead/popup-add-lead.component';

@Component({
  selector: 'codx-campaign-contacts',
  templateUrl: './campaign-contacts.component.html',
  styleUrls: ['./campaign-contacts.component.scss'],
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
  @ViewChild('headerHistory') headerHistory: TemplateRef<any>;
  @ViewChild('tempHistory') tempHistory: TemplateRef<any>;
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
  className = 'CampaignsBusiness';
  method = 'GetListCampaignContactsAsync';
  id: any;
  objectTypeOld: any;
  loaded: boolean;
  columnsGrid = [];
  gridViewSetup: any;
  moreFuncAdd = '';
  url = '';
  titleAction = '';
  constructor(
    private api: ApiHttpService,
    private detector: ChangeDetectorRef,
    private cache: CacheService,
    private callFc: CallFuncService,
    private codxService: CodxService,
    private cmSv: CodxCmService,
    private notiSv: NotificationsService
  ) {}
  async ngOnInit() {
    this.gridViewSetup = await firstValueFrom(
      this.cache.gridViewSetup(
        this.formModel?.formName,
        this.formModel?.gridViewName
      )
    );
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
    this.columnsGrid = [
      {
        headerTemplate: this.headerCustomerName,
        template: this.tempCustomerName,
        width: !this.isDoubleClick ? 200 : 300,
      },
      {
        headerTemplate: this.headerIndustries,
        template: this.tempIndustries,
        width: !this.isDoubleClick ? 200 : 300,
      },
      {
        headerTemplate: this.headerContact,
        template: this.tempContact,
        width: !this.isDoubleClick ? 175 : 275,
      },
      {
        headerTemplate: this.headerOwner,
        template: this.tempOwner,
        width: !this.isDoubleClick ? 150 : 250,
      },
      {
        headerTemplate: this.headerStatus,
        template: this.tempStatus,
        width: !this.isDoubleClick ? 100 : 175,
      },
      {
        headerTemplate: this.headerHistory,
        template: this.tempHistory,
        width: !this.isDoubleClick ? 150 : 250,
      },
    ];
    this.detector.detectChanges();
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
        this.getFunctionList(funcID);
        this.getList();
      } else {
        if (!this.loaded) this.loaded = true;
      }
    }
  }

  getList() {
    this.loaded = false;
    this.request.predicates = this.predicates;
    this.request.dataValues = this.transID + ';' + this.objectType;
    this.request.entityName = 'CM_CampaignsContacts';
    this.request.pageLoading = false;
    this.request.funcID = this.formModel.funcID;
    this.fetch().subscribe(async (item) => {
      this.loaded = true;
      this.lstCampContacts = item ?? [];
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

  getFunctionList(funcID) {
    this.cache.functionList(funcID).subscribe((res) => {
      if (res) {
        this.url = res?.url;
      }
    });
  }

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
      default:
        break;
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
    this.cache
      .gridViewSetup('CMCampaignsContacts', 'grvCMCampaignsContacts')
      .subscribe((res) => {
        if (res) {
          let obj = {
            title: this.moreFuncAdd,
            transID: this.transID,
            objectType: this.objectType,
            gridViewSetup: res,
            lstCampContacts: this.lstCampContacts,
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
            'CampaignsBusiness',
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
      this.notiSv.alertCode('SYS030').subscribe((x) => {
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
}
