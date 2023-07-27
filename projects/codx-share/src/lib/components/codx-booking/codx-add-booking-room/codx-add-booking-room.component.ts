import { Permission } from '../../../../../../../src/shared/models/file.model';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  AuthService,
  AuthStore,
  CacheService,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxBookingService } from '../codx-booking.service';
import {
  BookingAttendees,
  BookingItems,
  Equipments,
  Resource,
} from '../codx-booking.model';
import { EPCONST } from 'projects/codx-ep/src/lib/codx-ep.constant';
import { CodxShareService } from '../../../codx-share.service';
const _addMF = EPCONST.MFUNCID.Add;
const _copyMF = EPCONST.MFUNCID.Copy;
const _editMF = EPCONST.MFUNCID.Edit;
const _viewMF = EPCONST.MFUNCID.View;
const _EPParameters = EPCONST.PARAM.EPParameters;
const _EPRoomParameters = EPCONST.PARAM.EPRoomParameters;

export class Device {
  id;
  text = '';
  isSelected = false;
  icon = '';
  createdBy = null;
  createdOn = null;
}

@Component({
  selector: 'codx-add-booking-room',
  templateUrl: './codx-add-booking-room.component.html',
  styleUrls: ['./codx-add-booking-room.component.scss'],
})
export class CodxAddBookingRoomComponent extends UIComponent {
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('addLink', { static: true }) addLink;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('form') form: any;
  @ViewChild('cusCBB') cusCBB: any;
  data: any;
  funcType: any;
  tmpTitle: any;
  optionalData: any;
  dialogRef: DialogRef;
  formModel: FormModel;
  funcID: string;
  user: any;
  attendeesNumber = 0;
  startTime: string;
  endTime: string;
  listUM = [];
  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  ];
  grView: any;
  cbbResource = [];
  fields: Object = { text: 'resourceName', value: 'resourceID' };
  cbbResourceName: string;
  tabInfo = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'tabGeneralInfo',
    },
    {
      icon: 'icon-person_outline',
      text: 'Người tham dự',
      name: 'tabPeopleInfo',
    },
    {
      icon: 'icon-layers',
      text: 'Văn phòng phẩm',
      name: 'tabStationery',
    },
    {
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'tabMoreInfo',
    },
    {
      icon: 'icon-playlist_add_check',
      text: 'Mở rộng',
      name: 'tabReminder',
    },
  ];
  approvalRule: any;
  listRoles = [];
  curUser: any;
  resources = [];
  guestNumber = 0;
  roomCapacity = 0;
  calendarID: any;
  dueDateControl: any;
  vllDevices = [];
  lstDeviceRoom = [];
  tmplstDeviceEdit = [];
  tmplstDevice = [];
  calendarStartTime: string;
  calendarEndTime: string;
  isFullDay = false;
  lstStationery = [];
  isAfterRender: boolean;
  tmpAttendeesList = [];
  tmplstStationery = [];
  listFilePermission: any[];
  busyAttendees: string;
  returnData: any;
  title='';
  checkLoop: boolean;
  showAllResource: any;
  isPopupStationeryCbb: boolean;
  idUserSelected: any;
  popover: any;
  listUserID = [];
  guestControl: any;
  viewOnly = false;
  onSaving = false;
  isEP = true;
  categoryID: any;
  resourceOwner=null;
  constructor(
    injector: Injector,
    private notificationsService: NotificationsService,
    private codxBookingService: CodxBookingService,
    private codxShareService: CodxShareService,
    private authService: AuthService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = { ...dialogData?.data[0] };
    this.funcType = dialogData?.data[1];
    this.tmpTitle = dialogData?.data[2];
    this.optionalData = dialogData?.data[3];
    if (dialogData?.data[4] != null && dialogData?.data[4] == true) {
      this.viewOnly = true;
    }
    this.isEP = dialogData?.data[5] == false ? dialogData?.data[5] : true;
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef?.formModel;
    this.funcID = this.formModel?.funcID;
    this.user = this.authStore.get();
    if (this.funcType == _addMF) {
      if (this.optionalData != null) {
        this.data.bookingOn = this.optionalData.startDate;
        this.data.resourceID = this.optionalData.resourceId;
      } else {
        this.data.bookingOn = new Date();
      }
      this.data.attendees = 1;
      this.data.category = '1';
      this.attendeesNumber = this.data?.attendees;
      this.data.reminder = 15;
    } else if (this.funcType != _addMF) {
      let tmpStartTime = new Date(this.data?.startDate);
      let tmpEndTime = new Date(this.data?.endDate);
      this.startTime =
        ('0' + tmpStartTime.getHours()).toString().slice(-2) +
        ':' +
        ('0' + tmpStartTime.getMinutes()).toString().slice(-2);
      this.endTime =
        ('0' + tmpEndTime.getHours()).toString().slice(-2) +
        ':' +
        ('0' + tmpEndTime.getMinutes()).toString().slice(-2);

      this.attendeesNumber = this.data?.attendees;
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  onInit(): void {
    this.getCacheData();
    this.getCalendateTime();
    this.cacheService.valueList('EP012').subscribe((res) => {
      this.vllDevices = Array.from(res.datas);
      this.vllDevices.forEach((item) => {
        let device = new Device();
        device.id = item.value;
        device.text = item.text;
        device.icon = item.icon;
        this.lstDeviceRoom.push(device);
      });
      if (this.funcType != _addMF && this.optionalData == null) {
        //Lấy list Thiết bị
        this.codxBookingService
          .getResourceEquipments(this.data?.resourceID)
          .subscribe((eq: any) => {
            if (eq != null) {
              Array.from(eq).forEach((e: any) => {
                let tmpDevice = new Device();
                tmpDevice.id = e.equipmentID;
                tmpDevice.isSelected = false;
                this.lstDeviceRoom.forEach((vlDevice) => {
                  if (tmpDevice.id == vlDevice.id) {
                    tmpDevice.text = vlDevice.text;
                    tmpDevice.icon = vlDevice.icon;
                  }
                });
                if (this.data.equipments && this.data.equipments.length > 0) {
                  this.data.equipments.forEach((element) => {
                    if (element.equipmentID == tmpDevice.id) {
                      tmpDevice.isSelected = true;
                      tmpDevice.createdBy = element.createdBy;
                      tmpDevice.createdOn = element.createdOn;
                    }
                  });
                }
                this.tmplstDeviceEdit.push(tmpDevice);
              });
            }
          });
      }
      if (this.funcType == _copyMF) {
        if (this.data?.equipments) {
          this.data?.equipments.forEach((equip) => {
            let tmpDevice = new Device();
            tmpDevice.id = equip.equipmentID;
            tmpDevice.isSelected = equip.isPicked;
            this.lstDeviceRoom.forEach((vlDevice) => {
              if (tmpDevice.id == vlDevice.id) {
                tmpDevice.text = vlDevice.text;
                tmpDevice.icon = vlDevice.icon;
              }
            });
            this.tmplstDevice.push(tmpDevice);
          });
        }
      }
      this.detectorRef.detectChanges();
      if (this.funcType == _addMF && this.optionalData != null) {
        this.data.resourceID = this.optionalData.resourceId;
        let equips = this.optionalData.resource.equipments;
        if (equips) {
          equips.forEach((equip) => {
            let tmpDevice = new Device();
            tmpDevice.id = equip.equipmentID;
            tmpDevice.isSelected = false;
            this.lstDeviceRoom.forEach((vlDevice) => {
              if (tmpDevice.id == vlDevice.id) {
                tmpDevice.text = vlDevice.text;
                tmpDevice.icon = vlDevice.icon;
              }
            });
            this.tmplstDevice.push(tmpDevice);
          });
        }
        this.data.bookingOn = this.optionalData.startDate;
        let tmpStartTime = this.optionalData.startDate;
        let tmpEndTime = this.optionalData.endDate;
        this.startTime =
          ('0' + tmpStartTime.getHours()).toString().slice(-2) +
          ':' +
          ('0' + tmpStartTime.getMinutes()).toString().slice(-2);
        this.endTime =
          ('0' + tmpEndTime.getHours()).toString().slice(-2) +
          ':' +
          ('0' + tmpEndTime.getMinutes()).toString().slice(-2);
        this.detectorRef.detectChanges();
      }
      this.tmplstDevice = JSON.parse(JSON.stringify(this.tmplstDevice));
      this.changeDetectorRef.detectChanges();
    });
    this.detectorRef.detectChanges();

    if (this.data) {
      if (this.funcType != _addMF) {
        if (
          this.startTime == this.calendarStartTime &&
          this.endTime == this.calendarEndTime
        ) {
          this.isFullDay = true;
          this.changeDetectorRef.detectChanges();
        }
      }
    }

    if (this.funcType != _addMF) {
      this.codxBookingService
        .getBookingItems(this.data.recID)
        .subscribe((res: any) => {
          if (res) {
            Array.from(res).forEach((item: any) => {
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
                this.lstStationery.push(tmpSta);
            });
            this.changeDetectorRef.detectChanges();
          }
        });
    }

    this.isAfterRender = true;
  }

  ngAfterViewInit(): void {}

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getCacheData() {
    this.codxBookingService.getListUM().subscribe((res: any) => {
      if (res) {
        Array.from(res).forEach((um: any) => {
          this.listUM.push({ umid: um?.umid, umName: um?.umName });
        });
      }
    });
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((grv) => {
        if (grv) {
          this.grView = Util.camelizekeyObj(grv);
        }
      });

    this.codxBookingService
      .getDataValueOfSettingAsync(_EPParameters, _EPRoomParameters, '1')
      .subscribe((res: string) => {
        if (res) {
          let roomSetting_1 = JSON.parse(res);
          this.dueDateControl = roomSetting_1?.DueDateControl;
          this.guestControl = roomSetting_1?.GuestControl;
        }
      });

    this.codxBookingService
      .getDataValueOfSettingAsync(_EPParameters, null, '4')
      .subscribe((res: string) => {
        if (res) {
          let roomSetting_4 = JSON.parse(res);
          if (roomSetting_4 != null && roomSetting_4.length > 0) {
            let setting = roomSetting_4.filter(
              (x: any) => x.Category == EPCONST.ENTITY.R_Bookings
            );
            if (setting != null) {
              this.approvalRule =
                setting[0]?.ApprovalRule != null
                  ? setting[0]?.ApprovalRule
                  : '1';
              this.categoryID =
                setting[0]?.CategoryID != null
                  ? setting[0]?.CategoryID
                  : EPCONST.ES_CategoryID.Room;
            } else {
              this.approvalRule = '1'; //Đề phòng trường hợp setting lỗi/ thì lấy duyệt theo quy trình
              this.categoryID = EPCONST.ES_CategoryID.Room;
            }
          }
        }
      });
    // Lấy list role người tham gia
    this.cache.valueList('EP009').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        let tmpArr = [];
        tmpArr = res.datas;
        tmpArr.forEach((item) => {
          if (item.value != '4') {
            this.listRoles.push(item);
          }
        });
        //thêm người đặt(người dùng hiên tại) khi thêm mới
        if (this.funcType == _addMF || this.funcType == _copyMF) {
          let people = this.authService.userValue;
          let tmpResource = new BookingAttendees();
          tmpResource.userID = people?.userID;
          tmpResource.userName = people?.userName;
          tmpResource.status = '1';
          tmpResource.roleType = '1';
          tmpResource.optional = false;
          tmpResource.quantity = 1;
          this.listRoles.forEach((element) => {
            if (element.value == tmpResource?.roleType) {
              tmpResource.icon = element?.icon;
              tmpResource.roleName = element?.text;
            }
          });
          this.curUser = tmpResource;
          this.resources.push(tmpResource);
          this.changeDetectorRef.detectChanges();
        } else {
          //lấy ds người tham gia khi sửa
          if (this.data.resources != null) {
            this.loadAttendees(this.data?.resources);
          } else if (this.data.resources == null) {
            this.codxBookingService
              .getBookingAttendees(this.data?.recID)
              .subscribe((res) => {
                if (res) {
                  this.loadAttendees(this.data?.resources);
                }
              });
          }
          if (this.data?.attendees != null && this.data?.resources != null) {
            this.guestNumber =
              this.data?.attendees - this.data?.resources.length;
            if (this.guestNumber < 0) {
              this.guestNumber = 0;
            }
          } else {
            this.guestNumber = 0;
          }
          this.detectorRef.detectChanges();
        }
      }
    });
    if (
      (this.funcType == _addMF && this.data.resourceID != null) ||
      this.funcType != _addMF
    ) {
      this.codxBookingService
        .getResourceByID(this.data.resourceID)
        .subscribe((res: any) => {
          if (res) {
            this.roomCapacity = res?.capacity;
            this.resourceOwner = [res?.owner];
          }
        });
    }
  }
  getCalendateTime() {
    //Lấy giờ làm việc
    this.codxBookingService
      .getDataValueOfSettingAsync(_EPParameters, null, '1')
      .subscribe((res: string) => {
        if (res) {
          let epSetting = JSON.parse(res);
          this.calendarID = epSetting?.CalendarID;
          if (this.calendarID) {
            this.codxBookingService
              .getCalendarWeekdays(this.calendarID)
              .subscribe((cal: any) => {
                if (cal) {
                  Array.from(cal).forEach((day: any) => {
                    if (day?.shiftType == '1') {
                      let tmpstartTime = day?.startTime.split(':');
                      this.calendarStartTime =
                        tmpstartTime[0] + ':' + tmpstartTime[1];
                      if (this.funcType == _addMF) {
                        this.startTime = this.calendarStartTime;
                      }
                    } else if (day?.shiftType == '2') {
                      let tmpEndTime = day?.endTime.split(':');
                      this.calendarEndTime =
                        tmpEndTime[0] + ':' + tmpEndTime[1];
                      if (this.funcType == _addMF) {
                        this.endTime = this.calendarEndTime;
                      }
                    }
                  });
                  this.validateStartEndTime(this.startTime, this.endTime);
                  this.getResourceForCurrentTime();
                }
              });
          }
        }
      });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
  loadAttendees(resources) {
    if (resources) {
      Array.from(resources).forEach((people: any) => {
        let tempAttender = new BookingAttendees();
        tempAttender.userID = people?.userID;
        tempAttender.userName = people?.userName;
        tempAttender.status = people?.status;
        tempAttender.roleType = people?.roleType;
        tempAttender.quantity = people?.quantity;
        tempAttender.optional = people?.optional;
        this.listRoles.forEach((element) => {
          if (element.value == tempAttender.roleType) {
            tempAttender.icon = element?.icon;
            tempAttender.roleName = element?.text;
          }
        });
        if (tempAttender?.userID != this.data?.createdBy) {
          this.resources.push(tempAttender);
        } else if (tempAttender?.userID == this.data?.createdBy) {
          this.curUser = tempAttender;
          this.resources.push(tempAttender);
        }
      });
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Event-----------------------------------------//
  //---------------------------------------------------------------------------------//
  valueChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.data[event.field] = event.data.value;
      } else {
        this.data[event.field] = event.data;
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  valueDateChange(event: any) {
    if (event?.data && event?.data?.fromDate) {
      this.data.bookingOn = event.data.fromDate;

      // if (!this.bookingOnCheck()) {
      //   this.checkLoop = !this.checkLoop;
      //   if (!this.checkLoop) {
      //     if (this.dueDateControl != true || this.dueDateControl != '1') {
      //       this.notificationsService.notifyCode('EP001');
      //       return;
      //     }
      //   }
      //   return;
      // }
      this.validateStartEndTime(this.startTime, this.endTime);
      this.changeDetectorRef.detectChanges();
    }
  }

  fullDayChangeWithTime() {
    if (
      this.startTime == this.calendarStartTime &&
      this.endTime == this.calendarEndTime
    ) {
      this.isFullDay = true;
    } else {
      this.isFullDay = false;
    }
    this.changeDetectorRef.detectChanges();
  }

  valueStartTimeChange(event: any) {
    if (event?.data) {
      this.startTime = event.data.fromDate;
      this.validateStartEndTime(this.startTime, this.endTime);
      this.fullDayChangeWithTime();
      this.changeDetectorRef.detectChanges();
    }
  }

  valueEndTimeChange(event: any) {
    if (event?.data) {
      this.endTime = event.data.toDate;
      this.validateStartEndTime(this.startTime, this.endTime);
      this.fullDayChangeWithTime();
      this.changeDetectorRef.detectChanges();
    }
  }

  valueAllDayChange(event) {
    if (event?.data == true) {
      this.startTime = this.calendarStartTime;
      this.endTime = this.calendarEndTime;
      this.changeDetectorRef.detectChanges();
    }
  }

  checkedChange(event: any, device: any) {
    let index = this.tmplstDevice.indexOf(device);
    if (index != -1) {
      this.tmplstDevice[index].isSelected = event.data;
    }
  }

  guestChange(evt: any) {
    if (evt?.data != null) {
      this.guestNumber = evt?.data;
      if (this.guestNumber < 0) {
        this.guestNumber = 0;
      }
      this.attendeesNumber = this.resources.length + this.guestNumber;
      this.changeDetectorRef.detectChanges();
    }
  }

  reminderChange(evt: any) {
    if (evt != null) {
      this.data.reminder = evt.data;
    }
  }

  shareInputChange(e) {
    let assignTo = '';
    let listUserIDByOrg = '';
    let listDepartmentID = '';
    let listUserID = '';
    let listPositionID = '';
    let listEmployeeID = '';
    let listGroupMembersID = '';
    let type = 'U';
    if (e == null) return;
    e?.data?.forEach((obj) => {
      if (obj.objectType && obj.id) {
        type = obj.objectType;
        switch (obj.objectType) {
          case 'U':
            listUserID += obj.id + ';';
            break;
          case 'O':
          case 'D':
            listDepartmentID += obj.id + ';';
            break;
          case 'RP':
          case 'P':
            listPositionID += obj.id + ';';
            break;
          case 'RE':
            listEmployeeID += obj.id + ';';
            break;
          case 'UG':
            listGroupMembersID += obj.id + ';';
            break;
        }
      }
    });
    if (listGroupMembersID != '') {
      listGroupMembersID = listGroupMembersID.substring(
        0,
        listGroupMembersID.length - 1
      );
      this.codxBookingService
        .getListUserIDByListGroupID(listGroupMembersID)
        .subscribe((res) => {
          if (res && res?.length > 0) {
            this.valueUser(res);
          }
        });
    }
    if (listUserID != '') {
      listUserID = listUserID.substring(0, listUserID.length - 1);
      this.valueUser(listUserID);
    }

    if (listDepartmentID != '')
      listDepartmentID = listDepartmentID.substring(
        0,
        listDepartmentID.length - 1
      );
    if (listDepartmentID != '') {
      this.codxBookingService
        .getListUserIDByListOrgIDAsync([listDepartmentID, type])
        .subscribe((res) => {
          if (res) {
            listUserIDByOrg += res;
            if (listUserID != '') listUserIDByOrg += ';' + listUserID;
            this.valueUser(listUserIDByOrg);
          }
        });
    }
    if (listEmployeeID != '') {
      listEmployeeID = listEmployeeID.substring(0, listEmployeeID.length - 1);
      this.codxBookingService
        .getListUserIDByListEmployeeID(listEmployeeID)
        .subscribe((res) => {
          if (res && res.length > 0) {
            this.valueUser(res);
          }
        });
    }
    if (listPositionID != '') {
      listPositionID = listPositionID.substring(0, listPositionID.length - 1);
      this.codxBookingService
        .getListUserIDByListPositionsID(listPositionID)
        .subscribe((res) => {
          if (res && res.length > 0) {
            if (!res[1]) this.notificationsService.notifyCode('TM066');
            this.valueUser(res[0]);
          } else this.notificationsService.notifyCode('TM066');
        });
    }
  }
  valueUser(resourceID) {
    if (resourceID != '') {
      if (this.resources != null) {
        var user = this.resources;
        var array = resourceID.split(';');
        var id = '';
        var arrayNew = [];
        user.forEach((e) => {
          id += e.userID + ';';
        });
        if (id != '') {
          id = id.substring(0, id.length - 1);

          array.forEach((element) => {
            if (!id.split(';').includes(element)) arrayNew.push(element);
          });
        }
        if (arrayNew.length > 0) {
          resourceID = arrayNew.join(';');
          id += ';' + resourceID;
          this.getListUser(resourceID);
        }
      } else {
        this.getListUser(resourceID);
      }
    }
  }

  getListUser(resource) {
    while (resource.includes(' ')) {
      resource = resource.replace(' ', '');
    }
    var arrUser = resource.split(';');
    this.listUserID = this.listUserID.concat(arrUser);
    this.api
      .execSv<any>(
        'HR',
        'ERM.Business.HR',
        'EmployeesBusiness',
        'GetListEmployeesByUserIDAsync',
        JSON.stringify(resource.split(';'))
      )
      .subscribe((res) => {
        if (res && res.length > 0) {
          for (var i = 0; i < res.length; i++) {
            let emp = res[i];
            var tmpResource = new BookingAttendees();
            if (emp.userID == this.user.userID) {
              tmpResource.userID = emp?.userID;
              tmpResource.userName = emp?.userName;
              tmpResource.positionName = emp?.positionName;
              tmpResource.roleType = '1';
              tmpResource.optional = false;
              this.listRoles.forEach((element) => {
                if (element.value == tmpResource.roleType) {
                  tmpResource.icon = element.icon;
                  tmpResource.roleName = element.text;
                }
              });
              this.resources.push(tmpResource);
            } else {
              tmpResource.userID = emp?.userID;
              tmpResource.userName = emp?.userName;
              tmpResource.positionName = emp?.positionName;
              tmpResource.roleType = '3';
              tmpResource.optional = false;
              this.listRoles.forEach((element) => {
                if (element.value == tmpResource.roleType) {
                  tmpResource.icon = element.icon;
                  tmpResource.roleName = element.text;
                }
              });
              this.resources.push(tmpResource);
            }
          }
          this.resources.forEach((item) => {
            if (item.userID != this.curUser.userID) {
              this.resources.push(item);
            }
          });
          this.resources = this.filterArray(this.resources);
          this.data.attendees = this.resources.length;
          this.attendeesNumber = this.data.attendees + this.guestNumber;
          this.detectorRef.detectChanges();
        }
      });
  }

  deleteAttender(attID: string) {
    if (this.viewOnly) {
      return;
    }
    let tempDelete;
    this.resources.forEach((item) => {
      if (item.userID == attID) {
        tempDelete = item;
      }
    });
    this.resources.splice(this.resources.indexOf(tempDelete), 1);
    this.attendeesNumber = this.resources.length + this.guestNumber;
    this.changeDetectorRef.detectChanges();
  }

  showAllResourceChange(evt: any) {
    if (evt != null) {
      this.showAllResource = evt;
      this.getResourceForCurrentTime();
      this.detectorRef.detectChanges();
    }
  }

  valueAttendeesChange() {
    // if (event?.data != null) {
    //   if (event.data < 0) {
    //     event.data = 0;
    //   }
    //   this.attendeesNumber = event.data +this.guestNumber;
    //   this.changeDetectorRef.detectChanges();
    // }
  }

  //Stationery & Room

  valueCbxStationeryChange(event?) {
    if (event == null) {
      this.isPopupStationeryCbb = false;
      return;
    }
    event.dataSelected.forEach((item) => {
      let tmpSta = new BookingItems();
      (tmpSta.itemID = item.ResourceID),
        (tmpSta.quantity = this.attendeesNumber),
        (tmpSta.itemName = item.ResourceName),
        (tmpSta.umid = item.UMID),
        (tmpSta.umName = item.UMID),
        (tmpSta.objectType = 'EP_Resources'),
        (tmpSta.objectID = item.RecID);
      let tmpUM = this.listUM.filter((obj) => {
        return obj.umid == tmpSta.umid;
      });
      if (tmpUM != null && tmpUM.length > 0) {
        tmpSta.umName = tmpUM[0]?.umName;
      }
      this.lstStationery.push(tmpSta);
    });
    this.lstStationery = [
      ...new Map(
        this.lstStationery.map((item) => [item['itemID'], item])
      ).values(),
    ];

    this.changeDetectorRef.detectChanges();
    this.isPopupStationeryCbb = false;
  }

  valueQuantityChange(event?) {
    if (event?.data != null && event?.field) {
      if (event?.data < 0) {
        event.data = 0;
      }
      this.lstStationery.forEach((item) => {
        if (item.itemID === event?.field) {
          item.quantity = event.data;
        }
      });
      this.changeDetectorRef.detectChanges();
    }
    // this.lstStationery = this.lstStationery.filter((item) => {
    //   return item.quantity != 0;
    // });
  }

  deleteStationery(itemID: any) {
    if (this.viewOnly) {
      return;
    }
    if (itemID != null && this.lstStationery != null) {
      this.lstStationery = this.lstStationery.filter((item) => {
        return item?.itemID != itemID;
      });
    }
  }
  //////////////////////////
  attendeesCheckChange(event: any, userID: any) {
    this.resources.forEach((attender) => {
      if (attender.userID == userID) {
        attender.optional = event.data;
      }
    });
  }

  showPopover(p, userID) {
    // if (this.popover) this.popover.close();
    if (userID) this.idUserSelected = userID;
    p.open();
    this.popover = p;
  }

  selectRoseType(idUserSelected, value) {
    if (value == '1') {
      if (this.curUser.roleType == '1') {
        this.curUser.roleType = '3';
        this.listRoles.forEach((role) => {
          if (this.curUser.roleType == role.value) {
            this.curUser.icon = role.icon;
          }
        });
        this.detectorRef.detectChanges();
      } else {
        this.resources.forEach((att) => {
          if (att.roleType == '1') {
            att.roleType = '3';
            this.listRoles.forEach((role) => {
              if (att.roleType == role.value) {
                att.icon = role.icon;
              }
            });
            this.detectorRef.detectChanges();
          }
        });
      }
    }

    if (idUserSelected == this.curUser.userID) {
      this.curUser.roleType = value;
      this.listRoles.forEach((role) => {
        if (this.curUser.roleType == role.value) {
          this.curUser.icon = role.icon;
        }
      });
      this.changeDetectorRef.detectChanges();
    } else {
      this.resources.forEach((res) => {
        if (res.userID == idUserSelected) {
          res.roleType = value;
          this.listRoles.forEach((role) => {
            if (role?.value == res?.roleType) {
              res.icon = role.icon;
            }
          });
        }
      });
      this.changeDetectorRef.detectChanges();
    }
    this.changeDetectorRef.detectChanges();
    this.popover.close();
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//
  beforeSave(option: RequestOption) {
    let itemData = this.data;
    option.methodName = 'SaveAsync';
    let isAdd = true;
    if (this.funcType == _editMF) {
      isAdd = false;
    }
    option.data = [
      itemData,
      isAdd,
      this.tmpAttendeesList,
      this.tmplstStationery,
    ];
    return true;
  }

  onSaveForm(approval: boolean = false) {
    if(approval && this.funcType == _editMF && this.authService?.userValue?.userID != this.data.createdBy){      
      this.notificationsService.notifyCode('SYS032');
      return;
    }
    if (!this.onSaving) {
      this.onSaving = true;
      if (this.funcType == _addMF) {
        this.data.requester = this.authService?.userValue?.userName;
      }
      if (!this.bookingOnCheck()) {
        this.notificationsService.notifyCode('EP001');
        this.onSaving = false;
        return;
      }
      if (this.data.startDate < new Date()) {
        if (this.dueDateControl != true || this.dueDateControl != '1') {
          this.notificationsService.notifyCode('EP001');
          this.onSaving = false;
          return;
        }
      }
      if (!this.validateStartEndTime(this.startTime, this.endTime)) {
        this.notificationsService.notifyCode('EP002');
        this.onSaving = false;
        return;
      }
      if (this.data.startDate >= this.data.endDate) {
        this.notificationsService.notifyCode('EP002');
        this.onSaving = false;
        return;
      }
      this.form?.formGroup.patchValue(this.data);
      if (this.form?.formGroup.invalid == true) {
        this.codxBookingService.notifyInvalid(
          this.form?.formGroup,
          this.formModel
        );
        this.onSaving = false;
        return;
      }

      this.tmpAttendeesList = [];
      this.listFilePermission = [];
      this.resources.forEach((item) => {
        this.tmpAttendeesList.push(item);
        let tmpPer = new Permission();
        tmpPer.objectID = item.userID; //
        tmpPer.objectType = 'U';
        tmpPer.read = true;
        tmpPer.share = true;
        tmpPer.download = true;
        tmpPer.isActive = true;
        this.listFilePermission.push(tmpPer);
        if (item.roleType == '1') {
          this.data.owner = item?.userID;
        }
      });

      let tmpEquip = [];
      this.tmplstDevice.forEach((element) => {
        if (element.isSelected) {
          let tempEquip = new Equipments();
          tempEquip.equipmentID = element.id;
          tempEquip.createdBy =
            element.createdBy == null
              ? this.authService.userValue.userID
              : element.createdBy;
          tempEquip.createdOn =
            element.createdOn == null ? new Date() : element.createdOn;
          tmpEquip.push(tempEquip);
        }
      });
      this.data.equipments = [];
      this.data.equipments = tmpEquip;
      this.data.stopOn = this.data.endDate;
      if (this.data.online != true) {
        this.data.onlineUrl = null;
        this.data.onlineUrl2 = null;
      }
      if (this.approvalRule == '0' && approval) {
        this.data.approveStatus = '5';
      }
      this.data.approveStatus = this.data.approveStatus ?? '1';
      this.data.status = this.data.status ?? '1';

      this.data.resourceType = this.data.resourceType ?? '1';
      this.data.approval = this.approvalRule;
      this.data.requester = this.curUser.userName;
      this.data.attendees = this.resources.length + this.guestNumber;
      this.data.attachments = this.attachment.fileUploadList.length;
      //check
      this.codxBookingService
        .checkDuplicateBooking(
          this.data.startDate,
          this.data.endDate,
          this.data.resourceID,
          this.data.recID
        )
        .subscribe((result) => {
          if (result == '1') {
            this.notificationsService.notifyCode('EP009');
            this.onSaving = false;
            return;
          } else if (result == '2') {
            this.notificationsService.alertCode('EP017').subscribe((x) => {
              if (x.event?.status == 'Y') {
                this.checkOnlineUrlAndCapacity(approval);
              } else {
                this.onSaving = false;
                return;
              }
            });
          } else {
            this.checkOnlineUrlAndCapacity(approval);
          }
        });
    } else {
      this.onSaving = false;
      return;
    }
  }

  checkOnlineUrlAndCapacity(approval: boolean) {
    //ktra link online
    if (
      this.data.online &&
      (this.data.onlineUrl == null || this.data.onlineUrl == '')
    ) {
      this.notificationsService.alertCode('EP012').subscribe((x) => {
        if (x.event?.status == 'Y') {
          if (this.attendeesNumber > this.roomCapacity) {
            this.notificationsService.alertCode('EP004').subscribe((x) => {
              if (x.event?.status == 'Y') {
                this.attendeesValidateStep(approval);
              } else {
                this.onSaving = false;
                return;
              }
            });
          } else {
            this.attendeesValidateStep(approval);
          }
        } else {
          this.onSaving = false;
          return;
        }
      });
    } else {
      if (this.attendeesNumber > this.roomCapacity) {
        this.notificationsService.alertCode('EP004').subscribe((x) => {
          if (x.event?.status == 'Y') {
            this.attendeesValidateStep(approval);
          } else {
            this.onSaving = false;
            return;
          }
        });
      } else {
        this.attendeesValidateStep(approval);
      }
    }
  }

  checkAvailableStationery(approval) {
    //Check số lượng VPP đi kèm
    this.tmplstStationery = [];
    this.lstStationery.forEach((item) => {
      if (item.quantity > 0) {
        this.tmplstStationery.push(item);
      }
    });
    if (this.lstStationery.length > 0) {
      this.api
        .exec('EP', 'ResourcesBusiness', 'CheckAvailableResourceAsync', [
          this.tmplstStationery,
        ])
        .subscribe((res: any[]) => {
          if (res && res.length > 0) {
            let unAvaiResource = res.join(', ');
            this.notificationsService
              .alertCode('EP015', null, unAvaiResource)
              .subscribe((x) => {
                if (x.event?.status == 'Y') {
                  this.onSaving = false;
                  return;
                } else {
                  this.onSaving = false;
                  return;
                }
              });
          } else {
            this.startSave(approval);
          }
        });
    } else {
      this.startSave(approval);
    }
  }

  attendeesValidateStep(approval) {
    this.codxBookingService
      .bookingAttendeesValidator(
        this.tmpAttendeesList,
        this.data.startDate,
        this.data.endDate,
        this.data.recID
      )
      .subscribe((res: any) => {
        if (res != null && res.length > 0) {
          this.busyAttendees = '';
          res.forEach((item) => {
            this.busyAttendees += item.objectName + ', ';
          });
          this.notificationsService
            .alertCode('EP005', null, '"' + this.busyAttendees + '"')
            .subscribe((x) => {
              if (x.event?.status == 'Y') {
                this.checkAvailableStationery(approval);
              } else {
                this.onSaving = false;
                return;
              }
            });
        } else {
          this.checkAvailableStationery(approval);
        }
      });
  }

  bookingOnCheck() {
    let selectDate = new Date(this.data.bookingOn);
    let tmpCrrDate = new Date();
    this.data.startDate = new Date(this.data.startDate);
    this.data.endDate = new Date(this.data.endDate);

    this.data.startDate = new Date(
      selectDate.getFullYear(),
      selectDate.getMonth(),
      selectDate.getDate(),
      this.data.startDate.getHours(),
      this.data.startDate.getMinutes(),
      0,
      0
    );
    this.data.endDate = new Date(
      selectDate.getFullYear(),
      selectDate.getMonth(),
      selectDate.getDate(),
      this.data.endDate.getHours(),
      this.data.endDate.getMinutes(),
      0,
      0
    );
    let crrDate = new Date(
      tmpCrrDate.getFullYear(),
      tmpCrrDate.getMonth(),
      tmpCrrDate.getDate(),
      0,
      0,
      0,
      0
    );
    if (
      new Date(
        selectDate.getFullYear(),
        selectDate.getMonth(),
        selectDate.getDate(),
        0,
        0,
        0,
        0
      ) < crrDate
    ) {
      //this.bookingOnValid = true;
      if (this.dueDateControl == true || this.dueDateControl == '1') {
        return true;
      } else {
        return false;
      }
    } else {
      //this.bookingOnValid = false;
      this.changeDetectorRef.detectChanges();
      return true;
    }
  }

  validateStartEndTime(startTime: any, endTime: any) {
    if (startTime != null && endTime != null) {
      let tempStartTime = startTime.split(':');
      let tempEndTime = endTime.split(':');
      let tmpDay = new Date(this.data.bookingOn);

      this.data.startDate = new Date(
        tmpDay.getFullYear(),
        tmpDay.getMonth(),
        tmpDay.getDate(),
        tempStartTime[0],
        tempStartTime[1],
        0
      );

      this.data.endDate = new Date(
        tmpDay.getFullYear(),
        tmpDay.getMonth(),
        tmpDay.getDate(),
        tempEndTime[0],
        tempEndTime[1],
        0
      );
      this.getResourceForCurrentTime();
      this.changeDetectorRef.detectChanges();
    }
    return true;
  }

  cbxResourceChange(evt: any) {
    if (evt && !this.onSaving) {
      let selectResource = this.cbbResource.filter((obj) => {
        return obj.resourceID == evt;
      });
      if (selectResource) {
        this.roomCapacity = selectResource[0].capacity;
        this.resourceOwner = [selectResource[0].owner];
        this.data.resourceID = evt;
        this.tmplstDevice = [];
        if (
          selectResource[0]?.equipments &&
          selectResource[0]?.equipments.length > 0
        ) {
          selectResource[0].equipments.forEach((item) => {
            let tmpDevice = new Device();
            tmpDevice.id = item.equipmentID;
            if (this.tmplstDeviceEdit.length > 0) {
              this.tmplstDeviceEdit.forEach((oldItem) => {
                if (oldItem.id == tmpDevice.id) {
                  tmpDevice.isSelected = oldItem.isSelected;
                  tmpDevice.createdOn = oldItem.createdOn;
                  tmpDevice.createdBy = oldItem.createdBy;
                }
              });
            }
            this.vllDevices.forEach((vlItem) => {
              if (tmpDevice.id == vlItem.value) {
                tmpDevice.text = vlItem.text;
                tmpDevice.icon = vlItem.icon;
              }
            });
            this.tmplstDevice.push(tmpDevice);
          });
        }
        if (this.data?.resourceID != evt || this.tmplstDevice.length == 0) {
          //
        }
      }
      this.detectorRef.detectChanges();
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//

  startSave(approval) {
    if (!this.isEP) {
      this.startSaveNotEP(approval);
    } else {
      this.dialogRef.dataService
        .save(
          (opt: RequestOption) => this.beforeSave(opt),
          0,
          null,
          null,
          !approval
        )
        .subscribe(async (res) => {
          if (res.save || res.update) {
            if (!res.save) {
              this.returnData = res.update;
            } else {
              this.returnData = res.save;
            }
            if (this.returnData?.recID && this.returnData?.attachments > 0) {
              if (
                this.attachment.fileUploadList &&
                this.attachment.fileUploadList.length > 0
              ) {
                this.attachment.addPermissions = this.listFilePermission;
                this.attachment.objectId = this.returnData?.recID;
                (await this.attachment.saveFilesObservable()).subscribe(
                  (item2: any) => {
                    if (item2?.status == 0) {
                      this.fileAdded(item2);
                    }
                    if (approval) {
                      this.startRelease();
                    } else {
                      this.dialogRef && this.dialogRef.close(this.returnData);
                    }
                  }
                );
              }
            } else {
              if (approval) {
                this.startRelease();
              } else {
                this.dialogRef && this.dialogRef.close(this.returnData);
              }
            }
          } else {
            this.onSaving = false;
            return;
          }
        });
    }
  }

  startSaveNotEP(approval) {
    let isAdd = this.funcType == _addMF ? true : false;
    this.codxBookingService
      .addEditBooking(
        this.data,
        isAdd,
        this.tmpAttendeesList,
        this.tmplstStationery
      )
      .subscribe((res) => {
        if (res) {
          this.returnData = res;
          if (approval) {
            if (this.approvalRule != '0') {
              this.codxBookingService
                .getProcessByCategoryID(this.categoryID)
                .subscribe((res: any) => {
                  this.codxShareService
                    .codxRelease(
                      'EP',
                      this.returnData?.recID,
                      res?.processID,
                      'EP_Bookings',
                      this.formModel.funcID,
                      this.returnData?.createdBy,
                      this.returnData?.title,
                      null
                    )
                    .subscribe((res: any) => {
                      if (res?.msgCodeError == null && res?.rowCount) {
                        this.notificationsService.notifyCode('ES007');
                        this.returnData.approveStatus = '3';
                        this.returnData.write = false;
                        this.returnData.delete = false;
                        (this.dialogRef.dataService as CRUDService)
                          .update(this.returnData)
                          .subscribe();
                        this.dialogRef && this.dialogRef.close(this.returnData);
                      } else {
                        this.notificationsService.notifyCode(res?.msgCodeError);
                        // Thêm booking thành công nhưng gửi duyệt thất bại
                        this.dialogRef && this.dialogRef.close(this.returnData);
                      }
                    });
                });
            } else {
              this.notificationsService.notifyCode('ES007');
              this.codxBookingService
                .afterApprovedManual(
                  this.formModel.entityName,
                  this.returnData.recID,
                  '5'
                )
                .subscribe();
              this.dialogRef && this.dialogRef.close(this.returnData);
            }

            this.dialogRef && this.dialogRef.close(this.returnData);
          } else {
            this.dialogRef && this.dialogRef.close(this.returnData);
          }
        } else {
          this.onSaving = false;
          return;
        }
      });
  }

  startRelease() {
    if (this.approvalRule != '0') {
      this.codxBookingService
        .getProcessByCategoryID(this.categoryID)
        .subscribe((category: any) => {
          this.codxShareService
            .codxReleaseDynamic(
              'EP',
              this.returnData,
              category,
              'EP_Bookings',
              this.formModel.funcID,
              this.returnData?.title,
              (res) => {
                if (res?.msgCodeError == null && res?.rowCount) {
                  this.notificationsService.notifyCode('ES007');
                  this.returnData.approveStatus = '3';
                  this.returnData.write = false;
                  this.returnData.delete = false;
                  this.codxBookingService
                    .getBookingByRecID(this.returnData.recID)
                    .subscribe((res) => {
                      if (res) {
                        this.returnData.approveStatus = res?.approveStatus;
                        this.detectorRef.detectChanges();
                      }
                      (this.dialogRef.dataService as CRUDService)
                      .update(this.returnData)
                      .subscribe();
                    });
                  
                  this.dialogRef && this.dialogRef.close(this.returnData);
                } else {
                  this.notificationsService.notifyCode(res?.msgCodeError);
                  // Thêm booking thành công nhưng gửi duyệt thất bại
                  this.dialogRef && this.dialogRef.close(this.returnData);
                }
              },
              this.returnData?.createdBy,
              this.resourceOwner,
            )
        });
    } else { 
      this.notificationsService.notifyCode('ES007');
      this.codxBookingService
        .afterApprovedManual(
          this.formModel.entityName,
          this.returnData.recID,
          '5'
        )
        .subscribe();
      this.dialogRef && this.dialogRef.close(this.returnData);
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//

  getResourceForCurrentTime() {
    this.codxBookingService
      .getAvailableResources(
        '1',
        this.data.startDate,
        this.data.endDate,
        this.data.recID,
        this.showAllResource
      )
      .subscribe((res: any) => {
        if (res) {
          this.cbbResource = [];
          Array.from(res).forEach((item: any) => {
            let tmpRes = new Resource();
            tmpRes.resourceID = item?.resourceID;
            tmpRes.resourceName = item?.resourceName;
            tmpRes.capacity = item?.capacity;
            tmpRes.equipments = item?.equipments;
            tmpRes.owner=item?.owner
            this.cbbResource.push(tmpRes);
          });
          let resourceStillAvailable = false;
          if (this.data.resourceID != null) {
            this.cbbResource.forEach((item) => {
              if (item.resourceID == this.data.resourceID) {
                resourceStillAvailable = true;
              }
            });
            if (!resourceStillAvailable) {
              this.data.resourceID = null;
              debugger;
              this.tmplstDevice = [];
              this.cusCBB.value = null;
            } else {
              this.cbxResourceChange(this.data.resourceID);
              this.cusCBB.value = this.data.resourceID;
            }
          }

          this.detectorRef.detectChanges();
        }
      });
  }

  filterArray(arr) {
    return [...new Map(arr.map((item) => [item['userID'], item])).values()];
  }
  setTitle(e: any) {
    this.title = this.tmpTitle;
    this.changeDetectorRef.detectChanges();
  }
  fileAdded(event: any) {
    this.data.attachments = event.data.length;
  }
  //Popup Stationery and User
  closePopUpCbb() {
    this.isPopupStationeryCbb = false;
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//

  openPopupDevice(template: any) {
    var dialog = this.callfc.openForm(template, '', 550, 400);
    this.detectorRef.detectChanges();
  }

  openPopupLink() {
    let dlLink = this.callfc.openForm(this.addLink, '', 500, 300, this.funcID);
    dlLink.closed.subscribe((res: any) => {
      if (res?.event?.attendee != null && res?.event?.owner != null) {
        this.data.onlineUrl = res?.event?.attendee;
        this.data.onlineUrl2 = res?.event?.owner;
        this.detectorRef.detectChanges();
      }
    });
  }

  popup() {
    this.attachment.openPopup();
  }
  popupUploadFile() {
    this.attachment.uploadFile();
  }

  openStationeryPopup() {
    this.isPopupStationeryCbb = true;
  }
}
