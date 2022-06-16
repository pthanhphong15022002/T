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
  openNode = false ;
  constructor(private tmSv: TmService, private api: ApiHttpService, private dt: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadData();
  }


  loadData(){
    let field = this.gridView?.dateControl || 'DueDate';
    let model = new DataRequest();
    model.formName = 'Tasks';
    model.gridViewName = 'grvTasks';
    model.entityName = 'TM_Tasks';
    model.predicate = '';
    this.fromDate = moment('3/01/2022').toDate();
    this.toDate = moment('12/30/2022').toDate();
    model.page = 1;
    model.pageSize = 100;
    model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: field, value: this.fromDate },
        { operator: 'lte', field: field, value: this.toDate },
      ],
    };
    model.dataObj = '{"view":"2"}'; //JSON.stringify(this.dataObj);
    this.model = model ;
    const t = this;
    // this.lstItems = [];
    t.tmSv.loadTaskByAuthen(model).subscribe((res) => {
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
          this.isFinishLoad = true;
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
            });
        }
      } else {
        this.data = [];
      }

      t.dt.detectChanges();
    });
      
  }

  openShowNode(){
    this.openNode = !this.openNode;
  }
}
