import { DP_Processes } from './../../models/models';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  CacheService,
  FormModel,
} from 'codx-core';
import { TabModel } from '../../models/models';
import { DomSanitizer } from '@angular/platform-browser';
import { CodxDpService } from '../../codx-dp.service';

@Component({
  selector: 'lib-popup-views-details-process',
  templateUrl: './popup-views-details-process.component.html',
  styleUrls: ['./popup-views-details-process.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupViewsDetailsProcessComponent implements OnInit {
  @ViewChild('popupGuide') popupGuide;
  @ViewChild('viewDetail') viewDetail: TemplateRef<any>;
  @ViewChild('viewKanban') viewKanban: TemplateRef<any>;
  @ViewChild('viewDashboard') viewDashboard: TemplateRef<any>;
  //temp
  @ViewChild('titleTmpStep') titleTmpStep: TemplateRef<any>;
  @ViewChild('footerStep') footerStep: TemplateRef<any>;

  dialog: DialogRef;
  name = 'Dashboard';
  isCreate = false;
  process = new DP_Processes();
  dialogGuide: DialogRef;
  headerText = 'Hướng dẫn các bước thực hiện';
  // openPop =false ;
  listValueRefid: string[] = [];
  stepNames = [];
  tabInstances = [];
  tabControl: TabModel[] = [
    { name: 'Dashboard', textDefault: 'Dashboard', isActive: true },
    { name: 'Detail', textDefault: 'Chi tiết quy trình', isActive: false },
    { name: 'Kanban', textDefault: 'Kanban', isActive: false },
  ];
  // value
  vllApplyFor = 'DP002';
  formModelStep: FormModel = {
    formName: 'DPSteps',
    gridViewName: 'grvDPSteps',
    entityName: 'DP_Steps',
  };

  formModelTaskGroup: FormModel = {
    formName: 'DPStepsTaskGroups',
    gridViewName: 'grvDPStepsTaskGroups',
    entityName: 'DP_Steps_TaskGroups',
  };

  formModelTask: FormModel = {
    formName: 'DPStepsTasks',
    gridViewName: 'grvDPStepsTasks',
    entityName: 'DP_Steps_Tasks',
  };


  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    public sanitizer: DomSanitizer,
    private callFunc: CallFuncService,
    private dpService: CodxDpService,
    private cache: CacheService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.process = dt?.data?.data;
    this.isCreate = dt.data.isCreate;
    this.dpService
      .updateHistoryViewProcessesAsync(this.process.recID)
      .subscribe();
    // this.cache.valueList('DP034').subscribe((res) => {
    //   if (res && res.datas) {
    //     var tabIns = [];
    //     res.datas.forEach((element) => {
    //       var tab = {};
    //       tab['viewModelDetail'] = element?.value;
    //       tab['textDefault'] = element?.text;
    //       tab['icon'] = element?.icon;
    //       tabIns.push(tab);
    //     });
    //     this.tabInstances = tabIns;
    //   }
    // });
  }

  ngOnInit(): void {}

  clickMenu(item) {
    this.name = item.name;
    this.tabControl.forEach((obj) => {
      if (!obj.isActive && obj.name == this.name) {
        obj.isActive = true;
      } else obj.isActive = false;
    });
    this.changeDetectorRef.detectChanges();
  }
  showGuide(p) {
    p.close();
    let option = new DialogModel();
    option.zIndex = 1001;
    if (this.process?.steps?.length > 0) {
      this.stepNames = this.process.steps.map((x) => x.stepName);
      this.dialogGuide = this.callFunc.openForm(
        this.popupGuide,
        '',
        500,
        300,
        '',
        null,
        '',
        option
      );
    }
  }
  closeDetailInstance(data) {
    let listMap = new Map();
    for (let i = 0; i < this.listValueRefid.length; i++) {
      let id = this.listValueRefid[i];
      listMap.set(id, listMap.get(id) + 1 || 1);
    }
    var isUseSuccess = data.steps.filter((x) => x.isSuccessStep)[0].isUsed;
    var isUseFail = data.steps.filter((x) => x.isFailStep)[0].isUsed;
    var dataCountInstance = [data.recID, isUseSuccess, isUseFail];
    this.dpService
      .countInstanceByProccessId(dataCountInstance)
      .subscribe((res) => {
        if (res) {
          data.totalInstance = res;
        } else {
          data.totalInstance = 0;
        }
        var datas = [data, listMap];
        this.dialog.close(datas);
      });
  }
  valueListRefID(e) {
    //bat e ve xu lys
    if (e) {
      this.listValueRefid.push(e);
    }
  }
}
