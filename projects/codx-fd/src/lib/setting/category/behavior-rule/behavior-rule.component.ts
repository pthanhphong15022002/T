import { Dialog } from '@syncfusion/ej2-angular-popups';
import { Subject, Observable } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
  Injector,
} from '@angular/core';
import { LayoutService } from '@shared/services/layout.service';
import {
  ApiHttpService,
  AuthStore,
  ButtonModel,
  CallFuncService,
  CodxGridviewComponent,
  NotificationsService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
  DialogRef,
} from 'codx-core';
import { CodxMwpService } from 'projects/codx-mwp/src/public-api';
import { ActivatedRoute } from '@angular/router';
import { AddBehaviorRuleComponent } from './add-behavior-rule/add-behavior-rule.component';

@Component({
  selector: 'app-behavior-rule',
  templateUrl: './behavior-rule.component.html',
  styleUrls: ['./behavior-rule.component.scss'],
})
export class BehaviorRuleComponent extends UIComponent implements OnInit {
  funcID = '';
  dataItem: any;
  views: Array<ViewModel> = [];
  userPermission: any;
  showHeader: boolean = true;
  user: any;
  userName = '';
  isOpen = false;
  button?: ButtonModel;
  dialog: DialogRef;
  moreFuncs = [
    {
      id: 'btnEdit',
      icon: 'icon-list-checkbox',
      text: 'Chỉnh sửa',
    },
    {
      id: 'btnDelete',
      icon: 'icon-list-checkbox',
      text: 'Xóa',
    },
  ];

  @Input() functionObject;
  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('competenceName', { static: true })
  competenceName: TemplateRef<any>;
  @ViewChild('createdOn', { static: true }) createdOn: TemplateRef<any>;
  @ViewChild('memo', { static: true }) memo: TemplateRef<any>;
  @ViewChild('subheader') subheader;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('gridView') gridView: CodxGridviewComponent;

  myModel = {
    template: null,
  };
  constructor(
    private injector: Injector,
    private fb: FormBuilder,
    private notificationsService: NotificationsService,
    private changedr: ChangeDetectorRef,
    private layoutService: LayoutService,
    private mwpService: CodxMwpService,
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
      { field: 'competenceID', headerText: 'Mã quy tắc' },
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
      {
        field: 'createdOn',
        headerText: 'Ngày tạo',
        template: this.createdOn,
      },
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

  add() {
    var obj = {
      isModeAdd: true,
    };
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(AddBehaviorRuleComponent, obj, option);
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
        this.dialog = this.callfc.openSide(
          AddBehaviorRuleComponent,
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
