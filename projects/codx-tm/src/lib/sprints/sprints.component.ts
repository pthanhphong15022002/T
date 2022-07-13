import { I } from '@angular/cdk/keycodes';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ApiHttpService,
  AuthStore,
  ButtonModel,
  CallFuncService,
  CodxListviewComponent,
  CodxService,
  CRUDService,
  DataRequest,
  DialogRef,
  NotificationsService,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CodxTMService } from '../codx-tm.service';
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

  // @ViewChild('lstViewBoard') lstViewBoard: CodxListviewComponent;
  // @ViewChild('lstProjectBoard') lstProjectBoard: CodxListviewComponent;
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
  constructor(
    private inject: Injector,
    private tmSv: CodxTMService,
    private notiService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore,
    private codxService: CodxService,
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
    this.changeDetectorRef.detectChanges();
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
      .subscribe(res => {
        if (res) this.notiService.notifyCode('TM004'); else this.notiService.notify('Xóa không thành công ! Vui lòng....');//cần code để gọi mes
      })
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
      case 'btnAdd':
        this.add();
        break;
      case 'edit':
        if (data.iterationID != this.user.userID)
          this.edit(data);
        break;
      case 'copy':
        if (data.iterationID != this.user.userID)
          this.copy(data);
        break;
      case 'delete':
        if (data.iterationID != this.user.userID)
          this.delete(data);
        break;
      case 'sendemail':
        this.sendemail(data);
        break;
      case 'TMT03011': /// cái này cần hỏi lại để lấy 1 cái cố định gắn vào không được gán thế này, trong database chưa có biến cố định
        if (data.iterationID != this.user.userID)
          this.shareBoard(e, data);
        break;
      case 'TMT03012': /// cái này cần hỏi lại để lấy 1 cái cố định gắn vào không được gán thế này, trong database chưa có biến cố định
        this.viewBoard(e, data);
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
  sendemail(data) { }

  shareBoard(e, data) {
    var listUserDetail = [];
    if (data.iterationID) {
      var obj = {
        boardAction: data,
        listUserDetail: listUserDetail,
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
    if (data.iterationID != this.user.userID)
      this.urlView += '/' + data.iterationID;
    this.codxService.navigateMF(e.functionID, this.view.formModel.formName, this.view.formModel.gridViewName, data);
    //this.codxService.navigate('',this.urlView)
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

}
