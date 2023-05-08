import {
  Component,
  Injector,
  OnInit,
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
  ViewType,
  ViewModel,
} from 'codx-core';
import { CodxAdService } from '../../codx-ad.service';
import { TN_OrderModule } from '../../models/tmpModule.model';
import { tmpUserRoleInfo } from '../../models/AD_UserRoles.models';

@Component({
  selector: 'lib-popup-module-detail',
  templateUrl: './popup-module-detail.component.html',
  styleUrls: ['./popup-module-detail.component.scss'],
})
export class PopupModuleDetailComponent extends UIComponent {
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
    this.module = dt.data.module as TN_OrderModule;
    this.currency = dt.data.currency;
    this.vllL1449 = dt.data.vllL1449;
    this.tenantID = dt.data.tenantID;
    this.lstModule = dt.data.lstModule as Array<TN_OrderModule>;
    this.childMD = this.lstModule.find(
      (md: TN_OrderModule) =>
        md.boughtModule?.refID == this.module?.boughtModule?.moduleID
    );
  }

  dialog;
  module;
  childMD;
  lstModule;
  currency: string = '';
  vllL1449;
  tenantID;

  lstADUserRoles: tmpUserRoleInfo[] = [];

  //userRole
  //chị Thương kêu viết chếc
  fmUserRole: FormModel = {
    formName: 'TNUserRoles',
    gridViewName: 'grvTNUserRoles',
    entityName: 'TN_UserRoles',
  };
  lstUserRole: Array<any> = [];
  predicate = '';
  dataValue = '';
  clmnGrid;
  @ViewChild('tmplUserInfo', { static: true }) tmplUserInfo: TemplateRef<any>;
  @ViewChild('operatorHT', { static: true }) operatorHT: TemplateRef<any>;
  @ViewChild('employeeHT', { static: true }) employeeHT: TemplateRef<any>;
  @ViewChild('operRoleEndDate', { static: true })
  operRoleEndDate: TemplateRef<any>;
  @ViewChild('emplRoleEndDate', { static: true })
  emplRoleEndDate: TemplateRef<any>;

  onInit(): void {
    console.log('md', this.module);
    console.log('child md', this.childMD);
    this.predicate = 'TenantID=@0 and Module=@1';
    this.dataValue = this.module?.boughtModule?.moduleID + ';' + this.tenantID;
    this.adService
      .getLstAD_UserRolesByModuleIDs([
        this.module?.boughtModule?.moduleID,
        this.childMD?.boughtModule?.moduleID,
      ])
      .subscribe((lstReturn: tmpUserRoleInfo[]) => {
        this.lstADUserRoles = lstReturn;
        this.detectorRef.detectChanges();
      });

    this.cache
      .gridViewSetup(this.fmUserRole.formName, this.fmUserRole.gridViewName)
      .subscribe((lstHeaderTexts) => {
        console.log('hText', lstHeaderTexts);
      });
    this.clmnGrid = [
      {
        field: 'UserID',
        width: 30,
        template: this.tmplUserInfo,
        textAlign: 'center',
      },
      {
        headerTemplate: this.operatorHT,
        width: 30,
        template: this.operRoleEndDate,
        textAlign: 'center',
      },
      {
        headerTemplate: this.employeeHT,
        width: 30,
        template: this.emplRoleEndDate,
        textAlign: 'center',
      },
    ];
  }

  ngAfterViewInit() {
    // this.views = [
    //   {
    //     id: '1',
    //     type: ViewType.grid,
    //     active: true,
    //     sameData: true,
    //     model: {
    //       resources: this.clmnGrid,
    //       hideMoreFunc: false,
    //     },
    //   },
    // ];
  }
  getInterval(interval) {
    return this.vllL1449?.find((x) => x.value == interval)?.text;
  }

  closePopup() {
    this.dialog.close();
  }
}
