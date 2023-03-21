declare var window: any;

import {
  Component,
  TemplateRef,
  ViewChild,
  Injector,
  AfterViewInit,
} from '@angular/core';
import {
  ResourceModel,
  DialogRef,
  SidebarModel,
  UIComponent,
  FormModel,
  CallFuncService,
  NotificationsService,
  AuthService,
  CodxScheduleComponent,
  Util,
} from 'codx-core';
import { ButtonModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { DataRequest } from '@shared/models/data.request';
import { PopupAddBookingCarComponent } from './popup-add-booking-car/popup-add-booking-car.component';
import { CodxEpService, ModelPage } from '../../codx-ep.service';
import moment from 'moment';
@Component({
  selector: 'booking-car',
  templateUrl: 'booking-car.component.html',
  styleUrls: ['booking-car.component.scss'],
})
export class BookingCarComponent extends UIComponent implements AfterViewInit {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('chart') chart: TemplateRef<any>;
  @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>;
  @ViewChild('resourceTootip') resourceTootip!: TemplateRef<any>;
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  @ViewChild('footer') footerTemplate?: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('mfButton') mfButton?: TemplateRef<any>;
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
  @ViewChild('cardTemplate') cardTemplate?: TemplateRef<any>;

  @ViewChild('gridResourceName') gridResourceName: TemplateRef<any>;
  @ViewChild('gridHost') gridHost: TemplateRef<any>;
  @ViewChild('gridMF') gridMF: TemplateRef<any>;
  @ViewChild('gridBookingOn') gridBookingOn: TemplateRef<any>;
  @ViewChild('gridStartDate') gridStartDate: TemplateRef<any>;
  @ViewChild('gridEndDate') gridEndDate: TemplateRef<any>;
  @ViewChild('gridPhone') gridPhone: TemplateRef<any>;
  @ViewChild('gridAddress') gridAddress: TemplateRef<any>;
  showToolBar = 'true';
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Bookings';
  className = 'BookingsBusiness';
  method = 'GetListBookingAsync';
  idField = 'recID';
  optionalData: any;
  viewType = ViewType;
  formModel: FormModel;
  modelResource?: ResourceModel;
  request?: ResourceModel;
  model = new DataRequest();
  dataSelected: any;
  isAdd = true;
  isCollapsed = true;
  dialog!: DialogRef;
  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  fields: any;
  resourceField: any;
  funcID: string;
  itemDetail;
  popupTitle = '';
  funcIDName = '';
  columnsGrid: any;
  popupClosed = true;

  listCar = [];
  listReason = [];
  listAttendees = [];
  listItem = [];
  tempReasonName = '';
  tempCarName = '';
  tempAttendees = '';
  selectBookingItems = [];
  selectBookingAttendees = '';
  listDriver: any[];
  tempDriverName = '';
  driverName = '';
  queryParams: any;
  navigated = false;
  columnGrids: any;
  isAdmin: boolean;
  grView: any;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private callFuncService: CallFuncService,
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
        this.funcIDName = res.customName.toString().toLowerCase();
      }
    });
    this.funcID = this.router.snapshot.params['funcID'];
    this.queryParams = this.router.snapshot.queryParams;
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;
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
    this.request = new ResourceModel();
    this.request.assemblyName = 'EP';
    this.request.className = 'BookingsBusiness';
    this.request.service = 'EP';
    this.request.method = 'GetListBookingAsync';
    this.request.predicate = 'ResourceType=@0';
    this.request.dataValue = '2';
    this.request.idField = 'recID';
    if (this.queryParams?.predicate && this.queryParams?.dataValue) {
      this.request.predicate = this.queryParams?.predicate;
      this.request.dataValue = this.queryParams?.dataValue;
    }

    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'EP';
    this.modelResource.className = 'BookingsBusiness';
    this.modelResource.service = 'EP';
    this.modelResource.method = 'GetResourceAsync';
    this.modelResource.predicate = 'ResourceType=@0';
    this.modelResource.dataValue = '2';

    // this.model.page = 1;
    // this.model.pageSize = 200;
    // this.model.predicate = 'ResourceType=@0';
    // this.model.dataValue = '2';

    this.moreFunc = [
      {
        id: 'btnEdit',
        icon: 'icon-list-chechbox',
        text: 'Sửa',
      },
      {
        id: 'btnDelete',
        icon: 'icon-list-chechbox',
        text: 'Xóa',
      },
    ];

    this.fields = {
      id: 'recID',
      subject: { name: 'title' },
      startTime: { name: 'startDate' },
      endTime: { name: 'endDate' },
      resourceId: { name: 'resourceID' },
      status: 'approveStatus',
    };

    this.resourceField = {
      Name: 'Resources',
      Field: 'resourceID',
      IdField: 'resourceID',
      TextField: 'resourceName',
      Title: 'Resources',
    };

    this.buttons = {
      id: 'btnAdd',
    };

    this.codxEpService.getListResource('2').subscribe((res: any) => {
      if (res) {
        this.listCar = [];
        this.listCar = res;
      }
    });
    this.codxEpService.getListResource('3').subscribe((res: any) => {
      if (res) {
        this.listDriver = [];
        this.listDriver = res;
      }
    });
    this.codxEpService.getListReason('EP_BookingCars').subscribe((res: any) => {
      if (res) {
        this.listReason = [];
        this.listReason = res;
      }
    });
  }
  onLoading(evt: any) {
    if (this.formModel) {
      this.cache
        .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
        .subscribe((grv) => {
          if (grv) {
            this.grView = Util.camelizekeyObj(grv);
            this.columnGrids = [
              {
                field: '',
                headerText: '',
                width: 40,
                template: this.gridMF,
                textAlign: 'center',
              },
              {
                field: 'bookingOn',
                template: this.gridBookingOn,
                headerText: this.grView?.bookingOn?.headerText,
              },
              {
                field: 'resourceID',
                template: this.gridResourceName,
                headerText: this.grView?.resourceID?.headerText,
              },
              {
                field: 'title',
                headerText: this.grView?.title?.headerText,
              },
              {
                field: 'startDate',
                template: this.gridStartDate,
                headerText: this.grView?.startDate?.headerText,
              },
              {
                field: 'endDate',
                template: this.gridEndDate,
                headerText: this.grView?.endDate?.headerText,
              },
              {
                field: 'requester',
                headerText: this.grView?.requester?.headerText,
              },
              {
                field: 'address',
                template: this.gridAddress,
                headerText: this.grView?.address?.headerText,
              },
              {
                field: 'phone',
                template: this.gridPhone,
                headerText: this.grView?.phone?.headerText,
              },
            ];
            this.views.push({
              sameData: true,
              type: ViewType.grid,
              active: false,
              model: {
                resources: this.columnGrids,
              },
            });
          }
        });
    }
  }
  ngAfterViewInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteBookingAsync';
    this.columnGrids = [
      {
        field: '',
        headerText: '',
        width: 40,
        template: this.gridMF,
        textAlign: 'center',
      },
    ];
    this.views = [
      {
        sameData: false,
        type: ViewType.schedule,
        active: true,
        request2: this.modelResource,
        request: this.request,
        //toolbarTemplate: this.footerButton,
        showSearchBar: false,
        showFilter: false,
        model: {
          //panelLeftRef:this.panelLeft,
          eventModel: this.fields,
          template: this.cardTemplate,
          resourceModel: this.resourceField,
          //template:this.cardTemplate,
          template4: this.resourceHeader,
          //template5: this.resourceTootip,
          template6: this.mfButton, //header
          template8: this.contentTmp, //content
          statusColorRef: 'EP022',
        },
      },
      {
        id: '2',
        type: ViewType.listdetail,
        sameData: true,
        active: false,
        model: {
          template: this.template,
          panelRightRef: this.panelRight,
        },
      },
    ];
    if (this.queryParams?.predicate && this.queryParams?.dataValue) {
      this.codxEpService
        .getBookingByRecID(this.queryParams?.dataValue)
        .subscribe((res: any) => {
          if (res) {
            setInterval(() => this.navigate(res.startDate), 2000);
          }
        });
    }
    this.detectorRef.detectChanges();
  }
  onActionClick(evt?) {
    if (evt.type == 'add' && evt.data?.resourceId != null) {
      this.popupTitle = this.buttons.text + ' ' + this.funcIDName;
      this.addNew(evt.data);
    }
    if (evt.type == 'doubleClick') {
      this.edit(evt.data);
    }
  }
  navigate(date) {
    if (!this.navigated) {
      let ele = document.getElementsByTagName('codx-schedule')[0];
      if (ele) {
        if (
          (window.ng.getComponent(ele) as CodxScheduleComponent).scheduleObj
            .first.element.id == 'Schedule'
        ) {
          (
            window.ng.getComponent(ele) as CodxScheduleComponent
          ).scheduleObj.first.selectedDate = new Date(date);
          this.navigated = true;
        }
      }
    }
  }
  changeDataMF(event, data: any) {
    if (event != null && data != null) {
      if (data.approveStatus == '1') {
        event.forEach((func) => {
          //Mới tạo
          if (
            // Hiện: sửa - xóa - chép - gửi duyệt -
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'SYS04' /*MF chép*/ ||
            func.functionID == 'EP7T1101' /*MF gửi duyệt*/
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: hủy
            func.functionID == 'EP7T1102' /*MF hủy*/
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
            func.functionID == 'EP7T1101' /*MF gửi duyệt*/ ||
            func.functionID == 'EP7T1102' /*MF hủy*/
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
            func.functionID == 'EP7T1102' /*MF hủy*/
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: sửa - xóa - gửi duyệt

            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP7T1101' /*MF gửi duyệt*/
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
            func.functionID == 'EP7T1101' /*MF gửi duyệt*/ ||
            func.functionID == 'EP7T1102' /*MF hủy*/
          ) {
            func.disabled = true;
          }
        });
      } else {
        event.forEach((func) => {
          //Gửi duyệt
          if (
            //Hiện: chép
            func.functionID == 'EP7T1101' /*MF gửi duyệt*/ ||
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'SYS04' /*MF chép*/
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: sửa - xóa - gửi duyệt - hủy
            func.functionID == 'EP7T1102' /*MF hủy*/
          ) {
            func.disabled = true;
          }
        });
      }
    }
  }

  clickMF(event, data) {
    this.popupTitle = event?.text + ' ' + this.funcIDName;
    switch (event?.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'EP7T1101':
        this.release(data);
        break;
      case 'EP7T1102':
        this.cancel(data);
        break;
    }
  }
  click(evt: ButtonModel) {
    this.popupTitle = evt?.text + ' ' + this.funcIDName;
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
      case 'btnEdit':
        this.edit();
        break;
      case 'btnDelete':
        this.delete();
        break;
    }
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
  }

  changeItemDetail(event) {
    this.itemDetail = event?.data;
  }
  setPopupTitle(mfunc) {
    this.popupTitle = mfunc + ' ' + this.funcIDName;
  }
  release(data: any) {
    if (
      this.authService.userValue.userID != data?.owner
      //&& !this.authService.userValue.administrator
    ) {
      this.notificationsService.notifyCode('TM052');
      return;
    }
    if (data.approval != '0') {
      this.codxEpService
        .getCategoryByEntityName(this.formModel.entityName)
        .subscribe((res: any) => {
          this.codxEpService
            .release(data, res?.processID, 'EP_Bookings', this.funcID)
            .subscribe((res) => {
              if (res?.msgCodeError == null && res?.rowCount) {
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
  addNew(evt?) {
    if (evt != null) {
      this.optionalData = evt;
    } else {
      this.optionalData = null;
    }
    if (this.popupClosed) {
      this.view.dataService.addNew().subscribe((res) => {
        this.popupClosed = false;
        this.dataSelected = this.view.dataService.dataSelected;
        let option = new SidebarModel();
        option.Width = '800px';
        option.DataService = this.view?.dataService;
        option.FormModel = this.formModel;
        this.dialog = this.callFuncService.openSide(
          PopupAddBookingCarComponent,
          [this.dataSelected, true, this.popupTitle, this.optionalData],
          option
        );
        this.dialog.closed.subscribe((returnData) => {
          this.popupClosed = true;
          if (!returnData.event) this.view.dataService.clear();
        });
      });
    }
  }

  edit(evt?) {
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
      if (this.popupClosed) {
        this.codxEpService.getBookingByRecID(evt?.recID).subscribe((booking) => {
          if (booking) {
            this.view.dataService.edit(booking).subscribe((res) => {
              this.popupClosed = false;
              let option = new SidebarModel();
              option.Width = '800px';
              this.view.dataService.dataSelected = booking;
              option.DataService = this.view?.dataService;
              option.FormModel = this.formModel;
              this.dialog = this.callFuncService.openSide(
                PopupAddBookingCarComponent,
                [this.view.dataService.dataSelected, false, this.popupTitle],
                option
              );
              this.dialog.closed.subscribe((returnData) => {
                this.popupClosed = true;
                if (!returnData.event) this.view.dataService.clear();
              });
            });
          }
        });
      }
    }
  }

  copy(evt?) {
    if (evt) {
      if (this.popupClosed) {
        
        this.codxEpService.getBookingByRecID(evt?.recID).subscribe((booking) => {
          if (booking) {
            this.view.dataService.copy(booking).subscribe((res) => {
              this.popupClosed = false;
              let option = new SidebarModel();
              option.Width = '800px';
              this.view.dataService.dataSelected = booking;
              option.DataService = this.view?.dataService;
              option.FormModel = this.formModel;
              this.dialog = this.callFuncService.openSide(
                PopupAddBookingCarComponent,
              [
                this.view.dataService.dataSelected,
                true,
                this.popupTitle,
                null,
                true,
              ],
                option
              );
              this.dialog.closed.subscribe((returnData) => {
                this.popupClosed = true;
                if (!returnData.event) this.view.dataService.clear();
              });
            });
          }
        });
      }
    }
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
    this.view.dataService.delete([deleteItem]).subscribe((res) => {});
  }
  sameDayCheck(sDate: any, eDate: any) {
    return moment(new Date(sDate)).isSame(new Date(eDate), 'day');
  }
  showHour(date: any) {
    let temp = new Date(date);
    let time =
      ('0' + temp.getHours()).toString().slice(-2) +
      ':' +
      ('0' + temp.getMinutes()).toString().slice(-2);
    return time;
  }
  closeEditForm(evt?: any) {
    if (evt) {
      this.dialog && this.dialog.close();
    }
  }

  onSelect(obj: any) {
    //console.log(obj);
  }
}
