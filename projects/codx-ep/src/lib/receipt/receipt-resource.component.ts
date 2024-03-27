declare var window: any;
import {
  Component,
  Injector,
  AfterViewInit,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  FormModel,
  NotificationsService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { EPCONST } from '../codx-ep.constant';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { CodxBookingService } from 'projects/codx-share/src/lib/components/codx-booking/codx-booking.service';
import { EP_BookingInputParam } from 'projects/codx-share/src/lib/components/codx-booking/codx-booking.model';
import { AddReceiptResourceComponent } from './add-receipt-resource/add-receipt-resource.component';

@Component({
  selector: 'receipt-resource',
  templateUrl: './receipt-resource.component.html',
  styleUrls: ['./receipt-resource.component.scss'],
})
export class ReceiptResourceComponent
  extends UIComponent
  implements AfterViewInit
{
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  queryParams: any;
  popupTitle: string;
  funcIDName: string;
  isAdmin: boolean;
  buttons: any;
  crrEntityName: any;
  runMode: any;
  itemDetail: any;
  formModel: FormModel;
  moreFunc: Array<ButtonModel> = [];
  //---------------------------------------------------------------------------------//
  service = 'EP';
  assemblyName = 'EP';
  entity = 'EP_Bookings';
  className = 'BookingsBusiness';
  method = 'GetListBookingAsync';
  idField = 'recID';
  views: Array<ViewModel> | any = [];
  curUser: any;
  constructor(
    private injector: Injector,
    private codxShareService: CodxShareService,
    private codxBookingService: CodxBookingService,
    private notificationsService: NotificationsService,
    private activatedRoute: ActivatedRoute,
    private authStore: AuthStore,
  ) {
    super(injector);
    this.funcID = this.activatedRoute.snapshot.params['funcID'];
    this.queryParams = this.router.snapshot.queryParams;    
    this.curUser = this.authStore.get();
  }
  onInit(): void {
    this.getCache();
    this.buttons = [
      {
        id: 'btnAdd',
      },
    ];

    this.detectorRef.detectChanges();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRightRef,
        },
      },
    ];
    this.view.dataService.methodDelete = 'DeleteAsync';
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getCache() {}
  getBaseVariable() {}

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  viewChanged(evt: any) {
    this.funcID = this.router.snapshot.params['funcID'];
    this.queryParams = this.router.snapshot.queryParams;
    this.cache.functionList(this.funcID).subscribe((funcList) => {
      if (funcList) {
        this.crrEntityName = funcList?.entityName;
        this.funcIDName = funcList?.customName?.toString()?.toLowerCase();
        this.runMode = funcList?.runMode;
        this.detectorRef.detectChanges();
        this.getBaseVariable();
      }
    });
    //this.onLoading(evt);
  }
  click(evt: ButtonModel) {
    this.popupTitle = evt?.text + ' ' + this.funcIDName;
    switch (evt.id) {
      case 'btnAdd':
        // let dModel = new DialogModel();
        // dModel.FormModel = this.formModel;
        // dModel.DataService = this.view?.dataService;
        // let dialogStationery = this.callfc.openForm(
        //   FormSettingComponent,
        //   '',
        //   1024,
        //   768,
        //   null,
        //   [ EPCONST.MFUNCID.Add, this.popupTitle],
        //   '',
        //   dModel
        // );
        this.addNew();
        break;
      default:
        let event = evt?.data;
        let data = evt?.model;
        if (!data) data = this.view?.dataService?.dataSelected;
        this.codxShareService.defaultMoreFunc(
          event,
          data,
          null,
          this.view?.formModel,
          this.view?.dataService,
          this
        );
        break;
    }
  }

  changeItemDetail(event) {
    let recID = '';
    if (event?.data) {
      recID = event.data?.recID;
      this.itemDetail = event?.data;
    } else if (event?.recID) {
      recID = event.recID;
      this.itemDetail = event;
    }
  }

  onActionClick(event?) {
    if (event.type == 'add' && event.data?.resourceId != null) {
      this.popupTitle = this.buttons[0]?.text + ' ' + this.funcIDName;
      this.addNew(event.data);
    }
    if (event.type == 'doubleClick' || event.type == 'edit') {
      this.viewDetail(event.data);
    }
  }

  clickMF(event, item) {
    if (!item) item = this.view?.dataService?.dataSelected;
    if (!item && this.view?.dataService?.data?.length > 0) {
      item = this.view?.dataService?.data[0];
      this.view.dataService.dataSelected = item;
    }
    this.codxBookingService.getBookingByID(item?.recID).subscribe((data) => {
      if (data) {
        this.popupTitle = event?.text + ' ' + this.funcIDName;
        switch (event?.functionID) {
          //System MF
          case EPCONST.MFUNCID.Delete:
            this.delete(data);
            break;
          case EPCONST.MFUNCID.Edit:
            this.edit(data);
            break;
          case EPCONST.MFUNCID.Copy:
            this.copy(data);
            break;

          case EPCONST.MFUNCID.View:
            this.viewDetail(data);
            break;
          // Aproval Trans
          case EPCONST.MFUNCID.R_Release: //Gửi duyệt
          case EPCONST.MFUNCID.C_Release:
          case EPCONST.MFUNCID.S_Release:
            this.release(data);
            break;
          case EPCONST.MFUNCID.R_Cancel: //Hủy gửi duyệt
          case EPCONST.MFUNCID.C_Cancel:
          case EPCONST.MFUNCID.S_Cancel:
            this.cancel(data);
            break;

          //Room

          default:
            //Biến động , tự custom

            // var customData = {
            //   refID: '',
            //   refType: this.view?.formModel?.entityName,
            //   dataSource: data,
            // };

            this.codxShareService.defaultMoreFunc(
              event,
              data,
              null,
              this.view?.formModel,
              this.view?.dataService,
              this
              //customData
            );
            break;
        }
      }
    });
  }

  changeDataMF(event, data: any) {
    if (this.runMode == '1') {
      this.codxShareService.changeMFApproval(event, data?.unbounds);
    } else {
      //Mới tạo
      event.forEach((func) => {
        if (data?.approveStatus == EPCONST.A_STATUS.New) {
          if (
            // Hiện: sửa - xóa - chép - gửi duyệt -
            func.functionID == EPCONST.MFUNCID.View ||
            func.functionID == EPCONST.MFUNCID.Delete ||
            func.functionID == EPCONST.MFUNCID.Edit ||
            func.functionID == EPCONST.MFUNCID.Copy ||
            func.functionID == EPCONST.MFUNCID.R_Release ||
            func.functionID == EPCONST.MFUNCID.C_Release ||
            func.functionID == EPCONST.MFUNCID.S_Release
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: dời - mời - hủy
            func.functionID == EPCONST.MFUNCID.R_Cancel ||
            func.functionID == EPCONST.MFUNCID.C_Cancel ||
            func.functionID == EPCONST.MFUNCID.S_Cancel ||
            func.functionID == EPCONST.MFUNCID.R_Invite ||
            func.functionID == EPCONST.MFUNCID.R_Reschedule
          ) {
            func.disabled = true;
          }
        }
        if (data?.approveStatus == EPCONST.A_STATUS.Released) {
          //Gửi duyệt
          if (
            //Hiện: dời - mời - chép - hủy
            func.functionID == EPCONST.MFUNCID.View ||
            func.functionID == EPCONST.MFUNCID.Copy ||
            func.functionID == EPCONST.MFUNCID.R_Cancel ||
            func.functionID == EPCONST.MFUNCID.C_Cancel ||
            func.functionID == EPCONST.MFUNCID.S_Cancel ||
            func.functionID == EPCONST.MFUNCID.R_Invite ||
            func.functionID == EPCONST.MFUNCID.R_Reschedule
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: sửa - xóa - gửi duyệt

            func.functionID == EPCONST.MFUNCID.Delete ||
            func.functionID == EPCONST.MFUNCID.Edit ||
            func.functionID == EPCONST.MFUNCID.R_Release ||
            func.functionID == EPCONST.MFUNCID.C_Release ||
            func.functionID == EPCONST.MFUNCID.S_Release
          ) {
            func.disabled = true;
          }
        }
        if (data?.approveStatus == EPCONST.A_STATUS.Rejected) {
          //Từ chối
          if (
            //Hiện: chép
            func.functionID == EPCONST.MFUNCID.View ||
            func.functionID == EPCONST.MFUNCID.Copy
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: còn lại
            func.functionID == EPCONST.MFUNCID.Edit ||
            func.functionID == EPCONST.MFUNCID.Delete ||
            func.functionID == EPCONST.MFUNCID.R_Cancel ||
            func.functionID == EPCONST.MFUNCID.C_Cancel ||
            func.functionID == EPCONST.MFUNCID.S_Cancel ||
            func.functionID == EPCONST.MFUNCID.R_Release ||
            func.functionID == EPCONST.MFUNCID.C_Release ||
            func.functionID == EPCONST.MFUNCID.S_Release ||
            func.functionID == EPCONST.MFUNCID.R_Invite ||
            func.functionID == EPCONST.MFUNCID.R_Reschedule
          ) {
            func.disabled = true;
          }
        }
        if (data?.approveStatus == EPCONST.A_STATUS.Approved) {
          //Đã duyệt
          event.forEach((func) => {
            if (
              // Hiện: Mời - dời - Chép
              func.functionID == EPCONST.MFUNCID.View ||
              func.functionID == EPCONST.MFUNCID.Copy ||
              func.functionID == EPCONST.MFUNCID.R_Invite ||
              func.functionID == EPCONST.MFUNCID.R_Reschedule ||
              func.functionID == EPCONST.MFUNCID.R_Cancel ||
              func.functionID == EPCONST.MFUNCID.C_Cancel ||
              func.functionID == EPCONST.MFUNCID.S_Cancel
            ) {
              func.disabled = false;
            }
            if (
              //Ẩn: sửa - xóa - duyệt - hủy
              func.functionID == EPCONST.MFUNCID.Delete ||
              func.functionID == EPCONST.MFUNCID.Edit ||
              func.functionID == EPCONST.MFUNCID.R_Release ||
              func.functionID == EPCONST.MFUNCID.C_Release ||
              func.functionID == EPCONST.MFUNCID.S_Release
            ) {
              func.disabled = true;
            }
          });
        } else {
          if (
            //Hiện: chép
            func.functionID == EPCONST.MFUNCID.View ||
            func.functionID == EPCONST.MFUNCID.Copy ||
            func.functionID == EPCONST.MFUNCID.Delete ||
            func.functionID == EPCONST.MFUNCID.Edit ||
            func.functionID == EPCONST.MFUNCID.R_Release ||
            func.functionID == EPCONST.MFUNCID.C_Release ||
            func.functionID == EPCONST.MFUNCID.S_Release
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: còn lại
            func.functionID == EPCONST.MFUNCID.R_Cancel ||
            func.functionID == EPCONST.MFUNCID.C_Cancel ||
            func.functionID == EPCONST.MFUNCID.S_Cancel ||
            func.functionID == EPCONST.MFUNCID.R_Invite ||
            func.functionID == EPCONST.MFUNCID.R_Reschedule
          ) {
            func.disabled = true;
          }
        }
      });
    }
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  roleCheck() {
    //Kiểm tra quyền admin
    this.codxBookingService.roleCheck().subscribe((res) => {
      if (res == true) {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
    });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//

  showHour(date: any) {
    let temp = new Date(date);
    let time =
      ('0' + temp.getHours()).toString().slice(-2) +
      ':' +
      ('0' + temp.getMinutes()).toString().slice(-2);
    return time;
  }
  setPopupTitle(mfunc) {
    this.popupTitle = mfunc + ' ' + this.funcIDName;
    this.detectorRef.detectChanges();
  }

  setPopupTitleOption(mfunc) {
    this.popupTitle = mfunc;
    this.detectorRef.detectChanges();
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//

  release(data: any) {}

  cancel(data: any) {}

  addNew(evt?) {
    this.view.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      let inputParam = new EP_BookingInputParam();
      inputParam.data = res;
      inputParam.funcType = EPCONST.MFUNCID.Add;
      inputParam.popupTitle = this.popupTitle;
      let dialogAdd = this.callfc.openSide(
        AddReceiptResourceComponent,
        inputParam,
        option
      );
      dialogAdd.closed.subscribe((returnData) => {
        if (returnData?.event) {
          this.view?.dataService?.update(returnData?.event, true).subscribe();
        } else {
          this.view.dataService.clear();
        }
      });
    });
  }

  edit(data?) {
    if (data) {
      if (
        this.curUser?.userID == data?.createdBy ||
        this.codxBookingService.checkAdminRole(this.curUser, this.isAdmin)
      ) {
        this.view.dataService.edit(data).subscribe((res) => {
          let option = new SidebarModel();
          option.Width = '550px';
          this.view.dataService.dataSelected = data;
          option.DataService = this.view?.dataService;
          option.FormModel =this.view?.formModel;
          let inputParam = new EP_BookingInputParam();
          inputParam.data = res ?? this.view.dataService.dataSelected;
          inputParam.funcType = EPCONST.MFUNCID.Edit;
          inputParam.popupTitle = this.popupTitle;
          let dialogEdit = this.callfc.openSide(
            AddReceiptResourceComponent,
            inputParam,
            option
          );
          dialogEdit.closed.subscribe((returnData) => {
            if (returnData?.event) {
              this.view?.dataService?.update(returnData?.event, true).subscribe();
            } else {
              this.view.dataService.clear();
            }
          });
        });
      } else {
        this.notificationsService.notifyCode('SYS032');
        return;
      }
    }
  }

  copy(evt?) {
    if (evt) {
      if (true) {
        this.view.dataService.dataSelected = evt;
        this.view.dataService.copy().subscribe((res) => {
          if (res) {
            res.items = res.items ?? evt?.items;
            let option = new SidebarModel();
            option.Width = '550px';
            option.DataService = this.view?.dataService;
            option.FormModel = this.view?.formModel;
            let inputParam = new EP_BookingInputParam();
            inputParam.data = res ?? this.view?.dataService?.dataSelected;
            inputParam.funcType = EPCONST.MFUNCID.Copy;
            inputParam.popupTitle = this.popupTitle;
            let dialogCopy = this.callfc.openSide(
              AddReceiptResourceComponent,
              inputParam,
              option
            );
            dialogCopy.closed.subscribe((returnData) => {
              if (returnData?.event) {
                this.view?.dataService?.update(returnData?.event, true).subscribe();
              } else {
                this.view.dataService.clear();
              }
            });
          }
        });
      }
    }
  }
  viewDetail(data: any) {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      let inputParam = new EP_BookingInputParam();
      inputParam.data = data;
      inputParam.funcType = EPCONST.MFUNCID.View;
      inputParam.popupTitle = this.popupTitle;
      inputParam.viewOnly = true;
      let dialogview = this.callfc.openSide(
        AddReceiptResourceComponent,
        inputParam,
        option
      );
    
  ;
  }
  delete(data?) {
    if (
      this.curUser?.userID == data?.createdBy ||
      this.codxBookingService.checkAdminRole(this.curUser, this.isAdmin)
    ) {
      let deleteItem = this.view.dataService.dataSelected;
      if (data) {
        deleteItem = data;
      }
      this.view.dataService.delete([deleteItem]).subscribe(() => {});
    } else {
      this.notificationsService.notifyCode('SYS032');
      return;
    }
  }
  reloadData(data: any) {
    if (data != null) {
      this.view?.dataService.update(data, true).subscribe();
      this.detectorRef.detectChanges();
    }
  }
}
