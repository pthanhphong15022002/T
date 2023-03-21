import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'codx-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css']
})
export class InformationComponent implements OnInit {

  @Input() funcID = 'CM0101'; //True - Khách hàng; False - Liên hệ

  constructor() { }

  ngOnInit(): void {
  }

}
