import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService, DialogData, DialogRef, FormModel } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { BP_Processes, TabModel } from '../models/BP_Processes.model';

@Component({
  selector: 'lib-popup-view-detail-processes',
  templateUrl: './popup-view-detail-processes.component.html',
  styleUrls: ['./popup-view-detail-processes.component.scss'],
})
export class PopupViewDetailProcessesComponent implements OnInit {
  @ViewChild('addFlowchart') addFlowchart: AttachmentComponent;
  process!: BP_Processes;
  viewMode = '16';
  funcID="BPT11" //testsau klaay từ more ra
  name = 'ViewList';
  offset = '59px';
  dialog!: DialogRef;
  data: any;
  moreFunc: any;
  title = '';
  tabControl: TabModel[] = [];
  active = 0 ;
  dataFile : any
  formModel :any
  all: TabModel[] = [
    { name: 'ViewList', textDefault: 'Viewlist', isActive: true, id : 16 },
    { name: 'Kanban', textDefault: 'Kanban', isActive: false,id : 6  },
    { name: 'Flowchart', textDefault: 'Flowchart', isActive: false,id : 1000 },
  ];
  formModelFlowChart :FormModel ;
  listPhaseName = []

  constructor(
    private api: ApiHttpService,   
    private cache: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = dt?.data;
    this.process = this.data?.data;
    this.moreFunc = this.data?.moreFunc;
    this.title = this.moreFunc?.customName;
    this.formModel = this.data?.formModel
    this.cache.functionList(this.funcID).subscribe(f=>{
      if(f){
        this.formModelFlowChart = f.formModel
        // this.formModelFlowChart.funcID = this.funcID
        // this.formModelFlowChart.formName = f?.formName
        // this.formModelFlowChart.gridViewName = f?.gridViewName
      }
    })
    this.getFlowChart(this.process)
  }

  ngOnInit(): void {
    if (this.tabControl.length == 0) {
      this.tabControl = this.all;
    } 
    else {
      this.active = this.tabControl.findIndex(
        (x: TabModel) => x.isActive == true
      );
    }
    this.changeDetectorRef.detectChanges();
  }

  clickMenu(item) {
    this.name = item.name;
    // this.viewMode = item.id
    this.tabControl.forEach((obj) => {
      if (obj.isActive == true) {
        obj.isActive = false;
        return;
      }
    });
    item.isActive = true;
    if( this.name=="Flowchart") this.offset = '0px' ;else this.offset ="59px"
    this.changeDetectorRef.detectChanges();
  }

  getFlowChart(process) {
    let paras = [
      '',
      this.funcID,
      process?.recID,
      'BP_Processes',
      'inline',
      1000,
      process?.processName,
      'Flowchart',
      false,
    ];
    this.api
      .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', paras)
      .subscribe((res) => {
        if (res&& res?.url) {
          let obj = { pathDisk: res?.url, fileName: process?.processName };
          this.dataFile = obj;
        }
      });
  }
  async addFile(evt: any) {
    this.addFlowchart.referType = 'Flowchart';
    this.addFlowchart.uploadFile();
  }
  fileAdded(e) {
    if (e && e?.data?.length > 0) {
      this.dataFile = e.data[0];
    }
    this.changeDetectorRef.detectChanges();
  }

  getfileCount(e) {}
}
