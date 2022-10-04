import { Observable, Subject } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  TemplateRef,
  ContentChild,
  Injector,
} from '@angular/core';
import { LayoutService } from '@shared/services/layout.service';
import {
  ApiHttpService,
  AuthStore,
  ButtonModel,
  CodxGridviewComponent,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { LayoutModel } from '@shared/models/layout.model';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { CodxMwpService } from 'projects/codx-mwp/src/public-api';
import { ActivatedRoute } from '@angular/router';
import { AddProposedFieldComponent } from './add-proposed-field/add-proposed-field.component';

@Component({
  selector: 'app-proposed-field',
  templateUrl: './proposed-field.component.html',
  styleUrls: ['./proposed-field.component.scss'],
})
export class ProposedFieldComponent extends UIComponent implements OnInit {
  funcID = '';
  dataItem: any;
  views: Array<ViewModel> = [];
  userPermission: any;
  showHeader: boolean = true;
  user: any;
  userName = '';
  isOpen = false;
  predicate = '';
  dataValue = '';
  entityName = 'BS_Industries';
  ownDomain = '';
  ownName = '';
  ownPosition = '';
  industryIdUpdate = '';
  checkAddEdit = true;
  isAddMode = true;
  button?: ButtonModel;
  dialog: DialogRef;
  headerText = '';

  @Input() functionObject;
  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('itemOwner', { static: true }) itemOwner: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('note', { static: true }) note: TemplateRef<any>;
  @ViewChild('createdOn', { static: true }) createdOn: TemplateRef<any>;
  @ViewChild('subheader') subheader;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('gridView') gridView: CodxGridviewComponent;

  constructor(
    private injector: Injector,
    private fb: FormBuilder,
    private notificationsService: NotificationsService,
    private changedr: ChangeDetectorRef,
    private authStore: AuthStore,
    private route: ActivatedRoute
  ) {
    super(injector);
    this.user = this.authStore.get();
    this.route.params.subscribe((params) => {
      if (params) this.funcID = params['funcID'];
    });
  }
  reload = false;
  columnsGrid = [];
  @ViewChild(ImageViewerComponent) imageViewer: ImageViewerComponent;
  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.changedr.detectChanges();
  }

  onLoading(e) {
    if (this.view.formModel) {
      var formModel = this.view.formModel;
      this.cache
        .gridViewSetup(formModel.formName, formModel.gridViewName)
        .subscribe((res) => {
          if (res) {
            this.columnsGrid = [
              { field: 'industryID', headerText: res.IndustryID.headerText },
              {
                field: 'industryName',
                headerText: res.IndustryName.headerText,
              },
              {
                field: 'owner',
                headerText: res.Owner.headerText,
                template: this.itemOwner,
              },
              {
                field: 'note',
                headerText: res.Note.headerText,
                template: this.note,
              },
              {
                field: 'createName',
                headerText: 'Người tạo',
                template: this.itemCreateBy,
              },
              {
                field: 'createdOn',
                headerText: res.CreatedOn.headerText,
                template: this.createdOn,
              },
            ];
          }
        });
      this.views = [
        {
          type: ViewType.grid,
          sameData: true,
          active: false,
          model: {
            resources: this.columnsGrid,
          },
        },
      ];
      this.changedr.detectChanges();
    }
  }

  addEditForm: FormGroup;
  valueTrue = true;
  ownInfo = null;

  changeOwnerByCombobox(employeeID) {
    this.api
      .call(
        'ERM.Business.HR',
        'EmployeesBusiness',
        'GetListEmployeesByUserIDAsync',
        [JSON.stringify([employeeID])]
      )
      .subscribe((res) => {
        this.ownInfo = res.msgBodyData[0][0];
        this.reload = true;
        this.changedr.detectChanges();
      });
  }

  valueChange(e) {
    if (e) {
      var field = e.field;
      var dt = e.data;
      if (field === 'stop') this.addEditForm.patchValue({ stop: dt.checked });
      else {
        var obj = {};
        obj[field] = dt?.value ? dt.value : dt;
        this.addEditForm.patchValue(obj);
      }
    }
  }
  deleteProposedField(item) {
    this.notificationsService.alertCode('').subscribe((x: Dialog) => {
      let that = this;
      x.close = function (e) {
        if (e) {
          var status = e?.event?.status;
          if (status == 'Y') {
            that.api
              .call('BS', 'IndustriesBusiness', 'DeleteIndustryAsync', [
                item.industryID,
              ])
              .subscribe((res) => {
                if (res && res.msgBodyData[0]) {
                  if (res.msgBodyData[0][0] == true) {
                    that.gridView.removeHandler(item, 'industryID');
                    that.changedr.detectChanges();
                  }
                }
              });
          }
        }
      };
    });
  }

  onSaveForm() {
    var gridModel = {
      predicate: this.predicate,
      dataValue: this.dataValue,
      entityName: this.entityName,
    };
    if (this.addEditForm.invalid == true) {
      this.notificationsService.notify('Vui lòng kiểm tra lại thông tin nhập');
      return 0;
    } else {
      return this.api
        .call('BS', 'IndustriesBusiness', 'AddEditIndustryAsync', [
          this.addEditForm.value,
          this.isAddMode,
          gridModel,
        ])
        .subscribe((res) => {
          if (res && res.msgBodyData[0]) {
            if (res.msgBodyData[0][0] == true) {
              let data = res.msgBodyData[0][3][0];
              this.ownDomain = res.msgBodyData[0][3][0]?.ownDomain;
              this.ownName = res.msgBodyData[0][3][0]?.ownName;
              this.ownPosition = res.msgBodyData[0][3][0]?.ownPosition;
              this.userName = this.user?.userName;
              if (this.isAddMode == false) {
                this.checkAddEdit = false;
                this.industryIdUpdate = data?.industryID;
                this.changedr.detectChanges();
              }
              this.gridView.addHandler(data, this.isAddMode, 'industryID');
              console.log('check gridView', this.gridView);
              this.changedr.detectChanges();
            } else {
              this.notificationsService.notify(res.msgBodyData[0][1]);
            }
          }
        });
    }
  }

  add(e: any) {
    this.headerText = e?.text;
    var obj = {
      isModeAdd: true,
      headerText: this.headerText,
    };
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(
        AddProposedFieldComponent,
        obj,
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (e?.event) {
          this.view.dataService.add(e.event, 0).subscribe();
          this.changedr.detectChanges();
        }
      });
    });
  }

  edit(data) {
    if (data) this.view.dataService.dataSelected = data;
    var obj = {
      isModeAdd: false,
      headerText: this.headerText,
    };
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(
          AddProposedFieldComponent,
          obj,
          option
        );
        this.dialog.closed.subscribe((e) => {
          if (e?.event) {
            this.view.dataService.update(e.event).subscribe();
            this.changedr.detectChanges();
          }
        });
      });
  }

  delete(data) {
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (option: any) =>
        this.beforeDelete(option, this.view.dataService.dataSelected)
      )
      .subscribe();
  }

  beforeDelete(op: any, data) {
    op.methodName = 'DeleteIndustryAsync';
    op.data = data?.industryID;
    return true;
  }

  clickMF(e, data) {
    this.headerText = e?.text;
    if (e) {
      switch (e.functionID) {
        case 'SYS03':
          this.edit(data);
          break;
        case 'SYS02':
          this.delete(data);
          break;
      }
    }
  }
}
