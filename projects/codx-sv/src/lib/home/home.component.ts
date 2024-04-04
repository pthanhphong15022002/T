import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AESCryptoService,
  AlertConfirmInputConfig,
  AuthStore,
  ButtonModel,
  CRUDService,
  CodxListviewComponent,
  DataRequest,
  NotificationsService,
  RequestOption,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxSvService } from '../codx-sv.service';
import { isObservable } from 'rxjs';
import { formatDate } from '@angular/common';
import { SearchSuggestionsComponent } from './search-suggestions/search-suggestions.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent extends UIComponent implements OnInit {
  @ViewChild('listViewSurveys') listViewSurveys: CodxListviewComponent;
  @ViewChild('listViewSurveysSystem')
  listViewSurveysSystem: CodxListviewComponent;

  views: Array<ViewModel> = [];
  viewList: Array<ViewModel> = [];
  service = 'SV';
  assemblyName = 'ERM.Business.SV';
  className = 'SurveysBusiness';
  method = 'GetAsync';
  functionList: any;
  listFunctionList: any;
  fMoreFuncs: ButtonModel[];

  vllSV003: any;
  vllSV005: any;

  formats = {
    item: 'Title',
    fontStyle: 'Arial',
    fontSize: '13',
    fontColor: 'black',
    fontFormat: 'B',
  };

  dataModel = new DataRequest();

  dataSurveys: any;
  dataSurveysSystem: any;

  tabIndex: any;
  user: any;
  dtService: CRUDService;
  countSys = 0;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;

  constructor(
    private injector: Injector,
    private change: ChangeDetectorRef,
    private authStore: AuthStore,
    private svService: CodxSvService,
    private shareService: CodxShareService,
    private aesCrypto: AESCryptoService,
    private notifySvr: NotificationsService
  ) {
    super(injector);
    this.user = this.authStore.get();
    var dataSv = new CRUDService(injector);
    this.dtService = dataSv;

    dataSv.idField = 'recID';
    this.getVll();
  }

  onInit(): void {
    this.api.execSv<any>('SV','SV','SurveysBusiness','CountSurveySysAsync').subscribe(res => {
      this.countSys = res ?? 0;
    })
    this.router.params.subscribe((params) => {
      if (params) {
        this.funcID = params['funcID'];
        this.tabIndex = this.funcID;
      }
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.functionList = res;
        this.dataModel.funcID = this.funcID;
        this.dataModel.entityName = this.functionList.entityName;
        let predicate = 'IsTemplate';
        if (
          this.functionList.predicate != null &&
          this.functionList.predicate?.trim() != ''
        ) {
          predicate += ' and ' + this.functionList.predicate;
        }
        this.dataModel.predicate = predicate;
        this.dataModel.dataValue = this.functionList.dataValue;
        this.dataModel.page = 1;
        this.dataModel.pageSize = 5;
        this.getData();
      }
    });

    this.viewList = [
      {
        id: '1',
        type: ViewType.card,
        active: true,
        sameData: true,
      },
      // {
      //   id: '2',
      //   type: ViewType.list,
      //   active: false,
      //   sameData: true,
      // },
    ];

    this.fMoreFuncs = [
      {
        id: 'id-select-multi',
        formName: 'System',
        text: 'Chọn nhiều dòng',
        disabled: false,
      },
      // {
      //   id: 'id-refresh',
      //   formName: 'System',
      //   text: 'Làm mới',
      //   disabled: true,
      // },
      {
        id: 'id-codx-open-setting',
        formName: 'System',
        text: 'Thiết lập',
        disabled: false,
      },
    ];
  }

  getData() {
    this.svService.getDataSurveys(this.dataModel).subscribe((item: any) => {
      if (item && item[0]?.length > 0) {
        this.dataSurveysSystem =
          this.dataSurveysSystem?.length > 0
            ? this.dataModel.pageLoading == true
              ? [...this.dataSurveysSystem, ...item[0]]
              : [...item[0]]
            : [...item[0]];
      }
    });
  }

  readMoreSys() {
    this.dataModel.pageLoading = false;
    this.getData();
  }

  ngAfterViewInit() {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.panelLeftRef,
        },
      },
    ];

    var funcL = this.svService.loadFuncByParentID('SV');
    if (isObservable(funcL)) {
      funcL.subscribe((item) => {
        if (item)
          this.listFunctionList = this.sortObj(item, 'sorting').slice(0, 3);
      });
    } else this.listFunctionList = this.sortObj(funcL, 'sorting').slice(0, 3);

    this.change.detectChanges();
  }

  getVll() {
    var vllSV003 = this.svService.loadValuelist('SV003');

    if (isObservable(vllSV003)) {
      vllSV003.subscribe((item) => {
        if (item) this.vllSV003 = item;
      });
    } else this.vllSV003 = vllSV003;

    var vllSV005 = this.svService.loadValuelist('SV005') as any;
    if (isObservable(vllSV005)) {
      vllSV005.subscribe((item: any) => {
        if (item) this.vllSV005 = item.datas;
      });
    } else this.vllSV005 = vllSV005.datas;
  }

  sortObj(list: any, key: any) {
    function compare(a, b) {
      a = a[key];
      b = b[key];
      var type =
        typeof a === 'string' || typeof b === 'string' ? 'string' : 'number';
      var result;
      if (type === 'string') result = a.localeCompare(b);
      else result = a - b;
      return result;
    }
    return list.sort(compare);
  }

  clickMF(e, data) {
    switch (e?.functionID) {
      case 'SYS02': {
        this.deleteSurvey(data);
        break;
      }
    }
  }

  //Xóa survey
  deleteSurvey(data: any) {
    this.listViewSurveys.dataService.dataSelected = data;
    (this.listViewSurveys.dataService as CRUDService)
      .delete([this.listViewSurveys.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.listViewSurveys.dataService.onAction.next({
            type: 'delete',
            data: data,
          });
          this.detectorRef.detectChanges();
        }
      });
    // this.api
    //   .execSv('SV', 'SV', 'SurveysBusiness', 'DeleteItemAsync', data?.recID)
    //   .subscribe((item) => {
    //     if (item) {

    //       this.dataSurveys = this.dataSurveys.filter((x) => x.recID != recID);
    //       this.notifySvr.notifyCode('SYS008');
    //     } else this.notifySvr.notifyCode('SYS022');
    //   });
  }

  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.assemblyName = 'SV';
    opt.className = 'SurveysBusiness';
    opt.methodName = 'DeleteItemAsync';
    opt.data = [itemSelected.recID, true];
    // opt.methodName = 'DeleteProcessesAsync';
    // opt.data = [itemSelected.recID];
    return true;
  }

  createNewSurvey() {
    this.view.dataService.addNew().subscribe((res) => {
      res.title = 'Mẫu không có tiêu đề';
      this.api
        .execSv('SV', 'SV', 'SurveysBusiness', 'SaveAsync', [
          res,
          this.formats,
          true,
        ])
        .subscribe((item: any) => {
          var obj = {
            funcID: this.funcID,
            recID: item?.result?.recID,
          };
          var key = JSON.stringify(obj);
          key = this.aesCrypto.encode(key);

          this.codxService.navigate('', 'sv/add-survey', {
            _k: key,
          });
        });
    });
  }

  clone(item) {
    this.api
      .execSv(
        'SV',
        'SV',
        'SurveysBusiness',
        'CloneSurveyFromRecIDAsync',
        item.recID
      )
      .subscribe((res: any) => {
        if (res) {
          var obj = {
            funcID: this.funcID,
            recID: res.recID,
          };
          var key = JSON.stringify(obj);
          key = this.aesCrypto.encode(key);

          this.codxService.navigate('', 'sv/add-survey', {
            _k: key,
          });
        }
      });
  }

  update(item) {
    var obj = {
      funcID: this.funcID,
      recID: item.recID,
    };
    var key = JSON.stringify(obj);
    key = this.aesCrypto.encode(key);

    this.codxService.navigate('', 'sv/add-survey', {
      _k: key,
    });
  }

  updateRepond(item) {
    var obj = {
      funcID: this.funcID,
      transID: item.recID,
    };

    var key = JSON.stringify(obj);
    key = this.aesCrypto.encode(key);

    this.codxService.navigate('', 'sv/review', {
      _k: key,
    });
  }

  viewChanged(e: any) {}

  sortChanged(e: any) {}

  clickToolbarMore(e: any) {}

  onSearch(e: any) {}
  //change tab
  onTabSelect(e: any) {
    var funcID = this.listFunctionList[e?.selectedIndex].functionID;
    this.tabIndex = funcID;
    this.dataSurveys = [];
    // this.getData();
  }

  //Lấy trạng thái hiện thị
  getStatus(data: any, type: any) {
    if (type == 'status') {
      var date = '';
      if (data?.stop)
        return (
          'Đã đóng ngày ' + formatDate(data?.expiredOn, 'dd/MM/yyyy', 'en-US')
        );
      if (data?.status == '3')
        date = ' ngày ' + formatDate(data?.startedOn, 'dd/MM/yyyy', 'en-US');
      return (
        this.vllSV003.datas.filter((x) => x.value == data?.status)[0].default +
        date
      );
    } else if (type == 'bg') {
      if (data && data.settings) {
        var setting;
        if (typeof data.settings == 'string') {
          setting = JSON.parse(data.settings);
        }
        if (setting?.backgroudColor) return setting?.backgroudColor;
      }
    }
    return '';
  }

  getBgRepondent(data: any) {
    if (data && data?.unbounds?.settings) {
      var setting;
      if (typeof data?.unbounds?.settings == 'string') {
        setting = JSON.parse(data?.unbounds?.settings);
      }
      if (setting?.backgroudColor) return setting?.backgroudColor;
    }
  }
  //Mở form gợi ý tìm kiếm
  openFormSuggestion() {
    this.callfc.openForm(SearchSuggestionsComponent, '', 1000, 700, '', {
      formModel: this.view.formModel,
    });
  }

  getImgSrc(data: any, type: any) {
    if (data) {
      if (
        type == 'card' &&
        data?.settings &&
        typeof data?.settings == 'string'
      ) {
        var setting = JSON.parse(data.settings);
        if (setting?.image)
          return this.shareService.getThumbByUrl(setting?.image, 120);
      } else if (
        type == 'repondent' &&
        data?.unbounds?.settings &&
        typeof data?.unbounds?.settings == 'string'
      ) {
        var setting = JSON.parse(data.unbounds.settings);
        if (setting?.image)
          return this.shareService.getThumbByUrl(setting?.image, 120);
      }
    }
    return './assets/themes/sv/default/img/EmptySurvey.svg';
  }
}
