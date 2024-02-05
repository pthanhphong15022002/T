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
  //#region Contrucstor
  @ViewChild('grid') grid?: CodxGridviewV2Component;
  @ViewChild('contentTemplate') contentTemplate: TemplateRef<any>;
  views: Array<ViewModel> = [];
  subViews: Array<ViewModel> = [];
  viewActive: number = 0;
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
  vllAC125:any = [];
  vllAC126:any = [];
  vllAC108:any = [];
  vllAC109:any = [];
  vllAC111:any = [];
  button: ButtonModel[] = [{
    icon:'icon-i-journal-plus',
    id: 'btnAdd',
  }];
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
  //#endregion Contrucstor

  //#region Init
  onInit() {
    if (!this.funcID) this.funcID = this.router.snapshot.params['funcID'];
    this.cache.viewSettings(this.funcID).subscribe((res:any)=>{
      let data = res.filter(x => x.isDefault == true)[0];
      if (data) {
        this.viewActive = data?.view;
        console.log(this.viewActive);
        this.detectorRef.detectChanges();
      }
    })
    this.cache.valueList('AC077').subscribe((func) => {
      if (func) this.func = func.datas;
    });
    this.cache
      .valueList('AC064')
      .pipe(
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

    this.getVll('AC134', 'journalTypes134');
    this.getVll('AC135', 'journalTypes135');
    this.getVll('AC136', 'journalTypes136');
    this.getVll('AC137', 'journalTypes137');
    this.getVll('AC138', 'journalTypes138');
    this.getVll('AC125','vllAC125');
    this.getVll('AC126','vllAC126');
    this.getVll('AC108','vllAC108');
    this.getVll('AC109','vllAC109');
    this.getVll('AC111','vllAC111');
  }

  ngAfterViewInit() {
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
      case 'ACT09':
        this.addNewJournalSample(e, data);
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
      this.acService.changeMFJournal(event,this.mainFilterValue); 
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
            oData:{...res},
            mainFilterValue:this.mainFilterValue
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
        let data = {
          headerText: this.headerText,
          oData:{...res},
          mainFilterValue:this.mainFilterValue
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
      });
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
            oData:{...res},
            mainFilterValue:this.mainFilterValue
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
      });
  }

  delete(data): void {
    let f = this.func.find((x) => x.value === data.journalType);
    this.cache.functionList(f?.default).subscribe((func) => {
      if (func) {
        let arObj = func?.entityName.split('_');
        let service = arObj[0];
        let options = new DataRequest();
        options.entityName = func?.entityName;
        options.pageLoading = false;
        options.predicates = 'JournalType=@0 and JournalNo=@1';
        options.dataValues = data.journalType+';'+data.journalNo;
        this.api
        .execSv(service, 'Core', 'DataBusiness', 'LoadDataAsync', options)
        .pipe(map((r) => r?.[0] ?? [])).subscribe((res:any)=>{
          if (res.length > 0) {
            this.notiService.notifyCode('AC0002', 0, `"${data.journalDesc}"`);
          }else{
            this.view.dataService.delete([data]).subscribe((res: any) => {});
          }
        })
      }
    })
  }

  addNewJournalSample(e, data){
    let oData = {...data};
    this.api.exec('AC', 'JournalsBusiness', 'SetDefaultAsync', [
      this.mainFilterValue,
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      delete oData?.journalNo;
      delete oData?.recID;
      Object.assign(res?.data,oData);
      res.data.status = '1';
      res.data.isTemplate = false;
      res.data.journalName = data?.journalNo;
      let journal = res.data;
      this.api
        .execAction('AC_Journals', [journal], 'SaveAsync')
        .subscribe((res: any) => {
          if (res) {
            let f = this.func.find((x) => x.value === journal.journalType);
            if (!f) return;
            this.cache.functionList(f?.default).subscribe((func) => {
              if (func) {
                let urlRedirect = '/' + UrlUtil.getTenant();
                if (func && func.url && func.url.charAt(0) != '/') urlRedirect += '/';
                urlRedirect += func.url + '/' + journal?.journalNo;
                this.route.navigate([urlRedirect]);
              }
            });  
          }
        })
    })
  }

  setDefault() {
    return this.api.exec('AC', 'JournalsBusiness', 'SetDefaultAsync', [
      this.mainFilterValue,
    ]);
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

  getVll(vllCode: string, propName: string) {
    this.cache
      .valueList(vllCode)
      .pipe(
        map((d) => d.datas.map((v) => v.value))
      )
      .subscribe((res) => {
        this[propName] = res;
      });
  }
  //#endregion Function  
}
