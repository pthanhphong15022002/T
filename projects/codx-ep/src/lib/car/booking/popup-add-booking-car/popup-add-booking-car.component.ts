import { T } from '@angular/cdk/keycodes';
import {
  Component,
  EventEmitter,
  Injector,
  Input,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { APICONSTANT } from '@shared/constant/api-const';
import { AuthService, AuthStore, CacheService, CRUDService, Util } from 'codx-core';
import {
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
  FormModel,
  RequestOption,
} from 'codx-core';
import { CodxEpService, ModelPage } from '../../../codx-ep.service';
import { BookingAttendees } from '../../../models/bookingAttendees.model';
import { Equipments } from '../../../models/equipments.model';
import { Resource } from '../../../models/resource.model';

export class Device {
  id;
  text = '';
  isSelected = false;
  icon = '';
  createdBy=null;
  createdOn=null;
}

@Component({
  selector: 'popup-add-booking-car',
  templateUrl: 'popup-add-booking-car.component.html',
  styleUrls: ['popup-add-booking-car.component.scss'],
})
export class PopupAddBookingCarComponent extends UIComponent {
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('form') form: any;
  @ViewChild('cusCBB') cusCBB: any;

  @Input() editResources: any;
  @Input() isAdd = true;

  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();

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
  tempDriver: any;
  returnData = null;
  title = '';
  cbbData: any;
  driverCheck = false;
  useCard = false;
  isSaveSuccess = false;
  fGroupBookingAttendees: FormGroup;
  fGroupAddBookingCar: FormGroup;
  formModel: FormModel;
  dialogRef: DialogRef;
  modelPage: ModelPage;
  attendees = [];
  curUser: any;
  showAllResource = false;
  data: any;
  isNew: boolean = true;
  currentSection = 'GeneralInfo';
  CbxName: any;
  isAfterRender = false;
  lstEquipment = [];
  tmplstDeviceEdit = [];
  tempAtender: {
    userID: string;
    userName: string;
    roleType: string;
    status: string;
    objectType: string;
    objectID: any;
    icon: any;
  };
  carCapacity = 0;
  attendeesList = [];
  checkLoopS = true;
  checkLoopE = true;
  checkLoop = true;
  grvBookingCar: any;
  strAttendees: string = '';
  vllDevices = [];
  lstDeviceCar = [];
  tmplstDevice = [];
  lstPeople = [];
  funcID: string;
  driver: any;
  smallListPeople = [];
  editCarDevice = null;
  tmpTitle = '';
  tempArray = [];
  listRoles = [];
  optionalData: any;
  calendarStartTime: any;
  calendarEndTime: any;
  calEndHour: any;
  calStartHour: any;
  calEndMinutes: any;
  calStartMinutes: any;
  calendarID: any;
  isCopy = false;
  isPopupCbb = false;
  saveCheck = false;
  resources = [];
  listUserID = [];
  user: any;
  busyAttendees: string;
  approvalRule: any;
  dueDateControl: any;
  grView: any;
  oData: any;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private cacheService: CacheService,
    private authStore: AuthStore,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.oData = dialogData?.data[0];
    this.isAdd = dialogData?.data[1];
    this.tmpTitle = dialogData?.data[2];
    this.optionalData = dialogData?.data[3];
    this.isCopy = dialogData?.data[4];
    this.user = this.authStore.get();
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
    this.funcID = this.formModel.funcID;
    this.data={...this.oData};
    if (this.isAdd) {
      this.data.requester = this.authService?.userValue?.userName;
    }
    if (this.isAdd && this.optionalData != null) {
      this.data.resourceID = this.optionalData.resourceId;
      this.data.bookingOn = this.optionalData.startDate;
    } else if (this.isAdd && this.optionalData == null) {
      this.data.bookingOn = new Date();
    }
    if (this.isCopy) {
      this.data.bookingOn = new Date();
    }
  }
  onInit(): void {
    this.cache.gridViewSetup(this.formModel?.formName,this.formModel?.gridViewName).subscribe(grv=>{
      if(grv){
        this.grView=Util.camelizekeyObj(grv);
      }
    })
    this.cacheService.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
      this.vllDevices.forEach((item) => {
        let device = new Device();
        device.id = item.value;
        device.text = item.text;
        device.icon = item.icon;
        this.lstDeviceCar.push(device);
      });
      if (
        !this.isAdd &&
        this.data?.equipments != null &&
        this.optionalData == null
      ) {
        //Lấy list Thiết bị
        this.codxEpService.getResourceEquipments(this.data?.resourceID).subscribe((eq:any)=>{
          if(eq!=null){
            Array.from(eq).forEach((e:any)=>{
              let tmpDevice = new Device();
              tmpDevice.id = e.equipmentID;
              tmpDevice.isSelected=false;
              this.lstDeviceCar.forEach((vlDevice) => {
                if (tmpDevice.id == vlDevice.id) {
                  tmpDevice.text = vlDevice.text;
                  tmpDevice.icon = vlDevice.icon;
                }
              });
              if(this.data.equipments && this.data.equipments.length>0){
                this.data.equipments.forEach(element => {
                  if(element.equipmentID==tmpDevice.id){
                    tmpDevice.isSelected=true;
                    tmpDevice.createdBy=element.createdBy;
                    tmpDevice.createdOn=element.createdOn;
                  }
                });
              }
              this.tmplstDeviceEdit.push(tmpDevice);
            })
          }
          
        })
      }
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
            this.tmplstDevice.push(tmpDevice);
          });
        }
      }
      this.detectorRef.detectChanges();
      if (this.isAdd && this.optionalData != null) {
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
    });
    this.detectorRef.detectChanges();
    this.codxEpService
      .getEPCarSetting('4')
      .subscribe((approvalSetting: any) => {
        if (approvalSetting) {
          let settingVal = JSON.parse(approvalSetting.dataValue);
          Array.from(settingVal).forEach((item: any) => {
            if (item.FieldName == 'ES_EP002') {
              this.approvalRule = item.ApprovalRule;
            }
          });
        }
      });
    this.codxEpService.getEPCarSetting('1').subscribe((setting: any) => {
      if (setting) {
        let sysSetting = JSON.parse(setting.dataValue);
        this.calendarID = sysSetting?.CalendarID;
        this.dueDateControl = sysSetting?.DueDateControl;
        if (this.calendarID) {
          this.codxEpService
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
                  if (this.isAdd) {
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
                  if (this.isAdd) {
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
              if (this.isAdd && this.optionalData) {
                this.driverChangeWithCar(this.optionalData.resourceId);
              }
              if (this.isCopy) {
                this.driverChangeWithCar(this.data.resourceID);
              }

              this.detectorRef.detectChanges();
            });
        } else {
          this.codxEpService.getCalendar().subscribe((res: any) => {
            if (res) {
              let tempStartTime = JSON.parse(res.dataValue)[0]?.StartTime.split(
                ':'
              );
              this.calendarStartTime =
                tempStartTime[0] + ':' + tempStartTime[1];
              let tempEndTime = JSON.parse(res.dataValue)[1]?.EndTime.split(
                ':'
              );
              this.calendarEndTime = tempEndTime[0] + ':' + tempEndTime[1];
              let tmpDateTime = new Date();
              if (this.isAdd && this.optionalData == null) {
                this.data.startDate = new Date(
                  tmpDateTime.getFullYear(),
                  tmpDateTime.getMonth(),
                  tmpDateTime.getDate(),
                  tempStartTime[0],
                  tempStartTime[1],
                  0
                );
                this.data.endDate = new Date(
                  tmpDateTime.getFullYear(),
                  tmpDateTime.getMonth(),
                  tmpDateTime.getDate(),
                  tempEndTime[0],
                  tempEndTime[1],
                  0
                );
              }

              this.getResourceForCurrentTime();
              this.calStartHour = tempStartTime[0];
              this.calStartMinutes = tempStartTime[1];
              this.calEndHour = tempEndTime[0];
              this.calEndMinutes = tempEndTime[1];
              if (this.isAdd && this.optionalData) {
                this.driverChangeWithCar(this.optionalData.resourceId);
              }
              if (this.isCopy) {
                this.driverChangeWithCar(this.data.resourceID);
              }

              this.detectorRef.detectChanges();
            }
          });
        }
      } else {
        this.codxEpService.getEPSetting().subscribe((setting: any) => {
          if (setting) {
            this.calendarID = JSON.parse(setting.dataValue)?.CalendarID;
            if (this.calendarID) {
              this.codxEpService
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
                      if (this.isAdd) {
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
                      this.calendarEndTime =
                        tmpEndTime[0] + ':' + tmpEndTime[1];
                      if (this.isAdd) {
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
                  if (this.isAdd && this.optionalData) {
                    this.driverChangeWithCar(this.optionalData.resourceId);
                  }
                  if (this.isCopy) {
                    this.driverChangeWithCar(this.data.resourceID);
                  }

                  this.detectorRef.detectChanges();
                });
            }
          } else {
            this.codxEpService.getCalendar().subscribe((res: any) => {
              if (res) {
                let tempStartTime = JSON.parse(
                  res.dataValue
                )[0]?.StartTime.split(':');
                this.calendarStartTime =
                  tempStartTime[0] + ':' + tempStartTime[1];
                let tempEndTime = JSON.parse(res.dataValue)[1]?.EndTime.split(
                  ':'
                );
                this.calendarEndTime = tempEndTime[0] + ':' + tempEndTime[1];
                let tmpDateTime = new Date();
                if (this.isAdd && this.optionalData == null) {
                  this.data.startDate = new Date(
                    tmpDateTime.getFullYear(),
                    tmpDateTime.getMonth(),
                    tmpDateTime.getDate(),
                    tempStartTime[0],
                    tempStartTime[1],
                    0
                  );
                  this.data.endDate = new Date(
                    tmpDateTime.getFullYear(),
                    tmpDateTime.getMonth(),
                    tmpDateTime.getDate(),
                    tempEndTime[0],
                    tempEndTime[1],
                    0
                  );
                }
                this.getResourceForCurrentTime();
                this.calStartHour = tempStartTime[0];
                this.calStartMinutes = tempStartTime[1];
                this.calEndHour = tempEndTime[0];
                this.calEndMinutes = tempEndTime[1];
                if (this.isAdd && this.optionalData) {
                  this.driverChangeWithCar(this.optionalData.resourceId);
                }
                if (this.isCopy) {
                  this.driverChangeWithCar(this.data.resourceID);
                }

                this.detectorRef.detectChanges();
              }
            });
          }
        });

        this.detectorRef.detectChanges();
      }
    });

    this.cache.valueList('EP010').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        let tmpArr = [];
        tmpArr = res.datas;
        tmpArr.forEach((item) => {
          this.listRoles.push(item);
        });
        if (this.isAdd) {
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
        if (!this.isAdd){
          if(this.data.resources!=null){
            this.data.resources.forEach((people) => {
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
                this.lstPeople.push(tmpResource);
                this.resources.push(tmpResource);
              }
            });
            if (this.driver != null) {
              this.driverCheck = true;
            } else {
              this.driverCheck = false;
            }
            this.detectorRef.detectChanges();
          }
          else {
            this.codxEpService
              .getBookingAttendees(this.data.recID)
              .subscribe((res) => {
                if (res) {
                  this.attendees = res.msgBodyData[0];
                  this.attendees.forEach((people) => {
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
                      this.lstPeople.push(tmpResource);
                      this.resources.push(tmpResource);
                    }
                  });
                  if (this.driver != null) {
                    this.driverCheck = true;
                  } else {
                    this.driverCheck = false;
                  }
                  this.detectorRef.detectChanges();
                }
              });
          }
        }
        
      }
    });

    this.initForm();
    if (this.isAdd && !this.isCopy) {
      this.data.attendees = 1;
      this.data.bookingOn = this.data.startDate;
      this.detectorRef.detectChanges();
    }
    if ((this.isAdd && this.data.resourceID != null) || !this.isAdd) {
      this.codxEpService
        .getResourceByID(this.data.resourceID)
        .subscribe((res: any) => {
          if (res) {
            this.carCapacity = res.capacity;
          }
        });
    }
    
    this.isAfterRender = true;
  }

  initForm() {
    this.codxEpService
      .getFormGroupBooking(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.fGroupAddBookingCar = item;
      });
    this.detectorRef.detectChanges();
  }
  setTitle(e: any) {
    this.title = this.tmpTitle;
    this.detectorRef.detectChanges();
  }
  ngAfterViewInit(): void {}
  beforeSave(option: RequestOption) {
    let itemData = this.data;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd, this.attendeesList, null, null];
    return true;
  }
  validatePhoneNumber(phone) {
    var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return re.test(phone);
  }

  onSaveForm(approval: boolean = false) {
    if (true) {
      
      this.data.bookingOn = this.data.startDate;
      this.data.stopOn = this.data.endDate;
      let tempDate = new Date();
      if (this.data.startDate < new Date()) {
        if(this.dueDateControl!=true || this.dueDateControl!='1'){
          this.notificationsService.notifyCode('TM036');
          
        return;
        }
      }
      if (this.data.startDate >= this.data.endDate )
       {
        this.notificationsService.notifyCode('TM036');
        this.saveCheck = false;
        return;
        
      } 

      this.fGroupAddBookingCar.patchValue(this.data);
      if (this.fGroupAddBookingCar.invalid == true) {
        this.codxEpService.notifyInvalid(
          this.fGroupAddBookingCar,
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
        if(element.isSelected){
          let tempEquip = new Equipments();
          tempEquip.equipmentID = element.id;
          tempEquip.createdBy = element.createdBy==null? this.authService.userValue.userID :element.createdBy;
          tempEquip.createdOn =element.createdOn ==null? new Date(): element.createdOn;
          tmpEquip.push(tempEquip);
        }
      });
      this.data.equipments = tmpEquip;

      this.attendeesList = [];
      this.attendeesList.push(this.curUser);
      this.lstPeople.forEach((people) => {
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
      this.data.approveStatus = this.data.approveStatus?? '1';
      this.data.status = this.data.status ?? '1';    
      
      this.data.approval = this.approvalRule;
      this.data.attendees = this.attendeesList.length;
      //check
      this.codxEpService
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
      .subscribe((res:any) => {
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
              this.codxEpService
                .getCategoryByEntityName(this.formModel.entityName)
                .subscribe((res: any) => {
                  this.codxEpService
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
              this.codxEpService
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
  valueChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.data[event.field] = event.data.value;
      } else {
        this.data[event?.field] = event.data;
      }
    }
  }
  valueCbxCarChange(event?) {
    if (event?.data != null && event?.data != '') {
      this.tmplstDevice = [];
      var cbxCar = event.component.dataService.data;
      cbxCar.forEach((element) => {
        if (element.ResourceID == event.data) {
          this.carCapacity = element.Capacity;
          this.useCard = element.UseCard;
          element.Equipments.forEach((item) => {
            let tmpDevice = new Device();
            tmpDevice.id = item.EquipmentID;
            tmpDevice.isSelected = false;
            this.vllDevices.forEach((vlItem) => {
              if (tmpDevice.id == vlItem.value) {
                tmpDevice.text = vlItem.text;
                tmpDevice.icon = vlItem.icon;
              }
            });
            this.tmplstDevice.push(tmpDevice);
          });
        }
      });
      this.driverChangeWithCar(event.data);

      this.detectorRef.detectChanges();
    }
  }
  deleteAttender(attID: string) {
    var tempDelete;
    this.lstPeople.forEach((item) => {
      if (item.userID == attID) {
        tempDelete = item;
      }
    });
    this.lstPeople.splice(this.lstPeople.indexOf(tempDelete), 1);
    this.data.attendees = this.lstPeople.length + 1;
    this.detectorRef.detectChanges();
  }
  driverChangeWithCar(carID: string) {
    this.codxEpService.getGetDriverByCar(carID).subscribe((res) => {
      if (res && res.msgBodyData[0]?.resourceID != null) {
        this.tempAtender = {
          userID: res.msgBodyData[0].resourceID,
          userName: res.msgBodyData[0].resourceName,
          status: '1',
          objectType: 'EP_Drivers',
          roleType: '2',
          objectID: res.msgBodyData[0].recID,
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
  driverValidator(driverID: any, startDate: Date, endDate: Date, recID: any) {
    if (
      driverID != null &&
      startDate != null &&
      endDate != null &&
      endDate > startDate
    ) {
      this.codxEpService
        .driverValidator(
          driverID,
          new Date(startDate),
          new Date(endDate),
          recID
        )
        .subscribe((res) => {
          if (res && res.msgBodyData[0] != null) {
            this.driverCheck = res.msgBodyData[0];
            if (res.msgBodyData[0]) {
              this.driver = this.tempDriver;
            }
            if (!res.msgBodyData[0]) {
              this.driver = null;
              //this.notificationsService.notifyCode('EP008'); //Tài xế ko săn sàng
            }
          }
          this.detectorRef.detectChanges();
        });
    }
  }
  openPopupDevice(template: any) {
    var dialog = this.callfc.openForm(template, '', 550, 560);
    this.detectorRef.detectChanges();
  }
  checkedChange(event: any, device: any) {
    let index = this.tmplstDevice.indexOf(device);
    if (index != -1) {
      this.tmplstDevice[index].isSelected = event.data;
    }
  }
  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
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
    // if (
    //   this.data.startDate.getHours() == 0 &&
    //   this.data.startDate.getMinutes() == 0
    // ) {
    //   let temp = this.data.startDate;
    //   this.data.startDate = new Date(
    //     temp.getFullYear(),
    //     temp.getMonth(),
    //     temp.getDate(),
    //     this.calStartHour,
    //     this.calStartMinutes
    //   );
    // }
    // let tmpDate = new Date();
    // let startDate= this.data.startDate;
    // if (new Date(tmpDate.getFullYear(),tmpDate.getMonth(),tmpDate.getDate(),0,0,0,0) > new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate(),0,0,0,0)) {
    //   this.checkLoopS = !this.checkLoopS;
    //   if (!this.checkLoopS) {
    //     this.notificationsService.notifyCode('TM036');
    //   }
    //   return;
    // }
    // if(this.data.startDate && this.data.endDate){
    //   if(!this.timeCheck(this.data.startDate,this.data.endDate)){
    //     this.checkLoopS = !this.checkLoopS;
    //     if (!this.checkLoopS) {
    //       this.notificationsService.notifyCode('TM036');
    //     }
    //     return;
    //   };
    // }
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
    // if (
    //   this.data.endDate.getHours() == 0 &&
    //   this.data.endDate.getMinutes() == 0
    // ) {
    //   let temp = this.data.endDate;
    //   this.data.endDate = new Date(
    //     temp.getFullYear(),
    //     temp.getMonth(),
    //     temp.getDate(),
    //     this.calEndHour,
    //     this.calEndMinutes
    //   );
    // }
    // let tmpDate = new Date();
    // let endDate= this.data.endDate;
    // if (new Date(tmpDate.getFullYear(),tmpDate.getMonth(),tmpDate.getDate(),0,0,0,0) > new Date(endDate.getFullYear(),endDate.getMonth(),endDate.getDate(),0,0,0,0)) {
    //     this.checkLoopE = !this.checkLoopE;
    //   if (!this.checkLoopE) {
    //     this.notificationsService.notifyCode('TM036');
    //   }
    //   return;
    // }
    // if(this.data.startDate && this.data.endDate){
    //   if(!this.timeCheck(this.data.startDate,this.data.endDate)){
    //     this.checkLoopE = !this.checkLoopE;
    //     if (!this.checkLoopE) {
    //       this.notificationsService.notifyCode('TM036');
    //     }
    //     return;
    //   };
    // }
  }
  openPopupCbb() {
    this.isPopupCbb = true;
  }
  filterArray(arr) {
    return [...new Map(arr.map((item) => [item['userID'], item])).values()];
  }
  valueCbxUserChange(event) {
    //this.cbbData=event.id; gán data đã chọn cho combobox
    if (event?.dataSelected) {
      //this.lstPeople = [];
      event.dataSelected.forEach((people) => {
        this.tempAtender = {
          userID: people.UserID,
          userName: people.UserName,
          status: '1',
          objectType: 'AD_Users',
          roleType: '3',
          objectID: people.UserID,
          icon: '',
        };
        this.listRoles.forEach((element) => {
          if (element.value == this.tempAtender.roleType) {
            this.tempAtender.icon = element.icon;
          }
        });
        if (this.tempAtender.userID != this.curUser.userID) {
          this.lstPeople.push(this.tempAtender);
        }
      });

      this.lstPeople = this.filterArray(this.lstPeople);

      if (this.lstPeople.length > 0) {
        this.data.attendees = this.lstPeople.length + 1;
      }

      this.isPopupCbb = false;
      this.detectorRef.detectChanges();
    }
  }
  eventApply(e) {
    var listUserID = '';
    var listDepartmentID = '';
    var listUserIDByOrg = '';
    var type = 'U';
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
        }
      }
    });
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
      this.codxEpService
        .getListUserIDByListOrgIDAsync([listDepartmentID, type])
        .subscribe((res) => {
          if (res) {
            listUserIDByOrg += res;
            if (listUserID != '') listUserIDByOrg += ';' + listUserID;
            this.valueUser(listUserIDByOrg);
          }
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
              this.lstPeople.push(item);
            }
          });
          this.lstPeople = this.filterArray(this.lstPeople);
          this.data.attendees = this.lstPeople.length + 1;
          this.detectorRef.detectChanges();
        }
      });
  }

  showAllResourceChange(evt: any) {
    if (evt != null) {
      this.showAllResource = evt;
      this.getResourceForCurrentTime();
      this.detectorRef.detectChanges();
    }
  }
  cbbResource = [];
  fields: Object = { text: 'resourceName', value: 'resourceID' };
  cbbResourceName: string;
  getResourceForCurrentTime() {
    this.codxEpService
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
            if(this.tmplstDeviceEdit.length>0){
              this.tmplstDeviceEdit.forEach(oldItem=>{
                if(oldItem.id== tmpDevice.id){
                  tmpDevice.isSelected=oldItem.isSelected;
                  tmpDevice.createdOn=oldItem.createdOn;
                  tmpDevice.createdBy=oldItem.createdBy;
                }
              })
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
}
