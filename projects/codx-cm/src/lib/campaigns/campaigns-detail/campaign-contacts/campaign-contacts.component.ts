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
} from 'codx-core';
import { Observable, finalize, firstValueFrom, map } from 'rxjs';
import { PopupAddCampaignContactComponent } from './popup-add-campaign-contact/popup-add-campaign-contact.component';
import { CodxCmService } from '../../../codx-cm.service';

@Component({
  selector: 'codx-campaign-contacts',
  templateUrl: './campaign-contacts.component.html',
  styleUrls: ['./campaign-contacts.component.scss'],
})
export class CampaignContactsComponent implements OnInit {
  @Input() transID: any;
  @Input() objectType: any;
  @Input() isShow: boolean;
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
        width: 250,
      },
      {
        headerTemplate: this.headerIndustries,
        template: this.tempIndustries,
        width: 250,
      },
      {
        headerTemplate: this.headerContact,
        template: this.tempContact,
        width: 250,
      },
      {
        headerTemplate: this.headerOwner,
        template: this.tempOwner,
        width: 150,
      },
      {
        headerTemplate: this.headerStatus,
        template: this.tempStatus,
        width: 150,
      },
      {
        headerTemplate: this.headerHistory,
        template: this.tempHistory,
        width: 80,
      },
    ];
    this.detector.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transID']) {
      if (
        changes['transID'].currentValue != null &&
        changes['transID']?.currentValue?.trim() != ''
      ) {
        this.id = changes['transID']?.currentValue;
        this.objectTypeOld = changes['objectType']?.currentValue;
        this.formModel.funcID =
          this.objectType == '1' ? 'CM0301_1' : 'CM0301_2';
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
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
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
                this.detector.detectChanges();
              }
            });
        }
      });
  }

  delete(data){
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiSv.alertCode('SYS030').subscribe((x) => {
      if (x.event.status == 'Y') {
        this.api.execSv<any>('CM','ERM.Business.CM','CampaignsBusiness','DeleteCampaignContactsAsync',[data?.recID]).subscribe(res => {
          if(res){
            let idx = this.lstCampContacts.findIndex(x => x.recID == data.recID);
            if(idx != -1){
              this.lstCampContacts.splice(idx, 1);
              this.lstCampContacts = JSON.parse(JSON.stringify(this.lstCampContacts));
            }
            this.notiSv.notifyCode('SYS008');
          }
          this.detector.detectChanges();
        });
      }
    });
  }
  //#endregion
}
