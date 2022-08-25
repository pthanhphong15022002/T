import {
  Component,
  TemplateRef,
  ViewChild,
  Injector,
  Input,
  ViewEncapsulation,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  DataRequest,
  ViewModel,
  ViewType,
  RequestOption,
  ButtonModel,
  ResourceModel,
  SidebarModel,
  DialogRef,
  AuthStore,
  UrlUtil,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import * as moment from 'moment';
import { AssignInfoComponent } from 'projects/codx-share/src/lib/components/assign-info/assign-info.component';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CodxImportComponent } from 'projects/codx-share/src/lib/components/codx-import/codx-import.component';
import { CodxTMService } from '../codx-tm.service';
import { TM_TaskGroups } from '../models/TM_TaskGroups.model';
import { TM_Parameter, TM_TaskExtends } from '../models/TM_Tasks.model';
import { PopupAddComponent } from './popup-add/popup-add.component';
import { PopupConfirmComponent } from './popup-confirm/popup-confirm.component';
import { PopupExtendComponent } from './popup-extend/popup-extend.component';
import { PopupUpdateProgressComponent } from './popup-update-progress/popup-update-progress.component';
import { PopupViewTaskResourceComponent } from './popup-view-task-resource/popup-view-task-resource.component';
import { UpdateStatusPopupComponent } from './update-status-popup/update-status-popup.component';
import { ViewDetailComponent } from './view-detail/view-detail.component';
@Component({
  selector: 'codx-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TasksComponent implements OnInit {
  funcID: any;
  constructor(private activedRouter: ActivatedRoute) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  ngOnInit(): void {}
}
