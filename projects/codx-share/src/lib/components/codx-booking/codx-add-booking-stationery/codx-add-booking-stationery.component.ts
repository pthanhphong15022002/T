import { Component, Injector, Optional, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  DialogData,
  DialogRef,
  SidebarModel,
  UIComponent,
  FormModel,
  ViewsComponent,
  NotificationsService,
  UserModel,
  AuthStore,
  CRUDService,
  AuthService,
} from 'codx-core';
const _addMF = EPCONST.MFUNCID.Add;
const _copyMF = EPCONST.MFUNCID.Copy;
const _editMF = EPCONST.MFUNCID.Edit;
const _viewMF = EPCONST.MFUNCID.View;
const _EPParameters =  EPCONST.PARAM.EPParameters;
const _EPStationeryParameters = EPCONST.PARAM.EPStationeryParameters;
import { CodxBookingService } from '../codx-booking.service';
import { BookingItems, GridModels } from '../codx-booking.model';
import { EPCONST } from 'projects/codx-ep/src/lib/codx-ep.constant';
import { CodxShareService } from '../../../codx-share.service';
import { Approver, ResponseModel } from '../../../models/ApproveProcess.model';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
@Component({
  selector: 'codx-add-booking-stationery',
  templateUrl: './codx-add-booking-stationery.component.html',
  styleUrls: ['./codx-add-booking-stationery.component.scss'],
})
export class CodxAddBookingStationeryComponent extends UIComponent {
  @ViewChild('listView') listView: ViewsComponent;
  headerText = 'Thêm mới đăng ký';
  requestType;

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
  approvalRule: any;
  isPriceVisible: boolean = false;
  funcType: any;
  onSaving = false;
  categoryID: any;
  subFuncID = EPCONST.FUNCID.S_Category;
  lstWarehourse=[];
  autoComfirm =EPCONST.APPROVALRULE.NotHaved;
  viewOnly=false;
  constructor(
    private injector: Injector,
    private auth: AuthStore,
    private codxBookingService: CodxBookingService,
    private codxCommonService: CodxCommonService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    @Optional() dialogRef: DialogRef,
    @Optional() dialogData: DialogData
  ) {
    super(injector);
    this.dialogRef = dialogRef;
    this.data = { ...dialogData?.data[0] };
    this.funcType = dialogData?.data[1];
    this.title = dialogData?.data[2];
    if (this.funcType == _addMF || this.funcType == _copyMF) {
      this.isAddNew = true;
      this.data.attendees=1;
    } else {
      this.isAddNew = false;
      if (this.funcType == _viewMF){
        this.viewOnly=true;
      }
    }
    this.formModel = dialogRef?.formModel;
    this.funcID = this.formModel.funcID;
    if (!this.isAddNew) {
      if (this.data?.category == '1') {
        this.radioPersonalCheck = true;
        this.radioGroupCheck = false;
      } else {
        this.radioPersonalCheck = false;
        this.radioGroupCheck = true;
      }
    } else {
      this.radioPersonalCheck = true;
      this.radioGroupCheck = false;
    }
  }

