import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, NgModel } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ButtonModel } from '@syncfusion/ej2-angular-buttons';
import { classList } from '@syncfusion/ej2-base';
import {
  ApiHttpService,
  CallFuncService,
  CodxListviewComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CodxEsService } from '../codx-es.service';
import { EditSignFileComponent } from './edit-sign-file/edit-sign-file.component';

@Component({
  selector: 'app-sign-process',
  templateUrl: './sign-process.component.html',
  styleUrls: ['./sign-process.component.scss'],
})
export class SignProcessComponent implements OnInit {
  @ViewChild('popup', { static: true }) popup;
  @ViewChild('content', { static: true }) content;

  constructor(
    private esService: CodxEsService,
    private callFunc: CallFuncService,
    private df: ChangeDetectorRef,
    private api: ApiHttpService,
    private modalService: NgbModal
  ) {}

  //auto load page
  autoLoad = true;

  //Tab của task view [{Mới tạo: 1}, {Chờ duyệt: 2}, {Hoàn tất: 3}]
  task_View_Stt;

  //Tab xem thông tin chi tiết của Item [{Mô tả: 1}, {Công việc: 2}, {Qui trình duyệt: 3}]
  item_Detail_Stt;

  //Qui trình duyệt
  processes;

  //Công việc
  jobs;

  //Sign File chi tiết
  item_Detail;

  //Sign File
  item_Detail_Data_Stt;

  //task View
  taskViews;

  //previous StepNo
  preStepNo;

  //Gửi duyệt button
  canRequest;

  openNav = false;
  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  moreFunc: Array<ButtonModel> = [];

  @ViewChild('views') viewChild: ViewsComponent;
  // @ViewChild('uploadFile') uploadFile: TemplateRef<any>;
  @ViewChild('mainPage') mainPage: TemplateRef<any>;
  @ViewChild('listview') listview: CodxListviewComponent;
  @ViewChild('editSFile') editSFile: EditSignFileComponent;



  ngOnInit(): void {
    this.task_View_Stt = '1';
    this.item_Detail_Stt = '3';
    this.item_Detail_Data_Stt = '2';
    this.preStepNo = 0;

    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetListTasksTreeAsync',
        ['2206070006']
      )
      .subscribe((res) => {
        this.taskViews = res;
      });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        sameData: false,
        id: '1',
        type: ViewType.grid,
        active: true,
        model: {
          panelLeftRef: this.mainPage,
          // sideBarRightRef: this.uploadFile,
        },
      },
    ];
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
    this.autoLoad = false;
    this.task_View_Stt = stt;
    this.df.detectChanges();
    this.autoLoad = true;
  }
  clickChangeItemViewStatus(stt, recID) {
    this.item_Detail_Stt = stt;
  }

  clickChangeItemDetailDataStatus(stt) {
    this.item_Detail_Data_Stt = stt;
  }

  changeItemDetail(item) {
    if (item !== null) {

      // item.title = item.title.toUpperCase();


      this.esService.getApprovalTrans(item?.recID).subscribe(res => {
        this.processes = res;
        console.log(res);

        this.df.detectChanges();
      });

      // this.esService.getApprovalTrans(item?.recID).subscribe((res) => {
      //   this.jobs = res;

      //   this.df.detectChanges();
      // });
    }
    this.item_Detail = item;
    if (this.item_Detail != null) {
      this.canRequest = this.item_Detail.approveStatus < 3 ? true : false;
    }
  }

  changeNavState(state) {
    this.openNav = state;
  }

  // clickChangeOpenState(e) {
  //   this.showTaskList = !this.showTaskList;
  // }

  // clickChangeNextTab() {
  //   this.curTab += 1;
  // }

  editSignFile(e) {
    console.log(this.item_Detail);
  }

  viewDetailSignFile(e) {
    console.log(this.item_Detail);
  }

  removeSignFile(e) {
    console.log(this.item_Detail);
  }

  sendToApprove() {
    console.log(this.item_Detail);
  }

  checkStep(current, isChange) {
    if (current == this.preStepNo) {
      return false;
    } else {
      if (isChange) this.preStepNo = current;
      return true;
    }
  }

  setDate(date, leadtime) {
    //
    var res = new Date(date);
    res.setHours(res.getHours() + leadtime);
    return res;
  }
}
