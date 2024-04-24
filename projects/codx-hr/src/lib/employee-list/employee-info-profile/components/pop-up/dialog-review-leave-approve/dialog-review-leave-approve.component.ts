import { Injector, ChangeDetectorRef } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  ButtonModel,
  CodxFormComponent,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import moment from 'moment';

@Component({
  selector: 'lib-dialog-review-leave-approve',
  templateUrl: './dialog-review-leave-approve.component.html',
  styleUrls: ['./dialog-review-leave-approve.component.scss']
})
export class DialogReviewLeaveApproveComponent  extends UIComponent {
  EBasicSalaryObj: any;
  dialog: DialogRef | undefined;
  idField = 'RecID';
  actionType: string;
  disabledInput = false;
  isMultiCopy: boolean = false;
  headerText: 'Đăng ký nghĩ phép';
  @ViewChild('form') form!: CodxFormComponent;



  button: ButtonModel[] = [
    {
      id: 'btnAdd',
      text: 'Open Right Sidebar',
      icon: 'menu',
      action: 'OpenSidebarRight',
      disabled: false,
      cssClass: 'btn-primary text-g',
    }
  ];



  selectedItem: any = null;


  fakeData = [
    {
      name: 'Trần Thế Vinh',
      dateRange: '21/01/2024 - 22/01/2024',
      type: 'Nghỉ chế độ',
      reason: 'Bận việc gia đình nên xin nghỉ phép 1 ngày, sẽ cố gắng hoàn thành task đầy đủ',
      status: 'status1',
      data: {
        name: 'Trần Thế Vinh',
        status: 'status1',
        reason: 'Bận việc gia đình',
        time: "Cả ngày",
        durationTime: "01",
        type: "Phép năm",
        dateRigester: "20/01/2024",
        dateBegin: "21/01/2024",
        dateEnd: "22/01/2024"
      }
    },
    {
      name: 'Nguyễn Văn A',
      dateRange: '18/02/2024 - 20/02/2024',
      type: 'Nghỉ ốm',
      reason: 'Đau bụng, sốt cao',
      status: 'status2',
      data: {
        name: 'Nguyễn Văn A',
        status: 'status2',
        reason: 'Đau bụng, sốt cao',
        time: "Buổi sáng",
        durationTime: "03",
        type: "Phép bệnh",
        dateRigester: "15/02/2024",
        dateBegin: "18/02/2024",
        dateEnd: "20/02/2024"
      }
    },
    {
      name: 'Lê Thị B',
      dateRange: '05/03/2024 - 07/03/2024',
      type: 'Nghỉ thai sản',
      reason: 'Đi sinh con',
      status: 'status3',
      data: {
        name: 'Lê Thị B',
        status: 'status3',
        reason: 'Đi sinh con',
        time: "Cả ngày",
        durationTime: "03",
        type: "Nghỉ thai sản",
        dateRigester: "28/02/2024",
        dateBegin: "05/03/2024",
        dateEnd: "07/03/2024"
      }
    },
    {
      name: 'Phạm Văn C',
      dateRange: '10/03/2024 - 12/03/2024',
      type: 'Nghỉ chế độ',
      reason: 'Cưới con',
      status: 'status1',
      data: {
        name: 'Phạm Văn C',
        status: 'status1',
        reason: 'Cưới con',
        time: "Cả ngày",
        durationTime: "03",
        type: "Nghỉ chế độ",
        dateRigester: "05/03/2024",
        dateBegin: "10/03/2024",
        dateEnd: "12/03/2024"
      }
    },
    
    {
      name: 'Phạm Văn D',
      dateRange: '10/03/2024 - 12/03/2024',
      type: 'Nghỉ chế độ',
      reason: 'Cưới con',
      status: 'status1',
      data: {
        name: 'Phạm Văn D',
        status: 'status1',
        reason: 'Cưới con',
        time: "Cả ngày",
        durationTime: "03",
        type: "Nghỉ chế độ",
        dateRigester: "05/03/2024",
        dateBegin: "10/03/2024",
        dateEnd: "12/03/2024"
      }
    },
    // Add more fake data items as needed
  ];

  

  onItemSelected(item: any): void {
    console.log('hi')
    this.selectedItem = item.data; // Cập nhật dữ liệu chi tiết khi một mục được chọn
  }

  //check where to open the form
  employeeObj: any | null;
  actionArray = ['add', 'edit', 'copy'];
  fromListView: boolean = false; //check where to open the form
  showEmpInfo: boolean = true;
  loaded: boolean = false;
  loadedAutoNum = false;
  originEmpID = '';
  originEmpBeforeSelectMulti: any;
  // genderGrvSetup: any;
  //end
  constructor(
    injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    console.log(this.dialog)

    this.actionType = data?.data?.actionType;
    this.headerText = data?.data?.headerText;


  }

  override onInit(): void {
    if (this.fakeData.length > 0) {
      this.selectedItem = this.fakeData[0].data;
    }
  }

  onClosePopUp(){
    this.dialog?.close();
  }
  heighttest: string = '100'

}