  onInit(): void {
    this.user = this.auth.get();
    this.codxBookingService.getListWarehouse().subscribe((res:any)=>{
      if(res){
        this.lstWarehourse=res;
      }
    });

    this.codxBookingService.getStationeryGroup().subscribe((res) => {
      this.groupStationery = res[0];
      this.totalStationery = res[1];
    });

    this.codxBookingService
      .getDataValueOfSettingAsync(_EPParameters, _EPStationeryParameters, '1')
      .subscribe((res: string) => {
        if (res) {
          let StationerySetting_1 = JSON.parse(res);
          this.nagetivePhysical = StationerySetting_1.NagetivePhysical;
          this.isPriceVisible = StationerySetting_1.ShowUnitPrice ?? false;
          //this.autoComfirm = StationerySetting_1?.AutoConfirm ?? EPCONST.APPROVALRULE.NotHaved;
        }
      });
    this.codxBookingService
      .getDataValueOfSettingAsync(_EPParameters, null, '4')
      .subscribe((res: string) => {
        if (res) {
          let stationerySetting_4 = JSON.parse(res);
          if (stationerySetting_4 != null && stationerySetting_4.length > 0) {
            let setting = stationerySetting_4.filter(
              (x: any) => x.Category == EPCONST.ENTITY.S_Bookings
            );
            if (setting != null) {
              this.approvalRule =
                setting[0]?.ApprovalRule != null
                  ? setting[0]?.ApprovalRule
                  : '1';
              this.categoryID =
                setting[0]?.CategoryID != null
                  ? setting[0]?.CategoryID
                  : EPCONST.ES_CategoryID.Stationery;
            } else {
              this.approvalRule = '1'; //Đề phòng trường hợp setting lỗi/ thì lấy duyệt theo quy trình
              this.categoryID = EPCONST.ES_CategoryID.Stationery;
            }
          }
        }
      });
    this.cache.gridViewSetup('Stationery', 'grvStationery').subscribe((gv) => {
      this.grvStationery = gv;
    });

    this.initForm();

    if (!this.isAddNew) {
      this.data?.items?.forEach((item) => {
              let tmpSta = new BookingItems();
              (tmpSta.itemID = item?.itemID),
                (tmpSta.quantity = item?.quantity),
                (tmpSta.itemName = item?.itemName),
                (tmpSta.umid = item?.umid),
                (tmpSta.umName =
                  item?.umName != null && item?.umName != ''
                    ? item?.umName
                    : item?.umid),
                (tmpSta.objectType = 'EP_Resources'),
                (tmpSta.objectID = item?.resourceRecID),
                this.cart.push(tmpSta);
            });
            this.changeTab(2); //Lấy xong cart mới chuyển sang tab thông tin khi edit
            this.detectorRef.detectChanges();
         
    }
  }

