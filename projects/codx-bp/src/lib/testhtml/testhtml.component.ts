import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'lib-testhtml',
  templateUrl: './testhtml.component.html',
  styleUrls: ['./testhtml.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TesthtmlComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
