import { ChangeDetectorRef, Component, ElementRef, Injector, OnInit, Optional, ViewChild } from '@angular/core';
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
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { CodxHrService } from 'projects/codx-hr/src/public-api';


@Component({
  selector: 'lib-popup-myteam-reponsive',
  templateUrl: './popup-menusidebar-reponsive.component.html',
  styleUrls: ['./popup-menusidebar-reponsive.component.css']
})
export class PopupMenusidebarReponsiveComponent extends UIComponent
implements OnInit  {
  formModel: FormModel;
  dialog: DialogRef;
  EBasicSalaryObj: any;
  idField = 'RecID';
  actionType: string;
  disabledInput = false;
  isMultiCopy: boolean = false;
  employeeId: string | null;
  headerText: 'Đăng ký nghĩ phép';
  autoNumField: string;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;

  //check where to open the form
  employeeObj: any | null;
  actionArray = ['add', 'edit', 'copy'];
  fromListView: boolean = false; //check where to open the form
  showEmpInfo: boolean = true;
  loaded: boolean = false;
  moment = moment;
  employeeSign;
  loadedAutoNum = false;
  originEmpID = '';
  originEmpBeforeSelectMulti: any;
  dateNow = moment().format('YYYY-MM-DD');
  // genderGrvSetup: any;
  //end
  constructor(
    injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.actionType = data?.data?.actionType;
    this.headerText = data?.data?.headerText;
    this.dialog = dialog;
    console.log('dialog nè', this.dialog)

    
  }

  override onInit(): void {
    
  }

  /*Fake data buttons */


button2: ButtonModel = {
    id: 'btn2',
    text: 'Open Sidebar',
    action: 'OpenSidebarRight', 
    disabled: true,
    cssClass: 'btn-secondary'
};

  lstTabFake: any[] = [
    {
      functionID: 1,
      customName: "Dashboard",
      largeIcon: "icon-i-columns-gap" 
    },
    {
      functionID: 2,
      customName: "Thông tin cá nhân",
      largeIcon: "icon-assignment_ind" // Fake icon class
    },
    {
      functionID: 3,
      customName: "Quá trình làm việc",
      largeIcon: "icon-timeline" // Fake icon class
    },
    {
      functionID: 4,
      customName: "Khen thưởng kỷ luật",
      largeIcon: "icon-elevator" // Fake icon class
    },
    {
      functionID: 5,
      customName: "Thông tin phúc lợi",
      largeIcon: "icon-redeem" // Fake icon class
    },
    
    {
      functionID: 6,
      customName: "Thông tin pháp lý",
      largeIcon: "icon-gavel" // Fake icon class
    },
    {
      functionID: 7,
      customName: "Thông tin kiến thức",
      largeIcon: "icon-school" // Fake icon class
    }
    
  ];

  // crrFuncTabNum: number = 1;
  heightList = '50';

  clickTab(item: any) {
    console.log(item)
    // this.crrFuncTabNum = item.functionID;
    this.detectorRef.detectChanges();

  }


  lstFuncCurriculumVitaeFake: any[]= [
    {
      functionID: 1,
      customName: "Thông tin cá nhân",
      largeIcon: "icon-assignment_ind",
      isActive: true
    },
    {
      functionID: 2,
      customName: "Liên hệ",
      largeIcon: "icon-phone",
      isActive: false

    },
    {
      functionID: 3,
      customName: "Công việc",
      largeIcon: "icon-content_paste",
      isActive: false

    },
    {
      functionID: 4,
      customName: "Bộ phận - chức danh",
      largeIcon: "icon-content_paste",
      isActive: false

    },
    {
      functionID: 5,
      customName: "Thân nhân",
      largeIcon: "icon-family_restroom",
      isActive: false

    },
    // {
    //   functionID: 6,
    //   customName: "Thân nhân",
    //   largeIcon: "icon-family_restroom",
    //   isActive: false

    // },
    // {
    //   functionID: 7,
    //   customName: "Thân nhân",
    //   largeIcon: "icon-family_restroom",
    //   isActive: false

    // },
    // {
    //   functionID: 8,
    //   customName: "Thân nhân",
    //   largeIcon: "icon-family_restroom",
    //   isActive: false

    // },
    // {
    //   functionID: 9,
    //   customName: "Thân nhân",
    //   largeIcon: "icon-family_restroom",
    //   isActive: false

    // },
    // {
    //   functionID: 10,
    //   customName: "Thân nhân",
    //   largeIcon: "icon-family_restroom",
    //   isActive: false

    // },
    // {
    //   functionID: 9,
    //   customName: "Thân nhân",
    //   largeIcon: "icon-family_restroom",
    //   isActive: false

    // },
    // {
    //   functionID: 10,
    //   customName: "Thân nhân",
    //   largeIcon: "icon-family_restroom",
    //   isActive: false

    // },
    // {
    //   functionID: 9,
    //   customName: "Thân nhân",
    //   largeIcon: "icon-family_restroom",
    //   isActive: false

    // },
    // {
    //   functionID: 10,
    //   customName: "Thân nhân",
    //   largeIcon: "icon-family_restroom",
    //   isActive: false

    // },
    // {
    //   functionID: 9,
    //   customName: "Thân nhân",
    //   largeIcon: "icon-family_restroom",
    //   isActive: false

    // },
    // {
    //   functionID: 10,
    //   customName: "Thân nhân",
    //   largeIcon: "icon-family_restroom",
    //   isActive: false

    // }
  ]

  lstrewardCatalog: any[]= [
    {
      functionID: 1,
      customName: "Khen thưởng",
      largeIcon: "icon-sentiment_satisfied" // Fake icon class
    },
    {
      functionID: 2,
      customName: "Kỷ luật",
      largeIcon: "icon-sentiment_dissatisfied" // Fake icon class
    }
  ]

  lstFuncBenefits: any[]= [
    {
      functionID: 1,
      customName: "Nhóm lương",
      largeIcon: "icon-attach_money" // Fake icon class
    },
    {
      functionID: 2,
      customName: "Lương cơ bản",
      largeIcon: "icon-attach_money" // Fake icon class
    },
    {
      functionID: 3,
      customName: "Lương chức danh",
      largeIcon: "icon-content_paste" // Fake icon class
    },
    {
      functionID: 4,
      customName: "Phụ cấp",
      largeIcon: "icon-i-heart" // Fake icon class
    },
    {
      functionID: 5,
      customName: "Thu nhập khác",
      largeIcon: "icon-attach_money" // Fake icon class
    },
    // {
    //   functionID: 6,
    //   customName: "Khấu trừ khác",
    //   largeIcon: "icon-attach_money" // Fake icon class
    // }
  ]

  lstFuncLegalFakeInfo: any[]= [
    {
      functionID: 1,
      customName: "CMND - Mã số thuê",
      largeIcon: "icon-assignment_ind" // Fake icon class
    },
    {
      functionID: 2,
      customName: "Bảo hiểm xã hội",
      largeIcon: "icon-phone" // Fake icon class
    },
    {
      functionID: 3,
      customName: "Bảo hiểm y tế",
      largeIcon: "icon-content_paste" // Fake icon class
    },
    {
      functionID: 4,
      customName: "Bảo hiểm thất nghiệp",
      largeIcon: "icon-assignment_ind" // Fake icon class
    },
    {
      functionID: 5,
      customName: "Tài khoản cá nhân",
      largeIcon: "icon-assignment_ind" // Fake icon class
    },
    {
      functionID: 6,
      customName: "Hợp đồng lao động",
      largeIcon: "icon-assignment" // Fake icon class
    }
  ]

  lstFuncJobFakeInfo: any[]= [
    {
      functionID: 1,
      customName: "Bổ nhiệm - điều khiển",
      largeIcon: "icon-compare_arrows" // Fake icon class
    },
    {
      functionID: 2,
      customName: "Nghỉ phép",
      largeIcon: "icon-phone" // Fake icon class
    }
  ]

  lstFuncEducationInfo: any[]= [
    {
      functionID: 1,
      customName: "Chuyên nghành đào tạo",
      largeIcon: "icon-school" // Fake icon class
    },
    {
      functionID: 2,
      customName: "Chứng chỉ",
      largeIcon: "icon-book" // Fake icon class
    },
    {
      functionID: 3,
      customName: "Đào tạo",
      largeIcon: "icon-local_library" // Fake icon class
    },
    {
      functionID: 4,
      customName: "Đánh giá",
      largeIcon: "icon-edit" // Fake icon class
    }
  ]


  // isClick: boolean = false;
  // active = [null, null, null, null, null, null, null];



  navChange(evt: any, index: number = -1, functionID:number = -1, btnClick:any) {
    // let containerList = document.querySelectorAll('.pw-content');
    // let lastDivList = document.querySelectorAll('.div_final');
    // console.log(containerList)
    // let lastDiv = lastDivList[index];
    // let container = containerList[index];
    // console.log('container', container )
    // let containerHeight = (container as any).offsetHeight;
    // let contentHeight = 0;
    // for (let i = 0; i < container.children.length; i++) {
    //   contentHeight += (container.children[i] as any).offsetHeight;
    // }

    // if (!evt) return;
    // let element = document.getElementById(evt);
    // console.log(element)
    // if (!element) return;
    // let distanceToBottom = contentHeight - element.offsetTop;

    // if (distanceToBottom < containerHeight) {
    //   (lastDiv as any).style.width = '200px';
    //   (lastDiv as any).style.height = `${
    //     containerHeight - distanceToBottom + 50
    //   }px`;
    // }

    // if (index > -1) {
    //   this.active[functionID] = evt;
    //   console.log(this.active)
    //   this.detectorRef.detectChanges();
    // }
    // element.scrollIntoView({
    //   behavior: 'smooth',
    //   block: 'start',
    //   inline: 'nearest',
    // });

    // console.log('qua')
    // this.isClick = true;
    // this.detectorRef.detectChanges();
    // setTimeout(() => {
    //   this.isClick = false;
    //   return;
    // }, 500);
  }

  onSectionChange(data: any, index: number = -1) {
    // if (index > -1 && this.isClick == false) {
    //   this.active[index] = data;
    //   console.log(this.active)
    //   this.detectorRef.detectChanges();
    // }
  }


  @ViewChild('navList') navList: ElementRef | undefined;
  showLeftButton: boolean = true;
  showRightButton: boolean = false;

  scroll(direction: string): void {
    const navListWidth = this.navList?.nativeElement.scrollWidth;
    const containerWidth = this.navList?.nativeElement.offsetWidth;
    const scrollPosition = this.navList?.nativeElement.scrollLeft;

    if (direction === 'left') {
      this.navList?.nativeElement.scrollTo({ left: scrollPosition - containerWidth, behavior: 'smooth' });
    } else {
      this.navList?.nativeElement.scrollTo({ left: scrollPosition + containerWidth, behavior: 'smooth' });
    }
  }


  CloseMenuSideBar(){
    this.dialog.close();
  }


  
}




