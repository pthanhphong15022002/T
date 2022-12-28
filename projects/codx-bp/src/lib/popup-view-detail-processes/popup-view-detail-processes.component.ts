import { ProcessStepsComponent } from './../processsteps/processsteps.component';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { FileService } from '@shared/services/file.service';
import {
  ApiHttpService,
  ButtonModel,
  CacheService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { BP_Processes, TabModel } from '../models/BP_Processes.model';
import { environment } from 'src/environments/environment';
import {
  ToolbarService,
  PrintService,
} from '@syncfusion/ej2-angular-documenteditor';
import { CodxBpService } from '../codx-bp.service';
@Component({
  selector: 'lib-popup-view-detail-processes',
  templateUrl: './popup-view-detail-processes.component.html',
  styleUrls: ['./popup-view-detail-processes.component.scss'],
  providers: [ToolbarService, PrintService],
})
export class PopupViewDetailProcessesComponent implements OnInit {
  @ViewChild('addFlowchart') addFlowchart: AttachmentComponent;
  @ViewChild('viewProcessSteps') viewProcessSteps: ProcessStepsComponent;
  process: any;
  viewMode = '16';
  funcID = 'BPT11'; //testsau klaay từ more ra
  name = 'ViewList';
  offset = '75px';
  dialog!: DialogRef;
  data: any;
  moreFunc: any;
  title = '';
  // tabControl: TabModel[] = [];
  active = 0;
  dataFile: any;
  formModel: any;
  linkFile: any;
  tabControl: TabModel[] = [
    { name: 'ViewList', textDefault: 'Viewlist', isActive: true, id: 16 },
    { name: 'Kanban', textDefault: 'Kanban', isActive: false, id: 6 },
    { name: 'Flowchart', textDefault: 'Flowchart', isActive: false, id: 9 },
  ];
  tabView :any ;
  formModelFlowChart: FormModel;
  listPhaseName = [];
  childFunc = [];
  mfAdd: any;
  isShowButton = true;
  isEdit = true;
  listuserStr = '';

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private fileService: FileService,
    private bpService: CodxBpService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = dt?.data;
    this.isEdit = dt?.data?.editRole;
    this.process = JSON.parse(JSON.stringify(this.data.data));
    this.moreFunc = this.data?.moreFunc;
    this.title = this.moreFunc?.customName;
    this.formModel = this.data?.formModel;

    this.cache.functionList(this.funcID).subscribe((f) => {
      if (f) {
        this.formModelFlowChart = f.formModel;
      }
    });
    //this.getFlowChart(this.process)

    this.bpService
      .getListFunctionMenuCreatedStepAsync(this.funcID)
      .subscribe((datas) => {
        if (datas) {
          this.childFunc = datas;
        }
      });
    this.bpService
      .updateHistoryViewProcessesAsync(this.process.recID)
      .subscribe();
    this.getListUser();
  }

  ngOnInit(): void {
    this.tabView = this.tabControl.find(
      (x: TabModel) => x.isActive == true
    );
    this.changeDetectorRef.detectChanges();
  }

  getListUser() {
    this.bpService.getUserByProcessId(this.process.recID).subscribe((res) => {
      if (res) {
        this.listuserStr = res;
      }
    });
  }

  clickMenu(item) {
    this.name = item.name;
    this.tabControl.forEach((obj) => {
      if (obj.isActive == true) {
        obj.isActive = false;
        return;
      }
    });
    item.isActive = true;
    this.viewMode = item.id;
    // if(item.id == 6 || item.id == 16){
    this.viewProcessSteps?.chgViewModel(item.id);   
    // }
    this.changeDetectorRef.detectChanges();
  }

  // getFlowChart(process) {
  //   let paras = [
  //     '',
  //     this.funcID,
  //     process?.recID,
  //     'BP_Processes',
  //     'inline',
  //     1000,
  //     process?.processName,
  //     'Flowchart',
  //     false,
  //   ];
  //   this.api
  //     .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', paras)
  //     .subscribe((res) => {
  //       if (res && res?.url) {
  //         let obj = { pathDisk: res?.url, fileName: process?.processName };
  //         this.dataFile = obj;
  //         this.changeDetectorRef.detectChanges();
  //       }
  //     });
  // }
  // async addFile(evt: any) {
  //   this.addFlowchart.referType = 'Flowchart';
  //   this.addFlowchart.uploadFile();
  // }

  // fileSave(e) {
  //   if (e && typeof e === 'object') {
  //     this.dataFile = e;
  //     this.changeDetectorRef.detectChanges();
  //   }
  // }

  // printFlowchart() {
  //   if (this.linkFile) {
  //     const output = document.getElementById('output');
  //     const img = document.createElement('img');
  //     img.src = this.linkFile;
  //     output.appendChild(img);
  //     const br = document.createElement('br');
  //     output.appendChild(br);
  //     window.print();

  //     document.body.removeChild(output);
  //   } else
  //     window.frames[0]?.postMessage(
  //       JSON.stringify({ MessageId: 'Action_Print' }),
  //       '*'
  //     );
  // }

  // checkDownloadRight() {
  //   return this.dataFile.download;
  // }
  // async download(): Promise<void> {
  //   var id = this.dataFile?.recID;
  //   var fullName = this.dataFile.fileName;
  //   var that = this;

  //   if (this.checkDownloadRight()) {
  //     ///lấy hàm của chung dang fail
  //     this.fileService.downloadFile(id).subscribe(async (res) => {
  //       if (res) {
  //         let blob = await fetch(res).then((r) => r.blob());
  //         let url = window.URL.createObjectURL(blob);
  //         var link = document.createElement('a');
  //         link.setAttribute('href', url);
  //         link.setAttribute('download', fullName);
  //         link.style.display = 'none';
  //         document.body.appendChild(link);
  //         link.click();
  //         document.body.removeChild(link);
  //       }
  //     });
  //   } else {
  //     this.notiService.notifyCode('SYS018');
  //   }
  // }
  openPopUp() {}
  clickButtonAdd() {
    let value = this.childFunc.find((x) => x.id === 'P');
    this.clickButton(value);
  }

  clickButton(e: ButtonModel) {
    this.viewProcessSteps?.click(e);
  }
  getObjectFile(e) {
    if (e) {
      this.bpService.getFlowChartNew.next(e);
    }
  }
}
