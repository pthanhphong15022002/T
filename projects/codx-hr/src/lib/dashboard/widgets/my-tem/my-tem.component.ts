import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-my-tem',
  templateUrl: './my-tem.component.html',
  styleUrls: ['./my-tem.component.scss']
})
export class MyTemComponent {
  selectedTabs = 0 // 0: quản lý trực tiếp ; 1:Quản lý gián tiếp; 3:Team của tôi;

  @Input() mainContent_Id = "maincontent";
}
