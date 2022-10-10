import { ChangeDetectorRef, Component, ElementRef, Injector, Input, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { ApiHttpService, AuthStore, ButtonModel, CallFuncService, CodxListviewComponent, CRUDService, DialogRef, NotificationsService, RequestOption, ScrollComponent, SidebarModel, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { PopupAddPositionsComponent } from './popup-add-positions/popup-add-positions.component';
import { catchError, map, finalize, Observable, of } from 'rxjs';

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

  constructor(
    private changedt: ChangeDetectorRef,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private codxHr: CodxHrService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    inject: Injector
  ) {
    super(inject);
    var dataSv = new CRUDService(inject);
    // dataSv.request.gridViewName = 'grvPositions';
    // dataSv.request.entityName = 'HR_Positions';
    // dataSv.request.formName = 'Positions';
    //dataSv.request.pageSize = 15;
    this.dtService = dataSv;
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
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


  ngAfterViewInit(): void {
    this.views = [
      // {
      //   id: '1',
      //   type: ViewType.treedetail,
      //   active: false,
      //   sameData: true,
      //   model: {
      //     resizable: true,
      //     template: this.templateTree,
      //     panelRightRef: this.templateDetail
      //   }
      // },
      {
        id: '2',
        type: ViewType.treedetail,
        active: true,
        sameData: true,
        model: {
          resizable: true,
          template: this.templateTree,
          panelRightRef: this.itemViewList,
        }
      },
    ];
    this.view.dataService.parentIdField = 'ReportTo';
    this.changedt.detectChanges();
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

  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.dialog = this.callfunc.openSide(PopupAddPositionsComponent, this.view.dataService.dataSelected, option);
      this.dialog.closed.subscribe(e => {
        console.log(e);
      })
    });
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
      this.dialog = this.callfunc.openSide(PopupAddPositionsComponent, 'edit', option);
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
      this.dialog = this.callfunc.openSide(PopupAddPositionsComponent, 'copy', option);
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
          this.changedt.detectChanges();
        }
      }
      );

  }

  loadEmployByCountStatus(p, posID, status) {
    this.listEmployee = [];
    this.listEmployeeSearch = [];
    var stt = status.split(';');
    this.codxHr.loadEmployByCountStatus(posID, stt)
      .subscribe(response => {
        this.listEmployee = response;
        this.listEmployeeSearch = response;
        this.countResource = response.length;
        p.open();
        this.popover = p;
      });
  }

  selectedChange(evt: any) {
    // this.itemSelected = val.data;
    // this.dt.detectChanges();
    if (evt && evt.data) {
      this.orgUnitID = evt.data.orgUnitID;
      this.changedt.detectChanges();
    }
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  onSelectionChanged(evt: any) {
    ScrollComponent.reinitialization();
    if (this.listview) {
      if (!this.isLoaded)
        this.listview.dataService.setPredicate(this.predicate, this.dataValue.split(';')).subscribe(res => {
        });
      else
        this.isLoaded = false;
    } else {
      this.isLoaded = true;
      if (evt && evt.data) {
        this.predicate = "PositionID=@0";
        this.dataValue = evt.data.positionID;
      }
      this.changedt.detectChanges();
    }
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