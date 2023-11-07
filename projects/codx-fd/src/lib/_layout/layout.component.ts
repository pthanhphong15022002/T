import { Component, OnInit, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { CallFuncService, DialogRef, LayoutBaseComponent, SidebarModel } from 'codx-core';
import { CodxFdService } from '../codx-fd.service';

@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent extends LayoutBaseComponent {
  
  dialog!: DialogRef;
  // override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  constructor(inject: Injector,
    private callfc: CallFuncService,
    private router: Router,
    private fdService: CodxFdService,
    ) {
    super(inject);
    this.getModule();
  }

  onInit(): void {}

  getModule()
  {
    this.module = this.router?.url.split("/")[2].toUpperCase();
  }
  onAfterViewInit(): void { }

  countFavorite(data: any){
    console.log(data)
    let entityName = "";
    switch (data?.functionID)
    {
        case "FDT02":
        case "FDT03":
        case "FDT04":
        case "FDT05":
        case "FDK012":
        case "FDW012":
        case "FDT10":
          entityName = "FD_Cards";
          break;
        case "FDT091":
        case "FDT092":
          entityName = "FD_GiftTrans";
          break;
        case "FDT093":
          break;
    }
    if(data && data?.functionID !== "FDT072" && data?.functionID !== "FDT06") {
      var favIDs: any[] = [];
      data.favs.forEach((x: any) => {
        favIDs.push(x.recID);
      });
      data.favs.forEach((x: any) => {
        this.fdService.countFavorite(
          x.recID, 
          data?.functionID,
          data?.formName,
          data?.gridViewName,
          entityName,
          data?.entityName, // entityPermission
        )
        .subscribe((item: string)=>{
          x.count = Number.parseInt(item);
        });
      });
    }
  }
  
}
