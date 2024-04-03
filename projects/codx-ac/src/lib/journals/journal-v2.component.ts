import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  NgZone,
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
  DialogModel,
} from 'codx-core';
import { JournalsAddComponent } from '../journals/journals-add/journals-add.component';
import { NameByIdPipe } from '../pipes/name-by-id.pipe';
import { BehaviorSubject, Subject, map, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { CodxAcService } from '../codx-ac.service';
import { JournalViewsettingComponent } from './journals-viewsetting/journal-viewsetting/journal-viewsetting.component';

@Component({
  selector: 'lib-test-journal',
  templateUrl: './journal-v2.component.html',
  styleUrls: ['./journal-v2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalV2Component extends UIComponent {
  //#region Contrucstor
  @ViewChild('grid') grid?: CodxGridviewV2Component;
  @ViewChild('contentTemplate') contentTemplate: TemplateRef<any>;
  views: Array<ViewModel> = [];
  subViews: Array<ViewModel> = [];
  viewActive: number = 0;
  headerText: string;
  funcName: any;
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
  creaters: { journalNo: string; value: string }[];
  posters: { journalNo: string; value: string }[];
  mainFilterValue: string;
  subFilterValue: string;
  ViewType = ViewType;
  lstGroup:any;
  selectedToolBar:any;
  button: ButtonModel[] = [
    {
      icon: 'icon-i-journal-plus',
      id: 'btnAdd',
    },
  ];
  itemSelected: any;
  @ViewChild('templateListCard') tempCard?: TemplateRef<any>;
  @ViewChild('listItemTemplate') tempList?: TemplateRef<any>;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    inject: Injector,
    private route: Router,
    private notiService: NotificationsService,
    private acService: CodxAcService,
  ) {
    super(inject);
  }
  //#endregion Contrucstor

  //#region Init
  onInit() {
    
    this.cache.valueList('AC177').subscribe((func) => {
      if(func){
        this.lstGroup = func.datas;
        this.selectedToolBar = this.lstGroup[0].value;
      }else{
        this.lstGroup = [];
      }
    });

    if (!this.funcID) this.funcID = this.router.snapshot.params['funcID'];
      this.cache.valueList('AC077').subscribe((func) => {
        if (func) this.func = func.datas;
      });

      this.cache.functionList(this.funcID).subscribe((res) => {
        if (res) {
          this.funcName = res.defaultName;
        }
      });
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.smallcard,
        active: true,
        sameData: true,
        model: {
          template: this.tempCard,
        },
      },
      {
        type: ViewType.list,
        active: false,
        sameData: true,
        model: {
          template: this.tempList,
        },
      },
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
      },
    ];
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion Init

  //#region Event

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
      case 'ACT09':
        this.addNewJournalSample(e, data);
        break;
    }
  }

  selectedChangeToolBar(data:any){
    this.selectedToolBar = data.value;
    this.view.dataService.setPredicates(['Category=@0'],[data.value]);
    //this.detectorRef.detectChanges();
  }

  changeMF(event) {
    if (event) {
      this.acService.changeMFJournal(event, this.mainFilterValue);
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
    this.cache.functionList(f?.default).pipe(takeUntil(this.destroy$)).subscribe((func) => {
      if (func) {
        let urlRedirect = '/' + UrlUtil.getTenant();
        if (func && func.url && func.url.charAt(0) != '/') urlRedirect += '/';
        urlRedirect += func.url + '/' + data?.journalNo;
        this.route.navigate([urlRedirect]);
      }
      this.onDestroy();
    });
  }

  onDoubleClick(event) {
    let data = event?.rowData;
    this.dbClick(data);
  }

  toolbarClick(event) {
        switch (event.id) {
      case 'btnAdd':
        this.addNew(event);
        break;
    }
  }
  //#endregion Event

  //#region Function

  addNew(e) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    this.view.dataService
      .addNew((o) => this.setDefault())
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res != null) {
          res.isAdd = true;
          res.category = this.selectedToolBar;
          let data = {
            headerText: this.headerText,
            oData: { ...res },
            mainFilterValue: this.mainFilterValue,
          };
          let option = new SidebarModel();
          option.FormModel = this.view?.formModel;
          option.DataService = this.view?.dataService;
          option.Width = '800px';
          let dialog = this.callfc.openSide(
            JournalsAddComponent,
            data,
            option,
            this.view.funcID
          );
        }
        this.onDestroy();
      });
  }

  edit(e, dataEdit): void {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    this.view.dataService.dataSelected = dataEdit;
    this.view.dataService
      .edit(dataEdit)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        res.isEdit = true;
        res.category = this.selectedToolBar;
        let data = {
          headerText: this.headerText,
          oData: { ...res },
          mainFilterValue: this.mainFilterValue,
        };
        let option = new SidebarModel();
        option.FormModel = this.view?.formModel;
        option.DataService = this.view?.dataService;
        option.Width = '800px';
        let dialog = this.callfc.openSide(
          JournalsAddComponent,
          data,
          option,
          this.view.funcID
        );
        this.onDestroy();
      });
  }

  copy(e, dataCopy): void {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    this.view.dataService.dataSelected = dataCopy;
    this.view.dataService.copy().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        res.isCopy = true;
        let data = {
          headerText: this.headerText,
          oData: { ...res },
          mainFilterValue: this.mainFilterValue,
        };
        let option = new SidebarModel();
        option.FormModel = this.view?.formModel;
        option.DataService = this.view?.dataService;
        option.Width = '800px';
        let dialog = this.callfc.openSide(
          JournalsAddComponent,
          data,
          option,
          this.view.funcID
        );
      }
      this.onDestroy();
    });
  }

  delete(data): void {
    let f = this.func.find((x) => x.value === data.journalType);
    this.cache.functionList(f?.default).pipe(takeUntil(this.destroy$)).subscribe((func) => {
      if (func) {
        let arObj = func?.entityName.split('_');
        let service = arObj[0];
        let options = new DataRequest();
        options.entityName = func?.entityName;
        options.pageLoading = false;
        options.predicates = 'JournalType=@0 and JournalNo=@1';
        options.dataValues = data.journalType + ';' + data.journalNo;
        this.api
          .execSv(service, 'Core', 'DataBusiness', 'LoadDataAsync', options)
          .pipe(map((r) => r?.[0] ?? []))
          .subscribe((res: any) => {
            if (res.length > 0) {
              this.notiService.notifyCode('AC0002', 0, `"${data.journalDesc}"`);
            } else {
              this.view.dataService.delete([data]).subscribe((res: any) => {});
            }
            this.onDestroy();
          });
      }
          });
  }

  addNewJournalSample(e, data) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    let oData = { ...data };
    this.api
      .exec('AC', 'JournalsBusiness', 'SetDefaultAsync', [this.mainFilterValue])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        delete oData?.journalNo;
        delete oData?.recID;
        Object.assign(res?.data, oData);
        res.data.status = '1';
        res.data.isTemplate = false;
        res.data.journalName = data?.journalNo;
        let journal = res.data;
        journal.isAdd = true;
        let datas = {
          headerText: this.headerText,
          oData: { ...journal },
          mainFilterValue: this.mainFilterValue,
        };
        let option = new SidebarModel();
        option.FormModel = this.view?.formModel;
        option.DataService = this.view?.dataService;
        option.Width = '800px';
        let dialog = this.callfc.openSide(
          JournalsAddComponent,
          datas,
          option,
          this.view.funcID
        );
        this.onDestroy();
      });
  }

  setDefault() {
    return this.api.exec('AC', 'JournalsBusiness', 'SetDefaultAsync');
  }

  /**
   * * select item in view card
   * @param event
   * @returns
   */
  onSelected(data) {
    if (data) this.itemSelected = data;
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

  // getVll(vllCode: string, propName: string) {
  //   this.cache
  //     .valueList(vllCode)
  //     .pipe(map((d) => d.datas.map((v) => v.value)))
  //     .subscribe((res) => {
  //       this[propName] = res;
  //     });
  // }
  viewSetting(journal: any) {
    let data = {
      journal: journal,
    };
    let opt = new DialogModel();
    opt.FormModel = this.view.formModel;
    let dialog = this.callfc.openForm(
      JournalViewsettingComponent,
      null,
      null,
      null,
      '',
      data,
      '',
      opt
    );
  }
  //#endregion Function
}
