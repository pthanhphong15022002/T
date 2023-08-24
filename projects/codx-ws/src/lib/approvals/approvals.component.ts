import { Component } from '@angular/core';
import { WSUIComponent } from '../default/wsui.component';

@Component({
  selector: 'lib-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.css']
})
export class ApprovalsComponent extends WSUIComponent{
  override onInit(): void {
    throw new Error('Method not implemented.');
  }

}
