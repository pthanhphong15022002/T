import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ApiHttpService,
  ButtonModel,
  CacheService,
  CodxListviewComponent,
  DataRequest,
  FormModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { catchError, map, Observable, of, finalize, Subscription } from 'rxjs';

@Component({
  selector: 'lib-emp-contacts',
  templateUrl: './emp-contacts.component.html',
  styleUrls: ['./emp-contacts.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EmpContactsComponent implements OnInit {
  options = new DataRequest();
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

  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  constructor(
    private api: ApiHttpService,
    private changedt: ChangeDetectorRef,
    private cache: CacheService
  ) {}

  ngOnDestroy(): void {}

  ngOnInit(): void {
    this.options.pageLoading = true;
    this.options.pageSize = 50;
    this.options.entityName = 'HR_Employees';
    this.options.funcID = 'HR001';
    this.options.page = 1;
    this.options.searchText = '';
    this.options.unFavorite = true;
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
    ];
    this.changedt.detectChanges();
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

  changeView(evt: any) {}

  requestEnded(evt: any) {}

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
