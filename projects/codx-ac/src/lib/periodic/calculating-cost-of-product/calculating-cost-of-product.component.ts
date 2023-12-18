import { ChangeDetectorRef, Component, Injector, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModel, CallFuncService, DataRequest, DialogRef, NotificationsService, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { PopAddCalculatingCostOfProductComponent } from './pop-add-calculating-cost-of-product/pop-add-calculating-cost-of-product.component';

@Component({
  selector: 'lib-calculating-cost-of-product',
  templateUrl: './calculating-cost-of-product.component.html',
  styleUrls: ['./calculating-cost-of-product.component.css']
})
export class CalculatingCostOfProductComponent extends UIComponent{
  //#region Constructor
  views: Array<ViewModel> = [];
  @ViewChild('templateCard') templateCard?: TemplateRef<any>;
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>;

  button?: ButtonModel[] = [{ id: 'btnAdd' }];
  funcName: any;
  headerText: any;
  
  constructor(
    private inject: Injector,
    private notification: NotificationsService,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    private dt: ChangeDetectorRef,
  ) {
    super(inject);
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          template2: this.templateGrid,
          frozenColumns: 1,
        },
      },
      {
        type: ViewType.smallcard,
        active: false,
        sameData: true,
        model: {
          template: this.templateCard,
        },
      },
    ];
  }
  //#endregion Init

  //#region Event

  clickMF(e) {
    switch (e.functionID) {
      // case 'SYS02':
      //   this.delete(data);
      //   break;
      // case 'SYS03':
      //   this.edit(e, data);
      //   break;
      // case 'SYS04':
      //   this.copy(e, data);
      //   break;
      // case 'SYS002':
      //   this.export(data);
      //   break;
    }
  }
  //#endregion Event

  //#region Function
  changeMF(event:any){
    console.log(event);
  }
  //#endRegion Function
}
