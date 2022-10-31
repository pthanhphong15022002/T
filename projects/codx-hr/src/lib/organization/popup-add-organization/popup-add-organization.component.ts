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
  data: HR_OrganizationUnits = null;
  parentID: string = '';
  function?: FunctionListModel;
  detailComponent: any;
  treeComponent?: CodxTreeviewComponent;
  formModel: any;
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
    this.title = dt.data?.headerText;
    // if (this.option) {
    //   this.parentID = this.option.orgUnitID;
    //   this.detailComponent = this.option.detailComponent;
    //   this.treeComponent = this.option.treeComponent;
    //   this.data.parentID = this.parentID;
    //   this.function = this.option.function;
    //   if (this.function)
    //   {
    //     this.title += ' ' + this.function.customName;
    //   }
    // }
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
    this.data = new HR_OrganizationUnits();
    this.getParamerAsync(this.functionID);
  }

  onSave() {
    this.dialogRef.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res?.save || res?.update) {
          if (this.treeComponent) this.treeComponent.setNodeTree(this.data);
        }
      });
    // this.api
    //   .execSv(
    //     'HR',
    //     'ERM.Business.HR',
    //     'OrganizationUnitsBusiness',
    //     'UpdateAsync',
    //     [this.data]
    //   )
    //   .subscribe((res: any) => {
    //     if (res) {
    //       // if (this.detailComponent) {
    //       //   if (this.detailComponent instanceof OrganizeDetailComponent) {
    //       //     this.detailComponent.addItem(res);
    //       //   }
    //       // }
    //       if (this.treeComponent) {
    //         this.treeComponent.setNodeTree(this.data);
    //       }
    //       this.notifiSV.notifyCode('SYS006');
    //       this.dialogRef.close(res);
    //     } else {
    //       this.notifiSV.notifyCode('SYS023');
    //     }
    //   });
  }

  beforeSave(option: any) {
    option.assemblyName = 'ERM.Business.HR';
    option.className = 'OrganizationUnitsBusiness';
    option.methodName = 'UpdateAsync';
    option.data = [this.data];
    return true;
  }
  paramaterHR: any = null;
  getParamerAsync(funcID: string) {
    if (funcID) {
      this.api
        .execSv(
          'SYS',
          'ERM.Business.AD',
          'AutoNumberDefaultsBusiness',
          'GenAutoDefaultAsync',
          [funcID]
        )
        .subscribe((res: any) => {
          if (res) {
            this.paramaterHR = res;
            if (this.paramaterHR.stop) return;
            else {
              let funcID = this.dialogRef.formModel.funcID;
              let entityName = this.dialogRef.formModel.entityName;
              let fieldName = 'orgUnitID';
              if (funcID && entityName) {
                this.getDefaultOrgUnitID(funcID, entityName, fieldName);
              }
            }
          }
        });
    }
  }
  orgUnitID: String = '';
  getDefaultOrgUnitID(
    funcID: string,
    entityName: string,
    fieldName: string,
    data: any = null
  ) {
    if (funcID && entityName && fieldName) {
      this.api
        .execSv(
          'SYS',
          'ERM.Business.AD',
          'AutoNumbersBusiness',
          'GenAutoNumberAsync',
          [funcID, entityName, fieldName, null]
        )
        .subscribe((res: any) => {
          if (res) {
            this.orgUnitID = res;
            this.data.OrgUnitID = res;
            this.detectorRef.detectChanges();
          }
        });
    }
  }
  valueChange(event: any) {
    if (event && event?.data) {
      let value = event.data;
      let field = event.field;
      switch (field) {
        case 'orgUnitID':
          this.data.OrgUnitID = value;
          break;
        default:
          break;
      }
      this.detectorRef.detectChanges();
    }
  }
}
