import { Component, Input, OnInit } from '@angular/core';
import { CodxCmService } from '../../../codx-cm.service';
import { FormModel } from 'codx-core';

@Component({
  selector: 'codx-view-dealcompetitors',
  templateUrl: './view-dealcompetitors.component.html',
  styleUrls: ['./view-dealcompetitors.component.css']
})
export class ViewDealcompetitorsComponent implements OnInit {
  @Input() competitorID: any;
  lstDealCompetitor = [];
  fromModelDeal: FormModel = {
    formName: 'CMDeals',
    gridViewName: 'grvCMDeals',
    entityName: 'CM_Deals'
  }
  fromModelDealCompetitor: FormModel = {
    formName: 'CMDealsCompetitors',
    gridViewName: 'grvCMDealsCompetitors',
    entityName: 'CM_DealsCompetitors'
  }
  constructor(
    private cmSv: CodxCmService,
  ) {}

  ngOnInit(): void {
    this.getListDealAndDealCompetitor(this.competitorID);
  }


  getListDealAndDealCompetitor(competitorID){
    this.cmSv.getListDealAndDealCompetitor(competitorID).subscribe(res => {
      if(res && res.length > 0){
        this.lstDealCompetitor = res;
      }
    })
  }

  getFormModel(){

  }
}