// import { ChangeDetectorRef, Component, ElementRef, Injector, Optional, ViewChild, inject } from '@angular/core';
// import { initSubComponent } from '@syncfusion/ej2-pivotview';
// import { DialogRef, UIComponent } from 'codx-core';

// @Component({
//   selector: 'lib-popup-menusidebar-reponsive',
//   templateUrl: './popup-menusidebar-reponsive.component.html',
//   styleUrls: ['./popup-menusidebar-reponsive.component.css']
// })
// export class PopupMenusidebarReponsiveComponent extends UIComponent {
//   override onInit(): void {
//     throw new Error('Method not implemented.');
//   }

//   dialog: DialogRef;
//   crrFuncTabNum:number ;
//   isClick: boolean = false;
//   infoPersonal: any;

//   active = [null, null, null, null, null, null, null];
  

//   constructor(
//     private df: ChangeDetectorRef,
//     private inject: Injector,
//     @Optional() dialog?: DialogRef,


//   ) {
//     super(inject);
//     this.funcID = 'HRT03b';

//     this.crrFuncTabNum = 1;

//     this.dialog = dialog;
//   }
//   // Fake my data

//   lstTabFake: any[] = [
//     {
//       functionID: 1,
//       customName: "Dashboard",
//       largeIcon: "icon-i-columns-gap" // Fake icon class
//     },
//     {
//       functionID: 2,
//       customName: "Thông tin cá nhân",
//       largeIcon: "icon-assignment_ind" // Fake icon class
//     },
//     {
//       functionID: 3,
//       customName: "Quá trình làm việc",
//       largeIcon: "icon-timeline" // Fake icon class
//     },
//     {
//       functionID: 4,
//       customName: "Khen thưởng kỷ luật",
//       largeIcon: "icon-elevator" // Fake icon class
//     },
//     {
//       functionID: 5,
//       customName: "Thông tin phúc lợi",
//       largeIcon: "icon-redeem" // Fake icon class
//     },
    
