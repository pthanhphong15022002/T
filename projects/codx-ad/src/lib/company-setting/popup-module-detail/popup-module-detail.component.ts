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
} from 'codx-core';
import { CodxAdService } from '../../codx-ad.service';
import { TN_OrderModule } from '../../models/tmpModule.model';

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

  //userRole
  fmUserRole: FormModel = {
    formName: 'TNUserRoles',
    gridViewName: 'grvTNUserRoles',
    entityName: 'TN_UserRoles',
  };
  lstUserRole: Array<any> = [];
  predicate = '';
  dataValue = '';
  clmnGrid;
  @ViewChild('itemAction', { static: true }) tmplUserInfo: TemplateRef<any>;

  onInit(): void {
    console.log('md', this.module);
    console.log('child md', this.childMD);
    this.predicate = 'TenantID=@0 and Module=@1';
    this.dataValue = this.module?.boughtModule?.moduleID + ';' + this.tenantID;

    this.clmnGrid = [
      {
        field: 'userID',
        headerText: 'Nhân viên',
        width: 30,
        template: this.tmplUserInfo,
        textAlign: 'center',
      },
      {
        field: 'EndDate',
        headerText: 'Nghiệp vụ',
        width: 30,
        template: this.tmplUserInfo,
        textAlign: 'center',
      },
      {
        field: 'EndDate',
        headerText: 'Thường',
        width: 30,
        template: this.tmplUserInfo,
        textAlign: 'center',
      },
    ];

    this.api
      .execSv('Tenant', 'Tenant', 'UserRolesBusiness', 'GetListUserRoleAsync', [
        this.module?.boughtModule?.moduleID,
        this.childMD?.boughtModule?.moduleID,
      ])
      .subscribe((res: any) => {
        console.log('res', res);
      });
  }
  getInterval(interval) {
    return this.vllL1449?.find((x) => x.value == interval)?.text;
  }

  closePopup() {
    this.dialog.close();
  }
}
