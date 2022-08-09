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
  selector: 'app-od-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class ODTestComponent
  implements AfterViewInit, OnChanges {
  
  constructor(inject: Injector) {
  
  }
  ngOnChanges(changes: SimpleChanges): void { }
  onInit(): void {
    
  } 

  ngAfterViewInit(): void {
   
  }
 
}