//     {
//       functionID: 6,
//       customName: "Thông tin pháp lý",
//       largeIcon: "icon-gavel" // Fake icon class
//     },
//     {
//       functionID: 7,
//       customName: "Thông tin kiến thức",
//       largeIcon: "icon-school" // Fake icon class
//     }
    
//   ];

//   // crrFuncTabNum: number = 1;
//   heightList = '50';

//   clickTab(item: any) {
//     console.log(item)
//     this.crrFuncTabNum = item.functionID;
//     this.detectorRef.detectChanges();

//   }


//   lstFuncCurriculumVitaeFake: any[]= [
//     {
//       functionID: 1,
//       customName: "Lý lịch cá nhân",
//       largeIcon: "icon-assignment_ind",
//       isActive: true
//     },
//     {
//       functionID: 2,
//       customName: "Liên hệ",
//       largeIcon: "icon-phone",
//       isActive: false

//     },
//     {
//       functionID: 3,
//       customName: "Công việc",
//       largeIcon: "icon-content_paste",
//       isActive: false

//     },
//     {
//       functionID: 4,
//       customName: "Bộ phận - chức danh",
//       largeIcon: "icon-content_paste",
//       isActive: false

//     },
//     {
//       functionID: 5,
//       customName: "Thân nhân",
//       largeIcon: "icon-family_restroom",
//       isActive: false

