import { CodxEpService, GridModels } from './../../../codx-ep.service';
import {
  Component,
  Injector,
  Optional,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
  CRUDService,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { ApprovalStepComponent } from 'projects/codx-es/src/lib/setting/approval-step/approval-step.component';

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

  dialogRef: DialogRef;
  data: any = {};
  isAfterSaveProcess: boolean = false;
  option: SidebarModel;
  showPlan: boolean = true;

  cart = [];

  lstStationery = [];

  user: UserModel;
  grvStationery;
  model?: FormModel;
  groupStationery;
  radioGroupCheck: boolean;
  radioPersonalCheck: boolean;
  groupID: string;

  qtyEmp: number = 1;
  title: '';
  dialogAddBookingStationery: FormGroup;
  returnData = [];
  nagetivePhysical: string = '';
  totalStationery = 0;
  saveCheck = false;

  constructor(
    private injector: Injector,
    private auth: AuthStore,
    private epService: CodxEpService,
    private notificationsService: NotificationsService,
    @Optional() dialogRef: DialogRef,
    @Optional() data: DialogData
  ) {
    super(injector);
    this.dialogRef = dialogRef;
    this.formModel = data?.data?.formModel;
    this.funcID = this.formModel?.funcID;
    this.data = data?.data?.option?.DataService.dataSelected || {};
    this.isAddNew = data?.data?.isAddNew ?? true;
    this.option = data?.data?.option;
    this.title = data?.data?.title;
    this.dialogRef.dataService = this.option.DataService;
    if (!this.isAddNew) {
      if ((this.data.category = '1')) {
        this.radioPersonalCheck = true;
      } else {
        this.radioGroupCheck = true;
      }
    }
  }

  onInit(): void {
    this.user = this.auth.get();

    this.epService.getStationeryGroup().subscribe((res) => {
      this.groupStationery = res[0];
      this.totalStationery = res[1];
    });

    this.epService
      .getParams('EPStationeryParameters', 'NagetivePhysical')
      .subscribe((res: any) => {
        let dataValue = res[0].dataValue;
        let json = JSON.parse(dataValue);
        this.nagetivePhysical = json.NagetivePhysical;
      });

    this.cache.functionList('EP8S21').subscribe((res) => {
      if (res) {
        this.cache
          .gridViewSetup(res.formName, res.gridViewName)
          .subscribe((gv) => {
            this.grvStationery = gv;
          });
      }
    });

    this.initForm();

    if (!this.isAddNew) {
      this.radioPersonalCheck = true;
      this.radioGroupCheck = false;
      this.cart = this.data.bookingItems;
      this.changeTab(2);
    } else {
      if (this.data?.category == '1') {
        this.radioPersonalCheck = true;
        this.radioGroupCheck = false;
      } else {
        this.radioPersonalCheck = false;
        this.radioGroupCheck = true;
      }
    }
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
        this.dialogAddBookingStationery.addControl(
          'recID',
          new FormControl(this.data.recID)
        );
        if (this.data) {
          if (this.isAddNew) {
            this.dialogAddBookingStationery.patchValue({
              resourceType: '6',
              category: '1',
              status: '1',
              bookingOn: new Date(),
            });
            this.dialogAddBookingStationery.addControl(
              'issueStatus',
              new FormControl('1')
            );

            this.detectorRef.detectChanges();
          }
          if (!this.isAddNew) {
            this.data.bookingOn = new Date(this.data.bookingOn);
            this.dialogAddBookingStationery.addControl(
              'warehouseID',
              new FormControl(this.data.warehouseID)
            );
            this.dialogAddBookingStationery.patchValue(this.data);
            this.detectorRef.detectChanges();
          }
        }
        this.isAfterRender = true;
      });
  }

  changeTab(tabNo: number) {
    if (tabNo == 2 && this.cart.length == 0) {
      this.notificationsService.notifyCode('EP011');
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
      this.dialogAddBookingStationery.patchValue({ bUID: event?.data });
      this.epService
        .getEmployeeByOrgUnitID(event.data)
        .subscribe((res: any) => {
          this.qtyEmp = 0;
          if (res) {
            this.qtyEmp = res;
          }
        });
    }

    if (event?.field === 'category') {
      if (event?.data) {
        this.dialogAddBookingStationery.patchValue({ category: '1' });
      } else {
        this.dialogAddBookingStationery.patchValue({ category: '2' });
      }
    }
    this.detectorRef.detectChanges();
  }

  valueBookingOnChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.dialogAddBookingStationery.patchValue({
          [event.field]: event.data.value,
        });
      } else {
        this.dialogAddBookingStationery.patchValue({
          [event.field]: event.data,
        });
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
    if (event?.data > 0) {
      this.cart.forEach((item) => {
        if (item.resourceID == resourceID) {
          item.quantity = event?.data;
        }
      });
    }
    this.detectorRef.detectChanges();
  }

  beforeSave(option: any) {
    let itemData = this.dialogAddBookingStationery.value;
    this.addQuota();
    this.groupByWareHouse();
    this.dialogAddBookingStationery.patchValue({ recID: this.data.recID });
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAddNew, null, this.lstStationery, null];
    return true;
  }

  saveClick = false;

  onSaveForm(approval: boolean = false) {
    if (!this.saveCheck) {
      if (this.dialogAddBookingStationery.invalid == true) {
        this.epService.notifyInvalid(
          this.dialogAddBookingStationery,
          this.formModel
        );
      }
      if (this.dialogAddBookingStationery.value.reasonID instanceof Object) {
        this.dialogAddBookingStationery.patchValue({
          reasonID: this.dialogAddBookingStationery.value.reasonID[0],
        });
      }
      this.dialogAddBookingStationery.patchValue({
        title: this.dialogAddBookingStationery.value.note,
      });
      this.dialogRef.dataService
        .save((opt: any) => this.beforeSave(opt), 0, null, null, !approval)
        .subscribe((res) => {
          if (res.save || res.update) {
            if (!res.save) {
              this.returnData = res.update;
              this.returnData.forEach((item) => {
                if (item.recID == this.data.recID) {
                  (this.dialogRef.dataService as CRUDService)
                    .update(item)
                    .subscribe();
                } else {
                  (this.dialogRef.dataService as CRUDService)
                    .add(item, 0)
                    .subscribe();
                }
              });
            } else {
              this.returnData = res.save;

              this.returnData.forEach((item) => {
                (this.dialogRef.dataService as CRUDService)
                  .update(item)
                  .subscribe();
              });
            }

            if (approval) {
              this.epService
                .getCategoryByEntityName(this.formModel.entityName)
                .subscribe((category: any) => {
                  this.returnData.forEach((item) => {
                    this.epService
                      .release(
                        item,
                        category.processID,
                        'EP_Bookings',
                        this.formModel.funcID
                      )
                      .subscribe((res) => {
                        if (res?.msgCodeError == null && res?.rowCount >= 0) {
                          this.notificationsService.notifyCode('ES007');
                          item.approveStatus = '3';
                          item.status = '3';
                          item.write = false;
                          item.delete = false;
                          (this.dialogRef.dataService as CRUDService)
                            .update(item)
                            .subscribe();
                          this.dialogRef && this.dialogRef.close();
                        } else {
                          this.notificationsService.notifyCode(
                            res?.msgCodeError
                          );
                          // Thêm booking thành công nhưng gửi duyệt thất bại
                          this.dialogRef && this.dialogRef.close();
                        }
                      });
                  });
                });
              this.dialogRef && this.dialogRef.close();
            } else {
              this.dialogRef && this.dialogRef.close();
            }
          } else {
            return;
          }
        });
      this.saveCheck = true;
    } else {
      return;
    }
  }

  close() {
    this.dialogRef && this.dialogRef.close();
  }

  //#endregion

  filterStationery(groupID: string = null) {
    let resourceModel = new GridModels();
    (resourceModel.funcID = 'EP8S21'),
      (resourceModel.entityName = 'EP_Resources');
    resourceModel.pageSize = 20;
    this.groupID = groupID;
    this.api
      .exec('EP', 'ResourcesBusiness', 'GetListByCbxAsync', [
        resourceModel,
        groupID,
      ])
      .subscribe((res: any) => {
        this.listView.dataService.data = [];
        this.listView.dataService.add(res[0]).subscribe();
      });
    this.detectorRef.detectChanges();
  }

  //#region cart

  getCartQty(cart = []): number {
    if (cart.length == 0) {
      return 0;
    }
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }

  getItemQty(itemID) {
    let item = this.cart.filter((x) => x.resourceID == itemID);
    if (item.length == 0) {
      return 0;
    }
    return item[0].quantity;
  }

  addCart(event, data) {
    let tmpResource;
    tmpResource = { ...data };

    let isPresent = this.cart.find((item) => item.recID == tmpResource.recID);

    //NagetivePhysical = 0: khong am kho
    if (tmpResource.currentQty <= 0) {
      if (this.nagetivePhysical == '0') {
        //không add
        this.notificationsService.notifyCode('EP013');
        return;
      }
    }

    if (isPresent) {
      this.cart.filter((item: any) => {
        if (item.recID == tmpResource.recID) {
          item.quantity = item.quantity + 1;
          item.itemName = item.resourceName;
        }
      });
    } else {
      tmpResource.quantity = 1;
      tmpResource.itemName = tmpResource.resourceName;
      this.cart.push(tmpResource);
    }
    this.detectorRef.detectChanges();
  }

  addQuota() {
    this.cart.map((item) => {
      // this.lstStationery.push({
      //   id: item.resourceID,
      //   quantity: item?.quantity * this.qtyEmp,
      // });
      this.lstStationery.push(item);
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

  search(e) {
    this.listView.dataService.search(e).subscribe();
    this.detectorRef.detectChanges();
  }

  itemByRecID(index, item) {
    return item.recID;
  }
}
