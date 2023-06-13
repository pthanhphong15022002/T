import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, FormModel, ViewsComponent } from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/lib/codx-hr.service';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';

@Component({
  selector: 'lib-view-detail-ebenefit',
  templateUrl: './view-detail-ebenefit.component.html',
  styleUrls: ['./view-detail-ebenefit.component.css'],
})
export class ViewDetailEbenefitComponent implements OnInit {
  constructor(
    private authStore: AuthStore,
    private hrService: CodxHrService,
    private router: ActivatedRoute
  ) {}

  @ViewChild('attachment') attachment;
  @ViewChild('itemDetailTemplate') itemDetailTemplate;

  @Input() itemDetail: any;
  @Input() view: ViewsComponent;
  @Input() formModel;
  @Input() hideFooter = false;
  @Output() uploaded = new EventEmitter();
  @Output() clickMFunction = new EventEmitter();

  user: any; //user loggin
  tabControl: TabModel[] = [];
  renderFooter = false;
  isAfterRender = true;
  benefitFuncID = 'HRTApp05';
  benefitFormModel: FormModel;
  benefitFormGroup: FormGroup;
  active = 1;

  ngOnInit(): void {
    this.hrService.getFormModel(this.benefitFuncID).then((formModel) => {
      if (formModel) {
        this.benefitFormModel = formModel;
        this.hrService
          .getFormGroup(
            this.benefitFormModel.formName,
            this.benefitFormModel.gridViewName
          )
          .then((fg) => {
            if (fg) {
              this.benefitFormGroup = fg;
            }
          });
      }
    });
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (
  //     changes?.itemDetail &&
  //     changes.itemDetail?.previousValue?.recID !=
  //       changes.itemDetail?.currentValue?.recID
  //   ) {
  //     this.hrService.loadDataEContract(changes.itemDetail?.currentValue?.recID).subscribe((res) => {
  //       if (res) {
  //         this.itemDetail = res;
  //         this.df.detectChanges();
  //       }
  //     });
  //   }

  //   if(this.itemDetail.benefits){
  //     this.lstBenefit = JSON.parse(this.itemDetail.benefits)
  //   }
  // }

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

  clickMF(evt: any, data: any = null) {
    this.clickMFunction.emit({ event: evt, data: data });
  }
}