//     },
//     {
//       functionID: 6,
//       customName: "Thân nhân",
//       largeIcon: "icon-family_restroom",
//       isActive: false

//     },
//     {
//       functionID: 7,
//       customName: "Thân nhân",
//       largeIcon: "icon-family_restroom",
//       isActive: false

//     },
//     {
//       functionID: 8,
//       customName: "Thân nhân",
//       largeIcon: "icon-family_restroom",
//       isActive: false

//     },
//     {
//       functionID: 9,
//       customName: "Thân nhân",
//       largeIcon: "icon-family_restroom",
//       isActive: false

//     },
//     {
//       functionID: 10,
//       customName: "Thân nhân",
//       largeIcon: "icon-family_restroom",
//       isActive: false

//     },
//     {
//       functionID: 9,
//       customName: "Thân nhân",
//       largeIcon: "icon-family_restroom",
//       isActive: false

//     },
//     {
//       functionID: 10,
//       customName: "Thân nhân",
//       largeIcon: "icon-family_restroom",
//       isActive: false

//     },
//     {
//       functionID: 9,
//       customName: "Thân nhân",
//       largeIcon: "icon-family_restroom",
//       isActive: false

//     },
//     {
//       functionID: 10,
//       customName: "Thân nhân",
//       largeIcon: "icon-family_restroom",
//       isActive: false

//     },
//     {
//       functionID: 9,
//       customName: "Thân nhân",
//       largeIcon: "icon-family_restroom",
//       isActive: false

//     },
//     {
//       functionID: 10,
//       customName: "Thân nhân",
//       largeIcon: "icon-family_restroom",
//       isActive: false

//     }
//   ]

//   lstrewardCatalog: any[]= [
//     {
//       functionID: 1,
//       customName: "Khen thưởng",
//       largeIcon: "icon-sentiment_satisfied" // Fake icon class
//     },
//     {
//       functionID: 2,
//       customName: "Kỷ luật",
//       largeIcon: "icon-sentiment_dissatisfied" // Fake icon class
//     }
//   ]

