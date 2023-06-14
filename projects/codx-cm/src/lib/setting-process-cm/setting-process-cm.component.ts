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

  async viewChanged(e) {
    this.data = await this.getProcessById();
    if (this.data) {
      this.openPopupEditDynamic();
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
          ? '4'
          : '5'
        ]
      )
    );
    return data;
  }

  openPopupEditDynamic() {
    if (this.data) {
      this.data.applyFor =
        this.funcID == 'CMS0301'
          ? '1'
          : this.funcID == 'CMS0302'
          ? '2'
          : this.funcID == 'CMS0303'
          ? '3'
          : this.funcID == 'CMS0304'
          ? '4'
          : '5';
      this.data.category = '0';
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
              action: 'edit',
              titleAction: 'edit',
              gridViewSetup: res,
              lstGroup: this.lstGroup,
              systemProcess: true,
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
}
