import { ApiHttpService } from 'codx-core';
import { DataRequest } from './../../../../shared/models/data.request';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import moment from 'moment';
import { TmService } from '../tm.service';

@Component({
  selector: 'app-treeview',
  templateUrl: './treeview.component.html',
  styleUrls: ['./treeview.component.scss']
})
export class TreeviewComponent implements OnInit {

  model : DataRequest;
  moment = moment().locale("en");
  today: Date = new Date();
  fromDate: Date = moment(this.today).startOf("day").toDate();
  toDate: Date = moment(this.today).endOf("day").toDate();
  gridView: any;
  @Input() data= [];
  itemSelected= null;
  objectAssign: any;
  objectState: any;
  countOwner = 0;
  listNode = [];
  isFinishLoad = false;

  constructor(private tmSv: TmService, private api: ApiHttpService, private dt: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadData();
  }


  loadData(){
    let fied = this.gridView?.dateControl || 'DueDate';
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.predicate = '';
    this.model.funcID = "TM003"//this.viewBase.funcID ;
    this.model.page = 1;
    this.model.pageSize = 100;
    // model.dataValue = this.user.userID;
    // set max dinh
    this.model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: fied, value: this.fromDate || moment("3/01/2022").toDate() }, ///cho mac dinh cho filter
        { operator: 'lte', field: fied, value: this.toDate || moment("5/31/2022").toDate() },
      ],
    }; 
    const t = this;
    // this.lstItems = [];
    t.tmSv.loadTaskByAuthen(this.model).subscribe((res) => {
      if (res && res.length) {
        this.data = res[0];
        this.itemSelected = res[0][0];
        this.api
          .execSv<any>(
            'TM',
            'ERM.Business.TM',
            'TaskBusiness',
            'GetTaskByParentIDAsync',
            [this.itemSelected?.id]
          )
          .subscribe((res) => {
            this.countOwner = res.length
            if (res && res.length > 0) {
              let objectId = res[0].owner;
              let objectState = res[0].status;
              for (let i = 1; i < res?.length; i++) {
                objectId += ';' + res[i].owner;
                objectState += ';' + res[i].status;
              }
              this.objectAssign = objectId;
              this.objectState = objectState;
            }
          });

        if (this.itemSelected?.category != '1') {
          this.api
            .execSv<any>(
              'TM',
              'ERM.Business.TM',
              'TaskBusiness',
              'GetListTasksTreeAsync',
              this.itemSelected?.id
            )
            .subscribe((res) => {
              this.listNode = res;
              this.isFinishLoad = true;
            });
        }
      } else {
        this.data = [];
      }

      t.dt.detectChanges();
    });
      
  }

}
