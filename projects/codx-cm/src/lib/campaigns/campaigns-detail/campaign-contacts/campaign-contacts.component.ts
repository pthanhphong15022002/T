import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService, DataRequest, FormModel } from 'codx-core';
import { Observable, finalize, firstValueFrom, map } from 'rxjs';

@Component({
  selector: 'codx-campaign-contacts',
  templateUrl: './campaign-contacts.component.html',
  styleUrls: ['./campaign-contacts.component.css']
})
export class CampaignContactsComponent implements OnInit{
  @Input() transID: any;
  @Input() objectType: any;
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
  predicates = 'TransID=@0';
  dataValues = '';
  service = 'CM';
  currentRecID = '';
  assemblyName = 'ERM.Business.CM';
  className = 'CampaignsBusiness';
  method = 'GetListCampaignContactsAsync';
  id: any;
  loaded: boolean;
  columnsGrid = [];
  gridViewSetup: any;
  constructor(private api: ApiHttpService, private detector: ChangeDetectorRef, private cache: CacheService){

  }
  async ngOnInit() {
    this.gridViewSetup = await firstValueFrom(this.cache.gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName));

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
        if (changes['transID']?.currentValue == this.id) return;
        this.id = changes['transID']?.currentValue;
        this.getList();
      } else {
        if (!this.loaded) this.loaded = true;
      }
    }

  }

  getList() {
    this.loaded = false;
    this.request.predicates = this.predicates;
    this.request.dataValues = this.transID;
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

}
