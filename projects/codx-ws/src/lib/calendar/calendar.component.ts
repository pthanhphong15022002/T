import { Component, Injector } from '@angular/core';
import { WSUIComponent } from '../default/wsui.component';

@Component({
  selector: 'lib-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent extends WSUIComponent{
  constructor(inject: Injector) 
  {
    super(inject);
  }
  
  override onInit(): void {
    throw new Error('Method not implemented.');
  }

}
