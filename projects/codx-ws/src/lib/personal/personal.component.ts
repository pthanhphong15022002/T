import { Component } from '@angular/core';
import { WSUIComponent } from '../default/wsui.component';

@Component({
  selector: 'lib-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css']
})
export class PersonalComponent extends WSUIComponent{
  override onInit(): void {
    throw new Error('Method not implemented.');
  }

  selectedChange(e:any)
  {
  }
}
