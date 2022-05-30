import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, CodxListviewComponent, DataRequest, ListCardComponent } from 'codx-core';
import * as moment from 'moment';
import { ViewBoardInfoComponent } from '../view-board-info/view-board-info.component';

@Component({
  selector: 'app-list-view-boards',
  templateUrl: './list-view-boards.component.html',
  styleUrls: ['./list-view-boards.component.scss']
})
export class ListViewBoardsComponent implements OnInit{
  @Input('viewBoardInfo') viewBoardInfo: ViewBoardInfoComponent;
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
  this.viewBoardInfo.isAddNew.subscribe(res=>{
    if(res.projectID){
      this.lstProjectBoard.addHandler(res,true,'iterationID') ;
    }else{
      this.lstViewBoard.addHandler(res,true,'iterationID') ;
    }
      
  })
  }
  loadData(){

  }

}
