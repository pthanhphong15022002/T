import { ChangeDetectorRef, Component, Input, SimpleChanges, OnInit } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, CodxService, DataRequest, FormModel } from 'codx-core';
import { Observable, finalize, map } from 'rxjs';

@Component({
  selector: 'codx-campaign-deals',
  templateUrl: './campaign-deals.component.html',
  styleUrls: ['./campaign-deals.component.scss']
})
export class CampaignDealsComponent implements OnInit {

  @Input() transID: any;
  @Input() isShow: boolean;

  lstDatas = [];

  request = new DataRequest();
  predicates = 'CampaignID=@0';
  dataValues = '';
  service = 'CM';
  currentRecID = '';
  assemblyName = 'ERM.Business.CM';
  className = 'DealsBusiness';
  method = 'GetListDealsAsync';

  loaded: boolean;
  columnsGrid = [];
  gridViewSetup: any;
  formModel: FormModel = {
    formName: 'CMDeals',
    gridViewName: 'grvCMDeals',
    entityName: 'CM_Deals',
    funcID: 'CM0201'
  };

  id: any;
  url = '';
  constructor(private api: ApiHttpService,
    private detector: ChangeDetectorRef,
    private cache: CacheService,
    private callFc: CallFuncService,
    private codxService: CodxService,
    ){

  }
  ngOnInit(): void {
    this.getFunctionList('CM0201');
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

    this.detector.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transID']) {
      if (
        changes['transID'].currentValue != null &&
        changes['transID']?.currentValue?.trim() != ''
      ) {
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
    this.request.dataValues = this.transID ;
    this.request.entityName = 'CM_Deals';
    this.request.pageLoading = false;
    this.request.funcID = this.formModel.funcID;
    this.fetch().subscribe(async (item) => {
      this.loaded = true;
      this.lstDatas = item ?? [];
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

  getFunctionList(funcID){
    this.cache.functionList(funcID).subscribe((res) => {
      if(res){
        this.url = res?.url;
      }
    });
  }

  //#region navigate
  onEdit(data){
    // this.cmSv.navigateCampaign.next({recID: data.recID});
    this.codxService.navigate('', this.url, {
      recID: data?.rowData?.recID,
    });
  }
  //#endregion
}
