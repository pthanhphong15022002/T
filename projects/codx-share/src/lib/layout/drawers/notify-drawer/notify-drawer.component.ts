import { Component, HostBinding, OnInit, AfterViewInit} from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, CodxService, SidebarModel, } from 'codx-core';
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
  funcID:string = "WPT012";
  function:any = null;
  constructor(
    private api:ApiHttpService,
    public codxService:CodxService,
    private callFc:CallFuncService,
    private cache:CacheService
  ) 
  { }
 

  ngOnInit(): void {
    // get function - gridViewsetup
    if (this.funcID) {
      this.cache.functionList(this.funcID)
      .subscribe((func: any) => {
        if (func){
          this.function = JSON.parse(JSON.stringify(func));
        }
      });
    }
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
