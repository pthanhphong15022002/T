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
  countOb = 0;
  @Input() selected = [];
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
    this.countOb = 0;
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
            this.countOb = this.countOb + 1
            if(elm.files && elm.files.length>0)
            {
              var recIDs = elm.files.map(function(item) {
                return item.fileID || item?.recID;
              });
              recIDs = JSON.stringify(recIDs);
              this.getFile2(recIDs,i);
            }
            else
            {
              if(elm?.templateID) {
                fieldID = elm?.templateID;
                entityName = "AD_ExcelTemplates"
                if(elm.templateType == "word") entityName = "AD_WordTemplates";
                this.getFile(fieldID,entityName,i);
              }
              else if(elm.refStepNo)
              {
                //var index = this.getDocRef(elm.refStepID);
                var index = this.documentControl.findIndex(x=>x.recID == elm.refID);
                if(index>=0) {
                  if(this.documentControl[index].files && this.documentControl[index].files.length>0)
                  {
                    var recIDs = this.documentControl[index].files.map(function(item) {
                      return item?.fileID || item?.recID;
                    });
                    recIDs = JSON.stringify(recIDs);
                    this.getFile2(recIDs,i);
                  }
                  else
                  {
                    if(this.documentControl[index].templateID) {
                      fieldID = this.documentControl[index].templateID;
                      entityName = "AD_ExcelTemplates"
                      if(this.documentControl[index].templateType == "word") entityName = "AD_WordTemplates"
                    }
                    else fieldID = this.documentControl[index].fieldID;
                    this.getFile(fieldID,entityName,i);
                  }
                }
              }
              else
              {
                this.getFile(fieldID,entityName,i);
              }
            }
            
            i++;
          }
        });
        if(this.countOb == 0) this.groupData();
      }
    }
  }

  getDocRef(refStepID:any)
  {
    var index = null;
    if(refStepID)
    {
      var doc = this.documentControl.filter(x=>x.recID == refStepID)[0];
      if(doc?.refStepID == '00000000-0000-0000-0000-000000000000' || !doc?.refStepID)
      {
        return this.documentControl.findIndex(x=>x.recID == refStepID);
      } 
      else 
      {
        return this.getDocRef(doc.refStepID)
      }
    } 
    index = this.documentControl.findIndex(x=>x.recID == refStepID);
    return index;
  }

  groupData()
  {
    this.documentControl.forEach(element => {
      var index = this.dataList.findIndex(x=>x.stageName == element.stageName)
      if(index>=0)
      {
        var index2 = this.dataList[index].child.findIndex(x=>x.stepName == element.stepName);
        if(index2 >= 0)
        {
          this.dataList[index].child[index2].child.push(element);
        }
        else 
        {
          var obj2 = 
          {
            stepName: element.stepName,
            child: [element]
          }
          this.dataList[index].child.push(obj2);
        }
      }
      else 
      {
        var obj2 = 
        {
          stepName: element.stepName,
          child: [element]
        }
        var obj = 
        {
          stageName : element.stageName,
          child : [obj2]
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
        if(!this.documentControl[i]?.files) this.documentControl[i].files = [];
        this.documentControl[i].files = item;
        this.countOb = this.countOb - 1
        if(this.countOb == 0) this.groupData();
      }
    })
  }
  getFile2(recID:any,index:any)
  {
    let i = index;
    this.api.execSv("DM","DM","FileBussiness","GetListFile",recID).subscribe(item=>{
      if(item)
      {
        if(!this.documentControl[i]?.files) this.documentControl[i].files = [];
        this.documentControl[i].files = item;
        this.countOb = this.countOb - 1
        if(this.countOb == 0) this.groupData();
      }
    })
  }
  selectedItem(e:any)
  {
    var index = this.selected.findIndex(x=>x.recID == e?.recID);
    if(index>=0)
    {
      this.selected.splice(index , 1);
    }
    else this.selected.push(e);
    this.selectedChange.emit(this.selected)
  }

  checkHas(recID:any)
  {
    return this.selected.some(x=>x.recID == recID);
  }
}
