import { title } from 'process';
import { switchMap } from 'rxjs/operators';
import { CodxEpService, GridModels } from './../../../codx-ep.service';
import {
  Component,
  Injector,
  Optional,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ControlContainer, FormControl, FormGroup } from '@angular/forms';
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
  RequestModel,
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
  @ViewChild('listView') listView: ViewsComponent;
  @ViewChild('content') content;
  @ViewChild('viewApprovalStep') viewApprovalStep: ApprovalStepComponent;

  headerText = 'Thêm mới đăng ký';

  requestType;
  funcID: string;

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

  lstStationery = [];

  user: UserModel;

  model?: FormModel;
  groupStationery;

  groupID: string;

  qtyEmp: number = 0;
  title:'';
  dialogAddBookingStationery: FormGroup;
  
  constructor(
    private injector: Injector,
    private auth: AuthStore,
    private epService: CodxEpService,
    private notificationsService: NotificationsService,
    @Optional() dialogRef: DialogRef,
    @Optional() data: DialogData
  ) {
    super(injector);
    this.dialog = dialogRef;
    this.formModel = data?.data?.formModel;
    this.funcID = this.formModel?.funcID;
    this.data = data?.data?.option?.DataService.dataSelected || {};
    this.isAddNew = data?.data?.isAddNew ?? true;
    this.option = data?.data?.option;
    this.title=data?.data?.title;
    this.dialog.dataService=this.option.DataService;
  }

  onInit(): void {
    this.user = this.auth.get();

    this.epService.getStationeryGroup().subscribe((res) => {
      this.groupStationery = res;
    });

    this.initForm();
    this.filterStationery();
  }

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
  }

  initForm() {
    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((res) => {
        this.cache.valueList(res?.Category.referedValue).subscribe((res) => {
          this.requestType = res.datas;
        });
      });
    this.epService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.dialogAddBookingStationery = item;
        if (this.data) {
          if (this.isAddNew) {
            this.dialogAddBookingStationery.patchValue({
              resourceType: '6',
              category: '1',
              status: '1', 
            });
            this.dialogAddBookingStationery.addControl('issueStatus', new FormControl('1')) ;
              
          }
        }
        this.isAfterRender = true;
      });
  }

  changeTab(tabNo) {
    if (tabNo == 2 && this.cart.length == 0) {
      return;
    }
    this.currentTab = tabNo;
    this.detectorRef.detectChanges();
  }

  valueChange(event) {
    
    if (event?.field) {
      if (event.data instanceof Object) {
        this.data[event.field] = event.data.value;
      } else {
        this.data[event.field] = event.data;
      }
    }

    if (event?.field === 'bUID') {
      this.epService
        .getEmployeeByOrgUnitID(event.data)
        .subscribe((res: any) => {
          this.qtyEmp = 0;
          if (res) {
            this.qtyEmp = res;
          }
        });
    }

    this.detectorRef.detectChanges();
  }
  valueBookingOnChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.dialogAddBookingStationery.patchValue({[event.field]:event.data.value});
      } else {
        this.dialogAddBookingStationery.patchValue({[event.field]:event.data});
      }
    }
    this.detectorRef.detectChanges();
  }

  valueChangeQtyStationery(event: any, resourceID: string) {
    if (event?.data == 0) {
      this.cart = this.cart.filter((item) => {
        return item?.resourceID != resourceID;
      });
    }
    this.detectorRef.detectChanges();
  }

  beforeSave(option: any) {
    let itemData = this.dialogAddBookingStationery.value;
    this.addQuota();
    this.groupByWareHouse();

    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAddNew, null, null, this.lstStationery];
    return true;
  }

  onSaveForm() {
    //this.data.reasonID='RS-001';//Dev Test
    //this.dialogAddBookingStationery.patchValue(this.data);
    if (this.dialogAddBookingStationery.invalid == true) {
      this.epService.notifyInvalid(
        this.dialogAddBookingStationery,
        this.formModel
      );
    }
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        this.dialog.close();
      });
    console.log(this.addQuota());
    console.log(this.groupByWareHouse());
  }

  close() {
    this.dialog && this.dialog.close();
  }

  //#endregion

  filterStationery(groupID: string = null) {
    this.groupID = groupID;
    this.api
      .exec('EP', 'ResourcesBusiness', 'GetListStationeryByGroupIDAsync', [
        groupID,
      ])
      .subscribe((res: any) => {
        this.listView.dataService.data = [];
        this.listView.dataService.add(res).subscribe();
      });
    this.detectorRef.detectChanges();
  }

  //#region cart

  addCart(event, data) {
    let tmpResource;
    tmpResource = { ...data };

    let isPresent = this.cart.find((item) => item.recID == tmpResource.recID);

    if (isPresent) {
      this.cart.filter((item: any) => {
        if (item.recID == tmpResource.recID) {
          item.quantity = item.quantity + 1;
        }
      });
    } else {
      this.cartQty = this.cartQty + 1;
      tmpResource.quantity = 1;
      this.cart.push(tmpResource);
      this.notificationsService.notifyCode('SYS006');
    }
    this.detectorRef.detectChanges();
  }

  addQuota() {
    this.cart.map((item) => {
      this.lstStationery.push({
        id: item?.resourceID,
        quantity: item?.quantity * this.qtyEmp,
      });
    });

    return this.lstStationery;
  }

  //#endregion

  //#region split warehouses
  groupByWareHouse() {
    let warehouse = this.cart.reduce((bookings, item) => {
      const { location } = item;
      bookings[location] = bookings[location] ?? [];
      bookings[location].push(item);
      return bookings;
    }, {});
    return warehouse;
  }
  //#endregion

  click(data) {}

  clickMF($event, data) {}

  itemByRecID(index, item) {
    return item.recID;
  }
}
