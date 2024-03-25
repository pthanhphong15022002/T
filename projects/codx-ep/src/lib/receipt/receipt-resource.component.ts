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
  selector: 'receipt-resource',
  templateUrl: './receipt-resource.component.html',
  styleUrls: ['./receipt-resource.component.scss'],
})
export class ReceiptResourceComponent extends UIComponent implements AfterViewInit {
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
