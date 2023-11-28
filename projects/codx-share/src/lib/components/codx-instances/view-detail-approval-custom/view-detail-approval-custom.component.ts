import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ApiHttpService, CacheService, FormModel } from 'codx-core';
import { CodxShareService } from '../../../codx-share.service';

@Component({
  selector: 'codx-view-detail-approval-custom',
  templateUrl: './view-detail-approval-custom.component.html',
  styleUrls: ['./view-detail-approval-custom.component.css'],
})
export class ViewDetailApprovalCustomComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Input() transID: any; // Id nv
  @Input() funcID; //funcNV goc

  files: any[];
  itemDetail: any; // es singeer File
  isFristVer: boolean;
  showFile = true;
  itemDetailStt = 1; //so thu tu view tabs
  formModel: FormModel;
  hideMF = true;
  detailModule: any;
  vllApprove = 'DP043';

  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    // { name: 'AssignTo', textDefault: 'Giao việc', isActive: false },
    { name: 'References', textDefault: 'Nguồn công việc', isActive: false },
  ];
  aprovelTrans: any;
  processType: any;
  curTransID: any;
  listTaskType = [];
  loaded: boolean = false;

  constructor(
    private changeDecRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private shareService: CodxShareService,
    private cache: CacheService
  ) {
    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listTaskType = res?.datas;
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.getFiles();
    this.loaded = false;
    this.shareService.dataApproveTrans.subscribe((res) => {
      if (res && this.curTransID != this.transID) {
        this.aprovelTrans = res;
        this.curTransID = this.transID;
        this.processType = this.aprovelTrans.processType;
        this.getDataView();
      } else this.loaded = true;
    });
  }

  ngOnInit(): void {
    console.log(this.funcID);
  }
  ngAfterViewInit(): void {}

  getFiles() {
    this.api
      .execSv<any>(
        'ES',
        'ERM.Business.ES',
        'SignFilesBusiness',
        'GetByRecIDAsync', //'GetViewDetailAsync',
        [this.transID] //, this.funcID
      )
      .subscribe((result) => {
        if (result) {
          this.itemDetail = result;
          this.isFristVer = this.itemDetail?.approveStatus != '5';
          // if(this.runMode!= '1' && this.data?.unbounds){
          //   this.itemDetail.unbounds=this.data?.unbounds;
          // }
          this.files = [];
          if (this.itemDetail?.files?.length > 0) {
            let lstID = this.itemDetail?.files.map((x) => x.fileID);
            this.api
              .execSv<any>(
                'DM',
                'ERM.Business.DM',
                'FileBussiness',
                'GetListFileByIDAsync',
                [JSON.stringify(lstID)]
              )
              .subscribe((res) => {
                this.files = res;
                this.changeDecRef.detectChanges();
              });
          }
        }
      });
  }

  //getDataViewS
  getDataView() {
    this.loaded = false;
    let service = 'DP';
    let className = 'ActivitiesBusiness';
    let method = 'GetViewDetailsApprovelAsync';
    switch (this.processType) {
      case 'DP_Instances_Steps_Tasks':
        className = 'InstancesStepsTasksBusiness';
        break;
      case 'DP_Activities':
        className = 'ActivitiesBusiness';
        break;
      case 'DP_Instances':
        className = 'InstancesBusiness';
        break;
      case 'DP_Instances_Steps':
        className = 'InstancesStepsBusiness';
        break;
    }
    this.api
      .execSv<any>(service, service, className, method, this.transID)
      .subscribe((res) => {
        if (res) {
          this.detailModule = res;
        }
        this.loaded = true;
        this.changeDecRef.detectChanges();
      });
  }
  getName(applyFor) {
    //xuw ly tam  dua vao pipe sau ;
    let parentCategory = '';
    switch (applyFor) {
      case '1':
        parentCategory = 'Cơ hội';
        break;
      case '2':
        parentCategory = 'Sự cố';
        break;
      case '3':
        parentCategory = 'Yêu cầu';
        break;
      case '4':
        parentCategory = 'Hợp đồng';
        break;
      case '5':
        parentCategory = 'Tiềm năng';
        break;
    }
    return parentCategory;
  }
}

export class ViewDetailsApproval {
  title: string; // tên của đối tượng cần duyệt
  applyFor: string; // tên loai cơ hội, leadName, ...
  parentName: string; // tên cơ hội, leadName, ...
  stepName: string; // tên bước công việc nếu có
  instanceName: string; // tên bước công việc nếu có
  taskType: string; // loaij coong vieecj
  owner: string; // người phụ trách đối tuong duêt
  ownerName: string;
  status: string; // trang thai cong viec
  approveStatus: string; // tình trang duyet
  startDate: Date; // ngày bắt đầu
  endDate: Date; // ngày kết thúc
}
