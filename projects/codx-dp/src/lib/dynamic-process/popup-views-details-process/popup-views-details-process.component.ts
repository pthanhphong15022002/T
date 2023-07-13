import { DP_Processes } from './../../models/models';
import {
  AfterViewInit,
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
  NotificationsService,
  ApiHttpService,
} from 'codx-core';
import { TabModel } from '../../models/models';
import { DomSanitizer } from '@angular/platform-browser';
import { CodxDpService } from '../../codx-dp.service';
import { firstValueFrom } from 'rxjs';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { environment } from 'src/environments/environment';
import { FileService } from '@shared/services/file.service';

@Component({
  selector: 'lib-popup-views-details-process',
  templateUrl: './popup-views-details-process.component.html',
  styleUrls: ['./popup-views-details-process.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupViewsDetailsProcessComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('popupGuide') popupGuide;
  @ViewChild('viewDetail') viewDetail: TemplateRef<any>;
  @ViewChild('viewKanban') viewKanban: TemplateRef<any>;
  @ViewChild('flowChart') flowChart: TemplateRef<any>;
  //temp
  @ViewChild('titleTmpStep') titleTmpStep: TemplateRef<any>;
  @ViewChild('footerStep') footerStep: TemplateRef<any>;
  @ViewChild('addFlowchart') addFlowchart: AttachmentComponent;

  dialog: DialogRef;
  name = 'Kanban';
  isCreate = false;
  process = new DP_Processes();
  dialogGuide: DialogRef;
  headerText = 'Hướng dẫn các bước thực hiện';
  // openPop =false ;
  listValueRefid: string[] = [];
  stepNames = [];
  tabInstances = [];
  tabControl: TabModel[] = [
    {
      name: 'Detail',
      textDefault: 'Chi tiết quy trình',
      isActive: false,
      icon: 'icon-storage',
    },
    {
      name: 'Kanban',
      textDefault: 'Kanban',
      isActive: true,
      icon: 'icon-table_chart',
    },
    {
      name: 'FlowChart',
      textDefault: 'Biểu đồ',
      isActive: false,
      icon: 'icon-wallpaper',
    },
  ];
  listType = [];
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
  dataObj: any;
  // link File
  linkFile;
  hideMoreFC = false;
  dataFile: any;
  heightFlowChart = 700;
  loadFlow = false;
  offset = '0px'; //47
  loadedFigureOut = false;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private api: ApiHttpService,
    public sanitizer: DomSanitizer,
    private callFunc: CallFuncService,
    private dpService: CodxDpService,
    private cache: CacheService,
    private fileService: FileService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.process = dt?.data?.data;
    this.isCreate = dt.data.isCreate;
    this.dpService
      .updateHistoryViewProcessesAsync(this.process.recID)
      .subscribe();
    this.dataObj = { processID: this.process.recID };
    this.getFlowChart(this.process.recID);
  }

  async ngOnInit(): Promise<void> {
    if (this.process?.steps?.length > 0) {
      this.process?.steps?.forEach((step) => {
        this.groupByTask(step);
      });
      console.log(this.process.steps.map((step) => step.taskGroups));
      let data = await firstValueFrom(this.cache.valueList('DP004'));
      this.listType = data ? data?.datas : [];
    }
    //47
    this.offset = '47px';
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadedFigureOut = true;
    }, 500);
  }

  clickMenu(item) {
    for (let i = 0; i < this.tabControl.length; i++) {
      if (this.tabControl[i].isActive == true) {
        this.tabControl[i].isActive = false;
      }
    }
    item.isActive = true;
    this.name = item.name;
    // this.changeDetectorRef.detectChanges();
  }

  groupByTask(step) {
    let listGroupTask;
    const taskGroupList = step?.tasks?.reduce((group, task) => {
      const { taskGroupID } = task;
      group[taskGroupID] = group[taskGroupID] ?? [];
      group[taskGroupID].push(task);
      return group;
    }, {});
    const taskGroupConvert = step['taskGroups'].map((taskGroup) => {
      let tasks = taskGroupList[taskGroup['recID']] ?? [];
      return {
        ...taskGroup,
        tasks: tasks.sort((a, b) => a['indexNo'] - b['indexNo']),
      };
    });
    // this.currentStep['taskGroups'] = taskGroupConvert;
    listGroupTask = taskGroupConvert;
    if (taskGroupList['null']) {
      let taskGroup = {};
      taskGroup['tasks'] =
        taskGroupList['null']?.sort((a, b) => a['indexNo'] - b['indexNo']) ||
        [];
      taskGroup['recID'] = null; // group task rỗng để kéo ra ngoài
      listGroupTask.push(taskGroup);
    }
    step['taskGroups'] = listGroupTask;
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
    // let listMap = new Map();
    // for (let i = 0; i < this.listValueRefid.length; i++) {
    //   let id = this.listValueRefid[i];
    //   listMap.set(id, listMap.get(id) + 1 || 1);
    // }
    // var isUseSuccess = data.steps.filter((x) => x.isSuccessStep)[0].isUsed;
    // var isUseFail = data.steps.filter((x) => x.isFailStep)[0].isUsed;
    // var dataCountInstance = [data.recID, isUseSuccess, isUseFail];
    // this.dpService
    //   .countInstanceByProccessId(dataCountInstance)
    //   .subscribe((res) => {
    //     if (res) {
    //       data.totalInstance = res;
    //     } else {
    //       data.totalInstance = 0;
    //     }
    //     var datas = [data, listMap];
    //     this.dialog.close(datas);
    //   });
    this.dialog.close();
  }
  valueListRefID(e) {
    //bat e ve xu lys
    if (e) {
      this.listValueRefid.push(e);
    }
  }

  //flowChart

  getFlowChart(recID) {
    let param = [recID, 'DP_Processes', 'Flowchart'];
    this.api
      .execSv<any>('DM', 'DM', 'FileBussiness', 'GetFileByOORAsync', param)
      .subscribe((res) => {
        if (res) {
          this.dataFile = res;
          this.linkFile = environment.urlUpload + '/' + this.dataFile?.pathDisk;
          this.changeDetectorRef.detectChanges();
        }
        this.loadFlow = true;
      });
  }
  addFile(evt: any) {
    this.addFlowchart.referType = 'Flowchart';
    this.addFlowchart.uploadFile();
  }

  fileSave(e) {
    if (e && typeof e === 'object') {
      this.dataFile = e;
      this.linkFile = environment.urlUpload + '/' + this.dataFile?.pathDisk;
      this.changeDetectorRef.detectChanges();
    }
    this.addFlowchart.clearData();
  }

  printFlowchart() {
    this.linkFile = environment.urlUpload + '/' + this.dataFile?.pathDisk;
    if (this.linkFile) {
      const output = document.getElementById('output');
      const img = document.createElement('img');
      img.src = this.linkFile;
      output.appendChild(img);
      const br = document.createElement('br');
      output.appendChild(br);
      window.print();
    } else
      window.frames[0]?.postMessage(
        JSON.stringify({ MessageId: 'Action_Print' }),
        '*'
      );
  }

  async download(): Promise<void> {
    var id = this.dataFile?.recID;
    var fullName = this.dataFile.fileName;
    var that = this;

    if (this.dataFile.download) {
      this.fileService.downloadFile(id).subscribe(async (res) => {
        if (res) {
          // let blob = await fetch(this.linkFile).then((r) => r.blob());
          //Khuc nay dang loi
          let blob = await fetch(environment.urlUpload + '/' + res).then((r) =>
            r.blob()
          );
          let url = window.URL.createObjectURL(blob);
          var link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', fullName);
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
    } else {
      this.notiService.notifyCode('SYS018');
    }
  }

  getHeight() {
    let viewContent = document.getElementById('view-detail-process');
    // let viewMenu = document.getElementById('menu-flowchart') ;
    return (viewContent?.offsetHeight ?? 700) - 100;
  }
  //end
}
