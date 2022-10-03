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

@Component({
  selector: 'app-behavior',
  templateUrl: './behavior.component.html',
  styleUrls: ['./behavior.component.scss'],
})
export class BehaviorComponent extends UIComponent implements OnInit {
  funcID = '';
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
  button?: ButtonModel;
  dialog: DialogRef;

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
  }
  columnsGrid = [];
  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.columnsGrid = [
      {
        field: 'parentName',
        headerText: 'Quy tắc',
        template: this.parentNameR,
      },
      { field: 'competenceID', headerText: 'Mã hành vi' },
      {
        field: 'competenceName',
        headerText: 'Mô tả',
        template: this.competenceName,
      },
      { field: 'memo', headerText: 'Ghi chú', template: this.memo },
      {
        field: 'createName',
        headerText: 'Người tạo',
        template: this.itemCreateBy,
      },
      { field: 'createdOn', headerText: 'Ngày tạo', template: this.createdOn },
    ];
    this.changedr.detectChanges();
  }
  ngAfterViewInit() {
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

  add() {
    var obj = {
      isModeAdd: true,
    };
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(AddBehaviorComponent, obj, option);
      this.dialog.closed.subscribe((e) => {
        if (e?.event) {
          this.view.dataService.add(e.event, 1).subscribe();
          this.changedr.detectChanges();
        }
      });
    });
  }

  edit(data) {
    if (data) this.view.dataService.dataSelected = data;
    var obj = {
      isModeAdd: false,
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

  delete(data) {
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (option: any) =>
        this.beforeDelete(option, this.view.dataService.dataSelected)
      )
      .subscribe();
  }

  beforeDelete(op: any, data) {
    op.methodName = 'DeleteCompetencesAsync';
    op.data = data?.competenceID;
    return true;
  }

  clickMF(e, data) {
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
