import { Component, HostBinding, OnInit } from '@angular/core';
import { CodxService, CallFuncService, SidebarModel, ApiHttpService, CacheService } from 'codx-core';
import { ActiviesSliderComponent } from './activies-slider/activies-slider.component';

@Component({
  selector: 'codx-activies-approval-list',
  templateUrl: './activies-approval-list.component.html',
  styleUrls: ['./activies-approval-list.component.scss']
})
export class ActiviesApprovalListComponent implements OnInit {
  @HostBinding('class') get class() {
     return "d-flex align-items-center " + this.codxService.toolbarButtonMarginClass; 
  }
  funcID:string = "WPT038";
  function:any = null;
  constructor(
    private api:ApiHttpService,
    public codxService:CodxService,
    private callFc:CallFuncService,
    private cache:CacheService,

  ) { }

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


  openFormActivies(){
    let option = new SidebarModel();
    option.Width = '550px';
    let slider = this.callFc.openSide(ActiviesSliderComponent, "", option);
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
      ["AP"])
      .subscribe((res:any) => {
        if(res > 0) 
        {
          this.totalNoti = res;
        }
        else this.totalNoti = 0;
      });
  }
}
