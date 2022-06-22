import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ButtonModel } from '@syncfusion/ej2-angular-buttons';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import {
  ApiHttpService,
  CallFuncService,
  CodxListviewComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CodxEsService } from '../codx-es.service';
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
    private modalService: NgbModal
  ) {}

  autoLoad = true;
  taskViewStt;
  jobs;
  itemDetail;
  preStepNo;
  button;

  funcID = 'EST01';
  service = 'ES';
  assemblyName = 'ES';
  entity = 'ES_SignFiles';
  className = 'SignFilesBusiness';
  method = 'GetAsync';

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

    // this.api
    //   .execSv<any>(
    //     'TM',
    //     'ERM.Business.TM',
    //     'TaskBusiness',
    //     'GetListTasksTreeAsync',
    //     ['2206070006']
    //   )
    //   .subscribe((res) => {
    //     this.taskViews = res;
    //   });
  }

  ngAfterViewInit(): void {
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
    this.codxViews.dataService.dataValue = '1';
    this.codxViews.dataService.predicate = 'ApproveStatus=@0';
  }

  addNew(e) {
    //this.viewChild.currentView.openSidebarRight();
    this.modalService
      .open(this.content, { centered: true, size: 'lg' })
      .result.then(
        (result) => {},
        (reason) => {
          if (this.editSFile) {
            this.editSFile.deleteSignFile();
          }
        }
      );
  }

  clickChangeTaskViewStatus(stt) {
    this.taskViewStt = stt;
    this.codxViews.dataService.predicate = 'ApproveStatus=@0';
    this.codxViews.dataService.dataValue = stt;
    this.codxViews.dataService.load().subscribe();
    this.codxViews.currentView.resize(0, 1000);
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

  click(e) {}

  closeEditForm(e) {}
}
