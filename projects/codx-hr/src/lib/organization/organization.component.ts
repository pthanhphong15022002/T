import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import {
  ButtonModel,
  CodxTreeviewComponent,
  CRUDService,
  FormatvaluePipe,
  FormModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { map, Observable, of } from 'rxjs';
import { CodxHrService } from '../codx-hr.service';
import { PopupAddOrganizationComponent } from './popup-add-organization/popup-add-organization.component';

@Component({
  selector: 'lib-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrgorganizationComponent extends UIComponent {
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  orgUnitID: string = '';
  parentID: string = '';
  detailComponent: any;
  dataDetail: any = new Array();
  dataCard: any = new Array();
  treeComponent?: CodxTreeviewComponent;
  currentView: any;
  currView?: TemplateRef<any>;
  dtService: CRUDService;
  numberLV: string = '3';
  onlyDepartment?: boolean = false;
  formModelEmployee: FormModel = {
    formName: 'Employees',
    gridViewName: 'grvEmployees',
  };
  setupEmp?: any;
  start = '<span class="opacity-50">';
  end = '</span>';
  funcID: any;
  @ViewChild('templateTree') templateTree: TemplateRef<any>;
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  @ViewChild('templateDetail') templateOrgchart: TemplateRef<any>;
  @ViewChild('templateListView') templateListView: TemplateRef<any>;
  constructor(
    inject: Injector,
    private hrservice: CodxHrService,
    private change: ChangeDetectorRef
  ) {
    super(inject);
    this.dtService = new CRUDService(inject);
    this.router.params.subscribe((params) => {
      if (params) this.funcID = params['funcID'];
    });
  }

  onInit(): void {
    this.router.params.subscribe((params) => {
      if (params) {
        this.funcID = params['funcID'];
        if (!this.funcID.includes('WP')) {
          this.button = {
            id: 'btnAdd',
          };
        }
      }
    });
    if (!this.setupEmp) {
      this.cache
        .gridViewSetup(
          this.formModelEmployee.formName,
          this.formModelEmployee.gridViewName
        )
        .subscribe((res) => {
          if (res) {
            this.setupEmp = res;
          }
        });
    }
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.tree_orgchart,
        sameData: true,
        active: false,
        model: {
          resizable: true,
          template: this.templateTree,
          panelRightRef: this.templateRight,
          template2: this.templateOrgchart,
        },
      },
      {
        id: '2',
        type: ViewType.tree_list,
        sameData: true,
        active: true,
        model: {
          resizable: true,
          template: this.templateTree,
          panelRightRef: this.templateRight,
          template2: this.templateListView,
        },
      },
    ];
    this.view.dataService.parentIdField = 'ParentID';
    this.detectorRef.detectChanges();
  }

  orgChartAfterView(evt: any) {
    this.detailComponent = evt;
  }

  onSelectionChanged(evt: any) {
    var data = evt.data || evt;
    if (data && this.orgUnitID != data.orgUnitID) {
      this.orgUnitID = data.orgUnitID;
      this.parentID = data.parentID;
      this.hrservice
        .loadOrgchart(
          this.orgUnitID,
          this.parentID,
          this.numberLV,
          this.onlyDepartment
        )
        .subscribe((res) => {
          if (res) {
            this.dataDetail = res.Data as any[];
            var dataTemp = JSON.parse(JSON.stringify(this.dataDetail)) as any[];
            this.dataCard = dataTemp.filter((item) => {
              if (
                item.departmentCode === this.orgUnitID ||
                item.parentID === this.orgUnitID
              )
                return item;
            });
            var data = JSON.parse(JSON.stringify(this.dataCard));
            if (data.length > 1) {
              var index = data.findIndex((x) => x.orgUnitType == '1');
              var dataCompany = data[index];
              data.splice(index, 1);
              data.unshift(dataCompany);
            }
            this.dataCard = data;
          }
        });
      this.detectorRef.detectChanges();
    }
  }

  btnClick(e) {
    var headerText = '';
    if (e.text) headerText = e.text;
    this.add(headerText);
  }

  add(headerText) {
    this.currentView = this.view.currentView;
    if (this.currentView)
      this.treeComponent = this.currentView.currentComponent?.treeView;
    this.view.dataService.addNew().subscribe(() => {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.formModel;
      var dialog = this.callfc.openSide(
        PopupAddOrganizationComponent,
        {
          function: this.funcID,
          orgUnitID: this.orgUnitID,
          detailComponent: this.detailComponent,
          treeComponent: this.treeComponent,
          headerText: headerText,
          isModeAdd: true,
        },
        option
      );
      dialog.closed.subscribe((res) => {
        var data = res.event?.save;
        if (data) {
          this.dataCard.forEach((res) => {
            if (res.orgUnitID == data.orgUnitID) res['modifiedOn'] = new Date();
          });
        }
      });
    });
  }

  edit(data, headerText) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.currentView = this.view.currentView;
    if (this.currentView)
      this.treeComponent = this.currentView.currentComponent?.treeView;
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe(() => {
        let option = new SidebarModel();
        option.Width = '550px';
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.formModel;
        var dialog = this.callfc.openSide(
          PopupAddOrganizationComponent,
          {
            function: this.view.function,
            orgUnitID: this.orgUnitID,
            detailComponent: this.detailComponent,
            treeComponent: this.treeComponent,
            headerText: headerText,
            isModeAdd: false,
          },
          option
        );
        dialog.closed.subscribe((res) => {
          var data = res.event?.update;
          if (data && this.dataCard) {
            // this.dataCard.forEach((x) => {
            //   if (x.orgUnitID == data.orgUnitID) {
            //     x.departmentName = data.departmentName;
            //     x['modifiedOn'] = new Date();
            //   }
            // });
            var index = this.dataCard.findIndex(
              (x) => x.orgUnitID == data.orgUnitID
            );
            this.dataCard[index] = data;
            this.dataCard[index]['modifiedOn'] = new Date();
          }
        });
      });
  }

  delete(data) {
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (option: any) =>
        this.beforeDelete(option, this.view.dataService.dataSelected)
      )
      .subscribe((res: any) => {
        if (res) {
          this.dataCard = this.dataCard.filter(
            (x) => x.orgUnitID != data.orgUnitID
          );
        }
      });
    this.change.detectChanges();
  }

  beforeDelete(op: any, data) {
    op.assemblyName = 'ERM.Business.HR';
    op.className = 'OrganizationUnitsBusiness';
    op.methodName = 'DeleteAsync';
    op.data = data?.orgUnitID;
    return true;
  }

  clickMF(evt: any, data: any) {
    var headerText = '';
    if (evt.text) headerText = evt.text;
    switch (evt.functionID) {
      case 'SYS03':
        this.edit(data, headerText);
        break;
      case 'SYS02':
        this.delete(data);
        break;
    }
  }

  changeDataMF(e: any, data: any) {}

  changeView(evt: any) {
    this.currView = null;
    if (evt.view) {
      this.currView = evt.view.model.template2;
    }
  }

  loadEmployList(e, orgid, status) {}
}
