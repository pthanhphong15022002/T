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
  ApiHttpService,
  CacheService,
  CallFuncService,
  DataRequest,
  DialogModel,
  FormModel,
} from 'codx-core';
import { Observable, finalize, firstValueFrom, map } from 'rxjs';
import { PopupAddCampaignContactComponent } from './popup-add-campaign-contact/popup-add-campaign-contact.component';

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
  constructor(
    private api: ApiHttpService,
    private detector: ChangeDetectorRef,
    private cache: CacheService,
    private callFc: CallFuncService
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
        width: 200,
      },
      {
        headerTemplate: this.headerIndustries,
        template: this.tempIndustries,
        width: 400,
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

  //#region  more
  clickMF(e, data) {}

  changeDataMF(e, data) {}
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
  //#endregion
}
