import { type } from 'os';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  UIComponent,
  ViewModel,
  ViewType,
  CacheService,
  RequestModel,
  RequestOption,
  DataRequest,
  SidebarModel,
  NotificationsService,
  UrlUtil,
  ButtonModel,
  CodxGridviewV2Component,
  ScrollComponent,
} from 'codx-core';
import { PopupAddJournalComponent } from '../journals/popup-add-journal/popup-add-journal.component';
import { NameByIdPipe } from '../pipes/nameById.pipe';
import { BehaviorSubject, combineLatest, map, tap } from 'rxjs';
import { Router } from '@angular/router';
import { JournalService } from '../journals/journals.service';
import { CodxAcService } from '../codx-ac.service';
import { IJournalPermission } from '../journals/interfaces/IJournalPermission.interface';
import { IJournal } from '../journals/interfaces/IJournal.interface';

@Component({
  selector: 'lib-test-journal',
  templateUrl: './journal-v2.component.html',
  styleUrls: ['./journal-v2.component.css'],
})
export class JournalV2Component extends UIComponent implements OnInit {
  views: Array<ViewModel> = [];
  subViews: Array<ViewModel> = [];
  viewActive: number = 5;
  functionName: string;
  vll86 = [];
  vll85 = [];
  func = [];
  vllJournalTypes064: any[] = [];
  randomSubject = new BehaviorSubject<number>(Math.random());
  nameByIdPipe = new NameByIdPipe();
  creaters: { journalNo: string; value: string }[];
  posters: { journalNo: string; value: string }[];
  ViewType = ViewType;
  statusFilter: any = 1;
  status: string;
  button: ButtonModel = {
    id: 'btnAdd',
  };
  @ViewChild('grid') grid: CodxGridviewV2Component;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('moreTemplate', { static: true }) moreTemplate: TemplateRef<any>;
  @ViewChild('header1Template', { static: true })
  header1Template: TemplateRef<any>;
  @ViewChild('header2Template', { static: true })
  header2Template: TemplateRef<any>;
  @ViewChild('header3Template', { static: true })
  header3Template: TemplateRef<any>;
  @ViewChild('column1Template', { static: true })
  column1Template: TemplateRef<any>;
  @ViewChild('column2Template', { static: true })
  column2Template: TemplateRef<any>;
  @ViewChild('column3Template', { static: true })
  column3Template: TemplateRef<any>;
  viewComponent = [];
  constructor(
    inject: Injector,
    private route: Router,
    private notiService: NotificationsService,
    private journalService: JournalService,
    private acService: CodxAcService
  ) {
    super(inject);
  }