//   lstFuncBenefits: any[]= [
//     {
//       functionID: 1,
//       customName: "Nhóm lương",
//       largeIcon: "icon-attach_money" // Fake icon class
//     },
//     {
//       functionID: 2,
//       customName: "Lương cơ bản",
//       largeIcon: "icon-attach_money" // Fake icon class
//     },
//     {
//       functionID: 3,
//       customName: "Lương chức danh",
//       largeIcon: "icon-content_paste" // Fake icon class
//     },
//     {
//       functionID: 4,
//       customName: "Phụ cấp",
//       largeIcon: "icon-i-heart" // Fake icon class
//     },
//     {
//       functionID: 5,
//       customName: "Thu nhập khác",
//       largeIcon: "icon-attach_money" // Fake icon class
//     },
//     {
//       functionID: 6,
//       customName: "Khấu trừ khác",
//       largeIcon: "icon-attach_money" // Fake icon class
//     }
//   ]

//   lstFuncLegalFakeInfo: any[]= [
//     {
//       functionID: 1,
//       customName: "CMND - Mã số thuê",
//       largeIcon: "icon-assignment_ind" // Fake icon class
//     },
//     {
//       functionID: 2,
//       customName: "Bảo hiểm xã hội",
//       largeIcon: "icon-phone" // Fake icon class
//     },
//     {
//       functionID: 3,
//       customName: "Bảo hiểm y tế",
//       largeIcon: "icon-content_paste" // Fake icon class
//     },
//     {
//       functionID: 4,
//       customName: "Bảo hiểm thất nghiệp",
//       largeIcon: "icon-assignment_ind" // Fake icon class
//     },
//     {
//       functionID: 5,
//       customName: "Tài khoản cá nhân",
//       largeIcon: "icon-assignment_ind" // Fake icon class
//     },
//     {
//       functionID: 6,
//       customName: "Hợp đồng lao động",
//       largeIcon: "icon-assignment" // Fake icon class
//     }
//   ]

//   lstFuncJobFakeInfo: any[]= [
//     {
//       functionID: 1,
//       customName: "Bổ nhiệm - điều khiển",
//       largeIcon: "icon-compare_arrows" // Fake icon class
//     },
//     {
//       functionID: 2,
//       customName: "Nghỉ phép",
//       largeIcon: "icon-phone" // Fake icon class
//     }
//   ]

//   lstFuncEducationInfo: any[]= [
//     {
//       functionID: 1,
//       customName: "Chuyên nghành đào tạo",
//       largeIcon: "icon-school" // Fake icon class
//     },
//     {
//       functionID: 2,
//       customName: "Chứng chỉ",
//       largeIcon: "icon-book" // Fake icon class
//     },
//     {
//       functionID: 3,
//       customName: "Đào tạo",
//       largeIcon: "icon-local_library" // Fake icon class
//     },
//     {
//       functionID: 4,
//       customName: "Đánh giá",
//       largeIcon: "icon-edit" // Fake icon class
//     }
//   ]


//   // isClick: boolean = false;
//   // active = [null, null, null, null, null, null, null];



//   navChange(evt: any, index: number = -1, functionID:number = -1, btnClick:any) {
//     let containerList = document.querySelectorAll('.pw-content');
//     let lastDivList = document.querySelectorAll('.div_final');
//     console.log(containerList)
//     let lastDiv = lastDivList[index];
//     let container = containerList[index];
//     console.log('container', container )
//     let containerHeight = (container as any).offsetHeight;
//     let contentHeight = 0;
//     for (let i = 0; i < container.children.length; i++) {
//       contentHeight += (container.children[i] as any).offsetHeight;
//     }

//     if (!evt) return;
//     let element = document.getElementById(evt);
//     console.log(element)
//     if (!element) return;
//     let distanceToBottom = contentHeight - element.offsetTop;

//     if (distanceToBottom < containerHeight) {
//       (lastDiv as any).style.width = '200px';
//       (lastDiv as any).style.height = `${
//         containerHeight - distanceToBottom + 50
//       }px`;
//     }

