import { ChangeDetectorRef, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ButtonModel, CallFuncService, DialogRef, NotificationsService, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { ActivatedRoute } from '@angular/router';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupPolicyalComponent } from './popup-policyal/popup-policyal.component';

@Component({
  selector: 'lib-employee-policyal',
  templateUrl: './employee-policyal.component.html',
  styleUrls: ['./employee-policyal.component.css']
})
export class EmployeePolicyalComponent {


}