  //#region Init
  override onInit(): void {
    this.viewComponent.push(this.viewActive);
    this.subViews = [
      {
        type: ViewType.list,
        hide: true,
        active: this.viewActive == ViewType.list,
      },
      {
        type: ViewType.smallcard,
        active: this.viewActive == ViewType.smallcard,
      },
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          resources: [
            {
              headerTemplate: this.header1Template,
              template: this.column1Template,
            },
            {
              headerTemplate: this.header2Template,
              template: this.column2Template,
              width: '50%',
            },
            {
              headerTemplate: this.header3Template,
              template: this.column3Template,
            },
          ],
          template2: this.moreTemplate,
        },
      },
    ];

    this.cache.valueList('AC077').subscribe((func) => {
      if (func) this.func = func.datas;
    });
    this.cache
      .valueList('AC064')
      .pipe(
        tap((t) => console.log('AC064', t)),
        map((d) => d.datas)
      )
      .subscribe((res) => {
        this.vllJournalTypes064 = res;
      });
    this.cache.valueList('AC085').subscribe((res) => {
      if (res) {
        this.vll85 = res.datas;
      }
    });
    this.cache.valueList('AC086').subscribe((res) => {
      if (res) {
        this.vll86 = res.datas;
        this.status = res.datas[0].value;
      }
    });
    combineLatest({
      users: this.journalService.getUsers(),
      userGroups: this.journalService.getUserGroups(),
      userRoles: this.journalService.getUserRoles(),
      random: this.randomSubject.asObservable(),
    }).subscribe(({ users, userGroups, userRoles }) => {
      const options = new DataRequest();
      options.entityName = 'AC_JournalsPermission';
      options.pageLoading = false;
      this.acService
        .loadDataAsync('AC', options)
        .subscribe((journalPermissions: IJournalPermission[]) => {
          let createrMap: Map<string, string[]> = new Map();
          let posterMap: Map<string, string[]> = new Map();

          for (const permission of journalPermissions) {
            let name: string;
            if (permission.objectType === 'U') {
              name = this.nameByIdPipe.transform(
                users,
                'UserID',
                'UserName',
                permission.objectID
              );
            } else if (permission.objectType === 'UG') {
              name = this.nameByIdPipe.transform(
                userGroups,
                'GroupID',
                'GroupName',
                permission.objectID
              );
            } else {
              name = this.nameByIdPipe.transform(
                userRoles,
                'RoleID',
                'RoleName',
                permission.objectID
              );
            }

            if (permission.add === '1') {
              let creaters: string[] =
                createrMap.get(permission.journalNo) ?? [];
              creaters.push(name);
              createrMap.set(permission.journalNo, creaters);
            }

            if (permission.post === '1') {
              let posters: string[] = posterMap.get(permission.journalNo) ?? [];
              posters.push(name);
              posterMap.set(permission.journalNo, posters);
            }
          }

          this.creaters = Array.from(createrMap, ([key, value]) => ({
            journalNo: key,
            value: value.join(', '),
          }));
          this.posters = Array.from(posterMap, ([key, value]) => ({
            journalNo: key,
            value: value.join(', '),
          }));

          console.log(this.creaters);
          console.log(this.posters);
        });
    });
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.panelLeftRef,
        },
      },
    ];
    ScrollComponent.reinitialization();
    this.detectorRef.detectChanges();

    this.cache.functionList(this.view.funcID).subscribe((res) => {
      this.functionName = this.acService.toCamelCase(res.defaultName);
    });
  }

  //#region Init

  //#region Events
  viewChanged(view) {
    if (!this.viewComponent.includes(view.type))
      this.viewComponent.push(view.type);
    this.viewActive = view.type;
    this.subViews?.filter(function (v) {
      if (v.type == view.type) v.active = true;
      else v.active = false;
    });
  }

  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(e, data);
        break;
      case 'SYS04':
        this.copy(e, data);
        break;
    }
  }

  changePredicate(val, field: string) {
    this.statusFilter = val;
    let predicates = [field + '=@0'];
    let dataValues = [val];
    this.view.dataService.setPredicates(predicates, dataValues);
  }

  search(e) {
    if (e) this.view.dataService.search(e);
  }

  dbClick(data) {
    let f = this.func.find((x) => x.value === data.journalType);
    if (!f) return;
    this.cache.functionList(f?.default).subscribe((func) => {
      if (func) {
        let urlRedirect = '/' + UrlUtil.getTenant();
        if (func && func.url && func.url.charAt(0) != '/') urlRedirect += '/';
        urlRedirect += func.url;
        this.route.navigate([urlRedirect], {
          queryParams: {
            journalNo: data.journalNo,
            parent: this.view.funcID,
          },
        });
      }
    });
  }

  onChange(e): void {
    console.log('onChange', e);

    if (e.type === 'edit') {
      this.dbClick(e.data);
    }
  }
  //#region Events

  //#region Method
  add(e): void {
    console.log(`${e.text} ${this.functionName}`);

    this.view.dataService
      .addNew(() => this.api.exec('AC', 'JournalsBusiness', 'SetDefaultAsync'))
      .subscribe((res) => {
        console.log(res);
        const options = new SidebarModel();
        options.Width = '800px';
        options.DataService = this.view.dataService;
        options.FormModel = this.view.formModel;

        this.callfc.openSide(
          PopupAddJournalComponent,
          {
            formType: 'add',
            formTitle: `${e.text} ${this.functionName}`,
          },
          options,
          this.view.funcID
        );
      });
  }

  edit(e, data: IJournal): void {
    console.log('edit', { data });

    let tempData = { ...data };
    if (data.extras) {
      tempData = { ...data, ...JSON.parse(data.extras) };
    }

    this.view.dataService.dataSelected = tempData;
    this.view.dataService.edit(tempData).subscribe(() => {
      const options = new SidebarModel();
      options.Width = '800px';
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;

      this.callfc
        .openSide(
          PopupAddJournalComponent,
          {
            formType: 'edit',
            formTitle: `${e.text} ${this.functionName}`,
          },
          options,
          this.view.funcID
        )
        .closed.subscribe(() => {
          this.randomSubject.next(Math.random()); // ❌ bùa refresh
        });
    });
  }

  copy(e, data: IJournal): void {
    console.log('copy', data);

    let tempData = { ...data };
    if (data.extras) {
      tempData = { ...data, ...JSON.parse(data.extras) };
    }

    this.view.dataService.dataSelected = tempData;
    this.view.dataService.copy().subscribe(() => {
      const options = new SidebarModel();
      options.Width = '800px';
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;

      this.callfc.openSide(
        PopupAddJournalComponent,
        {
          formType: 'add',
          formTitle: `${e.text} ${this.functionName}`,
        },
        options,
        this.view.funcID
      );
    });
  }

  delete(data): void {
    this.journalService.hasVouchers(data).subscribe((hasVouchers) => {
      if (hasVouchers) {
        this.notiService.notifyCode('AC0002', 0, `"${data.journalDesc}"`);
        return;
      }

      this.view.dataService.delete([data]).subscribe((res: any) => {
        console.log(res);

        if (res) {
          this.journalService.deleteAutoNumber(data.autoNumber);
          this.acService.deleteFile(data.recID, this.view.formModel.entityName);
        }
      });
    });
  }
  //#region Method
}
