import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'codx-no-data',
  templateUrl: './codx-no-data.component.html',
  styleUrls: ['./codx-no-data.component.scss']
})
export class CodxNoDataComponent implements OnInit{
  @Input() size = 200;
  @Input() type = 200;
  @Input() mesCode = "SYS011";
  @Input() mould = "1";
  @Input() isLoading = false;

  width = ''
  ngOnInit(): void {
    this.width = this.size.toString() + 'px';
  }

}
