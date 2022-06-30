import { Component, Input, OnInit } from '@angular/core';
import { WP_News } from '../../models/WP_News.model';

@Component({
  selector: 'lib-approve-detail',
  templateUrl: './approve-detail.component.html',
  styleUrls: ['./approve-detail.component.css']
})
export class ApproveDetailComponent implements OnInit {

  @Input() data: any;
  @Input() option: string;
  @Input() formModel : any;
  constructor() { }

  ngOnInit(): void {
  }

}
