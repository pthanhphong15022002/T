import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'codx-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css']
})
export class InformationComponent implements OnInit {

  isCheckView = true;

  constructor() { }

  ngOnInit(): void {
  }

}
