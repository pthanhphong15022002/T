import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'codx-no-data',
  templateUrl: './codx-no-data.component.html',
  styleUrls: ['./codx-no-data.component.scss']
})
export class CodxNoDataComponent implements OnInit {
  @Input() size = 200;
  width = ''
  ngOnInit(): void {
    this.width = this.size.toString() + 'px';
  }

}
