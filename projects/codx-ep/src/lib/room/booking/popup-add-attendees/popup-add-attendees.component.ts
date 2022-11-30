
import {
  CacheService,
  DialogData,
  DialogRef,
  ApiHttpService,
  NotificationsService,
  CodxFormComponent,
} from 'codx-core';
import { Component, OnInit, Optional,  ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CodxEpService } from '../../../codx-ep.service';
import { BookingAttendees } from '../../../models/bookingAttendees.model';

@Component({
  selector: 'popup-add-attendees',
  templateUrl: './popup-add-attendees.component.html',
  styleUrls: ['./popup-add-attendees.component.css'],
})
export class PopupAddAttendeesComponent implements OnInit {
  @ViewChild('form') form: TemplateRef<any>;

  dialogRef: any;
  title = '';
  listRoles=[];

  popover: any;
  idUserSelected: any;

  data: any;
  funcID: any;
  formModel: any;
  headerText: any;
  oldAttendees=[];
  newAttendees=[];
  isPopupUserCbb: boolean;
  lstUser: any[];
  attendeesList=[];
  constructor(
    private cache: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private codxEpService: CodxEpService,
    private apiHttpService: ApiHttpService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialogRef = dialog;
    this.data = dialogData.data[0];
    this.formModel = dialogData.data[1];
    this.dialogRef.formModel=this.formModel;
    this.headerText = dialogData.data[2];
    this.cache.valueList('EP009').subscribe((res) => {
      if (res && res?.datas.length > 0) { 
        let tmpArr = res.datas;
        tmpArr.forEach((item) => {
          if (item.value != '4') {
            this.listRoles.push(item);
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.apiHttpService
            .callSv(
              'EP',
              'ERM.Business.EP',
              'BookingAttendeesBusiness',
              'GetAsync',
              [this.data.recID]
            )
            .subscribe((res) => {
              if (res) {
                let peopleAttend = res.msgBodyData[0];
                peopleAttend.forEach((people) => {
                  let tempAttender = new BookingAttendees();
                  tempAttender.userID = people.userID;
                  tempAttender.userName = people.userName;
                  tempAttender.status = people.status;
                  tempAttender.roleType = people.roleType;
                  tempAttender.optional = people.optional;
                  this.listRoles.forEach((element) => {
                    if (element.value == tempAttender.roleType) {
                      tempAttender.icon = element.icon;
                      tempAttender.roleName = element.text;
                    }
                  });
                  
                  this.oldAttendees.push(tempAttender);
                  
                });
                this.changeDetectorRef.detectChanges();
              }
            });

  }
 
  

  onSave(){
    this.codxEpService.inviteAttendees(this.data.recID,this.newAttendees).subscribe(res=>{
      if(res){
        let listUserID=this.data.bookingAttendees;
        this.newAttendees.forEach(item=>{        
          listUserID=listUserID+';'+item.userID;        
        });
        this.data.bookingAttendees=listUserID;
        this.notificationsService.notifyCode('SYS034');
        this.dialogRef && this.dialogRef.close(this.data);
      }
      else{
        this.dialogRef.close();
      }

    });
  }
  
  closePopUpCbb() {
    this.isPopupUserCbb = false;
  }
  
  openUserPopup() {
    this.isPopupUserCbb = true;
  }
  valueCbxUserChange(event) {
    
    if (event == null) {
      this.isPopupUserCbb = false;
      return;
    }
    if (event?.dataSelected) {
      this.lstUser = [];
      event.dataSelected.forEach((people) => {        
        let tempAttender = new BookingAttendees();
        tempAttender.userID = people.UserID;
        tempAttender.userName = people.UserName;
        tempAttender.status = '1';
        tempAttender.roleType = '3';
        tempAttender.optional = false;
        this.listRoles.forEach((element) => {
          if (element.value == tempAttender.roleType) {
            tempAttender.icon = element.icon;
            tempAttender.roleName = element.text;
          }
        });
        this.lstUser.push(tempAttender);        
      });
        this.lstUser.forEach(item=>{          
          let check =true;
          this.oldAttendees.forEach(old=>{
            if(item.userID==old.userID){
              check=false;
            }
          })
          if(check){
            this.newAttendees.push(item);
          }
        });
      // this.attendeesList.forEach((item) => {
      //   if (item.userID == this.curUser.userID) {
      //     this.attendeesList.splice(this.attendeesList.indexOf(item), 1);
      //   }
      // });
      // this.attendeesList=this.filterArray(this.attendeesList);
      // this.data.attendees = this.attendeesList.length + 1;
      // this.changeDetectorReftorRef.detectChanges();
      // let tmpDataCBB='';
      // // this.attendeesList.forEach(item=>{
      // //   tmpDataCBB=tmpDataCBB+";"+item.userID;        
      // // });
      // let roleCheck=0;
      // if(this.curUser.roleType!="1"){
      //   this.attendeesList.forEach(item=>{
      //     if(item.roleType=="1"){
      //       roleCheck=roleCheck+1;        
      //     }      
      //   });
      //   if(roleCheck<1){
      //     this.curUser.roleType='1';
      //     this.listRoles.forEach((element) => {
      //       if (element.value == this.curUser.roleType) {
      //         this.curUser.icon = element.icon;
      //         this.curUser.roleName = element.text;
      //       }
      //     });
      //   }
      // }
      this.isPopupUserCbb = false;
      this.changeDetectorRef.detectChanges();
    }
  }
  
  attendeesCheckChange(event: any, userID: any) {
    this.newAttendees.forEach((attender) => {
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
     if(value=="1"){
    //   if(this.curUser.roleType=="1"){
    //     this.curUser.roleType="3";
    //     this.listRoles.forEach((role) => {
    //       if (this.curUser.roleType == role.value) {
    //         this.curUser.icon = role.icon;
    //       }
    //     });
    //     this.changeDetectorRef.detectChanges();
    //   }
    //   else{
    //     this.attendeesList.forEach(att=>{
    //       if(att.roleType == "1"){
    //         att.roleType="3";
    //         this.listRoles.forEach((role) => {
    //           if (att.roleType == role.value) {
    //             att.icon = role.icon;
    //           }
    //         });
    //         this.changeDetectorRef.detectChanges();     
    //       }      
    //     });
    //   }      
      }

    // if(idUserSelected==this.curUser.userID){
    //   this.curUser.roleType=value;
    //   this.listRoles.forEach((role) => {
    //     if (this.curUser.roleType == role.value) {
    //       this.curUser.icon = role.icon;
    //     }
    //   });      
    //   this.changechangeDetectorRef.detectChanges();
    // }
    else{
      this.attendeesList.forEach((res) => {
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
  deleteAttender(attID:string){
    var tempDelete;
    this.newAttendees.forEach(item=>{
      if(item.userID== attID){
        tempDelete = item;
      }
    });
    this.newAttendees.splice(this.attendeesList.indexOf(tempDelete), 1);
    this.changeDetectorRef.detectChanges();
  }
}
