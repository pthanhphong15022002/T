import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  Optional,
  SimpleChanges,
} from '@angular/core';
import { ApiHttpService, DialogData, DialogRef } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'codx-view-approve',
  templateUrl: './codx-view-approve.component.html',
  styleUrls: ['./codx-view-approve.component.scss'],
})
export class CodxViewApproveComponent implements OnInit, OnChanges {
  @Input() listApprover;
  @Input() change;
  @Input() categoryID;
  @Input() type = 1;
  
  viewApprover;
  dialog;

  private destroyFrom$: Subject<void> = new Subject<void>();
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.dialog = dialog;
    this.categoryID = dt?.data?.categoryID;
    this.type = dt?.data?.type || "1";
  }

  ngOnInit(): void {
    this.loadListApproverStep();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if(changes?.listApprover || changes?.categoryID ||  changes?.change){
    //   if(!this.listApprover && this.categoryID){
    //     this.loadListApproverStep();
    //   }
    // }
  }
 
  loadListApproverStep() {
    this.getListAproverStepByCategoryID(this.categoryID)
      .pipe(takeUntil(this.destroyFrom$))
      .subscribe((res) => {
        if (res) {
          this.listApprover = res;
          this.changeDetectorRef.markForCheck();
        }
      });
  }
  getListAproverStepByCategoryID(categoryID) {
    return this.api.exec<any>(
      'ES',
      'ApprovalStepsBusiness',
      'GetListStepByCategoryIDAsync',
      categoryID
    );
  }
  popoverApproverStep(p, data) {
    if (!data) {
      p.close();
      return;
    }
    if (p.isOpen()) p.close();
    this.viewApprover = data;
    p.open();
  }
  
}
