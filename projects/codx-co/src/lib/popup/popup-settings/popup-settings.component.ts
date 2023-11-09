import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import { ApiHttpService, AuthStore, DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';

@Component({
  selector: 'co-popup-settings',
  templateUrl: './popup-settings.component.html',
  styleUrls: ['./popup-settings.component.scss'],
})
export class PopupSettingsComponent implements OnInit, AfterViewInit
{
  headerText: string;
  dialog!: DialogRef;
  data: any;
  lstSettingCalendar:any[] = [];
  user:any = null;
  isAdministrator:boolean = false;
  loaded:boolean = false;
  isLoading:boolean = false;
  constructor(
    private api:ApiHttpService,
    private auth:AuthStore,
    private notiService:NotificationsService,
    private detectorRef:ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog;
    this.data = dt.data;
    this.user = this.auth.get();
  }

  ngOnInit(): void {
    this.getSetting();
  }

  ngAfterViewInit(): void {}

  //get setting calendars
  getSetting(){
    this.api.execSv('SYS',
    'ERM.Business.SYS',
    'SettingValuesBusiness',
    'GetCalendarSettingAsync',
    ['WPCalendars'])
    .subscribe((res:any) => {
      let lstCalendar = [];
      if(res?.length > 0)
      {
        res.forEach((x:any) => 
        {
          let obj = {
            recID : x.recID,
            dataValue: JSON.parse(x.dataValue),
          }
          lstCalendar.push(obj);
        });
      }
      this.lstSettingCalendar = lstCalendar;
      this.loaded = true;
      this.detectorRef.detectChanges();
    });
  }
  // color change
  textColorChange(event) {
    if(event)
    {
      let value = event.data;
      let transType = event.field;
      this.lstSettingCalendar.map((x:any) => {
        if(x.dataValue.Template.TransType === transType)
        {
          x.dataValue.ShowColor = value;
          return x;
        }
      });
      this.detectorRef.detectChanges();
    }
  }

  // color change
  backgroundColorChange(event) {
    if(event)
    {
      let value = event.data;
      let transType = event.field;
      this.lstSettingCalendar.map((x:any) => {
        if(x.dataValue.Template.TransType === transType)
        {
          x.dataValue.ShowBackground = value;
          return x;
        }
      });
      this.detectorRef.detectChanges();
    }
  }
  // click save
  clickSave(){
    if(this.lstSettingCalendar)
    {
      this.isLoading = true;
      let settings = this.lstSettingCalendar.map(x => {
        return {
          recID: x.recID,
          dataValue: JSON.stringify(x.dataValue)
        }
      });
      this.api.execSv("SYS","ERM.Business.SYS","SettingValuesBusiness","SaveSettingCalendarAsync",JSON.stringify(settings))
      .subscribe((res:boolean) => {
        if(res)
        {
          this.notiService.notifyCode("SYS007");
          this.dialog.close(settings.map((x:any) =>  x.dataValue));
        }
        else
        {
          this.notiService.notifyCode("SYS021");
          this.dialog.close();
        }
        this.isLoading = false;
      });
    }
  }
}
