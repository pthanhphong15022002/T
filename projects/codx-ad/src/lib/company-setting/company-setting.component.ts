import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CodxService, UIComponent } from 'codx-core';
import { CodxAdService } from '../codx-ad.service';

@Component({
  selector: 'lib-company-setting',
  templateUrl: './company-setting.component.html',
  styleUrls: ['./company-setting.component.css'],
})
export class CompanySettingComponent extends UIComponent implements OnInit {
  funcID: any;
  moreFunc = [];
  constructor(
    private inject: Injector,
    private activedRouter: ActivatedRoute,
    private adService: CodxAdService,
    private codxService:CodxService
  ) {
    super(inject);
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.adService
    .getListFunction(this.funcID)
    .subscribe((res) => {
      if(res)
      {
        this.moreFunc = res;
        console.log(res);
      }
    });
  }

  onInit(): void {

  }
}
