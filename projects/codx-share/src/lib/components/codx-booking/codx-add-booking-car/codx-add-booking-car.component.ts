import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AuthService,
  AuthStore,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
} from 'codx-core';
import {
  BookingAttendees,
  Device,
  Equipments,
  Resource,
} from '../codx-booking.model';
import { CodxBookingService } from '../codx-booking.service';
const _copyMF = 'SYS04';
const _addMF = 'SYS01';
const _editMF = 'SYS03';
const _EPParameters = 'EPParameters';
const _EPCarParameters = 'EPCarParameters';
@Component({
  selector: 'codx-add-booking-car',
  templateUrl: './codx-add-booking-car.component.html',
  styleUrls: ['./codx-add-booking-car.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxAddBookingCarComponent
  extends UIComponent
  implements AfterViewInit
{
  tmpTitle = '';
  optionalData: any;
  isCopy: boolean;
  user: any;
  dialogRef: DialogRef;
  formModel: FormModel;
  funcID: string;
  data: any;
  funcType: any;
  isAfterRender: boolean;
  grView: any;
  vllDevices = [];
  lstDeviceCar = [];
  tmplstDeviceEdit = [];
  tmplstDevice = [];
  approvalRule: any;
  calendarID: any;
  dueDateControl: any;
  calendarStartTime: string;
  calEndHour: any;
  calEndMinutes: any;
  calendarEndTime: string;
  calStartHour: any;
  calStartMinutes: any;
  listRoles = [];
  carCapacity: any;
  driverCheck;
  driver: any;
  resources = [];
  curUser: BookingAttendees;
  tempAtender: {
    userID: any;
    userName: any;
    status: string;
    objectType: string;
    roleType: string;
    objectID: any;
    icon: string;
  };
  tempDriver: any;
  title: string;
  attendeesList = [];
  saveCheck: boolean;
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('form') form: any;
  @ViewChild('cusCBB') cusCBB: any;
  busyAttendees: string;
  returnData: any;
  useCard = false;
  listUserID = [];
  showAllResource: any;
  cbbResource = [];
  fields: Object = { text: 'resourceName', value: 'resourceID' };
  cbbResourceName: string;

  tabInfo: any[] = [
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
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'tabMoreInfo',
    },
  ];
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private authStore: AuthStore,
    private codxBookingService: CodxBookingService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = { ...dialogData?.data[0] };
    this.funcType = dialogData?.data[1];
    this.tmpTitle = dialogData?.data[2];
    this.optionalData = dialogData?.data[3];
    this.user = this.authStore.get();
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
    this.funcID = this.formModel.funcID;
    if (this.funcType == _addMF) {
      this.data.requester = this.authService?.userValue?.userName;
    }
    if (this.funcType == _addMF && this.optionalData != null) {
      this.data.resourceID = this.optionalData.resourceId;
      this.data.bookingOn = this.optionalData.startDate;
    } else if (this.funcType == _addMF && this.optionalData == null) {
      this.data.bookingOn = new Date();
    }
    if (this.funcType == _copyMF) {
      this.data.bookingOn = new Date();
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  onInit(): void {
    this.getCacheData();
  }
  ngAfterViewInit(): void {}

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getCacheData() {
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((grv) => {
        if (grv) {
          this.grView = Util.camelizekeyObj(grv);
        }
      });

    this.cache.valueList('EP012').subscribe((res) => {
      this.vllDevices = Array.from(res.datas);
      this.vllDevices.forEach((item) => {
        let device = new Device();
        device.id = item.value;
        device.text = item.text;
        device.icon = item.icon;
        this.lstDeviceCar.push(device);
      });
      if (
        this.funcType != _addMF &&
        this.data?.equipments != null &&
        this.optionalData == null
      ) {
        //Lấy list Thiết bị
        this.codxBookingService
          .getResourceEquipments(this.data?.resourceID)
          .subscribe((eq: any) => {
            if (eq != null) {
              Array.from(eq).forEach((e: any) => {
                let tmpDevice = new Device();
                tmpDevice.id = e.equipmentID;
                tmpDevice.isSelected = false;
                this.lstDeviceCar.forEach((vlDevice) => {
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

        if (this.isCopy) {
          if (this.data.equipments) {
            this.data.equipments.forEach((equip) => {
              let tmpDevice = new Device();
              tmpDevice.id = equip.equipmentID;
              tmpDevice.isSelected = false;
              this.lstDeviceCar.forEach((vlDevice) => {
                if (tmpDevice.id == vlDevice.id) {
                  tmpDevice.text = vlDevice.text;
                  tmpDevice.icon = vlDevice.icon;
                }
              });
              //this.tmplstDevice.push(tmpDevice);
              this.tmplstDeviceEdit.push(tmpDevice);
            });
          }
        }
        this.detectorRef.detectChanges();

        if (this.funcType == _addMF && this.optionalData != null) {
          this.data.resourceID = this.optionalData.resourceId;
          this.detectorRef.detectChanges();
          let equips = this.optionalData.resource?.equipments;
          if (equips) {
            equips.forEach((equip) => {
              let tmpDevice = new Device();
              tmpDevice.id = equip.equipmentID;
              tmpDevice.isSelected = false;
              this.lstDeviceCar.forEach((vlDevice) => {
                if (tmpDevice.id == vlDevice.id) {
                  tmpDevice.text = vlDevice.text;
                  tmpDevice.icon = vlDevice.icon;
                }
              });
              this.tmplstDevice.push(tmpDevice);
            });
          } else {
            equips = [];
          }
          this.data.startDate = this.optionalData.startDate;
          this.data.endDate = this.optionalData.startDate;
          this.detectorRef.detectChanges();
        }
        this.tmplstDevice = JSON.parse(JSON.stringify(this.tmplstDevice));
      }
    });

    
    this.codxBookingService
      .getDataValueOfSettingAsync(_EPParameters, _EPCarParameters, '1')
      .subscribe((res: string) => {
        if (res) {
          let carSetting_1 = JSON.parse(res);
          this.dueDateControl = carSetting_1?.DueDateControl;
        }
      });
    this.codxBookingService
      .getDataValueOfSettingAsync(_EPParameters, _EPCarParameters, '4')
      .subscribe((res: string) => {
        if (res) {
          let carSetting_4 = JSON.parse(res);
          if (carSetting_4 != null && carSetting_4.length > 0) {
            this.approvalRule = carSetting_4[0]?.ApprovalRule;
          }
        }
      });
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
                let tmpDateTime = new Date();
                if (this.optionalData && this.optionalData?.startDate) {
                  tmpDateTime = this.optionalData.startDate;
                }
                Array.from(cal).forEach((day: any) => {
                  if (day?.shiftType == '1') {
                    let tmpstartTime = day?.startTime.split(':');
                    this.calendarStartTime =
                      tmpstartTime[0] + ':' + tmpstartTime[1];
                    if (this.funcType == _addMF) {
                      this.data.startDate = new Date(
                        tmpDateTime.getFullYear(),
                        tmpDateTime.getMonth(),
                        tmpDateTime.getDate(),
                        tmpstartTime[0],
                        tmpstartTime[1],
                        0
                      );
                    }
                    this.calEndHour = tmpstartTime[0];
                    this.calEndMinutes = tmpstartTime[1];
                  } else if (day?.shiftType == '2') {
                    let tmpEndTime = day?.endTime.split(':');
                    this.calendarEndTime = tmpEndTime[0] + ':' + tmpEndTime[1];
                    if (this.funcType == _addMF) {
                      this.data.endDate = new Date(
                        tmpDateTime.getFullYear(),
                        tmpDateTime.getMonth(),
                        tmpDateTime.getDate(),
                        tmpEndTime[0],
                        tmpEndTime[1],
                        0
                      );
                    }
                    this.calEndHour = tmpEndTime[0];
                    this.calEndMinutes = tmpEndTime[1];
                  }
                });

                this.getResourceForCurrentTime();
                if (this.funcType == _addMF && this.optionalData) {
                  this.driverChangeWithCar(this.optionalData.resourceId);
                }
                if (this.funcType == _copyMF) {
                  this.driverChangeWithCar(this.data.resourceID);
                }
                this.detectorRef.detectChanges();
              });
          }
        }
      });    

    this.cache.valueList('EP010').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        let tmpArr = [];
        tmpArr = res.datas;
        tmpArr.forEach((item) => {
          this.listRoles.push(item);
        });
        if (this.funcType == _addMF ||this.funcType == _copyMF ) {
          let people = this.authService.userValue;
          let tmpResource = new BookingAttendees();
          tmpResource.userID = people?.userID;
          tmpResource.userName = people?.userName;
          tmpResource.roleType = '1';
          tmpResource.optional = false;
          this.listRoles.forEach((element) => {
            if (element.value == tmpResource.roleType) {
              tmpResource.icon = element.icon;
              tmpResource.roleName = element.text;
            }
          });

          this.curUser = tmpResource;
          this.resources.push(tmpResource);
        }
        if (this.funcType != _addMF) {
          if (this.data.resources != null) {
            this.loadAttendees(this.data?.resources);
          } else if (this.data.resources == null) {
            this.codxBookingService
              .getBookingAttendees(this.data.recID)
              .subscribe((res) => {
                if (res) {
                  this.loadAttendees(this.data?.resources);
                }
              });
          }
          this.detectorRef.detectChanges();
        }
      }
    });

    if (this.funcType == _addMF) {
      this.data.attendees = 1;
      this.data.bookingOn = this.data.startDate;
      this.detectorRef.detectChanges();
    }
    if (
      (this.funcType == _addMF && this.data.resourceID != null) ||
      this.funcType != _addMF
    ) {
      this.codxBookingService
        .getResourceByID(this.data.resourceID)
        .subscribe((res: any) => {
          if (res) {
            this.carCapacity = res?.capacity;
          } else {
            this.carCapacity = 0;
          }
        });
    }
    this.isAfterRender = true;
    this.detectorRef.detectChanges();
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Event-----------------------------------------//
  //---------------------------------------------------------------------------------//

  startDateChange(evt: any) {
    if (!evt.field) {
      return;
    }
    this.data.startDate = new Date(evt.data.fromDate);
    this.driverValidator(
      this.tempDriver?.userID,
      this.data.startDate,
      this.data.endDate,
      this.data.recID
    );
    this.detectorRef.detectChanges();

    this.getResourceForCurrentTime();
  }
  endDateChange(evt: any) {
    if (!evt.field) {
      return;
    }
    this.data.endDate = new Date(evt.data.fromDate);
    this.driverValidator(
      this.tempDriver?.userID,
      this.data.startDate,
      this.data.endDate,
      this.data.recID
    );

    this.getResourceForCurrentTime();
  }

  showAllResourceChange(evt: any) {
    if (evt != null) {
      this.showAllResource = evt;
      this.getResourceForCurrentTime();
      this.detectorRef.detectChanges();
    }
  }

  deleteAttender(attID: string) {
    var tempDelete;
    this.resources.forEach((item) => {
      if (item.userID == attID) {
        tempDelete = item;
      }
    });
    this.resources.splice(this.resources.indexOf(tempDelete), 1);
    this.data.attendees = this.resources.length + 1;
    this.detectorRef.detectChanges();
  }

  driverChangeWithCar(carID: string) {
    this.codxBookingService.getGetDriverByCar(carID).subscribe((res: any) => {
      if (res && res?.resourceID != null) {
        this.tempAtender = {
          userID: res?.resourceID,
          userName: res?.resourceName,
          status: '1',
          objectType: 'EP_Drivers',
          roleType: '2',
          objectID: res?.recID,
          icon: '',
        };
        this.listRoles.forEach((element) => {
          if (element.value == this.tempAtender.roleType) {
            this.tempAtender.icon = element.icon;
          }
        });
        this.driver = this.tempAtender;
        this.tempDriver = this.driver;
        this.driverValidator(
          this.tempDriver?.userID,
          this.data.startDate,
          this.data.endDate,
          this.data.recID
        );
      } else {
        this.driver = null;
        //this.notificationsService.notifyCode('EP008');
      }
      this.detectorRef.detectChanges();
    });
  }

  checkedChange(event: any, device: any) {
    let index = this.tmplstDevice.indexOf(device);
    if (index != -1) {
      this.tmplstDevice[index].isSelected = event.data;
    }
  }

  valueChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.data[event.field] = event.data.value;
      } else {
        this.data[event?.field] = event.data;
      }
    }
  }
  cbxResourceChange(evt: any) {
    if (evt) {
      this.data.resourceID = evt;
      let selectResource = this.cbbResource.filter((obj) => {
        return obj.resourceID == evt;
      });
      if (selectResource) {
        this.carCapacity = selectResource[0].capacity;
        this.tmplstDevice = [];
        if (selectResource[0].equipments != null) {
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
      }
      this.driverChangeWithCar(evt);
      this.detectorRef.detectChanges();
    }
  }
  // Chọn người tham gia
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
          this.data.attendees = this.resources.length + 1;
          this.detectorRef.detectChanges();
        }
      });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  driverValidator(driverID: any, startDate: Date, endDate: Date, recID: any) {
    if (
      driverID != null &&
      startDate != null &&
      endDate != null &&
      endDate > startDate
    ) {
      this.codxBookingService
        .driverValidator(
          driverID,
          new Date(startDate),
          new Date(endDate),
          recID
        )
        .subscribe((res) => {
          if (res != null) {
            this.driverCheck = true;
            if (res == true) {
              this.driver = this.tempDriver;
            }
            if (res == false) {
              this.driver = null;
            }
          }
          this.detectorRef.detectChanges();
        });
    }
  }

  validatePhoneNumber(phone) {
    var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return re.test(phone);
  }
  beforeSave(option: RequestOption) {
    let itemData = this.data;
    let isAdd = true;
    if (this.funcType == _editMF) {
      isAdd = false;
    }
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, isAdd, this.attendeesList, null, null];
    return true;
  }
  onSaveForm(approval: boolean = false) {
    if (true) {
      this.data.bookingOn = this.data.startDate;
      this.data.stopOn = this.data.endDate;
      if (this.data.startDate < new Date()) {
        if (this.dueDateControl != true || this.dueDateControl != '1') {
          this.notificationsService.notifyCode('TM036');
          return;
        }
      }
      if (this.data.startDate >= this.data.endDate) {
        this.notificationsService.notifyCode('TM036');
        this.saveCheck = false;
        return;
      }
      this.form?.formGroup.patchValue(this.data);
      if (this.form?.formGroup.invalid == true) {
        this.codxBookingService.notifyInvalid(
          this.form?.formGroup,
          this.formModel
        );
        this.saveCheck = false;
        return;
      }
      if (this.data.phone != null && this.data.phone != '') {
        if (!this.validatePhoneNumber(this.data.phone)) {
          this.notificationsService.notify('EP014');
          this.saveCheck = false;
          return;
        }
      }

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
      this.data.equipments = tmpEquip;

      this.attendeesList = [];
      this.resources.forEach((people) => {
        this.attendeesList.push(people);
      });
      if (this.driver != null) {
        this.attendeesList.push(this.driver);
      }
      this.data.stopOn = this.data.endDate;
      this.data.bookingOn = this.data.startDate;
      this.data.resourceType = '2';
      if (this.approvalRule == '0' && approval) {
        this.data.approveStatus = '5';
      }
      this.data.approveStatus = this.data.approveStatus ?? '1';
      this.data.status = this.data.status ?? '1';

      this.data.approval = this.approvalRule;
      this.data.attendees = this.attendeesList.length;
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
            this.notificationsService.notifyCode('EP007');
            return;
          } else if (result == '2') {
            this.notificationsService.alertCode('EP018').subscribe((x) => {
              if (x.event.status == 'N') {
                return;
              } else {
                this.capacityCheck(approval);
              }
            });
          } else {
            this.capacityCheck(approval);
          }
        });

      this.saveCheck = true;
    } else {
      return;
    }
  }
  capacityCheck(approval) {
    if (this.data.attendees > this.carCapacity) {
      this.notificationsService.alertCode('EP010').subscribe((x) => {
        if (x.event.status == 'N') {
          this.saveCheck = false;
          return;
        } else {
          this.attendeesValidateStep(approval);
        }
      });
    } else {
      this.attendeesValidateStep(approval);
    }
  }
  attendeesValidateStep(approval) {
    this.api
      .exec(
        'ERM.Business.EP',
        'BookingsBusiness',
        'BookingAttendeesValidatorAsync',
        [
          this.attendeesList,
          this.data.startDate,
          this.data.endDate,
          this.data.recID,
        ]
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
              if (x.event.status == 'N') {
                this.saveCheck = false;
                return;
              } else {
                this.startSave(approval);
              }
            });
        } else {
          this.startSave(approval);
        }
      });
  }
  timeCheck(startTime: Date, endTime: Date) {
    if (endTime <= startTime) {
      if (this.dueDateControl == false || this.dueDateControl != '1') {
        return false;
      }
    }
    if (this.tempDriver != null) {
      this.driverValidator(
        this.tempDriver?.userID,
        this.data.startDate,
        this.data.endDate,
        this.data.recID
      );
    }
    return true;
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  startSave(approval) {
    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt), 0, null, null, !approval)
      .subscribe((res) => {
        if (res.save || res.update) {
          if (!res.save) {
            this.returnData = res.update;
          } else {
            this.returnData = res.save;
          }
          if (approval) {
            if (this.approvalRule != '0') {
              this.codxBookingService
                .getCategoryByEntityName(this.formModel.entityName)
                .subscribe((res: any) => {
                  this.codxBookingService
                    .release(
                      this.returnData,
                      res.processID,
                      'EP_Bookings',
                      this.formModel.funcID
                    )
                    .subscribe((res) => {
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
          this.saveCheck = false;
          return;
        }
      });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//
  loadAttendees(resources: any) {
    if (resources != null) {
      Array.from(resources).forEach((people: any) => {
        let tmpResource = new BookingAttendees();
        tmpResource.userID = people?.userID;
        tmpResource.userName = people?.userName;
        tmpResource.roleType = people?.roleType;
        tmpResource.optional = false;
        this.listRoles.forEach((element) => {
          if (element.value == tmpResource.roleType) {
            tmpResource.icon = element.icon;
            tmpResource.roleName = element.text;
          }
        });
        if (tmpResource.userID == this.authService.userValue.userID) {
          this.curUser = tmpResource;
          this.resources.push(this.curUser);
        } else if (tmpResource.roleType == '2') {
          this.driver = tmpResource;
          this.driver.objectID = people.note;
          this.driver.objectType = 'EP_Resources';
        } else {
          this.resources.push(tmpResource);
        }
      });
      if (this.driver != null) {
        this.driverCheck = true;
      } else {
        this.driverCheck = false;
      }
    }
    this.detectorRef.detectChanges();
  }
  setTitle(e: any) {
    this.title = this.tmpTitle;
    this.detectorRef.detectChanges();
  }
  getResourceForCurrentTime() {
    this.codxBookingService
      .getAvailableResources(
        '2',
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
            tmpRes.resourceID = item.resourceID;
            tmpRes.resourceName = item.resourceName;
            tmpRes.capacity = item.capacity;
            tmpRes.equipments = item.equipments;
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

  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//

  openPopupDevice(template: any) {
    var dialog = this.callfc.openForm(template, '', 550, 400);
    this.detectorRef.detectChanges();
  }
}
