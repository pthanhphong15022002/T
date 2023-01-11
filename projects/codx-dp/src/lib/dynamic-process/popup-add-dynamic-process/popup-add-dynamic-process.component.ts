import { log } from 'console';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { PopupJobComponent } from './popup-job/popup-job.component';
import {
  DialogData,
  DialogRef,
  ApiHttpService,
  CallFuncService,
  SidebarModel,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { environment } from 'src/environments/environment';
import { PopupAddCustomFieldComponent } from './popup-add-custom-field/popup-add-custom-field.component';
import { DP_Processes } from '../../models/models';
import { PopupRolesDynamicComponent } from './popup-roles-dynamic/popup-roles-dynamic.component';

@Component({
  selector: 'lib-popup-add-dynamic-process',
  templateUrl: './popup-add-dynamic-process.component.html',
  styleUrls: ['./popup-add-dynamic-process.component.scss'],
})
export class PopupAddDynamicProcessComponent implements OnInit {
  @ViewChild('status') status: ElementRef;
  @ViewChild('imageAvatar') imageAvatar: AttachmentComponent;
  @ViewChild('setJobPopup') setJobPopup: TemplateRef<any>;
  process = new DP_Processes();

  dialog: any;
  currentTab = 1; //Bước hiện tại
  processTab = 0; // Tổng bước đã đi qua

  newNode: number; //vị trí node mới
  oldNode: number; // Vị trí node cũ
  funcID: any;
  isShow = true; //Check mở form
  isAddNew = true;
  attachment: any;
  linkAvatar = '';
  vllShare = 'ES014';
  showID = true;
  //!--ID SHOW FORM !--//
  general = true;
  role = true;
  settingProcess = true;
  memoProcess = true;
  //!--ID SHOW FORM !--//

  isViewSuccess = false;
  isViewReason = false;
  viewStepCrr = 'custom';

  //stage-nvthuan
  popupJob: DialogRef;
  dataStage = [
    {
      id: 1,
      name: 'Tiếp nhận yêu cầu',
      time: '5',
      phase: 3,
    },
    {
      id: 12,
      name: 'Đánh giá giả năng',
      time: '5',
      phase: 3,
    },
    {
      id: 13,
      name: 'Tiếp nhận yêu cầu',
      time: '5',
      phase: 3,
    },
    {
      id: 14,
      name: 'Tiếp nhận yêu cầu',
      time: '5',
      phase: 3,
    },
    {
      id: 15,
      name: 'Tiếp nhận yêu cầu',
      time: '5',
      phase: 3,
    },
    {
      id: 16,
      name: 'Tiếp nhận yêu cầu',
      time: '5',
      phase: 3,
    },
    {
      id: 16,
      name: 'Tiếp nhận yêu cầu',
      time: '5',
      phase: 3,
    },
    {
      id: 16,
      name: 'Tiếp nhận yêu cầu',
      time: '5',
      phase: 3,
    },
    {
      id: 16,
      name: 'Tiếp nhận yêu cầu',
      time: '5',
      phase: 3,
    },
    {
      id: 16,
      name: 'Tiếp nhận yêu cầu',
      time: '5',
      phase: 3,
    },
    {
      id: 16,
      name: 'Tiếp nhận yêu cầu',
      time: '5',
      phase: 3,
    },
    {
      id: 16,
      name: 'Tiếp nhận yêu cầu',
      time: '5',
      phase: 3,
    },
    {
      id: 16,
      name: 'Tiếp nhận yêu cầu',
      time: '5',
      phase: 3,
    },
  ]
  listJobType=[
      {id: 'P', icon: 'icon-i-layout-three-columns', text: 'Cuộc gọi', funcID: 'BPT101', color:{background: '#f1ff19'}},
      {id: 'T', icon: 'icon-i-journal-check', text: 'Công việc', funcID: 'BPT103', color:{background: '#ffa319'}},
      {id: 'E', icon: 'icon-i-envelope', text: 'Gửi mail', funcID: 'BPT104', color:{background: '#4799ff'}},
      {id: 'M', icon: 'icon-i-calendar-week', text: 'Cuộc họp', funcID: 'BPT105',color:{background: '#ff9adb'}},
      {id: 'Q', icon: 'icon-i-clipboard-check', text: 'Khảo sát', funcID: 'BPT106',color:{background: '#1bc5bd'}},
  ]
  jobType: any;
  //stage-nvthuan
  dataStep = []; //cong đoạn chuẩn để add trường tùy chỉnh
  //
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  //data test Thao
  arrSteps = [
    {
      recID: '41ebc7b7-8ed2-4f76-9eac-e336695cf6a9',
      stepName: 'Quy trinh test',
      showColumnControl: 1,
      stepField: [
        {
          fieldName: 'File Name1',
          note: 'File nay de cho có',
          dataType: 'Text',
          sorting: 1,
        },
        {
          fieldName: 'File Name2',
          note: 'File nay de cho có',
          dataType: 'Text',
          sorting: 2,
        },
        {
          fieldName: 'File Name3',
          note: 'File nay de cho có',
          dataType: 'Text',
          sorting: 3,
        },
        {
          fieldName: 'File Name4',
          note: 'File nay de cho có',
          dataType: 'Text',
          sorting: 4,
        },
        {
          fieldName: 'File Name5',
          note: 'File nay de cho có',
          dataType: 'Text',
          sorting: 5,
        },
        {
          fieldName: 'File Name6',
          note: 'File nay de cho có',
          dataType: 'Text',
          sorting: 6,
        },
      ],
    },
  ];
  crrData: any;

  isTurnOnYesNo: boolean = false; //Create variable Click yes/no for reason success/failure
  titleReasonYes: string = 'Có'; // title radio button for reason success/failure
  titleReasonNo: string = 'Không'; // title radio button for reason success/failure
  viewReasonSuccess: string = 'viewReasonSuccess'; // test click view Reason Success
  viewReasonFail: string = 'viewReasonFail'; // test click view Reason Success
  ngTemplateOutlet: any;

  isShowstage = true;
  isShowstageCauseSuccess = true;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private callfc: CallFuncService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.process = JSON.parse(JSON.stringify(data.data.data));
  }

  data = [
    {
      item: 'Spacing utilities that apply',
      name: 'Tính chất của một trận bán kết khiến HLV Park Hang-seo lẫn Shin Tae-yong đều phải thận trọng 1. ',
      data: [
        {
          item: 'Item 112',
          data: {
            name: 'Đây là điều khác hẳn so với những lần gặp nhau trước đây. ',
            item: 'Item3',
          },
        },
        {
          item: 'Spacing utilities that apply',
          data: {
            name: 'Đây là điều khác hẳn so với những lần gặp nhau trước đây. ',
            item: 'Item3',
          },
        },
        {
          item: 'Item 117',
          data: {
            name: 'Đây là điều khác hẳn so với những lần gặp nhau trước đây. ',
            item: 'Item3',
          },
        },
      ],
    },
    {
      item: 'Item 2',
      name: 'Tính chất của một trận bán kết khiến HLV Park Hang-seo lẫn Shin Tae-yong đều phải thận trọng 1. ',
      data: [
        {
          item: 'Item 118',
          data: {
            name: 'Đây là điều khác hẳn so với những lần gặp nhau trước đây. ',
            item: 'Item3',
          },
        },
        {
          item: 'Item 119',
          data: {
            name: 'Đây là điều khác hẳn so với những lần gặp nhau trước đây. ',
            item: 'Item3',
          },
        },
        {
          item: 'Item 116',
          data: {
            name: 'Đây là điều khác hẳn so với những lần gặp nhau trước đây. ',
            item: 'Item3',
          },
        },
      ],
    },
    {
      item: 'Item 3',
      name: 'Tính chất của một trận bán kết khiến HLV Park Hang-seo lẫn Shin Tae-yong đều phải thận trọng 1. ',
      data: [
        {
          item: 'Item 1111',
          data: {
            name: 'Đây là điều khác hẳn so với những lần gặp nhau trước đây. ',
            item: 'Item3',
          },
        },
        {
          item: 'Item 1131',
          data: {
            name: 'Đây là điều khác hẳn so với những lần gặp nhau trước đây. ',
            item: 'Item3',
          },
        },
        {
          item: 'Item 11134',
          data: {
            name: 'Đây là điều khác hẳn so với những lần gặp nhau trước đây. ',
            item: 'Item3',
          },
        },
      ],
    },
  ];

  ngOnInit(): void {
    // this.updateNodeStatus(0,1);
  }

  //#region onSave
  onSave() {}
  //#endregion

  //#region Change Tab
  //Click từng tab - mặc định thêm mới = 0
  clickTab(tabNo) {
    //if (tabNo <= this.processTab && tabNo != this.currentTab) {
    if (tabNo != this.currentTab) {
      this.updateNodeStatus(this.currentTab, tabNo);
      this.currentTab = tabNo;
    }
  }

  //#region Open form
  show() {
    this.isShow = !this.isShow;
  }
  showStage() {
    this.isShowstage = !this.isShowstage;
  }
  //#endregion
  //Setting class status Active
  updateNodeStatus(oldNode: number, newNode: number) {
    let nodes = Array.from(
      (this.status.nativeElement as HTMLElement).childNodes
    );
    let newClassName = (nodes[newNode] as HTMLElement).className;
    switch (newClassName) {
      case 'stepper-item':
        (nodes[newNode] as HTMLElement).classList.add('active');

        break;
      case 'stepper-item approve-disabled':
        (nodes[newNode] as HTMLElement).classList.remove('approve-disabled');
        (nodes[newNode] as HTMLElement).classList.add('approve');
        break;
    }

    let oldClassName = (nodes[oldNode] as HTMLElement).className;
    switch (oldClassName) {
      case 'stepper-item approve':
        (nodes[oldNode] as HTMLElement).classList.remove('approve');
        break;
      case 'stepper-item active':
        (nodes[oldNode] as HTMLElement).classList.remove('active');
        break;
    }
    if (oldNode > newNode && this.currentTab == this.processTab) {
    } else {
      (nodes[oldNode] as HTMLElement).classList.add('approve-disabled');
    }
  }

  //Tiếp tục qua tab
  async continue(currentTab) {
    if (this.currentTab > 2) return;

    let oldNode = currentTab;
    let newNode = oldNode + 1;

    switch (currentTab) {
      case 0:
        this.updateNodeStatus(oldNode, newNode);
        this.currentTab++;
        this.processTab == 0 && this.processTab++;
        break;
      case 1:
        this.newNode = newNode;
        this.oldNode = oldNode;
        this.updateNodeStatus(oldNode, newNode);
        this.processTab++;
        break;
      case 2:
        this.updateNodeStatus(oldNode, newNode);
        this.currentTab++;
        this.processTab++;
        break;
    }

    this.changeDetectorRef.detectChanges();
  }

  previous(currentTab) {
    let oldNode = currentTab;
    let newNode = oldNode - 1;
    this.updateNodeStatus(oldNode, newNode);
    this.currentTab--;
  }
  saveAndClose() {}

  //#region THÔNG TIN QUY TRÌNH - PHÚC LÀM

  //Avt
  addAvatar() {
    this.imageAvatar.referType = 'avt';
    this.imageAvatar.uploadFile();
  }
  fileImgAdded(e) {
    if (e?.data && e?.data?.length > 0) {
      var countListFile = e.data.length;
      this.linkAvatar = e?.data[countListFile - 1].avatar;

      this.changeDetectorRef.detectChanges();
    }
  }

  getAvatar(process) {
    let avatar = [
      '',
      this.funcID,
      process?.recID,
      'BP_Processes',
      'inline',
      1000,
      process?.processName,
      'avt',
      false,
    ];
    this.api
      .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', avatar)
      .subscribe((res) => {
        if (res && res?.url) {
          this.linkAvatar = environment.urlUpload + '/' + res?.url;
          this.changeDetectorRef.detectChanges();
        }
      });
  }
  //end

  //Control share
  sharePerm(share) {
    this.callfc.openForm(share, '', 420, window.innerHeight);
  }

  applyShare(e) {}

  addFile(e) {
    this.attachment.uploadFile();
  }

  clickRoles(e) {
    this.callfc.openForm(PopupRolesDynamicComponent, '', 950, 650, '',[e],'',this.dialog);
  }

  //end
  //#endregion THÔNG TIN QUY TRÌNH - PHÚC LÀM ------------------------------------------------------------------ >>>>>>>>>>

  //#region Trường tùy chỉnh
  clickShow(e, id) {
    let children = e.currentTarget.children[0];
    let element = document.getElementById(id);
    if (element) {
      let isClose = element.classList.contains('hidden-main');
      let isShow = element.classList.contains('show-main');
      if (isClose) {
        children.classList.add('icon-expand_less');
        children.classList.remove('icon-expand_more');
        element.classList.remove('hidden-main');
        element.classList.add('show-main');
      } else if (isShow) {
        element.classList.remove('show-main');
        element.classList.add('hidden-main');
        children.classList.remove('icon-expand_less');
        children.classList.add('icon-expand_more');
      }
    }
  }

  //add trường tùy chỉnh
  addCustomField(stepID) {
    let titleAction = '';
    let option = new SidebarModel();
    // option.DataService = this.view?.dataService;
    // option.FormModel = this.view?.formModel;
    option.Width = '550px';
    option.zIndex = 1010;
    var dialogCustomField = this.callfc.openSide(
      PopupAddCustomFieldComponent,
      ['add', titleAction],
      option
    );
    dialogCustomField.closed.subscribe((e) => {
      if (e.event != null) {
        //xu ly data đổ về
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  popoverSelectView(p, data) {
    this.crrData = data;
    p.open();
  }
  selectView(showColumnControl) {
    this.arrSteps.forEach((x) => {
      if (x.recID == this.crrData.recID)
        x.showColumnControl = showColumnControl;
    });
    this.changeDetectorRef.detectChanges();
  }
  //#endregion

  //#region BẢo gà viết vào đây
  valueChangeQuyTrinhChuyenDen() {}
  clickMF($event, data) {}

  showStageCauseSuccess() {
    this.isShowstageCauseSuccess = !this.isShowstageCauseSuccess;
  }

  //#stage -- nvthuan
  drop(event: CdkDragDrop<string[]>, data = null) {
    if (event.previousContainer === event.container) {
      if (data) {
        moveItemInArray(data, event.previousIndex, event.currentIndex);
      } else {
        moveItemInArray(
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
      }
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  //job -- nvthuan
  setJob() {
    this.popupJob = this.callfc.openForm(this.setJobPopup, '', 400, 400);
  }
  selectJob(id){
    let btn = document.getElementById(id);
    console.log(btn);
    
  }
  getTypeJob(e,value){
    this.jobType = value;
    
  }
  openPopupJob() {
    this.popupJob.close();
    let option = new SidebarModel();
    option.Width = '550px';
    option.zIndex = 1001;
    let dialog = this.callfc.openSide(
      PopupJobComponent,
      [
        'add',
        this.jobType
      ],
      option,
      
    );
    dialog.closed.subscribe((e) => {
      this.jobType = null
    })
  }
  //#job end
  //#stage -- end -- nvthuan

  //#region for reason successful/failed
  valueChangeSwtich($event: any, typeFeild: any) {
    if ($event && $event != null) {
      if (typeFeild === 'yes') {
        this.isTurnOnYesNo = $event.data ? true : false;
      }
      this.changeDetectorRef.detectChanges();
    }
  }
  clickViewReason($event: any, view: any) {
    if ($event && $event != null) {
      if (view === 'clickReasonsuccesss') {
        // isViewSuccess
        this.viewStepCrr = 'success';
      } else if (view === 'fail') {
        this.viewStepCrr = 'fail';

        //  this.ngTemplateOutlet = this.reasonFail;
      } else this.viewStepCrr = 'custom';
    }
    this.changeDetectorRef.detectChanges();
  }

  //#endregion
}
