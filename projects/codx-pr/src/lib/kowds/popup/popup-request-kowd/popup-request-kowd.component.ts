import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CacheService, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';
import { HR_Request } from '../../../models/HR_Request';

@Component({
  selector: 'pr-popup-request-kowd',
  templateUrl: './popup-request-kowd.component.html',
  styleUrls: ['./popup-request-kowd.component.css']
})
export class PopupRequestKowdComponent implements OnInit,AfterViewInit {

  dialog:DialogRef;
  headerText:string = "Gửi duyệt bảng công";
  data:any;
  orgUnitName:string;
  gridViewSetUp:any;
  mssgHR045:string;
  mssgSYS009:string;
  userPermission:any;
  constructor
  (
    private api:ApiHttpService,
    private notiSV: NotificationsService,
    private cache: CacheService,
    private dt: ChangeDetectorRef,
    @Optional() dialogRef?: DialogRef,
    @Optional() dialogData?: DialogData
  ) 
  {
    this.dialog = dialogRef;
    this.headerText = dialogData.data?.headerText;
    if(dialogData && dialogData?.data)
    {
      this.data = new HR_Request(Util.uid(),"","HR_Cate18",dialogData.data.dowCode,dialogData.data.orgUnitID);
      this.orgUnitName = dialogData.data.orgUnitName;
      this.gridViewSetUp = dialogData.data.gridViewSetUp;
      this.userPermission = dialogData.data.userPermission;
    }
  }
  ngOnInit(): void {
    this.cache.message("HR045")
    .subscribe((mssg:any) => {
      if(mssg)
      {
        this.mssgHR045 = mssg.customName ?? mssg.defaultName;
        this.setRequestName(this.data.dowCode,this.orgUnitName);
      }
    });
    this.cache.message("SYS009")
    .subscribe((mssg:any) => {
      if(mssg)
      {
        this.mssgSYS009 = mssg.customName ?? mssg.defaultName;
      }
    });
  }

  ngAfterViewInit(): void {

  }

  //
  valueChange(event){
    let field = event.field;
    let data = event.data;
    switch(field)
    {
      case "orgUnitID":
        data = data.dataSelected[0];
        this.data.orgUnitID = data.id;
        this.orgUnitName = data.text;
        this.setRequestName(this.data.dowCode,this.orgUnitName);
        break;
      case "requestName":
        this.data.requestName = data;
        break;
      case "note":
        this.data.note = data;
        break;
    }
    this.dt.detectChanges();
  }

  setRequestName(dowCode:string, orgUnitName:string){
    if(dowCode && orgUnitName)
    {
      let arrStr = dowCode.split("/");
      let strDowCode = `${arrStr[1]}/${arrStr[0]}`;
      this.data.requestName = Util.stringFormat(this.mssgHR045,strDowCode,orgUnitName);
      this.dt.detectChanges();
    }
  }
  

  // click save
  onSaveForm(){
    if(!this.data.dowCode)
    {
      let message = Util.stringFormat(this.mssgSYS009,this.gridViewSetUp["DowCode"].headerText);
      this.notiSV.notify(message);
      return;
    }
    if(!this.data.orgUnitID)
    {
      let message = Util.stringFormat(this.mssgSYS009,this.gridViewSetUp["OrgUnitID"].headerText);
      this.notiSV.notify(message);
      return;
    }
    else
    {
      this.api.execSv("HR","PR","KowDsBusiness","CreateRequestAsync",[this.data])
      .subscribe((res:any) => {
        if(res)
        {
          if(res[0])
          {
            this.notiSV.notifyCode("SYS006");
            this.dialog.close(true);
          }
          else this.notiSV.notify(res[1]);
        }
        else this.notiSV.notifyCode("SYS023");
      });
    }
  }

}
