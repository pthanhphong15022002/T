declare var window: any;
import {
  Component,
  Injector,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  UIComponent,
} from 'codx-core';
import { EPCONST } from '../codx-ep.constant';

@Component({
  selector: 'ep-booking',
  templateUrl: './ep-booking.component.html',
  styleUrls: ['./ep-booking.component.scss'],
})
export class EPBookingComponent extends UIComponent implements AfterViewInit {
  queryParams: any;
  
  constructor(
    private injector: Injector,
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
