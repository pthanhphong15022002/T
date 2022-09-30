import { Dialog } from '@syncfusion/ej2-angular-popups';
import { Subject, Observable } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, ElementRef, TemplateRef, ContentChild, Injector } from '@angular/core';
import { LayoutService } from '@shared/services/layout.service';
import { ApiHttpService, AuthStore, ButtonModel, CallFuncService, CodxFormDynamicComponent, CodxGridviewComponent, NotificationsService, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { LayoutModel } from '@shared/models/layout.model';
import { CodxMwpService } from 'projects/codx-mwp/src/public-api';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-behaviorrule',
  templateUrl: './behaviorrule.component.html',
  styleUrls: ['./behaviorrule.component.scss']
})
export class BehaviorruleComponent implements OnInit {

  funcID = '';
  dataItem: any;
  views: Array<ViewModel> = [];
  userPermission: any;
  showHeader: boolean = true;
  user: any;
  userName = '';
  isOpen = false;
  button?: ButtonModel;

  @Input() functionObject;
  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('competenceName', { static: true }) competenceName: TemplateRef<any>;
  @ViewChild('createdOn', { static: true }) createdOn: TemplateRef<any>;
  @ViewChild('memo', { static: true }) memo: TemplateRef<any>;
  @ViewChild("subheader") subheader;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('gridView') gridView: CodxGridviewComponent;

