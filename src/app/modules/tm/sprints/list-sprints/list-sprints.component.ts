import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, CodxListviewComponent, DataRequest, ListCardComponent } from 'codx-core';
import * as moment from 'moment';
import { SprintsInfoComponent } from '../sprints-info/sprints-info.component';

@Component({
  selector: 'app-list-sprints',
  templateUrl: './list-sprints.component.html',
  styleUrls: ['./list-sprints.component.scss']
})
export class ListSprintsComponent implements OnInit{
  @Input('sprintsInfo') sprintsInfo: SprintsInfoComponent;
  fromDate: Date 
  toDate: Date 
  view: string; 
  model = new DataRequest();
  gridView:any
  predicateViewBoards ="((Owner=@0) or (@1.Contains(outerIt.IterationID))) and (!@2.Contains(outerIt.IterationID)) AND ProjectID=null"
  predicateProjectBoards="((Owner=@0) or (@1.Contains(outerIt.IterationID))) and (!@2.Contains(outerIt.IterationID)) AND ProjectID!=null"
  listMyBoard = [];
  listProjectBoard = [];
  @ViewChild('lstViewBoard') lstViewBoard: ListCardComponent ;
  @ViewChild('lstProjectBoard') lstProjectBoard: ListCardComponent ;

  constructor(private api : ApiHttpService,private  changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {

  }
  ngAfterViewInit(){
  this.sprintsInfo.isAddNew.subscribe(res=>{
    if(res?.projectID!=null){
      this.lstProjectBoard.addHandler(res,true,'iterationID') ;
    }else{
      this.lstViewBoard.addHandler(res,true,'iterationID') ;
    }
      
  })
  }
  loadData(){

  }

}
