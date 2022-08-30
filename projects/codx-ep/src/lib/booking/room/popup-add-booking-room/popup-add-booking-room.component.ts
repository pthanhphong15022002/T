import { A } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ApiHttpService,
  AuthService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxEpService, ModelPage } from '../../../codx-ep.service';

export class Device {
  id;
  text = '';
  isSelected = false;
}

@Component({
  selector: 'popup-add-booking-room',
  templateUrl: './popup-add-booking-room.component.html',
  styleUrls: ['./popup-add-booking-room.component.scss'],
})
export class PopupAddBookingRoomComponent implements OnInit {
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('addLink', { static: true }) addLink;
  @ViewChild('attachment') attachment: AttachmentComponent;

  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
   
  fGroupAddBookingRoom: FormGroup;
  formModel: FormModel;
  dialogRef: DialogRef;
  modelPage: ModelPage;

  grvBookingRoom:any;
  peopleAttend =[];
  tempArray=[];
  curUser:any;
  lstPeople=[];
  lstStationery=[];
  strStationery:string;
  strAttendees:string;
  vllDevices = [];
  lstDeviceRoom = [];
  isAfterRender = false;
  chosenDate = null;
  CbxName: any;
  link = '';
  selectDate = null;
  startTime: any = null;
  endTime: any = null;
  startDate: any;
  endDate: any;
  isFullDay = false;
  resource!: any;
  beginHour =0;
  beginMinute = 0;
  endHour = 24;
  endMinute = 59;

