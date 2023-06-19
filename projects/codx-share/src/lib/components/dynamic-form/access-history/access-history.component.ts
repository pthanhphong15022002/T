import {
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  UIComponent,
  AuthStore,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { AD_sprAccessHistory } from '../../../models/report-classes.model';

@Component({
  selector: 'lib-access-history',
  templateUrl: './access-history.component.html',
  styleUrls: ['./access-history.component.scss'],
})
export class AccessHistoryComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private route: ActivatedRoute,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.formModel = new FormModel();
    this.tenantID = dt.data;
  }
  formModel: FormModel;
  dialog;
  tenantID;
  clmnGrid;
  lstAccessHis: AD_sprAccessHistory[] = [];

  //#region VieeChild HeaderText
  @ViewChild('userIDHT', { static: true }) userIDHT: TemplateRef<any>;
  @ViewChild('userNameHT', { static: true }) userNameHT: TemplateRef<any>;
  @ViewChild('emailHT', { static: true }) emailHT: TemplateRef<any>;
  @ViewChild('utcHT', { static: true }) utcHT: TemplateRef<any>;
  @ViewChild('gtmHT', { static: true }) gtmHT: TemplateRef<any>;
  //#endregion

  //region ViewChild Template
  @ViewChild('userIDTmp', { static: true }) userIDTmp: TemplateRef<any>;
  @ViewChild('userNameTmp', { static: true }) userNameTmp: TemplateRef<any>;
  @ViewChild('emailTmp', { static: true }) emailTmp: TemplateRef<any>;
  @ViewChild('utcTmp', { static: true }) utcTmp: TemplateRef<any>;
  @ViewChild('gtmTmp', { static: true }) gtmTmp: TemplateRef<any>;
  //#endregion

  onInit() {
    this.clmnGrid = [
      {
        headerTemplate: this.userIDHT,
        width: 90,
        template: this.userIDTmp,
        textAlign: 'center',
      },
      {
        headerTemplate: this.userNameHT,
        width: 30,
        template: this.userNameTmp,
        textAlign: 'center',
      },
      {
        headerTemplate: this.emailHT,
        width: 30,
        template: this.emailTmp,
        textAlign: 'center',
      },
      {
        headerTemplate: this.utcHT,
        width: 30,
        template: this.utcTmp,
        textAlign: 'center',
      },
      {
        headerTemplate: this.gtmHT,
        width: 30,
        template: this.gtmTmp,
        textAlign: 'center',
      },
    ];
    this.api
      .execSv(
        'SYS',
        'ERM.Business.AD',
        'SystemReportBusiness',
        'AccessHistoryAsync',
        [null, this.tenantID]
      )
      .subscribe((res: string) => {
        this.lstAccessHis = JSON.parse(res);
      });
  }

  onClose() {
    this.dialog.close();
  }
}
