import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'codx-view-approve',
  templateUrl: './codx-view-approve.component.html',
  styleUrls: ['./codx-view-approve.component.scss'],
})
export class CodxViewApproveComponent implements OnInit, OnChanges {
  @Input() listApprover;
  @Input() categoryID;
  
  viewApprover;

  private destroyFrom$: Subject<void> = new Subject<void>();
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,

  ) {}

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.listApprover || changes?.categoryID){
      if(!this.listApprover && this.categoryID){
        this.loadListApproverStep();
      }
    }
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
