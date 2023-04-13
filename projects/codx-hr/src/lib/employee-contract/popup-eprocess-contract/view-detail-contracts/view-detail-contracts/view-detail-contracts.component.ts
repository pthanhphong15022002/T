import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, DataRequest, NotificationsService, ViewsComponent } from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/lib/codx-hr.service';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';

@Component({
  selector: 'lib-view-detail-contracts',
  templateUrl: './view-detail-contracts.component.html',
  styleUrls: ['./view-detail-contracts.component.css']
})
export class ViewDetailContractsComponent {
  constructor(
    private authStore: AuthStore,
    private hrService: CodxHrService,
    private router: ActivatedRoute,
    private df: ChangeDetectorRef,
    private notify: NotificationsService,
  ) {
    this.funcID = this.router.snapshot.params['funcID'];
    this.user = this.authStore.get();
  }

  @ViewChild('attachment') attachment;
  @ViewChild('itemDetailTemplate') itemDetailTemplate;


  @Input() funcID;
  @Input() formModel;
  @Input() view: ViewsComponent;
  @Input() itemDetail: any;
  @Input() hideFooter = false;
  @Output() uploaded = new EventEmitter();
  @Output() clickMFunction = new EventEmitter();

  user: any; //user loggin
  tabControl: TabModel[] = [];
  renderFooter = false;
  isAfterRender = true;

  ngOnChanges(changes: SimpleChanges) {
    debugger
    if (
      changes?.itemDetail &&
      changes.itemDetail?.previousValue?.recID !=
        changes.itemDetail?.currentValue?.recID
    ) {
      // let dataRq = new DataRequest();
      // dataRq.gridViewName = 'grvEContracts';
      // dataRq.entityName = 'HR_EContracts';
      // dataRq.predicate = 'RecID=@0';
      // dataRq.dataValue = changes.itemDetail?.currentValue?.recID;
      // dataRq.page = 1;
      this.hrService.loadDataEContract(changes.itemDetail?.currentValue?.recID).subscribe((res) => {
        if (res) {
          this.itemDetail = res;
          this.df.detectChanges();
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.tabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true },
      { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
      { name: 'Comment', textDefault: 'Bình luận', isActive: false },
      { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
    ];
  }

  changeDataMF(e: any, data: any) {
    debugger
    this.hrService.handleShowHideMF(e, data, this.view);
  } 

  // clickMF(val: any, datas: any = null){
  //   var funcID = val?.functionID;
  //   if (!datas) {
  //     datas = this.itemDetail;
  //   } else {
  //     var index = this.view.dataService.data.findIndex((object) => {
  //       return object.recID === datas.recID;
  //     });
  //     if (index >= 0) {
  //       datas = this.view.dataService.data[index];
  //     }
  //   }
  //   this.clickMFunction.emit({event: val, data: datas});
  // }
  

  clickMF(evt: any, data: any = null){

    this.clickMFunction.emit({event: evt, data: data});
  }
}
