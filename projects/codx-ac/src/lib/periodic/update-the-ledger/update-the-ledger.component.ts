import { ChangeDetectorRef, Component, Injector, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModel, CallFuncService, DataRequest, DialogRef, NotificationsService, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';

@Component({
  selector: 'lib-update-the-ledger',
  templateUrl: './update-the-ledger.component.html',
  styleUrls: ['./update-the-ledger.component.css']
})
export class UpdateTheLedgerComponent extends UIComponent{
  
  views: Array<ViewModel> = [];
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  constructor(
    private inject: Injector,
    private notification: NotificationsService,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    private dt: ChangeDetectorRef,
  ) {
    super(inject);
  }

  //region Init
  onInit(): void {
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          template2: this.templateMore,
          frozenColumns: 1,
        },
      },
      {
        type: ViewType.smallcard,
        active: false,
        sameData: true,
        model: {
          template: this.itemTemplate,
        },
      },
    ];
  }
  //endRegion Init

  //#region Event

  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        //this.add(e);
        break;
    }
  }
  //#endRegion Event

  //region Function
  changeMFDetail(event:any){
    console.log(event);
  }
  //endRegion Function

}
