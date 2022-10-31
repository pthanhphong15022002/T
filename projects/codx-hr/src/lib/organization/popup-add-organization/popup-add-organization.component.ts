import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  Type,
} from '@angular/core';
import {
  ApiHttpService,
  AuthService,
  AuthStore,
  CodxTreeviewComponent,
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { FunctionListModel } from 'codx-core/lib/models/functionlist.model';
import { HR_OrganizationUnits } from '../../model/HR_OrganizationUnits.model';
import { OrganizeDetailComponent } from '../organize-detail/organize-detail.component';

@Component({
  selector: 'lib-popup-add-organization',
  templateUrl: './popup-add-organization.component.html',
  styleUrls: ['./popup-add-organization.component.css'],
})
export class PopupAddOrganizationComponent
  extends UIComponent
  implements OnInit
{
  title = '';
  header = '';
  dialogRef: DialogRef;
  isNew: boolean = true;
  user: any;
  functionID: string;
  option: any = {};
  data = null;
  parentID: string = '';
  function?: FunctionListModel;
  detailComponent: any;
  treeComponent?: CodxTreeviewComponent;
  formModel: any;
  isModeAdd: any;
  constructor(
    private injector: Injector,
    private auth: AuthService,
    private notifiSV: NotificationsService,
    @Optional() dialogRef?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    super(injector);
    this.user = this.auth.userValue;
    this.option = dt.data;
    this.dialogRef = dialogRef;
    this.functionID = this.dialogRef.formModel.funcID;
    this.treeComponent = this.option.treeComponent;
    this.isModeAdd = dt.data.isModeAdd;
    this.title = dt.data?.headerText;
    this.data = JSON.parse(
      JSON.stringify(this.dialogRef.dataService.dataSelected)
    );
    this.cache
      .functionList(this.dialogRef.formModel.funcID)
      .subscribe((res) => {
        if (res) {
          this.header =
            this.title +
            ' ' +
            res?.customName.charAt(0).toLocaleLowerCase() +
            res?.customName.slice(1);
        }
      });
  }

  onInit(): void {
    if (this.isModeAdd) this.data.orgUnitType = null;
  }

  onSave() {
    this.dialogRef.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res?.save || res?.update) {
          if (this.treeComponent) this.treeComponent.setNodeTree(this.data);
          this.dialogRef.close(res);
        }
      });
  }

  beforeSave(option: any) {
    option.assemblyName = 'ERM.Business.HR';
    option.className = 'OrganizationUnitsBusiness';
    option.methodName = 'UpdateAsync';
    option.data = [this.data];
    return true;
  }
}
