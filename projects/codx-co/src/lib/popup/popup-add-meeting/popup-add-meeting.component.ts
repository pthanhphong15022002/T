import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, DialogData, DialogModel, DialogRef, FormModel, NotificationsService } from 'codx-core';
import { PopupTemplateComponent } from '../popup-template/popup-template.component';

@Component({
  selector: 'co-popup-add-meeting',
  templateUrl: './popup-add-meeting.component.html',
  styleUrls: ['./popup-add-meeting.component.css']
})
export class PopupAddMeetingsComponent implements OnInit, AfterViewInit {

  //#region    
  user:any = null;
  action:string = "";
  title:string = "";
  dialogData:any = null;
  dialogRef:DialogRef = null;
  function:any = null; 
  formModel:FormModel = null;
  gridViewSetup:any = null // tạm thời chưa có gridviewsetup
  data:any = null;
  strUserID:string = "";
  lstRoles:any[] = [];
  isRepeat:boolean = false;
  tabInfo = [
    {
      icon: 'icon-info', // tabl icon
      text: 'Thông tin chung', // tab title
      name: 'tabGeneralInfo', // template name
    },
    {
      icon: 'icon-person_outline',
      text: 'Người tham gia',
      name: 'tabParticipants',
    },
    {
      icon: 'icon-layers',
      text: 'Mẫu biên bản buổi họp',
      name: 'tabSampleMeeting',
    },
    {
      icon: 'icon-settings_applications',
      text: 'Mở rộng',
      name: 'tabExtend',
    },
  ]
  //#endregion
  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private notiService:NotificationsService,
    private callFcSV:CallFuncService,
    private auth : AuthStore,
    private changeDetectorRef:ChangeDetectorRef,
    @Optional() dt: DialogData,
    @Optional() dr: DialogRef
  )
  {
    this.user = auth.get();
    this.dialogData = dt.data;
    this.dialogRef = dr;
    this.formModel = dr.formModel;
  }


  ngOnInit(): void {
    this.setValue();
  }


  ngAfterViewInit(): void {
    this.cache.valueList('CO001').subscribe((res) => {
      if (res && res?.datas) 
      {
        this.lstRoles = res.datas;
      }
    });
  }

  //set value
  setValue(){
    if(this.dialogData)
    {
      this.title = `${this.dialogData.action} lịch họp`;
      this.data = JSON.stringify(this.dialogData.data);
      if(this.dialogData.funcID)
      {
        this.cache.functionList(this.dialogData.funcID).subscribe((func:any) => {
          if(func)
          {
            this.function = func;
            if(this.formModel)
            {
              this.formModel = new FormModel();
              this.formModel.funcID = func.functionID;
              this.formModel.formName = func.formName;
              this.formModel.gridViewName = func.gridViewName;
            }
          }
        });
      }
      this.changeDetectorRef.detectChanges();
    }
  }

  // value change
  valueChange(event)
  {

  }

  // check Permission
  checkPermission( event:any,objectID:string){

  }

  // open popup select template
  openPopupTemplate(){
    let option = new DialogModel();
    option.FormModel = this.formModel;
    option.IsFull = true;
    this.callFcSV.openForm(PopupTemplateComponent,"Chọn template",0,0,"",null,"",option);
  }


  // active SWitch Repeat
  valueChangeSWitchRepeat(event:any){

  }

  // value change codx-tag
  valueChangeTags(event:any){

  }

}
