import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  DataRequest,
  DialogRef,
  NotificationsService,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { TM_Sprints } from '../models/TM_Sprints.model';
import { PopupAddSprintsComponent } from './popup-add-sprints/popup-add-sprints.component';
import { PopupShareSprintsComponent } from './popup-share-sprints/popup-share-sprints.component';

@Component({
  selector: 'lib-sprints',
  templateUrl: './sprints.component.html',
  styleUrls: ['./sprints.component.css'],
})
export class SprintsComponent extends UIComponent {
  @ViewChild('listCardSprints') listCardSprints: TemplateRef<any>;
  gridView: any;
  // predicateViewBoards =
  //   '((Owner=@0) or (@1.Contains(outerIt.IterationID))) AND ProjectID=null';
  predicateViewBoards = '(Owner=@0) or (@1.Contains(outerIt.IterationID))';
  predicateProjectBoards =
    '((Owner=@0) or (@1.Contains(outerIt.IterationID))) and ProjectID!=null';
  totalRowMyBoard: number = 6;
  totalRowProjectBoard: number = 6;
  totalViewBoards: number = 0;
  totalProjectBoards: number = 0;
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
  valuelist={}
  constructor(
    inject: Injector,
    private notiService: NotificationsService,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.dataValue = this.user.userID;
    this.funcID = this.activedRouter.params['funcID'];
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
        id: '2',
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
      option.Width = '800px';
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
        option.Width = '800px';
        this.dialog = this.callfc.openSide(
          PopupAddSprintsComponent,
          [this.view.dataService.dataSelected, 'edit'],
          option
        );
      });
  }

  copy(data) {
    this.view.dataService.copy().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '800px';
      this.view.dataService.dataSelected = data;
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
        if (res) this.notiService.notifyCode('TM004');
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
        if (data.iterationID != this.user.userID) this.delete(data);
        break;
      case 'SYS03':
        if (data.iterationID != this.user.userID) this.edit(data);
        break;
      case 'SYS04':
        if (data.iterationID != this.user.userID) this.copy(data);
        break;
      case 'sendemail':
        this.sendemail(data);
        break;
      case 'TMT03011': /// cái này cần hỏi lại để lấy 1 cái cố định gắn vào không được gán thế này, trong database chưa có biến cố định
        if (data.iterationID != this.user.userID) this.shareBoard(e.data, data);
        break;
      case 'TMT03012': /// cái này cần hỏi lại để lấy 1 cái cố định gắn vào không được gán thế này, trong database chưa có biến cố định
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
    // this.urlView = e?.url;
    this.urlView = 'tm/sprintdetails/TMT03011';
    if (data.iterationID != this.user.userID)
      this.urlView += '/' + data.iterationID;
      this.codxService.navigate('', this.urlView)
    // this.codxService.navigateMF(e.functionID, this.view.formModel.formName, this.view.formModel.gridViewName, data);
    // Đoạn này em rem lại vì chạy core cũ với lý do core mới lỗi
   
    // var state = {
    //   iterationID: data?.iterationID,
    // };

    // this.codxService.navigate('', this.urlView,null,state);
  }

  navigate(evt: any, data,url) {
    var res = this.valuelist as any;
    if (res && res.datas) {
      var state = {
       iterationID: data?.iterationID,
      };
      const ds = (res.datas as any[]).find((item) => item.value == data?.iterationID);
      var path = window.location.pathname;
      if (path.endsWith('/' + ds.default)) {
        history.pushState(state, '', path);
      } else {
        url += '/' + ds.default;
        this.codxService.navigate('', url, null, state);
      }
    }
    this.detectorRef.detectChanges()
    console.log(evt);
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
}