  titleAction = 'Thêm mới';
  title="đặt phòng";
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'tabGeneralInfo'
    },
    {
      icon: 'icon-person_add_alt_1',
      text: 'Người tham dự',
      name: 'tabPeopleInfo'
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
  ];

  funcID:string;
  isAdd = false;
  range: any;
  data: any = {};
  isSaveSuccess = false;
  constructor(    
    private callFuncService: CallFuncService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    private apiHttpService: ApiHttpService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.data=dialogData?.data[0];
    this.isAdd = dialogData?.data[1];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;   
    this.funcID=this.formModel.funcID; 
    //this.range = dialogRef.dataService!.dataSelected;
  }
  ngOnInit(): void {
    if(!this.isAdd){      
      this.titleAction = 'Chỉnh sửa';
    } 
    this.codxEpService.getModelPage(this.funcID).then((res) => {
      if (res) {
        this.modelPage = res;
      }

      this.codxEpService.getComboboxName(this.formModel.formName,this.formModel.gridViewName)
      .then((res) => {
        this.CbxName = res;
        console.log('cbxEPT1', this.CbxName);
      });

      this.cacheService.gridViewSetup(this.formModel.formName,this.formModel.gridViewName).subscribe(res => {
        console.log('grvEPT1', res);
        this.grvBookingRoom=res;
      })
      this.cacheService.valueList('EP012').subscribe((res) => {
        this.vllDevices = res.datas;
        this.vllDevices.forEach((item) => {
          let device = new Device();
          device.id = item.value;
          device.text = item.text;
          this.lstDeviceRoom.push(device);
        }); 
          
        if(!this.isAdd && this.fGroupAddBookingRoom.value.equipments!=null){
          
            let deviceArray=this.fGroupAddBookingRoom.value.equipments.split("|");
            let availableDevice= deviceArray[0];
            let pickedDevice= deviceArray[1];
            
            this.lstDeviceRoom.forEach(device =>{
              availableDevice.split(";").forEach(equip=>{
                if(device.id==equip){               
                  this.tempArray.push(device); 
                }
              });     
            })
            this.tempArray.forEach(device=>{
              pickedDevice.split(";").forEach(equip=>{
                if(device.id==equip){               
                  device.isSelected=true;
                }
              });  
            })            
                  
          this.tmplstDevice = JSON.parse(JSON.stringify(this.tempArray)); 
        } 
        this.lstDeviceRoom = JSON.parse(JSON.stringify(this.lstDeviceRoom));
      });

      if(this.isAdd){
        let people = this.authService.userValue;
        var user :{id: string, text: string, objectType: string, objectName: string}={                
          id:people.userID,
          text:people.userName,
          objectType:undefined,
          objectName:undefined
        };
        this.curUser=user;
        this.changeDetectorRef.detectChanges();
        
      } 
      
      if(!this.isAdd){
        this.apiHttpService
        .callSv('EP', 'ERM.Business.EP', 'BookingAttendeesBusiness','GetAsync', [this.data.recID])
        .subscribe((res) => {
          if(res){
            this.peopleAttend=res.msgBodyData[0];
            this.peopleAttend.forEach(people=>{
              let tempPeople :{id: string, text: string, objectType: string, objectName: string}={                
                id:people.userID,
                text:people.userName,
                objectType:undefined,
                objectName:undefined
              };
              if(this.authService.userValue.userID==people.userID){
                this.curUser=tempPeople;
              }
              else{
                this.lstPeople.push(tempPeople);
              }
            });      
            this.changeDetectorRef.detectChanges();
          }
        });
        
        this.apiHttpService
        .callSv('EP', 'ERM.Business.EP', 'BookingItemsBusiness','GetAsync', [this.data.recID])
        .subscribe((res) => {
          if(res){
            res.msgBodyData[0].forEach(stationery=>{
              let order :{id: string, quantity:number, text: string, objectType: string, objectName: string}={                
                id:stationery.itemID,
                text:stationery.itemName,
                quantity:stationery.quantity,
                objectType:undefined,
                objectName:undefined
              };
              this.lstStationery.push(order);
            });      
            this.changeDetectorRef.detectChanges();
          }
        });  
      }
      this.initForm();      
    });
  }

  ngAfterViewInit(): void {
    if (this.dialogRef) {
      if (!this.isSaveSuccess) {
        this.dialogRef.closed.subscribe((res: any) => {
          console.log('Close without saving or save failed', res);
          this.dialogRef.dataService.saveFailed.next(null);
        });
      }
    }
  }

  initForm() {
    this.codxEpService
      .getFormGroup(this.modelPage.formName, this.modelPage.gridViewName)
      .then((item) => {
        this.fGroupAddBookingRoom = item;
        this.isAfterRender = true;
        if (this.data) {
          console.log('fgroupEPT1', this.data)
          this.fGroupAddBookingRoom.patchValue(this.data);
          if(this.isAdd){            
            this.fGroupAddBookingRoom.patchValue({attendees:1});            
            this.link = null;
            this.selectDate = null;
            this.endTime = null;
            this.startTime = null;
          }
          if(!this.isAdd){            
            if(this.fGroupAddBookingRoom.value.hours==24){
              this.isFullDay=true;
            }     
            this.startTime=this.fGroupAddBookingRoom.value.startDate.toString().slice(16,21);
            this.endTime=this.fGroupAddBookingRoom.value.endDate.toString().slice(16,21);
                      
          }
        } 
      });     
    this.changeDetectorRef.detectChanges();   
  }
  beforeSave(option: any) {
    let itemData = this.fGroupAddBookingRoom.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd,this.strAttendees,null,this.lstStationery];
    return true;
  }
  onSaveForm() {
    this.strAttendees='';
    this.lstPeople.forEach((people) => {
      if (this.strAttendees == '') {
        this.strAttendees += people.id;
      } else {
        this.strAttendees += ';' + people.id;
      }
    });
    
    // if (this.fGroupAddBookingRoom.invalid == true) {
    //   return;
    // }
    // if (this.fGroupAddBookingRoom.value.endDate - this.fGroupAddBookingRoom.value.startDate <= 0 ) {
    //   this.notificationsService.notifyCode('EP003');
    // }
    // if (this.startTime && this.endTime) {
    //   let hours = parseInt(
    //     ((this.endTime - this.startTime) / 1000 / 60 / 60).toFixed()
    //   );
    //   if (!isNaN(hours) && hours > 0) {
    //     this.fGroupAddBookingRoom.patchValue({ hours: hours });
    //   }
    // }
    
    let pickedEquip = '';
    let availableEquip = '';
    this.tmplstDevice.forEach((element) => {
      if (availableEquip == '') {
        availableEquip += element.id;
      } else {
        availableEquip += ';' + element.id;
      }
      if (element.isSelected) {
        if (pickedEquip == '') {
          pickedEquip += element.id;
        } else {
          pickedEquip += ';' + element.id;
        }
      }
    });
    this.fGroupAddBookingRoom.patchValue({ equipments: availableEquip + '|' + pickedEquip });
    this.fGroupAddBookingRoom.patchValue({resourceID: this.fGroupAddBookingRoom.value.resourceID[0]}); 
    if (this.isAdd) {
      this.fGroupAddBookingRoom.patchValue({
        category: '1',
        status: '1',
        resourceType: '1',
        attendees:this.lstPeople.length +1,
      });      
    }
    console.log("data",this.fGroupAddBookingRoom.value);
    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res: any) => {
        if (res) {
          this.isSaveSuccess = true;
        }
      });
  }
  changeTime(data) {
    if (!data.field || !data.data) return;
    this.fGroupAddBookingRoom.patchValue({ [data['field']]: data.data.fromDate });
  }
  
  valueCbxUserChange(event?) {
    this.lstPeople=event.data.dataSelected;          
    this.fGroupAddBookingRoom.value.attendees=this.lstPeople.length+1;
    this.changeDetectorRef.detectChanges();
  }
  valueCbxStationeryChange(event?) {
    this.lstStationery=[];
    event.data.dataSelected.forEach(item=>{
      let tempStationery:{id:string,quantity:number,text:string,objectType:string,objectName:string}={
        id:item.id,
        quantity:this.fGroupAddBookingRoom.value.attendees,
        text:item.text,
        objectName:item.objectName,
        objectType:item.objectType
      }      
      this.lstStationery.push(tempStationery);
    });
    this.changeDetectorRef.detectChanges();
    
    console.log('stationery',this.lstStationery);
  }

  valueQuantityChange(event?) {
    this.lstStationery.forEach(item=>{
      if(item.id==event?.field){
        item.quantity=event?.data;
      }
    })
    console.log('stationery',this.lstStationery);

  }
  valueAttendeesChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.fGroupAddBookingRoom.patchValue({ attendees: event.data.value });
      } else {
        this.fGroupAddBookingRoom.patchValue({attendees: event.data });
      }
    }  
    this.lstStationery.forEach(item=>{
      item.quantity=this.fGroupAddBookingRoom.value.attendees;
    })
    this.changeDetectorRef.detectChanges();
    
  }

  valueChange(event) {
    if (event?.field == 'day') {
      this.isFullDay = event.data;
      if (this.isFullDay) {
        this.startTime = '00:00';
        this.endTime = '23:59';
        this.fGroupAddBookingRoom.patchValue({hours:24});
      } else {
        this.endTime = null;
        this.startTime = null;
      }
    } else if (event?.field) {
      if (event.data instanceof Object) {
        this.fGroupAddBookingRoom.patchValue({ [event['field']]: event.data.value });
      } else {
        this.fGroupAddBookingRoom.patchValue({ [event['field']]: event.data });
      }
    }  
    this.changeDetectorRef.detectChanges();
  }

  valueCbxRoomChange(event?) {  
    if(event?.data!=null && event?.data !=""){      
      this.tmplstDevice=[];
      var cbxCar = event.component.dataService.data;
      cbxCar.forEach(element => {
        if (element.ResourceID == event.data) {          
          var carEquipments= element.Equipments.split(";");
          carEquipments.forEach(item=>{
            this.lstDeviceRoom.forEach(device=>{
              if(item==device.id){ 
                device.isSelected=false;
                this.tmplstDevice.push(device);                
              }              
            })
          })          
        }
      });
    } 
  }
  closeForm() {
    this.initForm();
    this.closeEdit.emit();
  }
  setTitle(e: any) {
    this.title = this.titleAction + ' ' + e.toString().toLowerCase();
    this.changeDetectorRef.detectChanges();    
  }
  lstDevices = [];
  tmplstDevice = [];

  checkedChange(event: any, device: any) {
    let index = this.tmplstDevice.indexOf(device);
    if (index != -1) {
      this.tmplstDevice[index].isSelected = event.data;
    }
  }

  openPopupDevice(template: any) {
    var dialog = this.callFuncService.openForm(template, '', 550, 370);
    this.changeDetectorRef.detectChanges();
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  valueDateChange(event: any) {
    this.selectDate = event.data.fromDate;
    if (this.selectDate) {
      this.fGroupAddBookingRoom.patchValue({ bookingOn: this.selectDate });
    }
    //this.setDate();
  }

  buttonClick(e: any) {
    //console.log(e);
  }
  valueTimeChange(event: any) {    
    if(event?.field){
      if(event?.field=="startTime"){
        this.startTime = event.data.fromDate;
        this.isFullDay = false;
        this.beginHour = parseInt(this.startTime.split(':')[0]);
        this.beginMinute = parseInt(this.startTime.split(':')[1]);    
        this.selectDate=this.fGroupAddBookingRoom.value.bookingOn;
        if (this.selectDate) {
          if (!isNaN(this.beginHour) && !isNaN(this.beginMinute)) {
            this.startDate = new Date(
              this.selectDate.setHours(this.beginHour, this.beginMinute, 0)
            );
            if (this.startDate) {
              this.fGroupAddBookingRoom.patchValue({ startDate: this.startDate });
            }
          }
        }
      }
      if(event?.field=="endTime"){
        this.endTime = event.data.toDate;
        this.isFullDay = false;
        this.endHour = parseInt(this.endTime.split(':')[0]);
        this.endMinute = parseInt(this.endTime.split(':')[1]);
        this.selectDate=this.fGroupAddBookingRoom.value.bookingOn;
        if (this.selectDate) {
          if (!isNaN(this.endHour) && !isNaN(this.endMinute)) {
            this.endDate = new Date(
              this.selectDate.setHours(this.endHour, this.endMinute, 0)
            );
            if (this.endDate) {
              this.fGroupAddBookingRoom.patchValue({ endDate: this.endDate });
            }
          }
        }
      }
      if (this.beginHour > this.endHour ) {
        this.notificationsService.notifyCode('EP003');
        return;
      }  
      else if (this.beginHour == this.endHour && this.beginMinute > this.endMinute) {
        this.notificationsService.notifyCode('EP003');        
        return;
      }  
      
    }   
  }

  // setDate() {
  //   if (this.startTime) {
  //     this.beginHour = parseInt(this.startTime.split(':')[0]);
  //     this.beginMinute = parseInt(this.startTime.split(':')[1]);
  //     if (this.selectDate) {
  //       if (!isNaN(this.beginHour) && !isNaN(this.beginMinute)) {
  //         this.startDate = new Date(
  //           this.selectDate.setHours(this.beginHour, this.beginMinute, 0)
  //         );
  //         if (this.startDate) {
  //           this.fGroupAddBookingRoom.patchValue({ startDate: this.startDate });
  //         }
  //       }
  //     }
  //   }
  //   if (this.endTime) {
  //     this.endHour = parseInt(this.endTime.split(':')[0]);
  //     this.endMinute = parseInt(this.endTime.split(':')[1]);
  //     if (this.selectDate) {
  //       if (!isNaN(this.endHour) && !isNaN(this.endMinute)) {
  //         this.endDate = new Date(
  //           this.selectDate.setHours(this.endHour, this.endMinute, 0)
  //         );
  //         if (this.endDate) {
  //           this.fGroupAddBookingRoom.patchValue({ endDate: this.endDate });
  //         }
  //       }
  //     }
  //     if (this.beginHour > this.endHour || this.beginMinute > this.endMinute) {
  //       this.notificationsService.notifyCode('EP003');
  //     }
  //   }
  // }

  checkedOnlineChange(event) {
    this.fGroupAddBookingRoom.patchValue({
      online: event.data instanceof Object ? event.data.checked : event.data,
    });

    if (!this.fGroupAddBookingRoom.value.online)
      this.fGroupAddBookingRoom.patchValue({ onlineUrl: null });
    this.changeDetectorRef.detectChanges();
  }

  

  openPopupLink() {
    this.callFuncService.openForm(this.addLink, '', 500, 250);    
    this.changeDetectorRef.detectChanges();
  }

  public setdata(data: any) {
    if (this.isAdd) {
      this.isAdd = true;
      this.initForm();
    } else {
      this.fGroupAddBookingRoom.patchValue(data);
    }
  }

  popup(evt: any) {
    this.attachment.openPopup();
  }

  fileAdded(evt: any) {
  }
}
