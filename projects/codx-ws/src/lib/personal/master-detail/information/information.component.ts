import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css']
})
export class InformationComponent {
  @Input() menuFunctionID:any;
}
