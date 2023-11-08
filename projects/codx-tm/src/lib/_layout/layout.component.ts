import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { CallFuncService, DialogRef, LayoutBaseComponent } from 'codx-core';
import { ActivatedRoute, Router } from '@angular/router';
import { CodxTMService } from '../codx-tm.service';

@Component({
  selector: 'codx-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;
  funcID: string = '';

  constructor(
    inject: Injector,
    private route: ActivatedRoute,
    private tmService: CodxTMService,
    private callfc: CallFuncService,
    private router: Router
  ) {
    super(inject);
    //this.module = 'TM';
    this.getModule();
  }

  getModule() {
    this.module = this.router?.url.split('/')[2].toUpperCase();
  }

  onInit(): void {}

  childMenuClick(e) {
    this.tmService.childMenuClick.next(e);
  }
  menuClick(e) {}
  onAfterViewInit(): void {}

  //chưa làm rãnh làm sau vì TMT0206 đang lỗi => sẽ làm như FD DM
  countFavorite(data: any) {
    // console.log(data)
    // let entityName = "";
    // switch (data?.functionID)
    // {
    //     case "FDT02":
    //     case "FDT03":
    //     case "FDT04":
    //     case "FDT05":
    //     case "FDK012":
    //     case "FDW012":
    //     case "FDT10":
    //       entityName = "FD_Cards";
    //       break;
    //     case "FDT091":
    //     case "FDT092":
    //       entityName = "FD_GiftTrans";
    //       break;
    //     case "FDT093":
    //       break;
    // }
    // if(data && data?.functionID !== "FDT072" && data?.functionID !== "FDT06") {
    //   var favIDs: any[] = [];
    //   data.favs.forEach((x: any) => {
    //     favIDs.push(x.recID);
    //   });
    //   data.favs.forEach((x: any) => {
    //     this.fdService.countFavorite(
    //       x.recID,
    //       data?.functionID,
    //       data?.formName,
    //       data?.gridViewName,
    //       entityName,
    //       data?.entityName, // entityPermission
    //     )
    //     .subscribe((item: string)=>{
    //       x.count = Number.parseInt(item);
    //     });
    //   });
    // }
  }
}
