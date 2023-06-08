import {
  ChangeDetectorRef,
  Component,
  Injector,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  ButtonModel, CodxTreeviewComponent,
  CRUDService,
  DialogModel,
  DialogRef,
  NotificationsService,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType
} from 'codx-core';
import { CodxAdService } from 'projects/codx-ad/src/public-api';
import { PopupAddPositionsComponent } from './popup-add-positions/popup-add-positions.component';
import { ReportinglineDetailComponent } from './reportingline-detail/reportingline-detail.component';

@Component({
  selector: 'lib-reportingline',
  templateUrl: './reportingline.component.html',
  styleUrls: ['./reportingline.component.css'],
  // encapsulation: ViewEncapsulation.None,
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
  employees: any = [];
  itemSelected: any;
  orgUnitID: any;
  ListViewService: CRUDService;
  detailComponent: any = null;
  dataSelected: any = null;
  positionID: string = '';
  request: ResourceModel;
  codxTreeView: CodxTreeviewComponent = null;
  isCorporation: boolean;
  grvSetup: any[] = [];
  constructor(
    inject: Injector,
    private adService: CodxAdService
  ) {
    super(inject);
  }

  onInit(): void {
    this.funcID = this.router.snapshot.params['funcID'];
    this.request = new ResourceModel();
    this.request.service = 'HR';
    this.adService.getListCompanySettings()
      .subscribe((res) => {
        if (res) {
          this.isCorporation = res.isCorporation;
        }
      });
    this.getFunction(this.funcID);

  }
  getFunction(funcID: string) {
    if (funcID) {
      this.cache.functionList(funcID).subscribe((func: any) => {
        if (func) this.funcID = func;
        if (func?.formName && func?.gridViewName) {
          this.cache
            .gridViewSetup(func.formName, func.gridViewName)
            .subscribe((grd: any) => {
              if (grd) {
                this.grvSetup = grd;
              }
            });
        }
      });
    }
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

  viewChange(event: any) { }
  orgChartViewInit(component: any) {
    if (component) {
      this.detailComponent = component;
    }
  }
  // btn add toolbar click
  btnClick(event: any) {
    if (this.view) {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '800px';
      if (this.views[1].active) {
        // modeView tree-orgchart
        let currentView: any = this.view.currentView;
        if (currentView) {
          this.codxTreeView = currentView.currentComponent?.treeView;
        }
      }
      this.view.dataService.addNew().subscribe((result: any) => {
        if (result) {
          let object = {
            //dataService: this.view.dataService,
            formModel: this.view.formModel,
            data: result,
            funcID: this.funcID,
            isAdd: true,
            title: event.text,
            isCorporation: this.isCorporation,
          };
          let form = this.callfc.openSide(
            PopupAddPositionsComponent,
            object,
            option,
          );
          form.closed.subscribe((res: any) => {
            if (res?.event) {
              let node = res.event;
              this.codxTreeView.setNodeTree(node);
              this.detectorRef.detectChanges();
            }
          });
          this.detectorRef.detectChanges();
        }
      });
    }
  }
  // click moreFunction
  clickMF(event: any, data: any = null) {
    if (event) {
      switch (event.functionID) {
        case 'SYS03':
          this.edit(event, data);
          break;
        case 'SYS04':
          this.copy(event, data);
          break;
        case 'SYS02':
          this.delete(data);
          break;
      }
    }
  }
  // edit position
  edit(event: any, data: any) {
    if (this.view && data && event) {
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(data));
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '800px';
      this.view.dataService
        .edit(this.view.dataService.dataSelected)
        .subscribe((result) => {
          let object = {
            //dataService: this.view.dataService,
            formModel: this.view.formModel,
            data: result,
            funcID: this.funcID,
            isAdd: false,
            title: event.text,
            isCorporation: this.isCorporation,
          };
          this.callfc.openSide(
            PopupAddPositionsComponent, object, option, this.funcID)
            .closed.subscribe(res => {
              if (res) {

              }
            });

        });
    }
  }
  // coppy position
  copy(event: any, data: any) {
    if (event && data) {
      this.view.dataService.dataSelected = data;
      this.view.dataService.copy().subscribe((res) => {
        if (res) {
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.Width = '800px';
          let object = {
            //dataService: this.view.dataService,
            formModel: this.view.formModel,
            data: res,
            funcID: this.funcID,
            isAdd: true,
            title: event.text,
          };
          this.callfc.openSide(PopupAddPositionsComponent, object, option, this.funcID)
            .closed.subscribe((res) => {
              if (res?.event?.save) {
                let node = res.event.save.data;
                this.codxTreeView.setNodeTree(node);
              }
            });
        }
      });
    }

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
  loadEmployByCountStatus() { }

  // selected data
  onSelectionChanged(event) {
    if (this.view) {
      // let viewActive = this.view.views.find((e) => e.active == true);
      // if (viewActive?.id == '1') return;
      this.dataSelected = event.data;
      this.positionID = event.data.positionID;
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
