import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutModel } from '@shared/models/layout.model';
import { ApiHttpService, CodxService, TenantStore, ViewModel, ViewsComponent } from 'codx-core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CodxHrService } from '../codx-hr.service';

@Component({
  selector: 'lib-hrparameters',
  templateUrl: './hrparameters.component.html',
  styleUrls: ['./hrparameters.component.css']
})
export class HRParametersComponent implements OnInit {
  tenant: string;
  func = {};
  range = [];
  parameter = [];
  titlePage = "Thiết lập";
  modelForm = { title: "", fieldName: 0, number: 0 };
  views: Array<ViewModel> = [];
  
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('notificationFedback') notificationFedback: ElementRef;
  @ViewChild('itemCategory') itemCategory: ElementRef;
  @ViewChild('itemRankDedication') itemRankDedication: ElementRef;
  public currentActive = 1;
  private funcID;
  private page;
  active: any;
  constructor(
    private api: ApiHttpService,
    // private changedr: ChangeDetectorRef,
    private ngxLoader: NgxUiLoaderService, private tenantStore: TenantStore,
    private router: Router, 
    private at: ActivatedRoute,
    private hrService: CodxHrService,
    // private notificationsService: NotificationsService,
    // private modalService: NgbModal,
    @Inject(DOCUMENT) private document: Document,
    // private el: ElementRef,
    // injector: Injector,
    public codxService: CodxService,
  ) {
    // super({
    //   title: "Setting", formName: "FEDSettings", gridViewName: "grvFEDSettings",
    //   hideAside: true,
    //   hideSubHeader: true,
    //   isShowFavorite: false,
    //   isShowBack: true,
    //   deepTh: 1
    // } as ModelPage, injector);

    this.tenant = this.tenantStore.get()?.tenant;
  }

  ngOnInit(): void {
    this.hrService.layoutcpn.next(new LayoutModel(true, 'Thiết lập', false, false));
    // this.LoadData();

    // this.at.queryParams.subscribe(params => {
    //   if (params.page) {
    //     this.funcID = params.funcID;
    //     this.router.navigate(["/" + this.tenant + "/hr/setting"], { queryParams: { funcID: "HR012" } });
    //     this.page = params.page;
    //   }
    //   if (params.funcID) {

    //     this.funcID = params.funcID;
    //   }
    // });
  }

  // action(para: ActionArg): void {

  // }

  // ngAfterViewInit() {
  //   if (this.page) {
  //     this.scrollToID(this.page);
  //     return;
  //   }
  // }
  // scroll(el: HTMLElement, numberActive) {
  //   el.scrollIntoView({ behavior: 'smooth' });
  //   this.currentActive = numberActive;
  // }
  // scrollToID(id) {
  //   let el = document.getElementById(id);
  //   el.scrollIntoView({ behavior: 'smooth' });
  // }
  // LoadData() {
  //   this.ngxLoader.start();
  //   this.api.exec("SYS", "FunctionListBusiness", "GetFuncByParentAsync", ['HRS']).subscribe((result) => {
  //     if (result)
  //       this.func = result;
  //       this.ngxLoader.stop();
  //   });
  // }
  
  // LoadCategory(func) {
  //   // console.log("url : ", this.tenant + "/" + func.url);
  //   // this.router.navigateByUrl(this.tenant + "/" + func.url)
  //   this.router.navigateByUrl('nationality'+ "/" + func.url);;
  // }

  // onSectionChange(data: any) {
  //   this.active = data.current;
  //   this.currentActive = data.index;
  // }

}
