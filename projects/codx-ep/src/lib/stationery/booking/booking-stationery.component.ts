import { CodxEpService } from 'projects/codx-ep/src/public-api';
import {
  CacheService,
  CallFuncService,
  DialogModel,
  UIComponent,
  FormModel,
  AuthService,
} from 'codx-core';
import {
  AfterViewInit,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  DataRequest,
  DialogRef,
  NotificationsService,
  SidebarModel,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupRequestStationeryComponent } from './popup-request-stationery/popup-request-stationery.component';
import { FuncID } from '../../models/enum/enum';

@Component({
  selector: 'stationery',
  templateUrl: './booking-stationery.component.html',
  styleUrls: ['./booking-stationery.component.scss'],
})
export class BookingStationeryComponent
  extends UIComponent
  implements AfterViewInit
{
  @ViewChild('chart') chart: TemplateRef<any>;

  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
  viewType = ViewType;
  views: Array<ViewModel> = [];
  button: ButtonModel;
  dataSelected: any;
  columnsGrid: any;
  dialog!: DialogRef;
  model: DataRequest;
  funcID: string;
  service = 'EP';
  assemblyName = 'EP';
  entity = 'EP_Bookings';
  className = 'BookingsBusiness';
  method = 'GetListBookingAsync';
  idField = 'recID';
  funcIDName = '';
  popupTitle = '';
  tempReasonName = '';
  formModel: FormModel;
  itemDetail;
  popupClosed = true;
  listReason: any[] = [];

  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    private authService: AuthService
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;
      }
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.funcIDName =
          res.customName.charAt(0).toLowerCase() + res.customName.slice(1);
      }
    });
  }

  onInit(): void {
    this.codxEpService
      .getListReason('EP_BookingStationery')
      .subscribe((res: any) => {
        if (res) {
          this.listReason = res;
        }
      });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRight,
        },
      },
    ];

    this.detectorRef.detectChanges();
  }
  getReasonName(reasonID: any) {
    this.tempReasonName = '';
    this.listReason.forEach((r) => {
      if (r.reasonID == reasonID) {
        this.tempReasonName = r.description;
      }
    });
    return this.tempReasonName;
  }
  click(evt: any) {
    this.popupTitle = evt?.text + ' ' + this.funcIDName;
    switch (evt.id) {
      case 'btnAdd':
        this.addNewRequest();
        break;
      case 'btnAddNew':
        //this.openRequestList();
        break;
    }
  }
  clickMF(event, data) {
    this.popupTitle = event?.text + ' ' + this.funcIDName;
    switch (event?.functionID) {
      case 'SYS02': //Xoa
        this.delete(data);
        break;
      case 'SYS03': //Sua.
        this.edit(data);
        break;
      case 'SYS04': //Copy.
        this.copy(data);
        break;
      case 'EPT40303': //Cap phat
        this.allocate(data);
        break;
      case 'EP8T1101': //Gui duyet
        this.release(data);
        break;
        case 'EP8T1102': //hủy
        this.cancel(data);
        break;
    }
  }
  viewChanged(evt: any) {
    this.funcID = this.router.snapshot.params['funcID'];
    if (this.funcID == FuncID.BookingStationery) {
      this.button = {
        id: 'btnAdd',
      };
    } else {
      this.button = null;
    }
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;
      }
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.funcIDName =
          res.customName.charAt(0).toLowerCase() + res.customName.slice(1);
      }
    });
    this.detectorRef.detectChanges();
  }
  cancel(data: any) {
    this.codxEpService.cancel(data?.recID).subscribe((res: any) => {
      if (res != null) {
        this.notificationsService.notifyCode('SYS034'); //đã hủy gửi duyệt
        data.approveStatus = '1';
        data.status = '1';
        this.view.dataService.update(data).subscribe();
      } else {
        this.notificationsService.notifyCode(res?.msgCodeError);
      }
    });
  }
  changeDataMF(event, data: any) {
    if (event != null && data != null && this.funcID == 'EP8T11') {
      
        if (data.approveStatus == '1') {
          event.forEach((func) => {
            //Mới tạo
            if (
              // Hiện: sửa - xóa - chép - gửi duyệt -
              func.functionID == 'SYS02' /*MF sửa*/ ||
              func.functionID == 'SYS03' /*MF xóa*/ ||
              func.functionID == 'SYS04' /*MF chép*/ ||
              func.functionID == 'EP8T1101' /*MF gửi duyệt*/
            ) {
              func.disabled = false;
            }
            if (
              //Ẩn: hủy 
              func.functionID == 'EP8T1102' /*MF hủy*/ 
            ) {
              func.disabled = true;
            }
          });
        } else if (data.approveStatus == '5') {
          event.forEach((func) => {
            //Đã duyệt
            if (
              // Hiện: Chép 
              func.functionID == 'SYS04' /*MF chép*/
            ) {
              func.disabled = false;
            }
            if (//Ẩn: sửa - xóa - duyệt - hủy 
              func.functionID == 'SYS02' /*MF sửa*/ ||
              func.functionID == 'SYS03' /*MF xóa*/ ||
              func.functionID == 'EP8T1101' /*MF gửi duyệt*/||
              func.functionID == 'EP8T1102' /*MF hủy*/
            ) {
              func.disabled = true;
            }
          });
        } else if (data.approveStatus == '3') {
          event.forEach((func) => {
            //Gửi duyệt
            if ( //Hiện: chép - hủy
            func.functionID == 'SYS04' /*MF chép*/||
            func.functionID == 'EP8T1102' /*MF hủy*/
            ) {
              func.disabled = false;
            }
            if (//Ẩn: sửa - xóa - gửi duyệt
              
              func.functionID == 'SYS02' /*MF sửa*/ ||
              func.functionID == 'SYS03' /*MF xóa*/ ||
              func.functionID == 'EP8T1101' /*MF gửi duyệt*/
            ) {
              func.disabled = true;
            }
          });
        }
        else if (data.approveStatus == '4') {
          event.forEach((func) => {
            //Gửi duyệt
            if ( //Hiện: chép 
            func.functionID == 'SYS04' /*MF chép*/
            ) {
              func.disabled = false;
            }
            if (//Ẩn: sửa - xóa - gửi duyệt - hủy          
              func.functionID == 'SYS02' /*MF sửa*/ ||
              func.functionID == 'SYS03' /*MF xóa*/ ||
              func.functionID == 'EP8T1101' /*MF gửi duyệt*/||
              func.functionID == 'EP8T1102' /*MF hủy*/
            ) {
              func.disabled = true;
            }
          });
        }
      
    
    }
    //Cấp phát
    if (event != null && data != null && this.funcID == 'EP8T12') {
      event.forEach((func) => {
        if (
          func.functionID == 'SYS02' /*MF sửa*/ ||
          func.functionID == 'SYS03' /*MF xóa*/ ||
          func.functionID == 'SYS04' /*MF chép*/
        ) {
          func.disabled = true;
        }
      });
    }
    if (event != null && data != null && data.issueStatus == 3) {
      event.forEach((func) => {
        if (func.functionID == 'EPT40303' /*MF cấp phát*/) {
          func.disabled = true;
        }
      });
    }
  }

  addNewRequest() {
    if (true) {
      this.view.dataService.addNew().subscribe((res) => {
        this.popupClosed = false;
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.formModel;
        let dialogModel = new DialogModel();
        dialogModel.IsFull = true;
        this.callfc.openForm(
          PopupRequestStationeryComponent,
          this.popupTitle,
          700,
          650,
          this.funcID,
          {
            isAddNew: true,
            formModel: this.formModel,
            option: option,
            title: this.popupTitle,
          },
          '',
          dialogModel
        );
        this.dialog?.closed.subscribe((returnData) => {
          this.popupClosed = true;
          if (!returnData.event) this.view.dataService.clear();
        });
      });
    }
  }

  edit(evt: any) {
    if (evt) {
      if (
        this.authService.userValue.userID != evt?.owner &&
        !this.authService.userValue.administrator
      ) {
        this.notificationsService.notifyCode('TM052');
        return;
      }

      if (true) {
        this.view.dataService.dataSelected = evt;
        this.view.dataService
          .edit(this.view.dataService.dataSelected)
          .subscribe((res) => {
            this.popupClosed = false;
            let option = new SidebarModel();
            option.DataService = this.view?.dataService;
            option.FormModel = this.formModel;
            let dialogModel = new DialogModel();
            dialogModel.IsFull = true;
            this.callfc.openForm(
              PopupRequestStationeryComponent,
              this.popupTitle,
              700,
              650,
              this.funcID,
              {
                isAddNew: false,
                formModel: this.formModel,
                option: option,
                title: this.popupTitle,
              },
              '',
              dialogModel
            );
            this.dialog?.closed.subscribe((returnData) => {
              this.popupClosed = true;
              if (!returnData.event) this.view.dataService.clear();
            });
          });
      }
    }
  }

  copy(evt: any) {
    if (evt) {
      if (true) {
        this.view.dataService.dataSelected = evt;
        this.view.dataService
          .copy(this.view.dataService.dataSelected)
          .subscribe((res) => {
            this.popupClosed = false;
            let option = new SidebarModel();
            option.DataService = this.view?.dataService;
            option.FormModel = this.formModel;
            let dialogModel = new DialogModel();
            dialogModel.IsFull = true;
            this.callfc.openForm(
              PopupRequestStationeryComponent,
              this.popupTitle,
              700,
              650,
              this.funcID,
              {
                isAddNew: true,
                formModel: this.formModel,
                option: option,
                title: this.popupTitle,
              },
              '',
              dialogModel
            );
            this.dialog?.closed.subscribe((returnData) => {
              this.popupClosed = true;
              if (!returnData.event) this.view.dataService.clear();
            });
          });
      }
    }
  }

  allocate(evt: any) {
    let warehouseID: string = evt.warehouseID;
    this.codxEpService.getWarehousesOwner(warehouseID).subscribe((res) => {
      if (
        res[0] == this.authService.userValue.userID &&
        !this.authService.userValue.administrator
      ) {
        this.api
          .exec('EP', 'ResourceTransBusiness', 'AllocateAsync', [evt.recID])
          .subscribe((dataItem: any) => {
            if (dataItem) {
              this.codxEpService
                .getBookingByRecID(dataItem.recID)
                .subscribe((booking) => {
                  this.view.dataService.update(booking).subscribe((res) => {
                    if (res) {
                      this.notificationsService.notifyCode('SYS034');
                    }
                  });
                });

              this.detectorRef.detectChanges();
            }
          });
      } else {
        this.notificationsService.notifyCode('TM052');
        return;
      }
    });
  }

  release(evt) {
    let data = evt;
    if (
      this.authService.userValue.userID != data?.owner
      //&& !this.authService.userValue.administrator
    ) {
      this.notificationsService.notifyCode('TM052');
      return;
    }
    if (data.approval != 0) {
      this.codxEpService
        .getCategoryByEntityName(this.formModel.entityName)
        .subscribe((category: any) => {
          this.codxEpService
            .release(
              data,
              category.processID,
              'EP_Bookings',
              this.formModel.funcID
            )
            .subscribe((res) => {
              if (res?.msgCodeError == null && res?.rowCount >= 0) {
                this.notificationsService.notifyCode('ES007');
                data.approveStatus = '3';
                data.status = '3';
                data.write = false;
                data.delete = false;
                this.view.dataService.update(data).subscribe();
              } else {
                this.notificationsService.notifyCode(res?.msgCodeError);
              }
            });
        });
    } else {
      data.approveStatus = '5';
      data.status = '5';
      data.write = false;
      data.delete = false;
      this.view.dataService.update(data).subscribe();
      this.notificationsService.notifyCode('ES007');
      this.codxEpService
        .afterApprovedManual(this.formModel.entityName, data.recID, '5')
        .subscribe();
    }
  }

  setPopupTitle(mfunc) {
    this.popupTitle = mfunc + ' ' + this.funcIDName;
  }

  delete(evt?) {
    let deleteItem = this.view.dataService.dataSelected;
    if (evt) {
      deleteItem = evt;
      if (
        this.authService.userValue.userID != evt?.owner &&
        !this.authService.userValue.administrator
      ) {
        this.notificationsService.notifyCode('TM052');
        return;
      }
    }
    this.view.dataService.delete([deleteItem]).subscribe((res) => {
      if (!res) {
        this.notificationsService.notifyCode('SYS022');
      }
    });
  }

  closeEditForm(evt?: any) {
    if (evt) {
      this.dialog && this.dialog.close();
    }
  }

  changeItemDetail(event) {
    let recID = '';
    if (event?.data) {
      recID = event.data.recID;
      this.itemDetail = event?.data;
    } else if (event?.recID) {
      recID = event.recID;
      this.itemDetail = event;
    }
  }

  closeAddForm(event) {}
}
