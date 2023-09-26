import {
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
  DataRequest,
  SidebarModel,
  NotificationsService,
  UrlUtil,
  ButtonModel,
  CodxGridviewV2Component,
  ScrollComponent,
} from 'codx-core';
import { JournalsAddComponent } from '../journals/journals-add/journals-add.component';
import { NameByIdPipe } from '../pipes/name-by-id.pipe';
import { BehaviorSubject, combineLatest, map, tap } from 'rxjs';
import { Router } from '@angular/router';
import { JournalService } from '../journals/journals.service';
import { CodxAcService } from '../codx-ac.service';
import { IJournalPermission } from '../journals/interfaces/IJournalPermission.interface';
import { IJournal } from '../journals/interfaces/IJournal.interface';
import { toCamelCase } from '../utils';

@Component({
  selector: 'lib-test-journal',
  templateUrl: './journal-v2.component.html',
  styleUrls: ['./journal-v2.component.scss'],
})
export class JournalV2Component extends UIComponent implements OnInit {
  views: Array<ViewModel> = [];
  subViews: Array<ViewModel> = [];
  viewActive: number = ViewType.smallcard;
  functionName: string;
  vll86 = [];
  vll85 = [];
  func = [];
  vllJournalTypes064: any[] = [];

  journalTypes134: string[];
  journalTypes135: string[];
  journalTypes136: string[];
  journalTypes137: string[];
  journalTypes138: string[];

  randomSubject = new BehaviorSubject<number>(Math.random());
  nameByIdPipe = new NameByIdPipe();
  creaters: { journalNo: string; value: string }[];
  posters: { journalNo: string; value: string }[];

  mainFilterValue: string = '1';
  subFilterValue: string = '0';
  ViewType = ViewType;
  button: ButtonModel = {
    id: 'btnAdd',
  };

  @ViewChild('grid') grid?: CodxGridviewV2Component;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
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
        type: ViewType.smallcard,
        active: this.viewActive === ViewType.smallcard,
      },
      {
        type: ViewType.list,
        active: this.viewActive === ViewType.list,
      },
      {
        type: ViewType.grid,
        active: this.viewActive === ViewType.grid,
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
        this.subFilterValue = res.datas[0].value;
      }
    });

    this.cache.valueList('AC086').subscribe((res) => {
      if (res) {
        this.vll86 = res.datas;
        this.mainFilterValue = res.datas[0].value;
      }
    });

    this.assignVllToProp2('AC134', 'journalTypes134');
    this.assignVllToProp2('AC135', 'journalTypes135');
    this.assignVllToProp2('AC136', 'journalTypes136');
    this.assignVllToProp2('AC137', 'journalTypes137');
    this.assignVllToProp2('AC138', 'journalTypes138');

    combineLatest({
      users: this.journalService.getUsers$(),
      userGroups: this.journalService.getUserGroups$(),
      userRoles: this.journalService.getUserRoles$(),
      random: this.randomSubject.asObservable(),
    }).subscribe(({ users, userGroups, userRoles }) => {
      const options = new DataRequest();
      options.entityName = 'AC_JournalsPermission';
      options.pageLoading = false;
      this.acService
        .loadData$('AC', options)
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
      this.functionName = toCamelCase(res.defaultName);
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

  changePredicate(value: string, field: string): void {
    this[field] = value;

    let journalTypes: string = '';
    switch (this.subFilterValue) {
      case '1':
        journalTypes = this.journalTypes134.join(';');
        break;
      case '2':
        journalTypes = this.journalTypes135.join(';');
        break;
      case '3':
        journalTypes = this.journalTypes136.join(';');
        break;
      case '4':
        journalTypes = this.journalTypes137.join(';');
        break;
      case '5':
        journalTypes = this.journalTypes138.join(';');
        break;
    }
    const predicates: string[] =
      this.subFilterValue !== '0'
        ? ['Status=@0 and @1.Contains(JournalType)']
        : ['Status=@0'];
    const dataValues: string[] = [`${this.mainFilterValue};[${journalTypes}]`];
    this.view.dataService.setPredicates(predicates, dataValues, () => {
      this.grid?.refresh();
    });
  }

  search(e) {
    this.view.dataService.search(e);
  }

  dbClick(data) {
    if (this.mainFilterValue == '3') {
      // nhat ky mau
      return;
    }

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
          },
        });
      }
    });
  }

  // onActions(e): void {
  //   console.log('onActions', e);

  //   if (e.type === 'edit') {
  //     this.dbClick(e.data);
  //   }
  // }
  //#region Events

  //#region Method
  add(e): void {
    this.view.dataService
      .addNew(() =>
        this.api.exec(
          'AC',
          'JournalsBusiness',
          'SetDefaultAsync',
          this.mainFilterValue == '3'
        )
      )
      .subscribe(() => {
        const options = new SidebarModel();
        options.Width = '800px';
        options.DataService = this.view.dataService;
        options.FormModel = this.view.formModel;

        this.callfc.openSide(
          JournalsAddComponent,
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
    // if (data.extras) {
    //   tempData = { ...data, ...JSON.parse(data.extras) };
    // }

    this.view.dataService.dataSelected = tempData;
    this.view.dataService.edit(tempData).subscribe(() => {
      const options = new SidebarModel();
      options.Width = '800px';
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;

      this.callfc
        .openSide(
          JournalsAddComponent,
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
        JournalsAddComponent,
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
    this.journalService.hasVouchers$(data).subscribe((hasVouchers) => {
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

  //#region Function
  /** vll with pipe(map((d) => d.datas.map((v) => v.value))) */
  assignVllToProp2(vllCode: string, propName: string): void {
    this.cache
      .valueList(vllCode)
      .pipe(
        tap((t) => console.log(vllCode, t)),
        map((d) => d.datas.map((v) => v.value))
      )
      .subscribe((res) => {
        this[propName] = res;
      });
  }

  sortData(): void {
    const temp: any[] = this.view.dataService.data;
    this.view.dataService.data = [
      ...temp.filter((j: IJournal) =>
        this.journalTypes134.includes(j.journalType)
      ),
      ...temp.filter((j: IJournal) =>
        this.journalTypes135.includes(j.journalType)
      ),
      ...temp.filter((j: IJournal) =>
        this.journalTypes136.includes(j.journalType)
      ),
      ...temp.filter((j: IJournal) =>
        this.journalTypes137.includes(j.journalType)
      ),
      ...temp.filter((j: IJournal) =>
        this.journalTypes138.includes(j.journalType)
      ),
    ];
  }
  //#endregion
}
