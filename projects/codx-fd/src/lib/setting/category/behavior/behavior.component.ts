import { ActivatedRoute } from '@angular/router';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { Observable, Subject } from 'rxjs';
import {
  ApiHttpService,
  CodxGridviewComponent,
  NotificationsService,
  ViewsComponent,
  AuthStore,
  ButtonModel,
  ViewModel,
  ViewType,
  UIComponent,
  SidebarModel,
  DialogRef,
} from 'codx-core';
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
import { LayoutModel } from '@shared/models/layout.model';
import { CodxMwpService } from 'projects/codx-mwp/src/public-api';
import { AddBehaviorComponent } from './add-behavior/add-behavior.component';
import { CodxFdService } from '../../../codx-fd.service';

@Component({
  selector: 'app-behavior',
  templateUrl: './behavior.component.html',
  styleUrls: ['./behavior.component.scss'],
})
export class BehaviorComponent extends UIComponent implements OnInit {
  dataItem: any;
  views: Array<ViewModel> = [];
  userPermission: any;
  showHeader: boolean = true;
  user: any;
  userName = '';
  addEditForm: FormGroup;
  isAddMode = true;
  valueTrue = true;
  predicate = 'Category=@0 and IsGroup = @1';
  dataValue = '1;false';
  entityName = 'BS_Competences';
  parentName = '';
  headerText = '';
  button?: ButtonModel[];
  dialog: DialogRef;
  functionList: any;
  formModel: any;
  @Input() functionObject;
  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('competenceName', { static: true })
  competenceName: TemplateRef<any>;
  @ViewChild('parentNameR', { static: true }) parentNameR: TemplateRef<any>;
  @ViewChild('memo', { static: true }) memo: TemplateRef<any>;
  @ViewChild('createdOn', { static: true }) createdOn: TemplateRef<any>;
  @ViewChild('subheader') subheader;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('gridView') gridView: CodxGridviewComponent;

  myModel = {
    template: null,
  };
  constructor(
    private injector: Injector,
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

    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) this.functionList = res;
    });
  }
  columnsGrid = [];
  onInit(): void {
    this.button = [{
      id: 'btnAdd',
    }];
    this.changedr.detectChanges();
  }

  onLoading(e: any) {
    if (this.view.formModel) {
      var formModel = this.view.formModel;
      this.cache
        .gridViewSetup(formModel.formName, formModel.gridViewName)
        .subscribe((res) => {
          if (res) {
            console.log(res);
            this.columnsGrid = [
              {
                field: 'parentName',
                headerText: res.ParentID.headerText,
                template: this.parentNameR,
              },
              {
                field: 'competenceID',
                headerText: res.CompetenceID.headerText,
              },
              {
                field: 'competenceName',
                headerText: res.CompetenceName.headerText,
                template: this.competenceName,
              },
              {
                field: 'memo',
                headerText: res.Memo.headerText,
                template: this.memo,
              },
              {
                field: 'createName',
                headerText: res.CreatedBy.headerText,
                template: this.itemCreateBy,
              },
              {
                field: 'createdOn',
                headerText: res.CreatedOn.headerText,
                template: this.createdOn,
              },
            ];
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
        });
    }
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

  add(e) {
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
      this.dialog = this.callfc.openSide(AddBehaviorComponent, obj, option);
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
        this.dialog = this.callfc.openSide(AddBehaviorComponent, obj, option);
        this.dialog.closed.subscribe((e) => {
          if (e?.event) {
            this.view.dataService.update(e.event).subscribe();
            this.changedr.detectChanges();
          }
        });
      });
  }

  copy(data) {
    if (data) this.view.dataService.dataSelected = data;
    var obj = {
      isModeAdd: true,
      headerText: this.headerText,
    };
    this.view.dataService
      .copy( )
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(AddBehaviorComponent, obj, option);
        this.dialog.closed.subscribe((e) => {
          if (e?.event) {
            this.view.dataService.add(e.event, 0).subscribe();
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
      .subscribe((res: any) => {
        if(res)
        {
          this.view.dataService.onAction.next({type : 'delete', data: data});
          this.changedr.detectChanges();
        }
      });
  }

  beforeDelete(op: any, data) {
    op.methodName = 'DeleteCompetencesAsync';
    op.data = data?.competenceID;
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
        case 'SYS04':
          this.copy(data);
          break;
      }
    }
  }
}
