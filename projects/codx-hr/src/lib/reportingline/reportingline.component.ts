import {
  AfterContentInit,
  AfterViewInit,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import {
  ButtonModel,
  CodxFormDynamicComponent,
  CodxListviewComponent,
  CodxTreeviewComponent,
  CRUDService,
  DialogModel,
  DialogRef,
  NotificationsService,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddPositionsComponent } from './popup-add-positions/popup-add-positions.component';
import { catchError, map, finalize, Observable, of } from 'rxjs';
import { ReportinglineDetailComponent } from './reportingline-detail/reportingline-detail.component';

@Component({
  selector: 'lib-reportingline',
  templateUrl: './reportingline.component.html',
  styleUrls: ['./reportingline.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ReportinglineComponent extends UIComponent {
  @ViewChild('tmpTree') tmpTree: TemplateRef<any>;
  @ViewChild('tmpRightRef') tmpRightRef: TemplateRef<any>;
  @ViewChild('tmpOrgchart') tmpOrgchart: TemplateRef<any>;
  @ViewChild('tmpList') tmpList: TemplateRef<any>;

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
  ListViewService: CRUDService;
  predicates = 'PositionID = @0';
  dataValues: string = '';
  isLoaded: boolean = false;
  detailComponent: any = null;
  dataSelected: any = null;
  positionID: string = '';
  request: ResourceModel;
  constructor(private notifiSv: NotificationsService, inject: Injector) {
    super(inject);
  }

  onInit(): void {
    this.funcID = this.router.snapshot.params['funcID'];
    this.request = new ResourceModel();
    this.request.service = 'HR';
    // this.request.assemblyName = 'CO';
    // this.request.className = 'MeetingsBusiness';
    // this.request.method = 'GetListMeetingsAsync';
    //this.request.idField = 'meetingID';
  }
  ngAfterViewInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.views = [
      {
        id: '1',
        type: ViewType.list,
        active: true,
        sameData: true,
        model: {
          template: this.tmpList,
        },
      },
      {
        id: '2',
        type: ViewType.tree_orgchart,
        active: false,
        sameData: false,
        request: this.request,
        model: {
          resizable: true,
          template: this.tmpTree,
          panelRightRef: this.tmpOrgchart,
          resourceModel: { parentIDField: 'ReportTo' },
        },
      },
    ];
    //this.view.dataService.parentIdField = 'ReportTo';
    this.detectorRef.detectChanges();
  }

  viewChange(event: any) {
    if (event && event.view?.id) {
      if (event.view.id == '2') {
        //this.view.dataService.parentIdField = 'ReportTo';
        // this.view.dataService.load().subscribe(res=>{
        //   this.detectorRef.detectChanges();
        //   console.log(res);
        // })
      }
    }
  }
  orgChartViewInit(component: any) {
    if (component) {
      this.detailComponent = component;
    }
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
  edit(data: any) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    (this.view.dataService as CRUDService)
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(
          PopupAddPositionsComponent,
          'edit',
          option
        );
      });
  }
  copy(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(
          PopupAddPositionsComponent,
          'copy',
          option
        );
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
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.itemSelected = this.view.dataService.data[0];
          this.detectorRef.detectChanges();
        }
      });
  }
  loadEmployByCountStatus() {}

  btnClick() {
    if (this.view) {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.view.dataService.addNew().subscribe((result: any) => {
        if (result) {
          let data = {
            dataService: this.view.dataService,
            formModel: this.view.formModel,
            data: result,
            function: this.funcID,
            isAddMode: true,
          };
          let popup = this.callfc.openSide(
            CodxFormDynamicComponent,
            data,
            option,
            this.funcID
          );
          popup.closed.subscribe((res: any) => {
            if (res && res?.event?.save?.data) {
              let newNode = res.event.save.data;
              // this.codxTreeComponent.setNodeTree(newNode);
            }
          });
        }
      });
    }
  }

  onSelectionChanged() {
    if (this.view) {
      let viewActive = this.view.views.find((e) => e.active == true);
      if (viewActive && viewActive.id == '1') {
        return;
      }
      this.dataSelected = this.view.dataService.dataSelected;
      this.positionID = this.dataSelected.positionID;
      this.detectorRef.detectChanges();
    }
  }

  doubleClickItem(data: any) {
    if (this.view && data) {
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      this.callfc.openForm(
        ReportinglineDetailComponent,
        '',
        0,
        0,
        '',
        data,
        '',
        option
      );
    }
  }
}
