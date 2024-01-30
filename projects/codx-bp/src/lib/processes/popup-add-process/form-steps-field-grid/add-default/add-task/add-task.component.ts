import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { BaseFieldComponent } from '../../base.component';
import { BP_Processes_Steps } from 'projects/codx-bp/src/lib/models/BP_Processes.model';
import { AlertConfirmInputConfig, DialogModel, Util } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { AddSettingConditionsComponent } from './add-setting-conditions/add-setting-conditions.component';
import { ModeviewComponent } from 'projects/codx-bp/src/lib/modeview/modeview.component';
import { CodxExportAddComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export-add/codx-export-add.component';

@Component({
  selector: 'lib-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss']
})
export class AddTaskComponent extends BaseFieldComponent implements OnInit , OnChanges {
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('attachment2') attachment2: AttachmentComponent;
  @Input() activityType: any;
  isNewForm = false;
  listUses = [];
  checkList = [];
  vllBP013 =
  {
    datas:
    [
      {
        value : 1,
        text: "Đại diện "
      },
      {
        value : 2,
        text: "Song song"
      },
      {
        value : 3,
        text: "Tuần tự"
      },
    ]
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.activityType && changes['activityType'].currentValue != changes['activityType'].previousValue)
    {
      this.activityType = changes['activityType'].currentValue;
      if(this.data) this.changeActivity()
    }
  }
  ngOnInit(): void {
    if(this.type == 'add') this.default();
    else {
      this.data.settings = typeof this.data.settings === 'string' ?  JSON.parse(this.data.settings) : this.data.settings;
      this.defaultValue();
    }
  }
  defaultValue()
  {
    if(this.data) {
      this.stage = this.listStage.filter(x=>x.recID == this.data.stageID)[0];
      this.listUses = this.data.permissions || [];
    }
  }
  default()
  {
    var vllStage = this.vll.datas.filter(x=>x.value == "Task")[0];
    this.data = new BP_Processes_Steps();
    this.data.recID = Util.uid();
    this.data.stepNo = this.process.steps.length;
    this.data.stageID = this.stage.recID;
    this.data.parentID = this.parent.recID;
    this.data.activityType = "Task";
    this.data.stepName = vllStage.text + " " + (this.parent.child.length + 1);
    this.data.reminder = this.process.reminder;
    this.data.eventControl = null;
    this.data.interval = "1";
    this.data.memo = "";
    this.data.duration = 0;
    this.data.location = "";
    this.data.settings = 
    {
      icon: vllStage.icon,
      color: vllStage.color,
      backGround: vllStage.textColor,
      checkList: "",
      nextSteps: ""
    }
    this.dataChange.emit(this.data);
  }
  changeActivity()
  {
    var vllStage = this.vll.datas.filter(x=>x.value == this.activityType)[0];
    this.data.settings.icon = vllStage.icon;
    this.data.settings.color = vllStage.color;
    this.data.settings.backGround = vllStage.textColor;
    this.data.activityType = this.activityType;

    if(this.data.activityType == "Form")
    {
      if(!this.data.extendInfo || this.data.extendInfo.length == 0)
      {
        this.isNewForm = true;
        this.data.extendInfo = 
        [
          {
              recID: Util.uid(),
              fieldName: "Ten_bieu_mau",
              title: "Tên biểu mẫu",
              dataType: "String",
              fieldType: "Title",
              controlType: "TextBox",
              isRequired: true,
              defaultValue: null,
              description: "",
              columnOrder: 0,
              columnNo: 0
          },
          {
              recID: "c3f6287e-3e7b-4395-99db-e72dc0479117",
              fieldName: "Mo_ta_ngan_gon",
              title: "Mô tả ngắn gọn",
              dataType: "String",
              fieldType: "SubTitle",
              controlType: "TextBox",
              isRequired: true,
              defaultValue: "Mô tả ngắn gọn",
              description: "Câu trả lời",
              columnOrder: 1,
              columnNo: 0
          }
        ]
      }
      if(this.data.settings?.isTemplate == undefined || this.data.settings?.isTemplate == null) this.data.settings.isTemplate = false;
    }
    else if(this.data.activityType == "Task")
    {
      if(this.data.settings?.checkList) 
      {
        this.checkList = this.data.settings.checkList.split(";");
      }
    }
    else if(this.data.activityType == "Conditions" && !this.data.settings.nextSteps) this.data.settings.nextSteps = [];
    else if((this.data.activityType == "Sign" || this.data.activityType == "Check") && !this.data?.settings?.approveMode) this.data.settings.approveMode = 1;
  }
  valueChange(e:any)
  {
    this.data[e?.field] = e?.data;
    this.dataChange.emit(this.data);
  }

  valueChangeUser(e:any)
  {
    if(e?.data?.dataSelected)
    {
      e?.data?.dataSelected.forEach(element => {
        this.listUses.push(
          {
            objectID: element.id,
            objectName: element.text,
            objectType: "U",
            roleType: 'O'
          }
        )
      });
    }

    this.data.permissions = this.listUses;
    this.dataChange.emit(this.data);
  }

  deleteUser(index:any)
  {
    this.listUses.splice(index,1);
    this.data.permissions = this.listUses;
    this.dataChange.emit(this.data);
  }

  changeStage(e:any)
  {
    this.stage = this.parent = e;
    this.data.stageID = this.stage.recID;
    this.data.parentID = this.parent.recID;
    this.dataChange.emit(this.data);
  }

  openAttach1()
  {
    this.attachment.uploadFile();
  }
  openAttach2()
  {
    this.attachment2.uploadFile();
  }
  fileSave(e:any)
  {
    if(Array.isArray(e)) this.data.attachments = e.length;
    else this.data.attachments = 1;
    this.dataChange.emit(this.data);
  }
  fileDelete(e:any)
  {
    this.data.attachments --;
    this.dataChange.emit(this.data);
  }
  openFormSetting(val:any=null , index = null)
  {
    let option = new DialogModel();
    option.FormModel = this.formModel;
    let listForm = this.process.steps.filter(x=>x.stepNo < this.data.stepNo && x.activityType == 'Form');
    let dataSteps = this.process.steps.filter(x=>x.activityType != "Stage" && x.activityType != "Conditions" && x.activityType != "StartEnd");
    let popupDialog = this.callFuc.openForm(AddSettingConditionsComponent,"",700,700,"",{forms: listForm,dataStep:val,listSteps:dataSteps},"",option);
    popupDialog.closed.subscribe((res) => {
      if (res?.event) {
        if(typeof index === 'number') this.data.settings.nextSteps[index] = res?.event;
        else this.data.settings.nextSteps.push(res?.event);
        this.dataChange.emit(this.data);
      }
    })
  }
  openFormModeView()
  {
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 1010;
    let popupDialog = this.callFuc.openForm(
      ModeviewComponent,
      '',
      null,
      null,
      '',
      this.data.extendInfo,
      '',
      option
    );
    popupDialog.closed.subscribe((res) => {
      if (res?.event) {
        this.isNewForm = false;
        this.data.extendInfo = res?.event?.length > 0 ? JSON.parse(JSON.stringify(res?.event)) : [];
        this.dataChange.emit(this.data);
      }
    })
  }
  getNextStepHTML(id:any)
  {
    let data = this.process.steps.filter(x=>x.recID == id)[0];
    if(data)
    {
      return this.sanitizer
      .bypassSecurityTrustHtml('<i class="'+data.settings.icon+'" style="color:'+data.settings.color+'"></i><span class="ms-2">'+data.stepName+'</span>')
    }
    return "";
  }
  valueChangeRadio(e:any)
  {
    this.data.settings.approveMode = e?.target?.value;
    this.dataChange.emit(this.data);
  }

  valueChangeSetting(e:any)
  {
    this.data.settings[e?.field] = e?.data;
    this.dataChange.emit(this.data);
  }
  addTemplate(val:any , type:any)
  {
    if(val == "add") this.openFormTemplate(val,type);
    else
    {
      let business = "WordTemplatesBusiness";
      if(type == 'excel') business = "ExcelTemplatesBusiness";
      this.api.execSv("SYS","AD",business,"GetAsync",this.data.settings.template.templateID).subscribe(item=>{
        this.openFormTemplate(val,type,item);
      })
    }
  }

  openFormTemplate(val:any , type:any ,data:any = null)
  {
    var option = new DialogModel();
    option.FormModel = this.formModel;
    if (type == 'word') option.IsFull = true;
    let popup = this.callFuc
      .openForm(
        CodxExportAddComponent,
        null,
        1100,
        800,
        null,
        {
          action: val,
          type: type,
          refType: this.formModel?.entityName,
          formModel: this.formModel,
          data:data
        },
        '',
        option
      );
      
    popup.closed.subscribe((res) => {
        if(res && res?.event)
        {
          this.data.settings.template =
          {
            templateType: type,
            templateID: res?.event[0].recID,
            templateName: res?.event[0].templateName
          }
          this.dataChange.emit(this.data);
        }
      })
  }

  addCheckList()
  {
    this.checkList.push("");
  }
  valueChangeCheckList(e:any,i:any)
  {
    this.checkList[i] = e?.target?.value;
    let a = JSON.parse(JSON.stringify(this.checkList));
    this.data.settings.checkList = a.join(";");
    this.dataChange.emit(this.data);
  }
  
  deleteTemplate()
  {
    var config = new AlertConfirmInputConfig();
        config.type = 'YesNo';
        //SYS003
        this.notifySvr
          .alert('Thông báo', 'Bạn có chắc chắn muốn xóa ?', config)
          .closed.subscribe((x) => {
            if (x.event.status == 'Y') {
              var className =
              this.data?.settings?.template?.templateType == 'excel'
                  ? 'ExcelTemplatesBusiness'
                  : 'WordTemplatesBusiness';
              this.api
                .execSv(
                  "SYS",
                  'AD',
                  className,
                  'DeleteIDAsync',
                  this.data.settings.template.templateID
                )
                .subscribe((item) => {
                  if (item) {
                    this.notifySvr.notifyCode('RS002');
                    delete this.data.settings.template;
                    this.data.settings.isTemplate = false;
                    this.dataChange.emit(this.data);
                  } else {
                    this.notifySvr.notifyCode('SYS022');
                  }
                });
            }
          });
  }
}
