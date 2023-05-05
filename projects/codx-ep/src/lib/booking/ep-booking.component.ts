declare var window: any;
import {
  Component,
  TemplateRef,
  ViewChild,
  Injector,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  DataRequest,
  DialogRef,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  CallFuncService,
  ViewType,
  FormModel,
  NotificationsService,
  AuthService,
  CodxScheduleComponent,
  Util,
} from 'codx-core';
import { CodxEpService } from '../codx-ep.service';

@Component({
  selector: 'ep-booking',
  templateUrl: './ep-booking.component.html',
  styleUrls: ['./ep-booking.component.scss'],
})
export class EPBookingComponent extends UIComponent implements AfterViewInit {
  funcID: any;
  queryParams: any;
  
  constructor(
    private injector: Injector,
    private callFuncService: CallFuncService,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {
    super(injector);
    this.funcID = this.activatedRoute.snapshot.params['funcID'];
    this.queryParams = this.router.snapshot.queryParams;
    
  }
  onInit(){
    
  }
  ngAfterViewInit(){
    
  }
}
