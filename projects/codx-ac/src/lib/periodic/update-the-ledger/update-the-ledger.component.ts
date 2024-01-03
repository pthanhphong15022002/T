import { ChangeDetectorRef, Component, Injector, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModel, CallFuncService, DataRequest, DialogRef, NotificationsService, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { DynamicSettingControlComponent } from 'projects/codx-share/src/lib/components/dynamic-setting/dynamic-setting-control/dynamic-setting-control.component';

@Component({
  selector: 'lib-update-the-ledger',
  templateUrl: './update-the-ledger.component.html',
  styleUrls: ['./update-the-ledger.component.css'],
})
export class UpdateTheLedgerComponent extends UIComponent{
  //#region Contrucstor
  views: Array<ViewModel> = [];
  @ViewChild('template') template?: TemplateRef<any>;
  setting:any = [];
  dataValue :any = {};
  constructor(
    private inject: Injector,
    private notification: NotificationsService,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    private dt: ChangeDetectorRef,
  ) {
    super(inject);
  }

  //#endregion Contrustor

  //#region Init
  onInit(): void {
    if(!this.funcID) this.funcID = this.router.snapshot.params['funcID'];
    this.api.execSv('BG','BG','ScheduleTasksBusiness','GetScheduleTasksAsync',this.funcID).subscribe((res:any)=>{
      if (res) {
        this.setting = res?.paras;
        this.dataValue = JSON.parse(res?.paraValues);
      }
    })
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.content,
        active: false,
        sameData: true,
        showFilter:false,
        showSearchBar:false,
        model: {
          panelRightRef: this.template
        },
      },
    ];
  }
  //#endregion Init

  //#region Event

  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        //this.add(e);
        break;
    }
  }
  //#endregion Event

  //#region Function
  changeMF(event:any){
    console.log(event);
  }
  //#endregion Function

}
