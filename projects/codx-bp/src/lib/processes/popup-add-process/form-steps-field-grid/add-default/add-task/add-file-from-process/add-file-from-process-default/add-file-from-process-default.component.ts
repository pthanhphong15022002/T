import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiHttpService } from 'codx-core';

@Component({
  selector: 'lib-add-file-from-process-default',
  templateUrl: './add-file-from-process-default.component.html',
  styleUrls: ['./add-file-from-process-default.component.css']
})
export class AddFileFromProcessDefaultComponent implements OnInit{
  @Input() data:any;
  @Input() formModel:any;
  @Input() step:any;
  @Output() selectedChange = new EventEmitter<any>();
  
  documentControl:any;
  dataList:any = [];
  selected:any;
  constructor(
    private api: ApiHttpService,
  ) 
  {
  }

  ngOnInit(): void {
    this.formatData();
  }

  formatData()
  {
    if(this.data) {
      this.documentControl = JSON.parse(JSON.stringify(this.data.documentControl));
      if(this.step?.stepNo) this.documentControl = this.documentControl.filter(x=>x.stepNo < this.step.stepNo);
      let i = 0;
      if(this.documentControl && this.documentControl.length > 0)
      {
        this.documentControl.forEach(elm => {
          var dt = this.data.steps.filter(x=>x.stepNo == elm.stepNo);
          if(dt)
          {
            let fieldID =  elm.fieldID;
            let entityName = this.formModel.entityName;
            elm.stepName = dt[0].stepName,
            elm.stageName =  this.data.steps.filter(x=>x.recID == dt[0].parentID)[0].stepName;

            if(elm?.templateID) {
              fieldID = elm?.templateID;
              entityName = "AD_ExcelTemplates"
              if(elm.templateType == "word") entityName = "AD_WordTemplates"
            }
            else if(elm.refStepNo)
            {
              var index = this.getDocRef(elm.refStepID);
              if(index>=0) {
                if(this.documentControl[index].templateID) {
                  fieldID = this.documentControl[index].templateID;
                  entityName = "AD_ExcelTemplates"
                  if(this.documentControl[index].templateType == "word") entityName = "AD_WordTemplates"
                }
                else fieldID = this.documentControl[index].fieldID;
              }
            }

            this.getFile(fieldID,entityName,i);
            i++;
          }
        });
        this.groupData();
      }
    }
  }

  getDocRef(refStepID:any)
  {
    var index = null;
    if(refStepID)
    {
      var doc = this.documentControl.filter(x=>x.stepID == refStepID)[0];
      if(doc?.refStepID == '00000000-0000-0000-0000-000000000000' || !doc?.refStepID)
      {
        return this.documentControl.findIndex(x=>x.stepID == refStepID);
      } 
      else 
      {
        return this.getDocRef(doc.refStepID)
      }
    } 
    index = this.documentControl.findIndex(x=>x.stepID == refStepID);
    return index;
  }

  groupData()
  {
    this.documentControl.forEach(element => {
      var index = this.dataList.findIndex(x=>x.stageName == element.stageName)
      if(index>=0)
      {
        this.dataList[index].child.push(element);
      }
      else 
      {
        var obj = 
        {
          stageName : element.stageName,
          child : [element]
        }
        this.dataList.push(obj);
      }
    });
  }
  getFile(recID:any,entityName:any,index:any)
  {
    let i = index;
    this.api.execSv("DM","DM","FileBussiness","GetFileByObjectIDAsync",[recID + ";",entityName]).subscribe(item=>{
      if(item)
      {
        this.documentControl[i].files = item;
      }
    })
  }

  
  selectedItem(e:any)
  {
    if(this.selected?.recID == e.recID) this.selected = null;
    else this.selected = e;

    this.selectedChange.emit(this.selected)
  }
}
