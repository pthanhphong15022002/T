import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-show-more-less',
  templateUrl: './show-more-less.component.html',
  styleUrls: ['./show-more-less.component.css']
})
export class ShowMoreLessComponent implements OnInit {
  @Input('name') name: string;
  @Input('viewFormModel') viewFormModel: string;
  @Input('fieldName') fieldName: string;
  @Input('tmpName') tmpName: string;
  @Input('customName') customName: string;
  @Input('gridViewName') gridViewName: string;
  constructor() { }

  ngOnInit(): void {
  }

}
