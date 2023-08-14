import {
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  UIComponent,
  AuthStore,
  NotificationsService,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { CodxAdService } from '../../codx-ad.service';

@Component({
  selector: 'lib-popup-extend-module',
  templateUrl: './popup-extend-module.component.html',
  styleUrls: ['./popup-extend-module.component.scss'],
})
export class PopupExtendModuleComponent extends UIComponent {
  dialog;
  lstModule;
  grvTNOrders;
  extendMode;
  clmnGrid;
  defaultSettings;

  //#region

  @ViewChild('moduleHT', { static: true }) moduleHT: TemplateRef<any>;
  @ViewChild('operatorHT', { static: true }) operatorHT: TemplateRef<any>;
  @ViewChild('employeeHT', { static: true }) employeeHT: TemplateRef<any>;
  @ViewChild('totalHT', { static: true }) totalHT: TemplateRef<any>;

  @ViewChild('totalTmp', { static: true }) totalTmp: TemplateRef<any>;
  @ViewChild('operatorTmp', { static: true }) operatorTmp: TemplateRef<any>;
  @ViewChild('emplTmp', { static: true }) emplTmp: TemplateRef<any>;
  @ViewChild('moduleTmp', { static: true }) moduleTmp: TemplateRef<any>;
  //#endregion

  //#region module info
  months = 0;

  //#endregion
  constructor(
    private inject: Injector,
    private adService: CodxAdService,
    private authStore: AuthStore,
    private notify: NotificationsService,

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.dialog.formModel = new FormModel();
    this.lstModule = dt.data.lstModule;
    this.extendMode = dt.data.extendMode;
    this.grvTNOrders = dt?.data?.grvView;
  }

  onInit() {
    this.adService.getTenantDefaultSetting().subscribe((setting) => {
      this.defaultSettings = JSON.parse(setting.dataValue);
      this.months = Number(this.defaultSettings?.HireInervalNum);
      this.detectorRef.detectChanges();
    });
  }

  ngAfterViewInit() {
    this.clmnGrid = [
      {
        headerTemplate: this.moduleHT,
        template: this.moduleTmp,
        textAlign: 'center',
      },
      {
        headerTemplate: this.operatorHT,
        template: this.operatorTmp,
        textAlign: 'center',
      },
      {
        headerTemplate: this.employeeHT,
        template: this.emplTmp,
        textAlign: 'center',
      },
      {
        headerTemplate: this.totalHT,
        template: this.totalTmp,
        textAlign: 'center',
      },
    ];
  }
  closePopup() {
    this.dialog.close();
  }

  changeMonths(e) {
    if (e.data) {
      this.months = Number(e.data);
    }
  }

  changeUserQty(e, moduleID: string, isChildMD: boolean) {
    if (e.data) {
      let curMD;
      if (isChildMD) {
        curMD = this.lstModule.find(
          (x) => x.childModule.boughtModule.moduleID == moduleID
        );
      } else {
        curMD = this.lstModule.find((x) => x.boughtModule.moduleID == moduleID);
      }
      if (curMD) {
        curMD.quantity = Number(e.data);
      }
    }
  }
}
