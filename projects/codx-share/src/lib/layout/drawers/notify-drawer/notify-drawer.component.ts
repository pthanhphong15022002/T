import { Component, HostBinding, OnInit, AfterViewInit} from '@angular/core';

import { ApiHttpService, CallFuncService, CodxService, SidebarModel, } from 'codx-core';
import { SignalRService } from 'projects/codx-wp/src/lib/services/signalr.service';
import { NotifyDrawerSliderComponent } from './notify-drawer-slider/notify-drawer-slider.component';
@Component({
  selector: 'codx-notify-drawer',
  templateUrl: './notify-drawer.component.html',
  styleUrls: ['./notify-drawer.component.scss'],
})
export class NotifyDrawerComponent implements OnInit, AfterViewInit {
  @HostBinding('class') get class() {
     return "d-flex align-items-center " + this.codxService.toolbarButtonMarginClass; 
  }

  constructor(
    private api:ApiHttpService,
    public codxService:CodxService,
    private callFc:CallFuncService,
    private signalRSV : SignalRService
  ) 
  { }
 

  ngOnInit(): void {
    this.getNotiNumber();
  }


  ngAfterViewInit(): void {

  }
  
  openFormNotify(){
    let option = new SidebarModel();
    option.Width = '550px';
    let slider = this.callFc.openSide(NotifyDrawerSliderComponent, "", option);
    slider.closed.subscribe(() => {
      this.getNotiNumber();
    })
  }

  totalNoti:number = 0;
  // get noti number
  getNotiNumber(){
    this.api.execSv(
      "BG",
      "ERM.Business.BG",
      "NotificationBusinesss",
      "GetNotiNumberAsync",
      ["NO"]).subscribe((res:any) => {
        if(res > 0) 
        {
          this.totalNoti = res;
        }
        else this.totalNoti = 0;
      });
  }
}
