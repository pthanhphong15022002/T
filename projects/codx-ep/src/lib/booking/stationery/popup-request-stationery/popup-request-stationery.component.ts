import { CodxEpService } from './../../../codx-ep.service';
import {
  Component,
  Injector,
  Optional,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  DialogData,
  DialogRef,
  SidebarModel,
  UIComponent,
  FormModel,
  ViewsComponent,
  ScrollComponent,
  NotificationsService,
  UserModel,
  AuthStore,
  ResourceModel,
} from 'codx-core';
import { ApprovalStepComponent } from 'projects/codx-es/src/lib/setting/approval-step/approval-step.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
@Component({
  selector: 'popup-request-stationery',
  templateUrl: './popup-request-stationery.component.html',
  styleUrls: ['./popup-request-stationery.component.scss'],
})
export class PopupRequestStationeryComponent extends UIComponent {
  @ViewChild('view') override view: ViewsComponent;
  @ViewChild('status') status: ElementRef;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('stepAppr') stepAppr: ApprovalStepComponent;
  @ViewChild('content') content;
  @ViewChild('viewApprovalStep') viewApprovalStep: ApprovalStepComponent;

  headerText = 'Thêm mới đăng ký';

  currentTab = 1; // buoc hiện tại
  formModel: FormModel;
  isAfterRender = true;
  cbxName: any = {};
  lstDataFile = [];
  isAddNew: boolean = true; // flag thêm mới signfile
  gvSetup: any;

  isSaved: boolean = false; // flag đã gọi hàm lưu signfile
  isEdit: boolean = false; // flag kiểm tra đã chỉnh sửa thông tin signfile

  lstFile: any = [];

  templateName: string = ''; // tên template khi chọn lưu thành template

  dialog: DialogRef;
  data: any = {};
  isAfterSaveProcess: boolean = false;
  option: SidebarModel;
  showPlan: boolean = true;

  cart = [];
  cartQty = 0;

  user: UserModel;

  model?: FormModel;
  groupStationery;
  lstStationery;

  dialogAddBookingStationery: FormGroup;

  constructor(
    private injector: Injector,
    private auth: AuthStore,
    private epService: CodxEpService,
    private notificationsService: NotificationsService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = data?.data?.formModel;
    this.data = data?.data?.option?.DataService.dataSelected || {};
    this.isAddNew = data?.data?.isAddNew ?? true;
    this.option = data?.data?.option;
  }

  onInit(): void {
    this.user = this.auth.get();

    // this.epService.getStationeryGroup().subscribe((res) => {
    //   console.log(res);
    // });

    this.initForm();
  }

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
  }

  initForm() {
    this.epService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.dialogAddBookingStationery = item;
        if (this.data) {
          this.dialogAddBookingStationery.patchValue({
            resourceType: '6',
          });
        }
        this.isAfterRender = true;
      });
  }

  changeTab(tabNo) {
    this.currentTab = tabNo;

    this.detectorRef.detectChanges();
  }

  beforeSave(option: any) {
    let itemData = this.dialogAddBookingStationery.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAddNew, null, null, this.lstStationery];
    return true;
  }

  onSaveForm() {
    this.dialogAddBookingStationery.patchValue(this.data);
    // this.dialog.dataService
    //   .save((opt: any) => this.beforeSave(opt))
    //   .subscribe((res) => {
    //     this.dialog.close();
    //   });
    console.log(this.dialogAddBookingStationery);
  }

  approve() {
    //Gửi duyệt
    // this.epService
    //   .release(this.data, this.formModel.entityName, this.formModel.funcID)
    //   .subscribe((res) => {
    //     if (res?.msgCodeError == null && res?.rowCount) {
    //       //this.dialogSignFile.patchValue({ approveStatus: '3' });
    //       this.data.approveStatus = '3';
    //       this.epService
    //         .updateBooking(this.data, false, null, null, null)
    //         .subscribe((result) => {
    //           if (res) {
    //             this.notificationsService.notifyCode('EP007');
    //             this.dialog &&
    //               this.dialog.close({
    //                 data: this.data,
    //                 approved: true,
    //               });
    //           }
    //         });
    //     } else {
    //       this.notificationsService.notifyCode(res?.msgCodeError);
    //     }
    //   });
    this.dialog.close();
  }

  close() {
    this.dialog && this.dialog.close();
  }

  //#endregion

  //#region cart

  addCart(event, data) {
    // let tmpResource = new tempResources();
    // tmpResource = { ...data };

    // let isPresent = this.cart.find((item) => item.recID == tmpResource.recID);

    // if (isPresent) {
    //   this.cart.filter((item: tempResources) => {
    //     if (item.recID == tmpResource.recID) {
    //       if (tmpResource.quantity <= tmpResource.availableQty) {
    //         item.quantity = item.quantity + 1;
    //       } else {
    //         this.api
    //           .exec<any>(
    //             'EP',
    //             'ResourceQuotaBusiness',
    //             'GetQuotaByResourceIDAsync',
    //             item.resourceID
    //           )
    //           .subscribe((res: any) => {});
    //         this.notificationsService.notify('Vượt quá sô lượng sẵn có', '3'); //Test
    //       }
    //     }
    //   });
    // } else {
    //   this.cartQty = this.cartQty + 1;
    //   tmpResource.quantity = 1;
    //   if (tmpResource.quantity <= tmpResource.availableQty) {
    //     this.cart.push(tmpResource);
    //     this.cache.message('EP001').subscribe((mssg) => {
    //       this.notificationsService.notify(mssg.defaultName, '1');
    //     });
    //   } else {
    //     this.notificationsService.notify('Hết hàng', '3');
    //   }
    // }
    // console.log(this.cart);
    this.detectorRef.detectChanges();
  }

  //#endregion
  click(data) {}

  clickMF($event, data) {}

  itemByRecID(index, item) {
    return item.recID;
  }

  valueChange() {}
}
