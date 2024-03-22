import {
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ButtonModel,
  CodxListviewComponent,
  FormModel,
  ResourceModel,
  UIComponent,
  ViewModel,
  ViewType,
  ViewsComponent,
} from 'codx-core';
import { catchError, map, Observable, of, finalize, Subscription } from 'rxjs';

@Component({
  selector: 'lib-emp-contacts',
  templateUrl: './emp-contacts.component.html',
  styleUrls: ['./emp-contacts.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EmpContactsComponent extends UIComponent {
  actionSub: Subscription;
  displayCard = false;
  predicate = 'Status<@0';
  dataValue = '90';
  columnsGrid = [];
  @ViewChild('chartOrg') chartOrg: CodxListviewComponent;
  // @ViewChild('chart') chart: TemplateRef<any>;
  // @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('cardTemp') cardTemp: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  @ViewChild('itemStatusName', { static: true }) itemStatusName: TemplateRef<any>;
  @ViewChild('itemBirthDay', { static: true }) itemBirthDay: TemplateRef<any>;
  @ViewChild('itemJoinOn', { static: true }) itemJoinOn: TemplateRef<any>;
  @ViewChild('itemEmployee', { static: true }) itemEmployee: TemplateRef<any>;
  @ViewChild('itemPhone', { static: true }) itemPhone: TemplateRef<any>;
  @ViewChild('itemEmail', { static: true }) itemEmail: TemplateRef<any>;
  //@ViewChild('view') codxView!: ViewsComponent;

  @ViewChild('tmpTree') tmpTree: TemplateRef<any>;
  @ViewChild('tmpTreeItemDetail') tmpTreeItemDetail: TemplateRef<any>;
  @ViewChild('tmpTreeItemDetailCard') tmpTreeItemDetailCard: TemplateRef<any>;


  @ViewChild('templateList') templateList: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate: TemplateRef<any>;

  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];

  request: ResourceModel;
  itemSelected: any;
  grvSetup: any;

  service = 'HR';
  assemblyName = 'ERM.Business.HR';
  entityName = 'HR_Employees';
  className = 'EmployeesBusiness';
  method = 'GetListEmployeeAsync';
  idField = 'employeeID';

  constructor(inject: Injector,
    //private changedt: ChangeDetectorRef,
  ) { super(inject); }

  ngOnDestroy(): void { }

  onInit(): void {
    this.funcID = this.router.snapshot.params['funcID'];
    this.buttons = [
      {
        id: '1',
        icon: 'icon-format_list_bulleted icon-18',
        text: ' List',
      },
      {
        id: '2',
        icon: 'icon-appstore icon-18',
        text: ' Card',
      },
    ];
    this.columnsGrid = [
      {
        field: 'employeeName',
        headerText: 'Họ và tên',
        width: 200,
        template: this.itemEmployee,
      },
      {
        field: 'birthDay',
        headerText: 'Ngày sinh',
        width: 100,
        template: this.itemBirthDay,
      },
      {
        field: 'phone',
        headerText: 'Di động',
        width: 100,
        template: this.itemPhone,
      },
      {
        field: 'email',
        headerText: 'Email',
        width: 200,
        template: this.itemEmail,
      },
      {
        field: 'joinedOn',
        headerText: 'Ngày vào làm',
        width: 140,
        template: this.itemJoinOn,
      },
      {
        field: 'statusName',
        headerText: 'Trạng thái',
        template: this.itemStatusName,
        width: 140,
      },
    ];
    this.getFunction(this.funcID);
  }

  ngAfterViewInit(): void {
    this.request = new ResourceModel();
    this.request.service = 'HR';
    this.request.assemblyName = 'ERM.Business.HR';
    this.request.className = 'EmployeesBusiness';
    this.request.method = 'GetListEmployeeAsync';
    this.request.autoLoad = false;
    this.request.parentIDField = 'ParentID';
    this.request.idField = 'orgUnitID';

    this.views = [
      // {
      //   id: '0',
      //   type: ViewType.grid,
      //   sameData: true,
      //   model: {
      //     resources: this.columnsGrid,
      //   },
      // },
      {
        id: '1',
        type: ViewType.list,
        sameData: true,
        model: {
          template: this.templateList,
          headerTemplate: this.headerTemplate,
        },
      },
      {
        id: '2',
        type: ViewType.card,
        sameData: true,
        model: {
          template: this.cardTemp,
        },
      },
      // {
      //   id: '3',
      //   type: ViewType.tree_list,
      //   sameData: false,
      //   request: this.request,
      //   model: {
      //     resizable: false,
      //     template: this.tmpTree,
      //     panelRightRef: this.tmpTreeItemDetail,
      //     resourceModel: { parentIDField: 'ParentID', idField: 'OrgUnitID' },
      //   },
      // },
      // {
      //   id: '4',
      //   type: ViewType.tree_card,
      //   sameData: false,
      //   request: this.request,
      //   model: {
      //     resizable: false,
      //     template: this.tmpTree,
      //     panelRightRef: this.tmpTreeItemDetailCard,
      //     resourceModel: { parentIDField: 'ParentID', idField: 'OrgUnitID' },
      //   }
      // }
    ];

    this.detectorRef.detectChanges();
  }
  changeDataMF(evt:any,data:any){
    if(evt){
      
    }
  }
  selectedChange(event: any): void {
    this.itemSelected = event?.data;
    this.detectorRef.detectChanges();
  }

  viewChanging(event: any) {
    if (event?.id === '3' || event?.id === '4') {
      this.view.dataService.parentIdField = 'ParentID';
      this.view.dataService.idField = 'orgUnitID';
      this.view.idField = 'orgUnitID';
    } else {
      this.view.dataService.parentIdField = '';
      this.view.dataService.idField = 'employeeID';
      this.view.idField = 'employeeID';

    }
    this.detectorRef.detectChanges();
  }
  getFunction(funcID: string) {
    if (funcID) {
      this.cache.functionList(funcID).subscribe((func: any) => {
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
  search($event, ele) {
    if ($event.keyCode === 13) {
      //this.chartOrg.SearchText = $(ele).val();
      this.chartOrg.onChangeSearch();
    }
  }

  placeholder(field: string) {
    var headerText = this.grvSetup[field].headerText as string;
    return `<span class="place-holder">${headerText}</span>`
  }
  hasDataValue(data: string, field: string) {
    return `<span #data${field}Field class="data-text-color data-text-width line-clamp line-clamp-1"
        [ngbTooltip]="${field}Tooltip">${data}</span>
        `
  }
}
