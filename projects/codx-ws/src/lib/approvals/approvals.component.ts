import { AfterViewInit, Component, ComponentRef, Type, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { WSUIComponent } from '../default/wsui.component';
import { CodxApprovalComponent } from 'projects/codx-share/src/lib/components/codx-approval/codx-approval.component';
import { RequestReviewComponent } from './request-review/request-review.component';

@Component({
  selector: 'lib-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.css']
})
export class ApprovalsComponent extends WSUIComponent implements AfterViewInit {
 
  @ViewChild('content', { read: ViewContainerRef, static: false })
  content!: ViewContainerRef;
  private components = {
    cpnApproval: RequestReviewComponent,
  };
  override onInit(): void {
  }
  ngAfterViewInit(): void {
    this.loadContent()
  }
  loadContent()
  {
    let component: Type<any> = this.components.cpnApproval;
    this.content.createComponent<RequestReviewComponent>(component);
  }
}