  initForm() {
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((res) => {
        this.cache.valueList(res?.Category.referedValue).subscribe((res) => {
          this.requestType = res.datas;
          this.detectorRef.detectChanges();
        });
      });
    this.codxBookingService
      .getFormGroup(this.formModel?.formName, this.formModel?.gridViewName)
      .then((item) => {
        this.dialogAddBookingStationery = item;
        this.dialogAddBookingStationery.addControl(
          'recID',
          new FormControl(this.data.recID)
        );
        if (this.data) {
          if (this.isAddNew) {
            this.dialogAddBookingStationery.patchValue({
              reasonID: '',
              resourceType: '6',
              category: '1',
              status: '1',
              bookingOn: new Date(),
            });
            this.dialogAddBookingStationery.addControl(
              'issueStatus',
              new FormControl('1')
            );

            this.cache.getCompany(this.user.userID).subscribe((res) => {
              if(res){
                this.dialogAddBookingStationery.patchValue({
                  orgUnitID: res?.orgUnitID,
                });
              }
            });

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
  personBooking(event) {
    if (event) {
      this.data.attendees = 1;
      this.data.category = '1';
      this.dialogAddBookingStationery.patchValue({ category: '1' });
      this.detectorRef.detectChanges();
    }
  }
  groupBooking(event) {
    if (event) {
      this.data.category = '2';
      this.dialogAddBookingStationery.patchValue({ category: '2' });
      this.detectorRef.detectChanges();
    }
  }

  valueChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.data[event.field] = event.data.value;
      } else {
        this.data[event.field] = event.data;
      }
    }
    if (event?.field === 'orgUnitID') {
      this.dialogAddBookingStationery.patchValue({ bUID: event?.data });
      this.codxBookingService
        .getEmployeeByOrgUnitID(event.data)
        .subscribe((res: any) => {
          if (res) {
            this.data.attendees = res;
          }
        });
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

  valueChangeQtyStationery(event: any, itemID: string) {
    this.cart.forEach((item) => {
      if (item.itemID == itemID) {
        if (event.data > 0) {
          item.quantity = event.data;
        } else {
          item.quantity = 0;
        }
      }
    });

    this.detectorRef.detectChanges();
  }

  deleteStationery(itemID: any) {
    if(this.viewOnly) return;
    if (itemID) {
      this.cart = this.cart.filter((item) => {
        return item?.itemID != itemID;
      });
    }
  }

  beforeSave(option: any) {
    let itemData = this.data;
    this.addQuota();
    this.groupByWareHouse();
    this.dialogAddBookingStationery.patchValue({ recID: this.data.recID });
    option.methodName = 'SaveAsync';
    option.data = [itemData, this.isAddNew, null, this.lstStationery];
    return true;
  }

  //#region "Validate function before booking stationery"
  //Check items of cart
  isEmptyCart(_cart: any[]): boolean {
    if (_cart && _cart.length > 0) {
      return false;
    }
    this.notificationsService.notifyCode('EP011');
    return true;
  }

  checkCartItems(_cart: any[]) {
    let isPassed = true;
    _cart.map((item) => {
      if (item && item.quantity == 0) {
        this.notificationsService.notifyCode('EP021');
        isPassed = false;
      }
    });
    return isPassed;
  }
  //#endregion "Validate function before booking stationery"

  onSaveForm(approval: boolean = false) {
    if(approval && this.funcType == _editMF && this.authService?.userValue?.userID != this.data.createdBy){      
      this.notificationsService.notifyCode('SYS032');
      return;
    }
    if (!this.onSaving) {
      this.onSaving = true;
      if (this.dialogAddBookingStationery.invalid == true) {
        this.codxBookingService.notifyInvalid(
          this.dialogAddBookingStationery,
          this.formModel
        );
        this.onSaving = false;
        return;
      }
      this.data.approval = this.approvalRule;
      let bDay = new Date(this.dialogAddBookingStationery.value.bookingOn);
      let tmpDay = new Date();
      if (
        bDay <
        new Date(
          tmpDay.getFullYear(),
          tmpDay.getMonth(),
          tmpDay.getDate(),
          0,
          0,
          0,
          0
        )
      ) {
        this.notificationsService.notifyCode('TM036');

        this.onSaving = false;
        return;
      }

      if (!this.isEmptyCart(this.cart) && this.checkCartItems(this.cart)) {
        this.api
          .exec('EP', 'BookingsBusiness', 'QuotaCheckAsync', [
            this.cart,
            this.dialogAddBookingStationery.value.bookingOn,
          ])
          .subscribe((res: any) => {
            if (res && res.length > 0) {
              let unAvailResource = res.join(', ');
              this.notificationsService.notifyCode(
                'EP006',
                null,
                unAvailResource
              );

              this.onSaving = false;
              return;
            } else {
              this.startSave(approval);
            }
          });
      }
    }
  }

  startSave(approval) {
    this.dialogAddBookingStationery.patchValue({
      title: this.dialogAddBookingStationery.value.reasonID,
      approval: this.approvalRule,
    });

    this.data.bookingOn = this.dialogAddBookingStationery.value.bookingOn;
    this.data.reasonID = this.dialogAddBookingStationery.value.reasonID;
    this.data.note = this.dialogAddBookingStationery.value.note;
    this.data.title = this.dialogAddBookingStationery.value.reasonID;
    this.data.approval = this.approvalRule;
    this.data.resourceType = this.dialogAddBookingStationery.value.resourceType;
    this.data.issueStatus =
      this.dialogAddBookingStationery.value.issueStatus ?? '1';
    if ((this.approvalRule == '0' /*|| this.autoComfirm=='1'*/) && approval) {
      this.data.approveStatus = '5';
    }
    this.data.approveStatus = this.data.approveStatus ?? '1';
    this.data.status = this.data.status ?? '1';

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
            let autoRelease = false;
            // if(this.autoComfirm==EPCONST.APPROVALRULE.Haved){
            //   autoRelease=true;
            // }
            // else{
            //   if(this.approvalRule=='0'){
            //     autoRelease=true;
            //   }
            // }
              if(this.approvalRule=='0'){
                autoRelease=true;
              }
            if (!autoRelease) {
              this.codxBookingService
                .getProcessByCategoryID(this.categoryID)
                .subscribe((category: any) => {
                  this.returnData.forEach((item) => {
                    let curRO = null;
                    let curWarehourse= this.lstWarehourse.filter(x=>x.warehouseID == item?.warehouseID);
                    if(curWarehourse?.length>0){
                      curRO = new Approver()
                      curRO.approver= curWarehourse[0]?.owner;
                      curRO.roleType="RO";
                    }
                    else{
                      curWarehourse= this.lstWarehourse.filter(x=>x.isSystem == true);
                      if(curWarehourse?.length>0){
                        curRO = new Approver()
                        curRO.roleType= curWarehourse[0]?.owner;
                        curRO.roleType="RO";
                      }
                    }
                    this.codxCommonService
                      .codxReleaseDynamic(
                        'EP',
                        item,
                        category,
                        this.formModel?.entityName,
                        this.formModel.funcID,
                        item?.title,
                        (res:ResponseModel) => {
                          if (res?.msgCodeError == null && res?.rowCount >= 0) {                            
                            item.approveStatus = res.returnStatus ?? EPCONST.A_STATUS.Released;
                            item.write = false;
                            item.delete = false;
                            (this.dialogRef.dataService as CRUDService).update(item).subscribe();
                            this.notificationsService.notifyCode('SYS034');
                            this.dialogRef && this.dialogRef.close(item);
                          } else {
                            this.notificationsService.notifyCode(
                              res?.msgCodeError
                            );
                            // Thêm booking thành công nhưng gửi duyệt thất bại
                            this.dialogRef && this.dialogRef.close();
                          }
                        },
                        item?.createdBy,
                        [curRO],
                      )
                  });
                });
            } else {
              for(let i=0; i<this.returnData?.length;i++){
                this.codxBookingService.approvedManual(this.returnData[i]?.recID).subscribe((approveData:any)=>{
                  if(approveData!=null){
                    this.returnData[i].approveStatus=approveData?.approveStatus;
                    this.returnData[i].write = false;
                    this.returnData[i].delete = false;
                    if(i==this.returnData?.length -1 ){                      
                      this.notificationsService.notifyCode('SYS034');
                      this.dialogRef && this.dialogRef.close(this.returnData);
                    }
                  }
                  else{
                    return;
                  }
                });
              }
            }
          } else {
            this.dialogRef && this.dialogRef.close(this.returnData);
          }
        } else {
          this.dialogRef && this.dialogRef.close(this.returnData);
          this.onSaving = false;
          return;
        }
      });
  }

