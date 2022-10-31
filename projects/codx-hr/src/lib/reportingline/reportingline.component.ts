import { ChangeDetectorRef, Component, ElementRef, Injector, Input, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { ApiHttpService, AuthService, AuthStore, ButtonModel, CallFuncService, CodxListviewComponent, CRUDService, DialogModel, DialogRef, FormModel, NotificationsService, RequestOption, ScrollComponent, SidebarModel, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { PopupAddPositionsComponent } from './popup-add-positions/popup-add-positions.component';
import { catchError, map, finalize, Observable, of } from 'rxjs';
import { ReportinglineDetailComponent } from './reportingline-detail/reportingline-detail.component';

@Component({
  selector: 'lib-reportingline',
  templateUrl: './reportingline.component.html',
  styleUrls: ['./reportingline.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ReportinglineComponent extends UIComponent {

  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('p') public popover: NgbPopover;
  @ViewChild('templateTree') templateTree: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail: TemplateRef<any>;
  @ViewChild("listview") listview: CodxListviewComponent;
  
  
  @ViewChild("tmpTree") tmpTree:TemplateRef<any>;
  @ViewChild("tmpRightRef") tmpRightRef:TemplateRef<any>;
  @ViewChild("tmpOrgchart") tmpOrgchart:TemplateRef<any>;
  @ViewChild("tmpList") tmpList:TemplateRef<any>;
  @ViewChild("codxListView") codxListView:CodxListviewComponent;




  @Input() showMoreFunc = true;

  views: Array<ViewModel> = [];
  button?: ButtonModel;
  dialog!: DialogRef;
  moreFuncs: Array<ButtonModel> = [];
  funcID: string;
  posInfo: any = {};
  employees: any = [];
  itemSelected: any;
  countResource = 0;
  listEmployeeSearch = [];
  popoverCrr: any;
  allRoles: any;
  lstRoles: any;
  searchField: any;
  listEmployee = [];
  popoverDataSelected: any;
  orgUnitID: any;
  dtService: CRUDService;
  predicate = "";
  dataValue: string = "";
  isLoaded: boolean = false;
  positionID: any;
  currView:TemplateRef<any> = null;
  detailComponent: any = null;
  nodeSelected:any = null;
  constructor(
    private authStore: AuthService,
    private codxHr: CodxHrService,
    private notifiSv: NotificationsService,
    inject: Injector
  ) {
    super(inject);
    var dataSv = new CRUDService(inject);
    this.dtService = dataSv;
  }

  onInit(): void {
    this.funcID = this.router.snapshot.params['funcID'];
  }
  ngAfterViewInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.views = [
      {
        id: '1',
        type: ViewType.tree_orgchart,
        active: true,
        sameData: true,
        model: {
          resizable: true,
          template: this.tmpTree,
          panelRightRef: this.tmpRightRef,
          template2: this.tmpOrgchart
        }
      },
      {
        id: '2',
        type: ViewType.tree_list,
        active: false,
        sameData: true,
        model: {
          resizable: true,
          template: this.templateTree,
          panelRightRef: this.tmpRightRef,
          template2: this.tmpList
        }
      }
    ];
    this.view.dataService.parentIdField = 'ReportTo';
    this.detectorRef.detectChanges();
  }
  changeView(event: any) {
    this.currView = null;
    if (event.view && event.view?.model?.template2) {
      this.currView = event.view.model.template2;
    }
    this.detectorRef.detectChanges();
  }
  orgChartViewInit(component:any){
    if(component){
      this.detailComponent = component;
    }
  }
  doubleClickItem(data:any){
    if(data){
      let option = new DialogModel();
      option.DataService = this.view.dataService as CRUDService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      this.callfc.openForm(ReportinglineDetailComponent,"",0,0,"",data,"",option);
    }
  }
  searchName(e) {
    var listEmployeeSearch = [];
    this.searchField = e;
    if (this.searchField.trim() == '') {
      this.listEmployeeSearch = this.listEmployee;
      return;
    }
    this.listEmployee.forEach((res) => {
      var name = res.employeeName;
      if (name.toLowerCase().includes(this.searchField.toLowerCase())) {
        listEmployeeSearch.push(res);
      }
    });
    this.listEmployeeSearch = listEmployeeSearch;
  }
  action(e){
  }
  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
    }
  }
  edit(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(PopupAddPositionsComponent, 'edit', option);
    });
  }
  copy(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(PopupAddPositionsComponent, 'copy', option);
    });
  }
  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'Delete';
    opt.className = 'PositionsBusiness';
    opt.assemblyName = 'ERM.Business.HR';
    opt.data = itemSelected.positionID;
    return true;
  }
  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.delete([this.view.dataService.dataSelected], true, (opt,) =>
      this.beforeDel(opt)).subscribe((res) => {
        if (res) {
          this.itemSelected = this.view.dataService.data[0];
          this.detectorRef.detectChanges();
        }
      }
      );

  }
  loadEmployByCountStatus(){
  }
  selectedChange(evt: any) {
    // this.itemSelected = val.data;
    // this.dt.detectChanges();
    if (evt && evt.data) {
      this.orgUnitID = evt.data.orgUnitID;
      this.detectorRef.detectChanges();
    }
  }
  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }
  btnClick(){
    if(this.view)
    {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.callfc.openSide(PopupAddPositionsComponent, null, option);
    }
  }
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(PopupAddPositionsComponent, this.view.dataService.dataSelected, option);
      this.dialog.closed.subscribe(e => {
        console.log(e);
      })
    });
  }
  onSelectionChanged(event: any) {
    // ScrollComponent.reinitialization();
    // if (this.listview) {
    //   if (!this.isLoaded)
    //     this.listview.dataService.setPredicate(this.predicate, this.dataValue.split(';'))
    //     .subscribe();
    //   else
    //     this.isLoaded = false;
    // } else 
    // {
    //   this.isLoaded = true;
    //   if (event && event.data) {
    //     this.predicate = "PositionID=@0";
    //     this.dataValue = event.data.positionID;
    //   }
    //   this.detectorRef.detectChanges();
    // }

    if(event && event.data){
      this.nodeSelected = event.data;
      if(this.codxListView){
        if(!this.isLoaded){
          this.codxListView.dataService.setPredicate(this.predicate,this.dataValue.split(';')).subscribe(); 
        }
        else
        {
          this.isLoaded = false;
        }
      }
      else
      {
        this.isLoaded = true;
        if (this.nodeSelected.positionID) 
        {
          this.predicate = "PositionID = @0";
          this.dataValue = event.data.positionID;
        }
      }
      this.detectorRef.detectChanges();
    }
    console.log(event);
  }
  loadEOrgChartListChild(orgUnitID): Observable<any> {
    return this.api
      .call(
        'ERM.Business.HR',
        'OrganizationUnitsBusiness',
        'GetOrgChartListChildAsync',
        orgUnitID
      )
      .pipe(
        map((data: any) => {
          if (data.error) return;
          return data.msgBodyData[0];
        }),
        catchError((err) => {
          return of(undefined);
        }),
        finalize(() => null)
      );
  }
}