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
import { BehaviorSubject, Subject, combineLatest, map, takeUntil, tap } from 'rxjs';
import { Router } from '@angular/router';
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
  @ViewChild('grid') grid?: CodxGridviewV2Component;
  @ViewChild('contentTemplate') contentTemplate: TemplateRef<any>;
  views: Array<ViewModel> = [];
  subViews: Array<ViewModel> = [];
  viewActive: number = ViewType.smallcard;
  headerText: string;
  funcName:any;
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
  mainFilterValue: string;
  subFilterValue: string;
  ViewType = ViewType;
  button: ButtonModel[] = [{
    icon:'icon-i-journal-plus',
    id: 'btnAdd',
  }];
  optionSidebar: SidebarModel = new SidebarModel();
  itemSelected: any;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    inject: Injector,
    private route: Router,
    private notiService: NotificationsService,
    private acService: CodxAcService
  ) {
    super(inject);
  }

  //#region Init
  override onInit(): void {
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

    // combineLatest({
    //   users: this.journalService.getUsers$(),
    //   userGroups: this.journalService.getUserGroups$(),
    //   userRoles: this.journalService.getUserRoles$(),
    //   random: this.randomSubject.asObservable(),
    // }).subscribe(({ users, userGroups, userRoles }) => {
    //   const options = new DataRequest();
    //   options.entityName = 'AC_JournalsPermission';
    //   options.pageLoading = false;
    //   this.acService
    //     .loadData$('AC', options)
    //     .subscribe((journalPermissions: IJournalPermission[]) => {
    //       let createrMap: Map<string, string[]> = new Map();
    //       let posterMap: Map<string, string[]> = new Map();

    //       for (const permission of journalPermissions) {
    //         let name: string;
    //         if (permission.objectType === 'U') {
    //           name = this.nameByIdPipe.transform(
    //             users,
    //             'UserID',
    //             'UserName',
    //             permission.objectID
    //           );
    //         } else if (permission.objectType === 'UG') {
    //           name = this.nameByIdPipe.transform(
    //             userGroups,
    //             'GroupID',
    //             'GroupName',
    //             permission.objectID
    //           );
    //         } else {
    //           name = this.nameByIdPipe.transform(
    //             userRoles,
    //             'RoleID',
    //             'RoleName',
    //             permission.objectID
    //           );
    //         }

    //         if (permission.add === '1') {
    //           let creaters: string[] =
    //             createrMap.get(permission.journalNo) ?? [];
    //           creaters.push(name);
    //           createrMap.set(permission.journalNo, creaters);
    //         }

    //         if (permission.post === '1') {
    //           let posters: string[] = posterMap.get(permission.journalNo) ?? [];
    //           posters.push(name);
    //           posterMap.set(permission.journalNo, posters);
    //         }
    //       }

    //       this.creaters = Array.from(createrMap, ([key, value]) => ({
    //         journalNo: key,
    //         value: value.join(', '),
    //       }));
    //       this.posters = Array.from(posterMap, ([key, value]) => ({
    //         journalNo: key,
    //         value: value.join(', '),
    //       }));
    //     });
    // });
  }

  ngAfterViewInit() {
    //this.acService.changeToolBar.next(this.view.funcID);

    this.cache.functionList(this.view.funcID).subscribe((res) => {
      if (res) {
        this.funcName = res.defaultName;
      }
    });

    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.contentTemplate,
        },
      },
    ];
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

    //* thiết lập cấu hình sidebar
    this.optionSidebar.DataService = this.view.dataService;
    this.optionSidebar.FormModel = this.view.formModel;
    this.optionSidebar.Width = '800px';
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //#region Init

  //#region Event
  viewChanged(view) {
    if(view && view.type == this.viewActive) return;
    this.itemSelected = undefined;
    this.viewActive = view.type;
    this.subViews?.filter(function (v) {
      if (v.type == view.type) v.active = true;
      else v.active = false;
    });
    this.detectorRef.detectChanges();
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
    if(field === 'mainFilterValue' && this.mainFilterValue == value) return;
    if(field === 'subFilterValue' && this.subFilterValue == value) return;
    this[field] = value;
    this.itemSelected = undefined;
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
    this.detectorRef.detectChanges();
  }

  changeMF(event){
    if (event) {
      this.acService.changeMFJournal(event); 
    }
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
        urlRedirect += func.url + '/' + data?.journalNo;
        this.route.navigate([urlRedirect]);
      }
    });
  }

  onDoubleClick(event){
    let data = event?.rowData;
    this.dbClick(data);
  }

  toolbarClick(event) {
    switch (event.id) {
      case 'btnAdd':
        this.addNewJournal(event);
        break;
    }
  }
  //#endregion Event

  //#region Function

  addNewJournal(e) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    this.view.dataService
      .addNew((o) => this.setDefault())
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res != null) {
          res.isAdd = true;
          let data = {
            headerText: this.headerText,
            oData:{...res}
          };
          let dialog = this.callfc.openSide(
            JournalsAddComponent,
            data,
            this.optionSidebar,
            this.view.funcID
          );
        }
      });
    // this.view.dataService
    //   .addNew(() =>
    //     this.api.exec(
    //       'AC',
    //       'JournalsBusiness',
    //       'SetDefaultAsync',
    //       this.mainFilterValue == '3'
    //     )
    //   )
    //   .subscribe(() => {
    //     const options = new SidebarModel();
    //     options.Width = '800px';
    //     options.DataService = this.view.dataService;
    //     options.FormModel = this.view.formModel;

    //     this.callfc.openSide(
    //       JournalsAddComponent,
    //       {
    //         formType: 'add',
    //         formTitle: `${e.text} ${this.functionName}`,
    //       },
    //       options,
    //       this.view.funcID
    //     );
    //   });
  }

  //#endregion Function


  //#region Method
  

  edit(e, dataEdit): void {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    this.view.dataService.dataSelected = dataEdit;
    this.view.dataService
      .edit(dataEdit)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        res.isEdit = true;
        let data = {
          headerText: this.headerText,
          oData:{...res}
        };
        let dialog = this.callfc.openSide(
          JournalsAddComponent,
          data,
          this.optionSidebar,
          this.view.funcID
        );
      });
    // console.log('edit', { data });

    // let tempData = { ...data };
    // // if (data.extras) {
    // //   tempData = { ...data, ...JSON.parse(data.extras) };
    // // }

    // this.view.dataService.dataSelected = tempData;
    // this.view.dataService.edit(tempData).subscribe(() => {
    //   const options = new SidebarModel();
    //   options.Width = '800px';
    //   options.DataService = this.view.dataService;
    //   options.FormModel = this.view.formModel;

    //   this.callfc
    //     .openSide(
    //       JournalsAddComponent,
    //       {
    //         formType: 'edit',
    //         formTitle: `${e.text} ${this.functionName}`,
    //       },
    //       options,
    //       this.view.funcID
    //     )
    //     .closed.subscribe(() => {
    //       this.randomSubject.next(Math.random()); // ❌ bùa refresh
    //     });
    // });
  }

  copy(e, dataCopy): void {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    this.view.dataService.dataSelected = dataCopy;
    this.view.dataService
      .copy()
      .subscribe((res: any) => {
        if (res) {
          res.isCopy = true;
          let data = {
            headerText: this.headerText,
            oData:{...res}
          };
          let dialog = this.callfc.openSide(
            JournalsAddComponent,
            data,
            this.optionSidebar
          );
        }
      });
    // console.log('copy', data);

    // let tempData = { ...data };
    // if (data.extras) {
    //   tempData = { ...data, ...JSON.parse(data.extras) };
    // }

    // this.view.dataService.dataSelected = tempData;
    // this.view.dataService.copy().subscribe(() => {
    //   const options = new SidebarModel();
    //   options.Width = '800px';
    //   options.DataService = this.view.dataService;
    //   options.FormModel = this.view.formModel;

    //   this.callfc.openSide(
    //     JournalsAddComponent,
    //     {
    //       formType: 'add',
    //       formTitle: `${e.text} ${this.functionName}`,
    //     },
    //     options,
    //     this.view.funcID
    //   );
    // });
  }

  delete(data): void {
    // this.journalService.hasVouchers$(data).subscribe((hasVouchers) => {
    //   if (hasVouchers) {
    //     this.notiService.notifyCode('AC0002', 0, `"${data.journalDesc}"`);
    //     return;
    //   }

    //   this.view.dataService.delete([data]).subscribe((res: any) => {
    //     console.log(res);

    //     if (res) {
    //       this.journalService.deleteAutoNumber(data.autoNumber);
    //       this.acService.deleteFile(data.recID, this.view.formModel.entityName);
    //     }
    //   });
    // });
  }
  //#region Method

  //#region Function

  setDefault() {
    return this.api.exec('AC', 'JournalsBusiness', 'SetDefaultAsync', [
      this.mainFilterValue,
    ]);
  }

  assignVllToProp2(vllCode: string, propName: string): void {
    this.cache
      .valueList(vllCode)
      .pipe(
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

  /**
   * * select item in view card
   * @param event
   * @returns
   */
  onSelected(data) {
    if(data) this.itemSelected = data;
    this.detectorRef.detectChanges();
  }

  /**
   * * select item in view list
   * @param event
   * @returns
   */
  onSelectedViewList(event) {
    if (typeof event?.data !== 'undefined') {
      if (event?.data?.data || event?.data?.error) {
        return;
      } else {
        this.itemSelected = event?.data;
        this.detectorRef.detectChanges();
      }
    }
  }
  //#endregion
}
