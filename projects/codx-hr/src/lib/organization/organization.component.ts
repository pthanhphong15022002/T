import {
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
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
  styleUrls: ['./organization.component.css'],
})
export class OrgorganizationComponent extends UIComponent {
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  orgUnitID: string = '';
  parentID: string = '';
  detailComponent: any;
  dataDetail: any[] = [];
  dataCard: any[] = [];
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
  @ViewChild('templateTree') templateTree: TemplateRef<any>;
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  @ViewChild('templateDetail') templateOrgchart: TemplateRef<any>;
  @ViewChild('templateCard') templateCard: TemplateRef<any>;
  constructor(inject: Injector, private hrservice: CodxHrService) {
    super(inject);
    this.dtService = new CRUDService(inject);
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
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
        active: true,
        model: {
          resizable: true,
          template: this.templateTree,
          panelRightRef: this.templateRight,
          template2: this.templateOrgchart,
        },
      },
      {
        id: '2',
        type: ViewType.tree_card, 
        sameData: true,
        active: false,
        model: {
          resizable: true,
          template: this.templateTree,
          panelRightRef: this.templateRight,
          template2: this.templateCard,
        },
      }
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
          }
        });
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
      option.Width = '550px';
      option.DataService = this.view.currentView.dataService;
      option.FormModel = this.view.formModel;
      this.callfc.openSide(PopupAddOrganizationComponent,null,option);
    }
    
  }
  add() {
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
          function: this.view.function,
          orgUnitID: this.orgUnitID,
          detailComponent: this.detailComponent,
          treeComponent: this.treeComponent,
        },
        option
      );
    });
  }

  clickMF(evt: any, data: any) {
    // this.itemSelected = data;
    // this.titleAction = evt.text;
    switch (evt.functionID) {
      case 'SYS01':
        this.add();
        break;
      case 'SYS03':
        //this.edit(data);
        break;
      case 'SYS04':
        //this.copy(data);
        break;
      case 'SYS02':
        //this.delete(data);
        break;
      case 'TMT05011':
        //this.viewDetail(e.data, data);
        break;
      case 'TMT05013':
        // this.updateStatusMeeting(e.data, data);
        break;
    }
  }

  changeDataMF(e: any, data: any) {
    // console.log(e, data);
  }

  changeView(evt: any) {
    this.currView = null;
    if (evt.view) {
      this.currView = evt.view.model.template2;
      // var type = evt.view.type;
      // if (type === ViewType.tree_orgchart) this.numberLV = '3';
      // else this.numberLV = '1';
      // if (!this.orgUnitID && !this.parentID) return;
      // this.hrservice
      //   .loadOrgchart(
      //     this.orgUnitID,
      //     this.parentID,
      //     this.numberLV,
      //     this.onlyDepartment
      //   )
      //   .subscribe((res) => {
      //     if (res) {
      //       this.dataDetail = res.Data as any[];
      //       var dataTemp = JSON.parse(JSON.stringify(this.dataDetail)) as any[];
      //       this.dataCard = dataTemp.filter((item) => {
      //         if (
      //           item.orgUnitID === this.orgUnitID ||
      //           item.parentID === this.orgUnitID
      //         )
      //           return item;
      //       });
      //     }
      //   });
    }
  }
}
