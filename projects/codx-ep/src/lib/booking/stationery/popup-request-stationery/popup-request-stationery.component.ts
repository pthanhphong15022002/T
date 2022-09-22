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
  DataRequest,
} from 'codx-core';
import { ApprovalStepComponent } from 'projects/codx-es/src/lib/setting/approval-step/approval-step.component';
import { ES_SignFile } from 'projects/codx-es/src/public-api';
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
  dialogSignFile: FormGroup;
  lstDataFile = [];
  isAddNew: boolean = true; // flag thêm mới signfile
  processID: String = '';
  transID: String = '';
  gvSetup: any;

  isSaved: boolean = false; // flag đã gọi hàm lưu signfile
  isEdit: boolean = false; // flag kiểm tra đã chỉnh sửa thông tin signfile

  lstFile: any = [];

  templateName: string = ''; // tên template khi chọn lưu thành template

  dialog: DialogRef;
  data: any = {};
  autoNo: string; //Số văn bản tự động mặc định

  newNode: number; //vị trí node mới
  oldNode: number; //vị trí node trước

  isAfterSaveProcess: boolean = false;
  model: DataRequest;
  option: SidebarModel;
  oSignFile: ES_SignFile;
  user: any = {};
  showPlan: boolean = true;

  cart = [];
  cartQty = 0;

  dialogAddRoom: FormGroup;

  constructor(
    private injector: Injector,
    private epService: CodxEpService,
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

  onInit(): void {}

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
  }

  initForm() {
    this.epService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.dialogAddRoom = item;
        if (this.data) {
          this.dialogAddRoom.patchValue(this.data);
          this.dialogAddRoom.patchValue({
            resourceType: '1',
          });
        }
        this.isAfterRender = true;
      });
  }

  popup(data, current) {
    this.attachment.openPopup();
  }

  changeTab(tabNo) {

    this.currentTab = tabNo;

    this.detectorRef.detectChanges();
  }

  valueChange(event) {}

  processIDChange(event) {
    if (event?.field && event?.component && event?.data != '') {
      if (event?.field == 'processID') {
        this.processID = event?.data;
      }
    }
  }

  //#region Methods Save
  onSaveSignFile() {
    this.detectorRef.detectChanges();
  }

  onSaveProcessTemplateID(dialogTmp: DialogRef) {
    if (
      this.processID != '' &&
      this.dialogSignFile.value.approveControl != '1'
    ) {
      this.dialogSignFile.patchValue({
        processID: this.processID,
        approveControl: '2',
      });
      this.onSaveSignFile();

      dialogTmp && dialogTmp.close();
    }
  }

  //#region Change Tab

  //#endregion

  close() {
    this.dialog && this.dialog.close();
  }

  //#endregion

  //#region cart
  groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  }

  addCart(event, data) {
    //check if item exist in cart
    if (this.cart.includes(data)) {
      this.cart.push(data);
    } else {
      this.cartQty = this.cartQty + 1;
      this.cart.push(data);
    }
  }

  //#endregion

  setValueAreaControl(event) {}

  click(data) {}

  clickMF($event, data) {}

  itemByRecID(index, item){
    return item.recID
  }

  test() {
    if (this.currentTab < 2) {
      this.currentTab++;
    }
  }
}
