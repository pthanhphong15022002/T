import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  ButtonModel,
  CallFuncService,
  CodxListviewComponent,
  DialogModel,
  DialogRef,
  NotificationsService,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CodxEsService } from '../codx-es.service';
import { PopupAddSignatureComponent } from '../setting/signature/popup-add-signature/popup-add-signature.component';
import { PopupAddSignFileComponent } from './popup-add-sign-file/popup-add-sign-file.component';
import { ViewDetailComponent } from './view-detail/view-detail.component';

@Component({
  selector: 'app-sign-file',
  templateUrl: './sign-file.component.html',
  styleUrls: ['./sign-file.component.scss'],
})
export class SignFileComponent implements OnInit {
  constructor(
    private esService: CodxEsService,
    private df: ChangeDetectorRef,
    private notifySv: NotificationsService,
    private callfunc: CallFuncService,
    private activedRouter: ActivatedRoute
  ) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }
  @ViewChild('popup', { static: true }) popup;
  @ViewChild('content', { static: true }) content;
  @ViewChild('listview') listview: CodxListviewComponent;
  @ViewChild('editSFile') editSFile: PopupAddSignFileComponent;
  @ViewChild('viewdetail') viewdetail: ViewDetailComponent;
  @ViewChild('paneLeft') panelLeft: TemplateRef<any>;
  @ViewChild('paneRight') panelRight: TemplateRef<any>;
  @ViewChild('itemTemplate') template: TemplateRef<any>;
  @ViewChild('view') view: ViewsComponent;

  autoLoad = true;
  taskViewStt;
  jobs;
  itemDetail;
  preStepNo;
  button;

  funcID: string;
  service = 'ES';
  assemblyName = 'ES';
  entity = 'ES_SignFiles';
  className = 'SignFilesBusiness';
  method = 'GetAsync';
  dataSelected;
  SidebarModel;

  dialog: DialogRef;

  buttons: Array<ButtonModel> = [];
  moreFunc: Array<ButtonModel> = [];

  views: Array<ViewModel> | any = []; // @ViewChild('uploadFile') uploadFile: TemplateRef<any>;

  ngOnInit(): void {
    this.taskViewStt = '1';
    this.preStepNo = 0;
    this.button = {
      id: 'btnAdd',
    };
  }

  ngAfterViewInit(): void {
    this.view.dataService.methodDelete = 'DeleteSignFileAsync';
    this.view.dataService.dataValue = '1';
    this.view.dataService.predicate = 'ApproveStatus=@0';
    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.template,
          panelLeftRef: this.panelLeft,
          panelRightRef: this.panelRight,
          contextMenu: '',
        },
      },
    ];
    this.df.detectChanges();
  }

  clickChangeTaskViewStatus(stt) {
    if (this.taskViewStt != stt) {
      this.taskViewStt = stt;
      this.view.dataService.predicate = 'ApproveStatus=@0';
      this.view.dataService.dataValue = stt;
      this.view.dataService
        .setPredicates(['ApproveStatus=@0'], [stt])
        .subscribe((item) => {});
    }
  }

  changeItemDetail(event) {
    this.itemDetail = event?.data;
  }

  editSignFile(e) {
    console.log(this.itemDetail);
  }

  viewDetailSignFile(e) {
    console.log(this.itemDetail);
  }

  removeSignFile(e) {
    console.log(this.itemDetail);
  }

  sendToApprove() {
    console.log(this.itemDetail);
  }

  checkStep(current, isChange) {
    if (current == this.preStepNo) {
      return false;
    } else {
      if (isChange) this.preStepNo = current;
      return true;
    }
  }

  closeAddForm(event) {
    this.dialog && this.dialog.close();
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
    }
  }

  addNew(evt?) {
    this.view.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.view.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;

      let dialogModel = new DialogModel();
      dialogModel.IsFull = true;
      this.dialog = this.callfunc.openForm(
        PopupAddSignFileComponent,
        'Thêm mới',
        700,
        650,
        this.funcID,
        {
          isAddNew: true,
          dataSelected: this.view.dataService.dataSelected,
          isAdd: true,
          formModel: this.view?.currentView?.formModel,
        },
        '',
        dialogModel
      );
    });
  }

  edit(data) {
    // let item = this.codxViews.dataService.dataSelected;
    // if (evt) {
    //   item = evt;
    // }
    // this.codxViews.dataService.edit(item).subscribe((res) => {
    //   this.dataSelected = this.codxViews.dataService.dataSelected;
    //   let option = new SidebarModel();
    //   option.Width = '800px';
    //   option.DataService = this.codxViews?.currentView?.dataService;
    //   option.FormModel = this.codxViews?.currentView?.formModel;
    //   this.dialog = this.callfunc.openSide(
    //     PopupAddSignatureComponent,
    //     [item, false],
    //     option
    //   );
    // });
  }

  clickMF(event: any, data) {
    this.viewdetail.openFormFuncID(event, data);
    // switch (event?.functionID) {

    //   case 'SYS03':
    //     this.edit(data);
    //     this.viewdetail.openFormFuncID(event, data);
    //     break;
    //   case 'SYS02':
    //     this.viewdetail.openFormFuncID(event, data);
    //     break;
    // }
  }

  viewChange(e: any) {}
}
