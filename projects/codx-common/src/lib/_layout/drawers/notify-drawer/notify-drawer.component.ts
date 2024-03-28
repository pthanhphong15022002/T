import { Component, HostBinding, OnInit, AfterViewInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, CodxService, SidebarModel, } from 'codx-core';
import { NotifyDrawerSliderComponent } from './notify-drawer-slider/notify-drawer-slider.component';
import { Subscription } from 'rxjs';
@Component({
  selector: 'codx-notify-drawer',
  templateUrl: './notify-drawer.component.html',
  styleUrls: ['./notify-drawer.component.scss'],
})
export class NotifyDrawerComponent implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding('class') get class() {
     return "d-flex align-items-center " + this.codxService.toolbarButtonMarginClass; 
  }
  funcID:string = "BGT001";
  function:any = null;
  subscritions = new Subscription();
  constructor(
    private api:ApiHttpService,
    public codxService:CodxService,
    private callFc:CallFuncService,
    private cache:CacheService,
    private dt:ChangeDetectorRef
  ) 
  { }
  
 

  ngOnInit(): void {
    if (this.funcID) 
    {
      let subscribe = this.cache.functionList(this.funcID)
      .subscribe((func: any) => {
        if (func)
        {
          this.function = JSON.parse(JSON.stringify(func));
          this.dt.detectChanges();
        }
      });
      this.subscritions.add(subscribe);
    }
    this.getNotiNumber();
  }


  ngAfterViewInit(): void {

  }
  ngOnDestroy(): void {
    this.subscritions.unsubscribe();
  }
  
  openFormNotify(){
    let option = new SidebarModel();
    option.Width = '550px';
    let slider = this.callFc.openSide(NotifyDrawerSliderComponent, "", option);
    let subscribe = slider.closed.subscribe(() => {
      this.getNotiNumber();
    });
    this.subscritions.add(subscribe);
  }

  totalNoti:number = 0;
  getNotiNumber(){
    let subscribe = this.api.execSv(
      "BG",
      "ERM.Business.BG",
      "NotificationBusinesss",
      "GetNotiNumberAsync",
      ["NO"])
      .subscribe((res:any) => {
        if(res > 0) 
        {
          this.totalNoti = res;
        }
        else this.totalNoti = 0;
        this.dt.detectChanges();
      });
    this.subscritions.add(subscribe);
  }
}
