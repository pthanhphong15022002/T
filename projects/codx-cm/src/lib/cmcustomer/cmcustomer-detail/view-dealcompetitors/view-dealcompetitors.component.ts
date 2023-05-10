import { Component, Input, OnInit } from '@angular/core';
import { CodxCmService } from '../../../codx-cm.service';
import { FormModel } from 'codx-core';
import { X } from '@angular/cdk/keycodes';

@Component({
  selector: 'codx-view-dealcompetitors',
  templateUrl: './view-dealcompetitors.component.html',
  styleUrls: ['./view-dealcompetitors.component.css'],
})
export class ViewDealcompetitorsComponent implements OnInit {
  @Input() competitorID: any;
  lstDealCompetitor = [];
  fromModelDeal: FormModel = {
    formName: 'CMDeals',
    gridViewName: 'grvCMDeals',
    entityName: 'CM_Deals',
  };
  fromModelDealCompetitor: FormModel = {
    formName: 'CMDealsCompetitors',
    gridViewName: 'grvCMDealsCompetitors',
    entityName: 'CM_DealsCompetitors',
  };
  loaded: boolean;
  lstStep = [];
  constructor(private cmSv: CodxCmService) {}

  ngOnInit(): void {
    this.getListDealAndDealCompetitor(this.competitorID);
  }

  getListDealAndDealCompetitor(competitorID) {
    this.loaded = false;
    this.cmSv.getListDealAndDealCompetitor(competitorID).subscribe((res) => {
      if (res && res.length > 0) {
        this.lstDealCompetitor = res;
        var lstRef = this.lstDealCompetitor.map((x) => x.refID);
        var lstSteps = this.lstDealCompetitor.map((x) => x.stepID);
        if (lstRef != null && lstRef.length > 0)
          this.getStepsByListID(lstSteps, lstRef);
      }
      this.loaded = true;
    });
  }

  getStepsByListID(lstStepID, lstIns) {
    this.cmSv.getStepsByListID(lstStepID, lstIns).subscribe((res) => {
      if (res && res.length > 0) {
        this.lstStep = res;
      }
    });
  }

  getStep(stepID) {
    if (this.lstStep != null && this.lstStep.length > 0) {
      var step = this.lstStep.find((x) => x.stepID == stepID);
      return step;
    } else {
      return null;
    }
  }
}
