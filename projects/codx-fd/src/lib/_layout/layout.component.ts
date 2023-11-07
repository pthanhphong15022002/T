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
    if(data) {
      var favIDs: any[] = [];
      data.favs.forEach((x: any) => {
        favIDs.push(x.recID);
      });
      data.favs.forEach((x: any) => {
        this.fdService.countFavorite(x.recID, data?.functionID, x?.paraValues).subscribe((item: string)=>{
          x.count = Number.parseInt(item);
        });
      });
    }
  }
  
}
