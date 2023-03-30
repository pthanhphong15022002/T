import { CO_Permissions } from './../models/CO_Meetings.model';
import { CodxTMService } from './../codx-tm.service';
import {
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
  Input,
  AfterViewInit,
  ViewEncapsulation,
  Output,
  EventEmitter,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  DataRequest,
  DialogModel,
  DialogRef,
  FormModel,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CO_Meetings, CO_Resources } from '../models/CO_Meetings.model';
import { APICONSTANT } from '@shared/constant/api-const';
import { Observable, of } from 'rxjs';
import moment from 'moment';
import { PopupTabsViewsDetailsComponent } from '../popup-tabs-views-details/popup-tabs-views-details.component';

@Component({
  selector: 'codx-meetings',
  templateUrl: './tmmeetings.component.html',
  styleUrls: ['./tmmeetings.component.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class TMMeetingsComponent implements OnInit {
  funcID: any;
  constructor(
    private activedRouter: ActivatedRoute,

  ) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];

  }
  ngOnInit(): void {}

  // getResourecesNew(arrayResource) {
  //   if (arrayResource?.length > 0) {
  //     var idResources = arrayResource.map((x) => {
  //       return x.resourceID;
  //     });
  //     if (!this.listResources)
  //       return this.resourcesNew.emit(idResources.join(';'));
  //     let arrResOld = this.listResources.split(';');
  //     let idNew = [];
  //     idResources.forEach((obj) => {
  //       let dt = arrResOld.find((x) => x == obj);
  //       if (dt) idNew.push(dt);
  //     });
  //     return this.resourcesNew.emit(idNew.join(';'));
  //   }
  // }
}
