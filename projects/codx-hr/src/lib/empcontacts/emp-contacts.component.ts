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
} from 'codx-core';
import { catchError, map, Observable, of, finalize, Subscription } from 'rxjs';

@Component({
  selector: 'lib-emp-contacts',
  templateUrl: './emp-contacts.component.html',
  styleUrls: ['./emp-contacts.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EmpContactsComponent extends UIComponent {
  console = console;
  actionSub: Subscription;
  displayCard = false;
  predicate = 'Status<@0';
  dataValue = '90';
  columnsGrid = [];
  @ViewChild('chartOrg') chartOrg: CodxListviewComponent;
  @ViewChild('employList') employList: CodxListviewComponent;
  isShowTree = true;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  // @ViewChild('chart') chart: TemplateRef<any>;
  // @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('cardTemp') cardTemp: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  @ViewChild('itemStatusName', { static: true })
  itemStatusName: TemplateRef<any>;
  @ViewChild('itemBirthDay', { static: true }) itemBirthDay: TemplateRef<any>;
  @ViewChild('itemJoinOn', { static: true }) itemJoinOn: TemplateRef<any>;
  @ViewChild('itemEmployee', { static: true }) itemEmployee: TemplateRef<any>;
  @ViewChild('itemPhone', { static: true }) itemPhone: TemplateRef<any>;
  @ViewChild('itemEmail', { static: true }) itemEmail: TemplateRef<any>;
  @ViewChild('view') codxView!: any;

  @ViewChild('tmpTree') tmpTree: TemplateRef<any>;
  @ViewChild('tmpTreeItemDetail') tmpTreeItemDetail: TemplateRef<any>;
  @ViewChild('tmpTreeItemDetailCard') tmpTreeItemDetailCard: TemplateRef<any>;


  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];

  request: ResourceModel;
  orgUnitID : string = '' ;

  constructor(inject: Injector,
    //private changedt: ChangeDetectorRef,
  ) { super(inject); }

  ngOnDestroy(): void { }

  onInit(): void {

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
  }

  ngAfterViewInit(): void {
    this.request = new ResourceModel();
    this.request.service = 'HR';
    this.request.assemblyName = 'ERM.Business.HR';
    this.request.className = 'EmployeesBusiness';
    this.request.method = 'GetModelFormEmployAsyncNew';
    this.request.autoLoad = false;
    this.request.parentIDField = 'ParentID';
    this.request.idField = 'orgUnitID';

    this.views = [
      {
        id: '1',
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          resources: this.columnsGrid,
          panelLeftRef: this.panelLeftRef,
        },
      },
      {
        id: '2',
        type: ViewType.card,
        active: true,
        sameData: true,
        model: {
          template: this.cardTemp,
        },
      },
      {
        id: '3',
        type: ViewType.tree_list,
        active: false,
        sameData: true,
        //request: this.request,
        model: {
          resizable: true,
          template: this.tmpTree,
          panelRightRef: this.tmpTreeItemDetail,
          resourceModel: { parentIDField: 'ParentID' , idField: 'OrgUnitID' },
        },
      },
      {
        id: '4',
        type: ViewType.tree_card,
        active: false,
        sameData: true,
        request: this.request,
        model:{
          resizable: true,
          template: this.tmpTree,
          panelRightRef: this.tmpTreeItemDetailCard,
          resourceModel: { parentIDField: 'ParentID' , idField: 'OrgUnitID' },
        }
      }
    ];
    this.detectorRef.detectChanges();
  }

  selectedChange(event: any): void {
    this.orgUnitID = event?.data?.orgUnitID;
    this.detectorRef.detectChanges();
  }

  viewChanged(event: any) {
    if (event?.view?.id === '3' || event?.view?.id === '4') {
      this.view.dataService.parentIdField = 'ParentID';
    } else {
      this.view.dataService.parentIdField = '';
    }
  }
  search($event, ele) {
    if ($event.keyCode === 13) {
      //this.chartOrg.SearchText = $(ele).val();
      this.chartOrg.onChangeSearch();
    }
  }
  searchEmp($event) {
    this.employList.searchText = $event;
    this.employList.onChangeSearch();
  }
  async onSelectionChanged($event) {
    await this.setEmployeePredicate($event.dataItem.orgUnitID);
    this.employList.onChangeSearch();
  }

  setEmployeePredicate(orgUnitID): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loadEOrgChartListChild(orgUnitID)
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
            this.employList.predicate = p;
            this.employList.dataValue = v;
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

  changeView(evt: any) { }

  requestEnded(evt: any) { }

  placeholder(
    value: string,
    formModel: FormModel,
    field: string
  ): Observable<string> {
    if (value) {
      return of(`<span>${value}</span>`);
    } else {
      return this.cache
        .gridViewSetup(formModel.formName, formModel.gridViewName)
        .pipe(
          map((datas) => {
            if (datas && datas[field]) {
              var gvSetup = datas[field];
              if (gvSetup) {
                if (!value) {
                  var headerText = gvSetup.headerText as string;
                  return `<span class="opacity-50">${headerText}</span>`;
                }
              }
            }

            return `<span class="opacity-50">${field}</span>`;
          })
        );
    }
  }
}
