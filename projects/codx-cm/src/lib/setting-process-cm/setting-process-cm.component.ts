import { firstValueFrom } from 'rxjs';
import {
  Component,
  ViewChild,
  ChangeDetectorRef,
  SimpleChanges,
  OnInit,
  Injector,
  TemplateRef,
} from '@angular/core';
import { LayoutModel } from 'codx-core/lib/models/layout.model';
import { CodxCmService } from '../codx-cm.service';
import { ActivatedRoute } from '@angular/router';
import { PopupAddDynamicProcessComponent } from 'projects/codx-dp/src/lib/dynamic-process/popup-add-dynamic-process/popup-add-dynamic-process.component';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogModel,
  FormModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
  ViewsComponent,
} from 'codx-core';
import { CodxDpService } from 'projects/codx-dp/src/public-api';
import { DP_Processes } from 'projects/codx-dp/src/lib/models/models';

@Component({
  selector: 'lib-setting-process-cm',
  templateUrl: './setting-process-cm.component.html',
  styleUrls: ['./setting-process-cm.component.css'],
})
export class SettingProcessCmComponent extends UIComponent implements OnInit {
  @ViewChild('paneleft') paneleft: TemplateRef<any>;

  lstGroup = [];
  heightWin: any;
  widthWin: any;
  funcID: any;
  data: any;
  views: Array<ViewModel> = [];
  title = '';
  constructor(
    private inject: Injector,
    private cmSv: CodxCmService,
    private activeRouter: ActivatedRoute,
    private dpService: CodxDpService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(inject);
    this.funcID = this.activeRouter.snapshot.params['funcID'];
    this.heightWin = Util.getViewPort().height - 100;
    this.widthWin = Util.getViewPort().width - 100;
  }
  onInit() {
    this.cache.functionList(this.funcID).subscribe((fun) => {
      if (fun) {
        this.title = fun.customName || fun.description;
      }
    });
    this.getListProcessGroups();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: false,
        model: {
          panelRightRef: this.paneleft,
        },
      },
    ];
  }
  ngOnChanges(changes: SimpleChanges): void {}

  async onLoading(e) {
    this.data = await this.getProcessById();
    if (this.data) {
      this.openPopupEditDynamic('edit');
    } else {
      this.api
        .execSv<any>('DP', 'Core', 'DataBusiness', 'GetDefaultAsync', [
          'DP01',
          'DP_Processes',
        ])
        .subscribe((res) => {
          if (res && res?.data) {
            this.data = res.data;
            this.data['_uuid'] = this.data['recID'] ?? Util.uid();
            this.data['idField'] = 'recID';
            this.data.status = '1';
            this.openPopupEditDynamic('add');
          }
        });
    }
    this.changeDetectorRef.detectChanges();
  }

  getListProcessGroups() {
    this.dpService.getListProcessGroups().subscribe((res) => {
      if (res && res.length > 0) {
        this.lstGroup = res;
      }
    });
  }

  async getProcessById() {
    var data = await firstValueFrom(
      this.api.execSv<any>(
        'DP',
        'ERM.Business.DP',
        'ProcessesBusiness',
        'GetProcessDefaultAsync',
        [
          this.funcID == 'CMS0301'
            ? '1'
            : this.funcID == 'CMS0302'
            ? '2'
            : this.funcID == 'CMS0303'
            ? '3'
            : this.funcID == 'CMS0304'
            ? '5'
            : '4',
        ]
      )
    );
    return data;
  }

  openPopupEditDynamic(action) {
    this.data.applyFor =
      this.funcID == 'CMS0301'
        ? '1'
        : this.funcID == 'CMS0302'
        ? '2'
        : this.funcID == 'CMS0303'
        ? '3'
        : this.funcID == 'CMS0304'
        ? '5'
        : '4';
    this.data.category = '0';
    this.data.processName =
      this.funcID == 'CMS0301'
        ? '[SYS_CRM] Cơ hội'
        : this.funcID == 'CMS0302'
        ? '[SYS_CRM] Sự cố'
        : this.funcID == 'CMS0303'
        ? '[SYS_CRM] Yêu cầu'
        : this.funcID == 'CMS0304'
        ? '[SYS_CRM] Tiềm năng'
        : '[SYS_CRM] Hợp đồng';
    let dialogModel = new DialogModel();
    dialogModel.IsFull = true;
    dialogModel.zIndex = 999;
    let formModel = new FormModel();
    formModel.entityName = 'DP_Processes';
    formModel.formName = 'DPProcesses';
    formModel.gridViewName = 'grvDPProcesses';
    formModel.funcID = 'DP01';
    // dialogModel.DataService = this.view?.dataService;
    dialogModel.FormModel = formModel;
    this.cache
      .gridViewSetup('DPProcesses', 'grvDPProcesses')
      .subscribe((res) => {
        if (res) {
          var obj = {
            action: action,
            titleAction: this.title,
            gridViewSetup: res,
            lstGroup: this.lstGroup,
            systemProcess: '1',
            data: this.data,
          };
          var dialog = this.callfc.openForm(
            PopupAddDynamicProcessComponent,
            '',
            this.widthWin,
            this.heightWin,
            '',
            obj,
            '',
            dialogModel
          );
          dialog.closed.subscribe((e) => {});
        }
      });
  }
}
