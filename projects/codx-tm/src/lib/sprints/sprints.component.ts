import {
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  DataRequest,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { map, Observable, of } from 'rxjs';
import { CodxTMService } from '../codx-tm.service';
import { TM_Sprints } from '../models/TM_Sprints.model';
import { PopupAddSprintsComponent } from './popup-add-sprints/popup-add-sprints.component';
import { PopupShareSprintsComponent } from './popup-share-sprints/popup-share-sprints.component';

@Component({
  selector: 'lib-sprints',
  templateUrl: './sprints.component.html',
  styleUrls: ['./sprints.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SprintsComponent extends UIComponent {
  @ViewChild('listCardSprints') listCardSprints: TemplateRef<any>;
  gridView: any;
  boardAction: any;
  user: any;
  sprintDefaut = new TM_Sprints();

  @ViewChild('itemViewBoard') itemViewBoard: TemplateRef<any>;
  @ViewChild('templetSprints') templetSprints: TemplateRef<any>;
  urlShare = '';
  urlView = '';
  moreFunc: any[];
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  model?: DataRequest;
  predicate = 'Owner=@0';
  dataValue = 'ADMIN';
  resourceKanban?: ResourceModel;
  dialog!: DialogRef;
  itemSelected: any;
  funcID = '';
  valuelist = {};
  action = 'edit';
  listMoreFunc = [];

  constructor(
    inject: Injector,
    private notiService: NotificationsService,
    private tmSv: CodxTMService,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.dataValue = this.user.userID;
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.tmSv.functionParent = this.funcID;
    this.cache.functionList(this.funcID).subscribe((f) => {
      if (f) {
        this.tmSv.urlback = f.url;
      }
    });
    this.cache.moreFunction('Sprints', 'grvSprints').subscribe((res) => {
      if (res) this.listMoreFunc = res;
    });
  }

  //#region Init
  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.card,
        sameData: true,
        active: true,
        model: {
          template: this.itemViewBoard,
        },
      },
    ];
    this.view.dataService.methodSave = 'AddEditSprintAsync';
    this.view.dataService.methodUpdate = 'AddEditSprintAsync';
    this.view.dataService.methodDelete = 'DeleteSprintsByIDAsync';
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region CRUD Methods
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(
        PopupAddSprintsComponent,
        [this.view.dataService.dataSelected, 'add'],
        option
      );
      this.dialog.closed.subscribe((e) => {
        console.log(e);
      });
    });
  }

  edit(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(
          PopupAddSprintsComponent,
          [this.view.dataService.dataSelected, 'edit'],
          option
        );
      });
  }

  copy(data) {
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(
        PopupAddSprintsComponent,
        [this.view.dataService.dataSelected, 'copy'],
        option
      );
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        // if (res) this.notiService.notifyCode('TM004');
      });
  }

  beforeDel(opt: RequestOption) {
    opt.methodName = 'DeleteSprintsByIDAsync';
    opt.data = this.itemSelected.iterationID;
    return true;
  }
  //#endregion

  //#region More function
  clickMF(e: any, data: any) {
    this.itemSelected = data;
    switch (e.functionID) {
      case 'SYS01':
        this.add();
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'sendemail':
        this.sendemail(data);
        break;
      case 'TMT03011':
        if (data.iterationID != this.user.userID) this.shareBoard(e.data, data);
        break;
      case 'TMT03012':
        this.viewBoard(e.data, data);
        break;
      default:
        break;
    }
  }
  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }
  //#endregion

  //#region Event
  sendemail(data) {}

  shareBoard(e, data) {
    var listUserDetail = [];
    if (data.iterationID) {
      var obj = {
        boardAction: data,
        listUserDetail: listUserDetail,
        title: e?.customName,
        vllShare: 'TM003',
      };
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'SprintsBusiness',
          'GetListUserSharingOfSprintsByIDAsync',
          data.iterationID
        )
        .subscribe((res) => {
          if (res) obj.listUserDetail = res;
          this.openPopupShare(obj);
        });
    }
  }
  openPopupShare(obj) {
    this.callfc.openForm(
      PopupShareSprintsComponent,
      'Chia sẻ view board',
      350,
      510,
      '',
      obj
    );
  }

  viewBoard(e, data) {
    this.urlView = e?.url;
    // this.urlView = 'tm/sprintdetails/TMT03011'; ///gán cứng chứ thương chưa đổi
    this.codxService.navigate('', this.urlView, {
      iterationID: data.iterationID,
    });
    // this.urlView = 'tm/sprintdetails/TMT03011';
    // if (data.iterationID != this.user.userID)
    //   this.urlView += '/' + data.iterationID;
    //   this.codxService.navigate('', this.urlView)
    // this.codxService.navigateMF(e.functionID, this.view.formModel.formName, this.view.formModel.gridViewName, data);
    // Đoạn này em rem lại vì chạy core cũ với lý do core mới lỗi

    // var state = {
    //   iterationID: data?.iterationID,
    // };
    // this.codxService.navigate('', this.urlView,null,state);
  }

  changeView(evt: any) {
    console.log('evt: ', evt);
    var t = this;
  }

  requestEnded(evt: any) {
    // if (evt) {
    //   this.dialog.close();
    // }
  }
  //#endregion
  changeDataMF(e, data) {
    if (e) {
      e.forEach((x) => {
        if (
          (x.functionID == 'SYS02' ||
            x.functionID == 'SYS03' ||
            x.functionID == 'SYS04') &&
          data.iterationID == this.user.userID
        ) {
          x.disabled = true;
        }
      });
    }
  }

  //#region doubeclick carrd
  doubleClick(data) {
    if (this.listMoreFunc.length > 0) {
      this.listMoreFunc.forEach((obj) => {
        if (obj.functionID == 'TMT03012') this.urlView = obj.url;
      });
      this.codxService.navigate('', this.urlView, {
        iterationID: data.iterationID,
      });
    }
  }
  //#end

  onScroll(event) {
    const dcScroll = event.srcElement;
    if (
      dcScroll.scrollTop + dcScroll.clientHeight <
      dcScroll.scrollHeight - 150
    ) {
      return;
    }

    if (this.view.dataService.page < this.view.dataService.pageCount) {
      this.view.dataService.scrolling();
    }
  }

 /// placeholder
  placeholder(
    value: string,
    formModel: FormModel,
    field: string
  ): Observable<string> {
   //if (value) {
      return of(`<span class="cut-size-long">${value}</span>`);
   }
    // else {
    //   return this.cache
    //     .gridViewSetup(formModel.formName, formModel.gridViewName)
    //     .pipe(
    //       map((datas) => {
    //         if (datas && datas[field]) {
    //           var gvSetup = datas[field];
    //           if (gvSetup) {
    //             if (!value) {
    //               var headerText = gvSetup.headerText as string;
    //               return `<div style="height : 40px;"><span class="opacity-50">${headerText}</span></div>`;
    //             }
    //           }
    //         }

    //         return `<span class="opacity-50">${field}</span>`;
    //       })
    //     );
    // }
   //}
}