//     if (index > -1) {
//       this.active[functionID] = evt;
//       console.log(this.active)
//       this.detectorRef.detectChanges();
//     }
//     element.scrollIntoView({
//       behavior: 'smooth',
//       block: 'start',
//       inline: 'nearest',
//     });

//     console.log('qua')
//     this.isClick = true;
//     this.detectorRef.detectChanges();
//     setTimeout(() => {
//       this.isClick = false;
//       return;
//     }, 500);
//   }

//   onSectionChange(data: any, index: number = -1) {
//     if (index > -1 && this.isClick == false) {
//       this.active[index] = data;
//       console.log(this.active)
//       this.detectorRef.detectChanges();
//     }
//   }


//   @ViewChild('navList') navList: ElementRef | undefined;
//   showLeftButton: boolean = true;
//   showRightButton: boolean = false;

//   scroll(direction: string): void {
//     const navListWidth = this.navList?.nativeElement.scrollWidth;
//     const containerWidth = this.navList?.nativeElement.offsetWidth;
//     const scrollPosition = this.navList?.nativeElement.scrollLeft;

//     if (direction === 'left') {
//       this.navList?.nativeElement.scrollTo({ left: scrollPosition - containerWidth, behavior: 'smooth' });
//     } else {
//       this.navList?.nativeElement.scrollTo({ left: scrollPosition + containerWidth, behavior: 'smooth' });
//     }
//   }


//   listField: any = [
//     {
//       id: 'Employeeinfo',
//       name: 'Nhân viên',
//       field: 'FullName',
//       width: 200,
//       textAlign: 'Left',
//       type: 'text',
//     },
//     {
//       id: 'StartWorkingDate',
//       name: 'Tình trạng',
//       field: 'StartWorkingDate',
//       width: 100,
//       textAlign: 'Left',
//       type: 'combobox',
//     },
//     {
//       id: 'Hotline',
//       name: 'Liên hệ',
//       field: 'Phone',
//       width: 100,
//       textAlign: 'Left',
//       type: 'datetime',
//     },
//   ];

//   listThanNhan: any[] = [
//     {
//       FullName: 'Vũ Đại Kỳ',
//       Gender: 1,
//       img: 'assets/images/avar.png',
//       EmployeeCode: 'ELV02269',
//       JobWorking: 'Kiểm thử chất lượng phần mềm',
//       TT: 'Trung tâm CDC',
//       WorkingType: 'Thử việc',
//       StartWorkingDate: new Date().toISOString(),
//       Email: 'nnpvi@lacviet.com.vn',
//       Phone: '(+84) 39-1234-5678',
//     },
//     {
//       FullName: 'Vũ Đại Kỳ',
//       Gender: 1,
//       img: 'assets/images/avar.png',
//       EmployeeCode: 'ELV02269',
//       JobWorking: 'Kiểm thử chất lượng phần mềm',
//       TT: 'Trung tâm CDC',
//       WorkingType: 'Thử việc',
//       StartWorkingDate: new Date().toISOString(),
//       Email: 'nnpvi@lacviet.com.vn',
//       Phone: '(+84) 39-1234-5678',
//     },
//     {
//       FullName: 'Vũ Đại Kỳ',
//       Gender: 1,
//       img: 'assets/images/avar.png',
//       EmployeeCode: 'ELV02269',
//       JobWorking: 'Kiểm thử chất lượng phần mềm',
//       TT: 'Trung tâm CDC',
//       WorkingType: 'Thử việc',
//       StartWorkingDate: new Date().toISOString(),
//       Email: 'nnpvi@lacviet.com.vn',
//       Phone: '(+84) 39-1234-5678',
//     },
//     {
//       FullName: 'Vũ Đại Kỳ',
//       Gender: 1,
//       img: 'assets/images/avar.png',
//       EmployeeCode: 'ELV02269',
//       JobWorking: 'Kiểm thử chất lượng phần mềm',
//       TT: 'Trung tâm CDC',
//       WorkingType: 'Thử việc',
//       StartWorkingDate: new Date().toISOString(),
//       Email: 'nnpvi@lacviet.com.vn',
//       Phone: '(+84) 39-1234-5678',
//     },
//   ];

// }
