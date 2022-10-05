import { Component, HostBinding, OnInit } from '@angular/core';
import { CodxService, CallFuncService, SidebarModel } from 'codx-core';
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
    public codxService:CodxService,
    private callFc:CallFuncService,
  ) { }

  ngOnInit(): void {
  }


  openFormActivies(){
    let option = new SidebarModel();
    option.Width = '550px';
    this.callFc.openSide(ActiviesSliderComponent, "", option);
  }
}
