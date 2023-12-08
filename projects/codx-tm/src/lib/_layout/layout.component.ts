import { Component, Injector, ViewEncapsulation } from '@angular/core';
import {
  ApiHttpService,
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
} from 'codx-core';
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
    private api: ApiHttpService,
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

  //countFavorite TMT0206
  countFavorite(data: any) {
    let funcID = data?.functionID;
    var favIDs: any[] = [];
    data.favs.forEach((x: any) => {
      favIDs.push(x.recID);
    });
    let className = 'DataBusiness';
    let methol = 'GetCountFavoriteAsync';
    let assemblyName = 'Core';
    if (funcID == 'TMT0206') {
      assemblyName = 'TM';
      className = 'TaskBusiness';
      methol = 'CountFavoriteMonitorTasksAsync';
    }
    this.tmService
      .countFavorite(funcID, favIDs, assemblyName, className, methol)
      .subscribe((res) => {
        data.favs.forEach((x: any) => {
          x.count = res ? res[x.recID] ?? 0 : 0;
        });
      });
  }
}
