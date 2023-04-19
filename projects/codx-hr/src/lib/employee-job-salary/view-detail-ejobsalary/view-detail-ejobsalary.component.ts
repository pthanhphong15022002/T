import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges, ViewChild, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, DataRequest, FormModel, NotificationsService, ViewsComponent } from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/lib/codx-hr.service';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';


@Component({
  selector: 'lib-view-detail-ejobsalary',
  templateUrl: './view-detail-ejobsalary.component.html',
  styleUrls: ['./view-detail-ejobsalary.component.css']
})
export class ViewDetailEjobsalaryComponent implements OnInit{
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
  benefitFuncID = 'HRTApp04';
  benefitFormModel : FormModel;
  benefitFormGroup : FormGroup;
  lstBenefit;
  active = 1;
  dataOldSalary;
  console = console;

  ngOnInit(): void {
    this.hrService.getFormModel(this.benefitFuncID).then((formModel) => {
      if (formModel) {
        this.benefitFormModel = formModel;
        this.hrService
          .getFormGroup(this.benefitFormModel.formName, this.benefitFormModel.gridViewName)
          .then((fg) => {
            if (fg) {
              this.benefitFormGroup = fg;
            }
          });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes?.itemDetail &&
      changes.itemDetail?.previousValue?.recID !=
        changes.itemDetail?.currentValue?.recID
    ) {
      // this.hrService.loadDataEContract(changes.itemDetail?.currentValue?.recID).subscribe((res) => {
      //   if (res) {
      //     this.itemDetail = res;
      //     this.df.detectChanges();
      //   }
      // });
    }

    // console.log('thong tin hdld', this.itemDetail);

    //Get old salary on detail body
    this.hrService
    .GetOldSalaries(this.itemDetail)
    .subscribe((res) => {
      this.dataOldSalary = res;
    })

    if(this.itemDetail.benefits){
      this.lstBenefit = JSON.parse(this.itemDetail.benefits)
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
    this.hrService.handleShowHideMF(e, data, this.view);
  } 
 
  

  clickMF(evt: any, data: any = null){
    this.clickMFunction.emit({event: evt, data: data});
  }
}
