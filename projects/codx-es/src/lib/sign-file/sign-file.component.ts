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
  ApiHttpService,
  ButtonModel,
  CallFuncService,
  CodxListviewComponent,
  DialogRef,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CodxEsService } from '../codx-es.service';
import { PopupAddSignatureComponent } from '../setting/signature/popup-add-signature/popup-add-signature.component';
import { PopupAddSignFileComponent } from './popup-add-sign-file/popup-add-sign-file.component';

@Component({
  selector: 'app-sign-file',
  templateUrl: './sign-file.component.html',
  styleUrls: ['./sign-file.component.scss'],
})
export class SignFileComponent implements OnInit {
  @ViewChild('popup', { static: true }) popup;
  @ViewChild('content', { static: true }) content;

  constructor(
    private esService: CodxEsService,
    private callFunc: CallFuncService,
    private df: ChangeDetectorRef,
    private api: ApiHttpService,
    private modalService: NgbModal,
    private callfunc: CallFuncService,
    private activedRouter: ActivatedRoute
  ) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

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
  @ViewChild('listview') listview: CodxListviewComponent;
  @ViewChild('editSFile') editSFile: PopupAddSignFileComponent;
  @ViewChild('viewdetail') viewdetail: PopupAddSignFileComponent;
  @ViewChild('paneLeft') panelLeft: TemplateRef<any>;
  @ViewChild('paneRight') panelRight: TemplateRef<any>;
  @ViewChild('itemTemplate') template: TemplateRef<any>;
  @ViewChild('codxViews') codxViews: ViewsComponent;

  ngOnInit(): void {
    this.taskViewStt = '1';
    this.preStepNo = 0;
    this.button = {
      id: 'btnAdd',
    };
  }

  ngAfterViewInit(): void {
    this.codxViews.dataService.dataValue = '1';
    this.codxViews.dataService.predicate = 'ApproveStatus=@0';
    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.template,
          panelLeftRef: this.panelLeft,
          panelRightRef: this.panelRight,
        },
      },
    ];
  }

  clickChangeTaskViewStatus(stt) {
    if (this.taskViewStt != stt) {
      this.taskViewStt = stt;
      this.codxViews.dataService.predicate = 'ApproveStatus=@0';
      this.codxViews.dataService.dataValue = stt;
      this.codxViews.dataService.load().subscribe();
    }
  }

  changeItemDetail(event) {
    this.itemDetail = event.data;
  }

  // clickChangeOpenState(e) {
  //   this.showTaskList = !this.showTaskList;
  // }

  // clickChangeNextTab() {
  //   this.curTab += 1;
  // }

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
      case 'btnEdit':
        this.edit();
        break;
      case 'btnDelete':
        this.delete();
        break;
    }
  }

  addNew(evt?) {
    this.codxViews.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.codxViews.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '750px';
      option.DataService = this.codxViews?.currentView?.dataService;
      option.FormModel = this.codxViews?.currentView?.formModel;
      this.dialog = this.callfunc.openForm(
        PopupAddSignFileComponent,
        'Thêm mới',
        700,
        650,
        '',
        [
          {
            dataSelected: this.codxViews.dataService.dataSelected,
            isAdd: true,
            formModel: this.codxViews?.currentView?.formModel,
          },
        ]
      );
    });
  }

  edit(evt?) {
    let item = this.codxViews.dataService.dataSelected;
    if (evt) {
      item = evt;
    }
    this.codxViews.dataService.edit(item).subscribe((res) => {
      this.dataSelected = this.codxViews.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '750px';
      option.DataService = this.codxViews?.currentView?.dataService;
      option.FormModel = this.codxViews?.currentView?.formModel;

      this.dialog = this.callfunc.openSide(
        PopupAddSignatureComponent,
        [item, false],
        option
      );
    });
  }

  delete(evt?) {
    let deleteItem = this.codxViews.dataService.dataSelected;
    if (evt) {
      deleteItem = evt;
    }
    this.codxViews.dataService.delete([deleteItem]).subscribe((res) => {
      console.log(res);
    });
  }

  clickMF(event: any, data) {
    switch (event?.functionID) {
      case 'edit':
        this.edit(data);
        break;
      case 'delete':
        this.delete(data);
        break;
    }
  }
}
