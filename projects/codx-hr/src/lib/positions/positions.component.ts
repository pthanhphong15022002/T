import { ChangeDetectorRef, Component, ElementRef, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { ApiHttpService, AuthStore, ButtonModel, CallFuncService, CodxListviewComponent, DialogRef, NotificationsService, RequestOption, SidebarModel, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { PopupAddPositionsComponent } from './popup-add-positions/popup-add-positions.component';
import { catchError, map, finalize, Observable, of } from 'rxjs';

@Component({
  selector: 'lib-positions',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.css']
})
export class PositionsComponent  extends UIComponent {
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

  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('p') public popover: NgbPopover;
  @ViewChild('templateTree') templateTree: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail: TemplateRef<any>;
  @ViewChild("listview") listview: CodxListviewComponent;
  popoverCrr: any;
  allRoles: any;
  lstRoles: any;
  searchField: any;
  listEmployee = [];
  popoverDataSelected: any;
  orgUnitID: any;

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
      {
        id: '1',
        type: ViewType.treedetail,
        active: false,
        sameData: true,
        model: {
          resizable: true,
          template: this.templateTree,
          panelRightRef: this.templateDetail
        }
      },
      {
        id: '2',
        type: ViewType.treedetail,
        active: true,
        sameData: true,
        model: {
          resizable: true,
          template: this.templateTree,
          panelRightRef: this.panelRightRef,
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

    opt.data = itemSelected.employeeID;
    return true;
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.delete([this.view.dataService.dataSelected], true, (opt,) =>
      this.beforeDel(opt)).subscribe((res) => {
        if (res[0]) {
          this.itemSelected = this.view.dataService.data[0];
        }
      }
      );
  }

  loadEmployByCountStatus(p, posID, status) {
    this.listEmployee = [];
    this.listEmployeeSearch = [];
    var stt = status.split(';');
    // this.popover["_elementRef"] = new ElementRef(el);
    
    // if (p.isOpen()) {
    //   p.close();
    // }
    // this.posInfo = {};
   
    this.codxHr.loadEmployByCountStatus(posID, stt)
      .subscribe(response => {

        this.listEmployee = response;
        this.listEmployeeSearch = response;
        this.countResource = response.length;
        
        p.open();
        this.popover = p;  

      });
    // this.codxHr.loadEmployByCountStatus(posID, stt).pipe()
    //   .subscribe(response => {

    //     this.employees = response || [];
    //     this.popover.open();

    //   });
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

  async onSelectionChanged($event) {
   // await this.setEmployeePredicate($event.dataItem.orgUnitID);
    // this.employList.onChangeSearch();
  }

  setEmployeePredicate(orgUnitID): Promise<any> {
    return new Promise((resolve, reject) => {
      this
        .loadEOrgChartListChild(orgUnitID)
        .pipe()
        .subscribe((response) => {
          if (response) {
            var v = '';
            var p = '';
            for (let index = 0; index < response.length; index++) {
              const element = response[index];
              if (v != '') v = v + ';';
              if (p != '') p = p + '||';
              v = v + element;
              p = p + 'OrgUnitID==@' + index.toString();
            }
            // this.employList.predicate = p;
            // this.employList.dataValue = v;
          }
          resolve('');
        });
    });
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
