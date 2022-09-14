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
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateTime } from '@syncfusion/ej2-charts';
import {
  ApiHttpService,
  AuthService,
  CacheService,
  CallFuncService,
  CRUDService,
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

  tempAtender:{userId: string, userName:string, roleType:string,status:string,objectType:string,optional:boolean};
  attendeesList=[];
  tmpAttendeesList=[];
  grvBookingRoom:any;
  peopleAttend =[];
  tempArray=[];
  curUser:any;
  hostUser:any;
  hostUserId:any;
  lstUser=[];
  lstUserOptional=[];
  lstStationery=[];
  strStationery:string;
  vllDevices = [];
  lstDeviceRoom = [];
  isAfterRender = false;
  chosenDate = null;
  CbxName: any;
  link = '';
  startTime: any = null;
  endTime: any = null;
  tmpStartDate: any;
  tmpEndDate: any;
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
        this.tempAtender={                
          userId:people.userID,
          userName:people.userName,
          status:'1',
          objectType:'AD_Users',
          roleType:'1',
          optional:false,
        };
        this.curUser=this.tempAtender;
        this.changeDetectorRef.detectChanges();
        
      } 
      
      if(!this.isAdd){
        if (this.data.attachments > 0) {
          this.codxEpService
            .getFiles(this.formModel.funcID,this.data.recID,this.formModel.entityName)
            .subscribe((res) => {
              console.log('get file', res); 
            });
          }
        this.apiHttpService
        .callSv('EP', 'ERM.Business.EP', 'BookingAttendeesBusiness','GetAsync', [this.data.recID])
        .subscribe((res) => {
          if(res){
            this.peopleAttend=res.msgBodyData[0];
            this.peopleAttend.forEach(people=>{
              this.tempAtender ={                
                userId:people.userID,
                userName:people.userName,
                status:people.status,
                objectType:'AD_Users',
                roleType:people.roleType,
                optional:people.optional,
              };
              if(this.tempAtender.userId!=this.authService.userValue.userID){                
                this.attendeesList.push(this.tempAtender);
              }
              if(this.tempAtender.userId==this.authService.userValue.userID)
              {
                this.curUser=this.tempAtender;
              }
              else if(people.optional==false){
                this.lstUser.push(this.tempAtender);
              }
              else{
                this.lstUserOptional.push(this.tempAtender);
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
              let order :{id: string, quantity:number, text: string, objectType: string, objectName: string} = {                
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
          if(this.data.hours==24){
            this.isFullDay=true;
          }
          else{            
            this.isFullDay=false;
          }
          this.fGroupAddBookingRoom.addControl(
            'isFullDay',
            new FormControl(this.isFullDay)
          );
          if(this.isAdd){            
            this.fGroupAddBookingRoom.patchValue({attendees:1});            
            this.link = null;
            this.fGroupAddBookingRoom.value.bookingOn= new Date();
            this.endTime = null;
            this.startTime = null;
          }
          if(!this.isAdd){            
            if(this.fGroupAddBookingRoom.value.hours==24){
              this.isFullDay=true;
              
              this.changeDetectorRef.detectChanges();  
            }     
            this.startTime=this.fGroupAddBookingRoom.value.startDate.toString().slice(16,21);
            this.endTime=this.fGroupAddBookingRoom.value.endDate.toString().slice(16,21);                     
          }
        } 
      });     
    this.changeDetectorRef.detectChanges();   
  }
  // setStatusTime(modifiedOn: any){
  //   let dateSent = new Date(modifiedOn);
  //   let currentDate=new Date();
  //   var day= Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) ) /(1000 * 60 * 60 * 24)).toString();
  //   if(day!='0'){
  //     return day+" ngày trước"
  //   }
  //   else{
  //     var hour= currentDate.getHours() - dateSent.getHours();
  //     return hour+" giờ trước"       
  //   }
  // }
  beforeSave(option: any) {
    let itemData = this.fGroupAddBookingRoom.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd,this.tmpAttendeesList ,null,this.lstStationery];
    return true;
  }
  onSaveForm() { 
    if (this.fGroupAddBookingRoom.invalid == true) {
      this.codxEpService.notifyInvalid(this.fGroupAddBookingRoom, this.formModel);
      return;
    }
    if (this.tmpEndDate - this.tmpStartDate <= 0 ) {
      this.notificationsService.notifyCode('EP003');
    }
    if (this.startTime && this.endTime) {
      let hours = parseInt(
        ((this.endTime - this.startTime) / 1000 / 60 / 60).toFixed()
      );
      if (!isNaN(hours) && hours > 0) {
        this.fGroupAddBookingRoom.patchValue({ hours: hours });
      }
    } 
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
    if(this.fGroupAddBookingRoom.value.resourceID instanceof Object){
      this.fGroupAddBookingRoom.patchValue({resourceID:this.fGroupAddBookingRoom.value.resourceID[0]})
    }
    if (this.fGroupAddBookingRoom.value.reasonID instanceof Object){
      this.fGroupAddBookingRoom.patchValue({reasonID:this.fGroupAddBookingRoom.value.reasonID[0]})
    }
    this.fGroupAddBookingRoom.patchValue({
      category: '1',
      status: '1',
      resourceType: '1',
      attendees:this.fGroupAddBookingRoom.value.attendees,
      startDate:this.tmpStartDate,
      endDate:this.tmpEndDate,
      //equipments: availableEquip + '|' + pickedEquip,
    });      
       
    this.attendeesList.forEach(item=>{
      this.tmpAttendeesList.push(item);
    });    
    this.tmpAttendeesList.push(this.curUser);
    console.log("data",this.fGroupAddBookingRoom.value);    
    console.log("attend",this.attendeesList);
    
    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe(async res => {
        if (res.save || res.update) {
          if (this.attachment.fileUploadList.length > 0) {
            this.attachment.objectId = this.fGroupAddBookingRoom.value.recID;
            (await this.attachment.saveFilesObservable()).subscribe(
              (item2: any) => {
                if (item2?.status == 0) {
                  this.fileAdded(item2);
                }
              }
            );
          }
          if (res.update) {
            (this.dialogRef.dataService as CRUDService)
              .update(res.update)
              .subscribe();
          }
          this.dialogRef && this.dialogRef.close();
        } 
        else {
          this.notificationsService.notifyCode('E0011');          
        }
      });
  }
  changeTime(data) {
    if (!data.field || !data.data) return;
    this.fGroupAddBookingRoom.patchValue({ [data['field']]: data.data.fromDate });
  }
  UpdateAttendeesList(){
    this.attendeesList=[];
    if(this.lstUser.length>0 && this.lstUserOptional.length>0)
    {
      this.lstUser.forEach(item=>{
        this.attendeesList.push(item);
      });
      this.lstUserOptional.forEach(item=>{
        this.attendeesList.push(item);
      });
    }
    else if(this.lstUser.length>0 && this.lstUserOptional.length==0)
    {
      this.lstUser.forEach(item=>{
        this.attendeesList.push(item);
      });
    }
    else if(this.lstUserOptional.length>0 && this.lstUser.length==0)
    {      
      this.lstUserOptional.forEach(item=>{
        this.attendeesList.push(item);
      });
    }
    this.attendeesList.forEach(item=>{
      if(item.userId==this.curUser.userId){
        this.attendeesList.splice(this.attendeesList.indexOf(item),1);
      }
    });       
    this.fGroupAddBookingRoom.patchValue({attendees:this.attendeesList.length+1})
  }
  valueCbxUserChange(event?) {
    this.lstUser=[];
    this.attendeesList=[];
    event.data.dataSelected.forEach((people) => {
      this.tempAtender = {
        userId: people.dataSelected.UserID,
        userName: people.dataSelected.UserName,
        status:'1',
        objectType: 'AD_Users',
        roleType:'3',
        optional:false,
      };
      
      this.lstUser.push(this.tempAtender);
    });
    
    if(this.lstUser.length>0 && this.lstUserOptional.length>0)
    {
      for (let i = 0; i < this.lstUser.length ; ++i) {
        for (let j = 0; j < this.lstUserOptional.length; ++j) {
          if (this.lstUser[i].userId == this.lstUserOptional[j].userId) {
              this.lstUserOptional.splice(j,1);
          }
        }
      }
    }
    this.UpdateAttendeesList();    
    this.changeDetectorRef.detectChanges();
  }
  valueCbxUserOptionalChange(event?) {
    this.lstUserOptional=[];this.attendeesList=[];
    event.data.dataSelected.forEach((people) => {
      this.tempAtender = {
        userId: people.id,
        userName: people.text,
        status:'1',
        objectType: 'AD_Users',
        roleType:'3',
        optional:true,
      };
      
      this.lstUserOptional.push(this.tempAtender);      
    });
    for (let i = 0; i < this.lstUserOptional.length; ++i) {
      for (let j = 0; j < this.lstUser.length; ++j) {
        if (this.lstUserOptional[i].userId == this.lstUser[j].userId) {
            this.lstUser.splice(j,1);
        }
      }
    }
    this.UpdateAttendeesList();
    
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
  }

  valueQuantityChange(event?) {
    this.lstStationery.forEach(item=>{
      if(item.id==event?.field){
        item.quantity=event?.data;
      }
    })
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
    if (event?.field) {
      if (event.data instanceof Object) {
        this.fGroupAddBookingRoom.patchValue({ [event['field']]: event.data.value });
      } else {
        this.fGroupAddBookingRoom.patchValue({ [event['field']]: event.data });
      }
    }  
    this.changeDetectorRef.detectChanges();
  }
  valueAllDayChange(event) {
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
    if (event.data.fromDate) {
      this.fGroupAddBookingRoom.patchValue({ bookingOn: event.data.fromDate });
    }
  }

  buttonClick(e: any) {
    //console.log(e);
  }
  valueStartTimeChange(event: any) {    
      if(event?.field=="startTime"){
        this.startTime = event.data.fromDate;
        this.isFullDay = false;
        this.beginHour = parseInt(this.startTime.split(':')[0]);
        this.beginMinute = parseInt(this.startTime.split(':')[1]);  
        if (this.fGroupAddBookingRoom.value.bookingOn) {
          if (!isNaN(this.beginHour) && !isNaN(this.beginMinute)) {
            let tmpDay=new Date(this.fGroupAddBookingRoom.value.bookingOn);
            this.tmpStartDate = new Date(tmpDay.getFullYear(),tmpDay.getMonth(),tmpDay.getDate(), this.beginHour, this.beginMinute, 0);   
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
      console.log('start', this.tmpStartDate);
      console.log('end', this.tmpEndDate);
      
  }
  valueEndTimeChange(event: any) {    
      if(event?.field=="endTime"){
        this.endTime = event.data.toDate;
        this.isFullDay = false;
        this.endHour = parseInt(this.endTime.split(':')[0]);
        this.endMinute = parseInt(this.endTime.split(':')[1]);
        if (this.fGroupAddBookingRoom.value.bookingOn) {
          if (!isNaN(this.endHour) && !isNaN(this.endMinute)) {
            let tmpDay=new Date(this.fGroupAddBookingRoom.value.bookingOn);
            this.tmpEndDate = new Date(tmpDay.getFullYear(),tmpDay.getMonth(),tmpDay.getDate(), this.endHour, this.endMinute, 0);     
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
      console.log('start', this.tmpStartDate);
      console.log('end', this.tmpEndDate);
     
  }
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
  popupUploadFile(evt:any) {
    this.attachment.uploadFile();
  } 
  fileAdded(event: any) {    
    this.fGroupAddBookingRoom.patchValue({attachments:event.data.length});    
  }
  fileCount(event: any) {    
       
  }

}