  myModel = {
    template: null
  };
  constructor(
    private fb: FormBuilder,
    private api: ApiHttpService,
    private notificationsService: NotificationsService,
    private changedr: ChangeDetectorRef,
    private layoutService: LayoutService,
    private mwpService: CodxMwpService,
    private authStore: AuthStore,
    private callfc: CallFuncService,
    private route: ActivatedRoute,
  ) {
    this.user = this.authStore.get();
    this.route.params.subscribe(params => {
      if(params) this.funcID = params['funcID'];
    })
  }
  columnsGrid = [];
  ngOnInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.initForm();
    this.columnsGrid = [
      // { field: 'noName', nameColumn: '', template: this.GiftIDCell, width: 30 },
      { field: 'competenceID', headerText: 'Mã quy tắc', width: 100 },
      { field: 'competenceName', headerText: 'Mô tả', template: this.competenceName },
      { field: 'memo', headerText: 'Ghi chú', template: this.memo, width: 150 },
      { field: 'createName', headerText: 'Người tạo', template: this.itemCreateBy, width: 200 },
      { field: 'createdOn', headerText: 'Ngày tạo', template: this.createdOn, width: 100 },
    ];
    // this.mwpService.layoutcpn.next(new LayoutModel(true, '', false, true));
    this.changedr.detectChanges();
  }
  ngAfterViewInit() {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        model: {
          panelLeftRef: this.panelLeftRef,
        }
      }
    ];
    this.userPermission = this.viewbase.userPermission;
    this.changedr.detectChanges();

    // this.mwpService.layoutChange.subscribe(res => {
    //   if (res) {
    //     if (res.isChange)
    //       this.showHeader = res.asideDisplay;
    //     else
    //       this.showHeader = true;
    //   }
    // })
  }

  openFormCreate(e, isAddMode) {
    if (isAddMode == true) {
      this.isAddMode = true;
      this.closeInfor();
      this.getBehaviorRuleID();
    }
    else {
      this.isAddMode = false;
      this.addEditForm.patchValue(this.dataItem);
    }
    // this.viewbase.currentView.openSidebarRight();
  }

  setDefaultValue(e) {
    console.log("check setDefaultValue", e);
  }

  clickClosePopup() {
    this.closeInfor();
    // this.viewbase.currentView.closeSidebarRight();
  }

  closeInfor() {
    this.clearInfor();
  }

  clearInfor() {
    this.addEditForm.controls['competenceID'].setValue('');
    this.addEditForm.controls['competenceName'].setValue('');
    this.addEditForm.controls['memo'].setValue('');
    this.addEditForm.controls['stop'].setValue(false);

    this.changedr.detectChanges();
  }

  getBehaviorRuleID() {
    this.getOneFieldAutonumber(this.funcID)
      .subscribe((key) => {
        this.addEditForm.patchValue({ competenceID: key });
      });
  }

  getOneFieldAutonumber(functionID): Observable<any> {
    var subject = new Subject<any>();
    this.api.call("AD", "AutoNumbersBusiness",
      "CreateAutoNumberByFunction", [functionID, null])
      .subscribe(item => {
        if (item && item.msgBodyData.length > 0)
          subject.next(item.msgBodyData[0][1]);
      });
    return subject.asObservable();
  }

  headerStyle = {
    textAlign: 'center',
    backgroundColor: '#F1F2F3',
    fontWeight: 'bold',
    border: 'none'
  }
  columnStyle = {
    border: 'none',
    fontSize: '13px !important',
    fontWeight: 400,
    lineHeight: 1.4
  }

  addEditForm: FormGroup;
  isAddMode = true;

  closeQuitacungxu(): void {
    document.getElementById('canvas_quitacungxu').classList.remove('offcanvas-on');
    this.initForm();
  }
  openForm(dataItem, isAddMode) {
    if (isAddMode == true) {
      this.isAddMode = true;
      this.initForm();
    }
    else {
      this.isAddMode = false;
      this.addEditForm.patchValue(dataItem);
    }
    document.getElementById('canvas_quitacungxu').classList.add('offcanvas-on');
  }
  initForm() {
    this.addEditForm = this.fb.group({
      competenceID: [
        '',
        Validators.compose([
          Validators.required,

        ]),
      ],
      competenceName: [
        '',
        Validators.compose([
          Validators.required,
        ]),
      ],
      stop: [
        false,
        Validators.compose([
        ]),
      ],
      memo: [
        '',
        Validators.compose([
        ]),
      ]
    }, { updateOn: 'blur' });
  }
  valueChange(e) {
    if (e) {
      var field = e.field;
      var dt = e.data;
      if (field === "stop")
        this.addEditForm.patchValue({ stop: dt.checked })
      else {
        var obj = {};
        obj[field] = dt?.value ? dt.value : dt;
        this.addEditForm.patchValue(obj);
      }
    }
  }
  deleteBehaviorRule(item) {
    this.notificationsService.alertCode("").subscribe((x: Dialog) => {
      let that = this;
      x.close = function (e) {
        if (e) {
          var status = e?.event?.status;
          if (status == "Y") {
            that.api
              .call("BS", "CompetencesBusiness", "DeleteCompetencesAsync", [
                item.competenceID
              ])
              .subscribe((res) => {
                if (res && res.msgBodyData[0]) {
                  if (res.msgBodyData[0][0] == true) {
                    that.gridView.removeHandler(item, "competenceID");
                    that.changedr.detectChanges();
                  }
                }
              });
          }
        }
      }
    })
  }

  PopoverEmpEnter(p: any, dataItem) {
    this.dataItem = dataItem;
    p.open();
  }

  onSaveForm() {
    if (this.addEditForm.status == 'INVALID') {
      this.notificationsService.notify("Vui lòng kiểm tra lại thông tin nhập");
      return 0;
    } else {
      return this.api
        .call("BS", "CompetencesBusiness", "AddEditCompetencesAsync", [
          this.addEditForm.value, this.isAddMode
        ])
        .subscribe((res) => {
          if (res && res.msgBodyData[0]) {
            if (res.msgBodyData[0][0] == true) {
              this.clickClosePopup();
              this.initForm();
              let data = res.msgBodyData[0][2];
              this.userName = this.user?.userName;
              this.gridView.addHandler(data, this.isAddMode, "competenceID");
              this.changedr.detectChanges();
            }
          }
        });
    }

  }
}
