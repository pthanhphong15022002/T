import { CodxEpService } from 'projects/codx-ep/src/public-api';
import { DialogModel, UIComponent, FormModel, AuthService } from 'codx-core';
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
  isAdmin: boolean;
  approvalRule: any;

  constructor(
    injector: Injector,
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
    this.codxEpService.roleCheck().subscribe((res) => {
      if (res == true) {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
    });
    this.codxEpService
      .getEPStationerySetting('4')
      .subscribe((approvalSetting: any) => {
        if (approvalSetting) {
          this.approvalRule = JSON.parse(
            approvalSetting.dataValue
          )[0]?.ApprovalRule;
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
    if (
      !this.codxEpService.checkRole(
        this.authService.userValue,
        data?.owner,
        this.isAdmin
      )
    ) {
      this.notificationsService.notifyCode('TM052');
      return;
    }
    this.codxEpService
      .cancel(data?.recID, '', this.formModel.entityName)
      .subscribe((res: any) => {
        if (res != null && res?.msgCodeError == null) {
          this.notificationsService.notifyCode('SYS034'); //đã hủy gửi duyệt
          data.approveStatus = '0';
          this.view.dataService.update(data).subscribe();
        } else {
          this.notificationsService.notifyCode(res?.msgCodeError);
        }
      });

    this.codxEpService
      .cancel(data?.recID, '', this.formModel.entityName)
      .subscribe((res: any) => {
        //kiểm tra code có trả về mã lỗi ko, nếu ko có tức là thành công
        if (res != null && res?.msgCodeError == null) {
          //...
        } else {
          //thông báo lỗi trả từ BE
          this.notificationsService.notifyCode(res?.msgCodeError);
        }
      });
  }

  undo(data: any) {
    this.codxEpService.undo(data?.approvalTransRecID).subscribe((res: any) => {
      if (res != null) {
        this.notificationsService.notifyCode('SYS034'); //đã thu hồi
        data.approveStatus = '3';
        this.view.dataService.update(data).subscribe();
      } else {
        this.notificationsService.notifyCode(res?.msgCodeError);
      }
    });
  }

  reject(data: any) {
    this.codxEpService
      .approve(
        data?.approvalTransRecID, //ApprovelTrans.RecID
        '4',
        '',
        ''
      )
      .subscribe((res: any) => {
        if (res?.msgCodeError == null && res?.rowCount >= 0) {
          this.notificationsService.notifyCode('SYS034'); //đã duyệt
          data.approveStatus = '4';
          this.view.dataService.update(data).subscribe();
        } else {
          this.notificationsService.notifyCode(res?.msgCodeError);
        }
      });
  }

  approve(data: any) {
    this.codxEpService
      .approve(
        data?.approvalTransRecID, //ApprovelTrans.RecID
        '5',
        '',
        ''
      )
      .subscribe((res: any) => {
        if (res?.msgCodeError == null && res?.rowCount >= 0) {
          this.notificationsService.notifyCode('SYS034'); //đã duyệt
          data.approveStatus = '5';
          this.view.dataService.update(data).subscribe();
        } else {
          this.notificationsService.notifyCode(res?.msgCodeError);
        }
      });
  }

  updateStatus(data: any) {
    this.view.dataService.update(data).subscribe();
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
          if (
            //Ẩn: sửa - xóa - duyệt - hủy
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP8T1101' /*MF gửi duyệt*/ ||
            func.functionID == 'EP8T1102' /*MF hủy*/
          ) {
            func.disabled = true;
          }
        });
      } else if (data.approveStatus == '3') {
        event.forEach((func) => {
          //Gửi duyệt
          if (
            //Hiện: chép - hủy
            func.functionID == 'SYS04' /*MF chép*/ ||
            func.functionID == 'EP8T1102' /*MF hủy*/
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: sửa - xóa - gửi duyệt

            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP8T1101' /*MF gửi duyệt*/
          ) {
            func.disabled = true;
          }
        });
      } else if (data.approveStatus == '4') {
        event.forEach((func) => {
          //Gửi duyệt
          if (
            //Hiện: chép
            func.functionID == 'SYS04' /*MF chép*/
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: sửa - xóa - gửi duyệt - hủy
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP8T1101' /*MF gửi duyệt*/ ||
            func.functionID == 'EP8T1102' /*MF hủy*/
          ) {
            func.disabled = true;
          }
        });
      } else {
        event.forEach((func) => {
          //Gửi duyệt
          if (
            //Hiện: chép
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP8T1101' /*MF gửi duyệt*/ ||
            func.functionID == 'SYS04' /*MF chép*/
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: sửa - xóa - gửi duyệt - hủy
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
        !this.codxEpService.checkRole(
          this.authService.userValue,
          evt?.owner,
          this.isAdmin
        )
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

  allocate(data: any) {
    if (this.approvalRule) {
      this.api
        .exec('ES', 'ApprovalTransBusiness', 'GetByTransIDAsync', [data?.recID])
        .subscribe((trans: any) => {
          trans.map((item: any) => {
            if (item.stepType === 'I') {
              this.codxEpService
                .approve(
                  item.recID, //ApprovelTrans.RecID
                  '5',
                  '',
                  ''
                )
                .subscribe((res: any) => {
                  if (res?.msgCodeError == null && res?.rowCount >= 0) {
                    this.notificationsService.notifyCode('SYS034'); //đã duyệt
                    data.issueStatus = '3';
                    this.view.dataService.update(data).subscribe();
                  } else {
                    this.notificationsService.notifyCode(res?.msgCodeError);
                  }
                });
            }
          });
        });
    } else {
      this.api
        .exec('EP', 'ResourceTransBusiness', 'AllocateAsync', [data.recID])
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
          } else {
            this.notificationsService.notifyCode('SYS001');
          }
        });
    }
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
        !this.codxEpService.checkRole(
          this.authService.userValue,
          evt?.owner,
          this.isAdmin
        )
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

  private isEmptyGuid(value: string) {
    return value === '00000000-0000-0000-0000-000000000000';
  }
}
