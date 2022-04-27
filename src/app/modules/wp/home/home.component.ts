import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ApiHttpService, DataRequest } from 'codx-core';
import { mode } from 'crypto-js';

@Component({
  selector: 'codx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  functionID = "WPT02";
  entityName = "WP_News";
  gridViewName ="grvNews";
  predicate = "Category != @0 && ApproveStatus = @1";
  datavalue = "0;5";
  sortColumns = "CreatedOn";
  sortDirections =  "desc";
  sliderNews = [];
  sliderData = [];
  listSlider = []
  @ViewChild('listViewNews') listViewNews:any;
  constructor(private api: ApiHttpService) { }
  
  ngOnInit(): void {
    var model = new DataRequest();
    model.funcID = this.functionID,
    model.predicate = this.predicate;
    model.dataValue = this.datavalue;
    model.predicates = "NewsType = @0"
    model.dataValues = "2";
    model.pageLoading = true;
    model.page = 1;
    model.pageSize = 6;
    model.formName = "News";
    model.gridViewName ="grvNews";
    model.entityName = "WP_News";
    model.srtColumns = this.sortColumns;
    model.srtDirections = this.sortDirections;
    this.api.execSv("WP","ERM.Business.WP","NewsBusiness","GetListNewsAsync",model).subscribe(
      (value) => {
        this.sliderData = value[0];
        this.sliderNews = this.sliderData.splice(0,3);
        this.listSlider.push(this.sliderNews);
        this.listSlider.push(this.sliderData);
      }
    );
  }

  searchEvent(event:any){
  }

  
  
  

}
