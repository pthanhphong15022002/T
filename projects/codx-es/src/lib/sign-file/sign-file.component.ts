import {
  ChangeDetectorRef,
  Component,
  Injector,
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
  UIComponent,
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
export class SignFileComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private esService: CodxEsService,
    private df: ChangeDetectorRef,
    private notifySv: NotificationsService,
    private callfunc: CallFuncService,
    private activedRouter: ActivatedRoute
  ) {
    super(inject);
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
  idField = 'recID';

  predicate = '';
  datavalue = '';
  dataSelected = '';
  SidebarModel;

  dialog: DialogRef;

  buttons: Array<ButtonModel> = [];
  views: Array<ViewModel> | any = []; // @ViewChild('uploadFile') uploadFile: TemplateRef<any>;

  onInit(): void {
    this.taskViewStt = '1';
    this.preStepNo = 0;
    this.button = {
      id: 'btnAdd',
    };

    // this.esService.getSFByUserID(['ADMIN', '5']).subscribe((res) => {
    //   console.log('kq', res);
    // });
    // this.cache.functionList('EST021').subscribe((res) => {
    //   console.log('funcList', res);
    // });
  }

  ngAfterViewInit(): void {
    this.view.dataService.methodDelete = 'DeleteSignFileAsync';
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

  getDetailSignFile(id: any) {
    this.esService
      .getDetailSignFile(this.itemDetail?.recID)
      .subscribe((res) => {
        if (res) {
          this.itemDetail = res;
          this.df.detectChanges();
        }
      });
  }

  sendToApprove() {
    console.log(this.itemDetail);
  }

  closeAddForm(event) {
    //this.dialog && this.dialog.close();
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
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;

      let dialogModel = new DialogModel();
      dialogModel.IsFull = true;
      let dialogAdd = this.callfunc.openForm(
        PopupAddSignFileComponent,
        'Thêm mới',
        700,
        650,
        this.funcID,
        {
          isAddNew: true,
          formModel: this.view?.formModel,
          option: option,
        },
        '',
        dialogModel
      );
      dialogAdd.closed.subscribe((x) => {
        if (x.event) {
          if (x.event?.approved) {
            this.view.dataService.add(x.event.data, 0).subscribe();
          } else {
            delete x.event._uuid;
            this.view.dataService.add(x.event, 0).subscribe();
            //this.getDtDis(x.event?.recID)
          }
        }
      });
    });
  }

  setStyles(color): any {
    let styles = {
      backgroundColor: color,
      color: 'white',
    };
    return styles;
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