  close() {
    this.dialogRef && this.dialogRef.close();
  }

  //#endregion

  filterStationery(groupID: string = null) {
    let resourceModel = new GridModels();
    (resourceModel.funcID = EPCONST.FUNCID.S_Category),
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
        if(res?.length>0 && res[0]!=null){          
          this.listView.dataService.add(res[0]).subscribe();

        }
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
    let item = this.cart.filter((x) => x.itemID == itemID);
    if (item.length == 0) {
      return 0;
    }
    return item[0].quantity;
  }

  addCart(event, data) {
    let tmpResource = new BookingItems();
    tmpResource.itemID = data?.resourceID;
    tmpResource.quantity = 1;
    tmpResource.itemName = data?.resourceName;
    tmpResource.umid = data?.umid;
    tmpResource.umName = data?.umName;
    tmpResource.objectType = 'EP_Resources';
    tmpResource.objectID = data?.recID;

    let isPresent = this.cart.find((item) => item.itemID == tmpResource.itemID);

    //NagetivePhysical = 0: khong am kho
    if (data.currentQty <= 0) {
      if (this.nagetivePhysical == '0') {
        //không add
        this.notificationsService.notifyCode('EP013');
        return;
      }
    }

    if (isPresent) {
      this.cart.filter((item: any) => {
        if (item.itemID == tmpResource.itemID) {
          item.quantity = item.quantity + 1;
          item.itemName = item.itemName;
        }
      });
    } else {
      this.cart.push(tmpResource);
    }
    this.detectorRef.detectChanges();
  }

  addQuota() {
    this.cart.map((item) => {
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
    this.listView.dataService.search(e);
    this.detectorRef.detectChanges();
  }

  itemByRecID(index, item) {
    return item.itemID;
  }
}
