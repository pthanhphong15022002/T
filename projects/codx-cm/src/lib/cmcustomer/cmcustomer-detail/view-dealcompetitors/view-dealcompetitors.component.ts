import { Component, OnInit } from '@angular/core';
import { CodxCmService } from '../../../codx-cm.service';

@Component({
  selector: 'codx-view-dealcompetitors',
  templateUrl: './view-dealcompetitors.component.html',
  styleUrls: ['./view-dealcompetitors.component.css']
})
export class ViewDealcompetitorsComponent implements OnInit {


  constructor(
    private cmSv: CodxCmService,
  ) {}

  ngOnInit(): void {
  }



}
