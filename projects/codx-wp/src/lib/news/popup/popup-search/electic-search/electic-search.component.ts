import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-electic-search',
  templateUrl: './electic-search.component.html',
  styleUrls: ['./electic-search.component.scss']
})
export class ElecticSearchComponent implements OnInit {

  dataSource: [];
  constructor() { }

  ngOnInit(): void {
    console.log('dataSource ElecticSearch: ',this.dataSource)
  }

}
