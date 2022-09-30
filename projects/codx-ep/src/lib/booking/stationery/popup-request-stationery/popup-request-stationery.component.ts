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
} from 'codx-core';
import { ApprovalStepComponent } from 'projects/codx-es/src/lib/setting/approval-step/approval-step.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { tempResources } from '../../../models/EP_Resources.models';
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
    this.initForm();
  }

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
  }

  initForm() {
    this.epService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        debugger;
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

  close() {
    this.dialog && this.dialog.close();
  }

  //#endregion

  //#region cart

  addCart(event, data: tempResources) {
    let tmpResource = new tempResources();
    tmpResource = { ...data };

    let isPresent = this.cart.find((item) => item.recID == tmpResource.recID);

    if (isPresent) {
      this.cart.filter((item: tempResources) => {
        if (item.recID == tmpResource.recID) {
          if (tmpResource.quantity <= tmpResource.availableQty) {
            item.quantity = item.quantity + 1;
          } else {
            this.notificationsService.notify('Vượt quá sô lượng sẵn có', '3');
          }
        }
      });
    } else {
      this.cartQty = this.cartQty + 1;
      tmpResource.quantity = 1;
      if (tmpResource.quantity <= tmpResource.availableQty) {
        this.cart.push(tmpResource);
        this.cache.message('EP001').subscribe((mssg) => {
          this.notificationsService.notify(mssg.defaultName, '1');
        });
      } else {
        this.notificationsService.notify('Hết hàng', '3');
      }
    }
    console.log(this.cart);
    this.detectorRef.detectChanges();
  }

  //#endregion
  click(data) {}

  clickMF($event, data) {}

  itemByRecID(index, item) {
    return item.recID;
  }

  valueChange(){}
}
