import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { TM_Tasks } from './components/codx-tasks/model/task.model';
import { CallFuncService, SidebarModel } from 'codx-core';
import { AssignInfoComponent } from './components/assign-info/assign-info.component';

@Injectable({
  providedIn: 'root',
})
export class CodxShareService {
  hideAside = new BehaviorSubject<any>(null);
  constructor(
    private callfunc: CallFuncService,
  ) {}
  defaultMoreFunc(val:any  , data:any,  afterSave?: Function , formModel?:any , dataService?:any)
  {
    var funcID = val?.functionID;
    switch(funcID)
    {
      //Giao việc
      case "SYS005":
        {
          var task = new TM_Tasks();
          task.refID = data?.recID;
          task.refType = formModel.entityName;
          var vllControlShare = 'TM003';
          var vllRose = 'TM002';
          var title = val?.data.customName;
          let option = new SidebarModel();
          option.DataService = dataService;
          option.FormModel = formModel;
          option.Width = '550px';
          let dialog = this.callfunc.openSide(
            AssignInfoComponent,
            [task, vllControlShare, vllRose, title],
            option
          );
          dialog.closed.subscribe((e) => {
            if (afterSave && e?.event && e?.event[0]) {
              var result = 
              {
                funcID: funcID,
                result: e?.event,
                data: data
              }
              afterSave(result);
            }
          });
          break;
        }
    }
  }
}
