import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  Type,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CodxTreeviewComponent,
  DialogData,
  DialogRef,
} from 'codx-core';
import { FunctionListModel } from 'codx-core/lib/models/functionlist.model';
import { OrganizeDetailComponent } from '../organize-detail/organize-detail.component';

@Component({
  selector: 'lib-popup-add-organization',
  templateUrl: './popup-add-organization.component.html',
  styleUrls: ['./popup-add-organization.component.css'],
})
export class PopupAddOrganizationComponent implements OnInit {
  title = 'Thêm';
  dialog: DialogRef;
  isNew: boolean = true;
  user: any;
  functionID: string;
  option: any = {};
  data: any;
  parentID: string = '';
  function?: FunctionListModel;
  detailComponent: any;
  treeComponent?: CodxTreeviewComponent;
  constructor(
    private detectorRef: ChangeDetectorRef,
    private authStore: AuthStore,
    private api: ApiHttpService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.option = dt.data;
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.functionID = this.dialog.formModel.funcID;
    this.data = dialog.dataService!.dataSelected || {};
    if (this.option) {
      this.parentID = this.option.orgUnitID;
      this.detailComponent = this.option.detailComponent;
      this.treeComponent = this.option.treeComponent;
      this.data.parentID = this.parentID;
      this.function = this.option.function;
      if (this.function) this.title += ' ' + this.function.customName;
    }
  }

  ngOnInit(): void {}

  onSave(continute: boolean = false) {
    if (continute) {
    } else {
      this.api
        .execSv(
          'HR',
          'ERM.Business.HR',
          'OrganizationUnitsBusiness',
          'UpdateAsync',
          [this.data]
        )
        .subscribe((res: any) => {
          if (res) {
            if (this.detailComponent) {
              if (this.detailComponent instanceof OrganizeDetailComponent) {
                this.detailComponent.addItem(res);
              }
            }
            if (this.treeComponent) {
              // var nodeTree = this.treeComponent.dicDatas[this.parentID];
              // if (nodeTree)
              this.treeComponent.setNodeTree(this.data);
            }
            this.dialog.close();
          }
        });
    }
  }
}
