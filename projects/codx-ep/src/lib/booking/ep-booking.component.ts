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
  funcID: any;
  queryParams: any;
  resourceType: string;
  
  constructor(
    private injector: Injector,
    private activatedRoute: ActivatedRoute
  ) {
    super(injector);
    this.funcID = this.activatedRoute.snapshot.params['funcID'];
    this.queryParams = this.router.snapshot.queryParams;
    if(this.funcID == EPCONST.FUNCID.R_Bookings){
      this.resourceType=EPCONST.VLL.ResourceType.Room;
    } 
    else if(this.funcID == EPCONST.FUNCID.C_Bookings){
      this.resourceType=EPCONST.VLL.ResourceType.Car;
    }
    else{
      this.resourceType=EPCONST.VLL.ResourceType.Stationery;
    }
  }
  onInit(){
    
  }
  ngAfterViewInit(){
    
  }
  viewChanged(evt: any) {
    this.funcID = this.activatedRoute.snapshot.params['funcID'];
    this.detectorRef.detectChanges();
    //this.onLoading(evt);
  }
}
