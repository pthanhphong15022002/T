import { Component, HostBinding, OnInit } from '@angular/core';
import { CodxService, CallFuncService, SidebarModel, ApiHttpService } from 'codx-core';
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
  constructor(
    private api:ApiHttpService,
    public codxService:CodxService,
    private callFc:CallFuncService,
  ) { }

  ngOnInit(): void {
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
