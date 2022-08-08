import {
  Component,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  Injector,
} from '@angular/core';


@Component({
  selector: 'app-od-approvel',
  templateUrl: './approvel.component.html',
  styleUrls: ['./approvel.component.scss'],
})
export class ODApprovelComponent
  implements AfterViewInit, OnChanges {
  
    funcID: any;
  constructor(inject: Injector) {
  
  }
  ngOnChanges(changes: SimpleChanges): void { }
  onInit(): void {
    
  } 

  ngAfterViewInit(): void {
   
  }
  selectedChange(e:any)
  {
    this.funcID = e?.functionID
  }
}
