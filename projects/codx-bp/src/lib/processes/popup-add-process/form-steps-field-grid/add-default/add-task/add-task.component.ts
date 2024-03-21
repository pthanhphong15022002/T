import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { BaseFieldComponent } from '../../base.component';
import { BP_Processes_Steps } from 'projects/codx-bp/src/lib/models/BP_Processes.model';
import { AlertConfirmInputConfig, DialogModel, Util } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { AddSettingConditionsComponent } from './add-setting-conditions/add-setting-conditions.component';
import { ModeviewComponent } from 'projects/codx-bp/src/lib/modeview/modeview.component';
import { CodxExportAddComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export-add/codx-export-add.component';
import { AddFileFromProcessComponent } from './add-file-from-process/add-file-from-process.component';
import { Approver } from 'projects/codx-common/src/lib/models/ApproveProcess.model';
import { BpSignPDFComponent } from 'projects/codx-bp/src/lib/sign-pdf/bp-sign-pdf.component';

@Component({
  selector: 'lib-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss'],
})
export class AddTaskComponent
  extends BaseFieldComponent
  implements OnInit, OnChanges
{
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('attachment2') attachment2: AttachmentComponent;
  @Input() activityType: any;
  @Output() dataChangeAttach = new EventEmitter<any>();
  //listCombobox = {};
  listCombobox = { P: 'PositionByOrgChart' };
  multiple = true;
  vllShare = 'BP017';
  typeShare = '1';
  isNewForm = false;
  listUses = [];
  listUses2 = [];
  listTo = [];
  listCC = [];
  checkList = [];
  vllBP013 = {
    datas: [
      {
        value: 1,
        text: 'Tuần tự',
      },
      {
        value: 2,
        text: 'Song song',
      },
      {
        value: 3,
        text: 'Đại diện',
      },
    ],
  };

  listDocument = [];
  dataEmail: any;
  showEmail = false;
  listRequester = [
    {
      fieldName: "username",
      title: 'Người lập phiếu',
      controlType: "Text",
      dataType: "String"
    },
    {
      fieldName: "createdon",
      title: "Ngày tạo",
      controlType : "MaskBox",
      dataFormat : "d",
      dataType : "DateTime"
    },
    {
      fieldName: "orgunit",
      title: "Người lập phiếu_Bộ phận",
      controlType : "ComboBox",
      refType : "3",
      refValue : "OrganizationUnits",
      dataType : "String"
    },
    {
      fieldName: "position",
      title: "Người lập phiếu_Chức danh",
      controlType : "ComboBox",
      refType : "3",
      refValue : "Positions",
      dataType : "String"
    },
    {
      fieldName: "department",
      title: "Người lập phiếu_Phòng ban",
      controlType : "ComboBox",
      refType : "3",
      refValue : "OrganizationUnits",
      dataType : "String"
    },
    {
      fieldName: "company",
      title: "Người lập phiếu_Công ty",
      controlType : "ComboBox",
      refType : "3",
      refValue : "OrganizationUnits",
      dataType : "String"
    },
  ];
  isAllowEdit = "0"; 
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes?.activityType &&
      changes['activityType'].currentValue !=
        changes['activityType'].previousValue
    ) {
      this.activityType = changes['activityType'].currentValue;
      if (this.data) this.changeActivity();
    }
  }
  ngOnInit(): void {
    if (this.process.settings && this.process.settings.length > 0) 
    {
      this.isAllowEdit = this.process.settings.filter(
        (x) => x.fieldName == 'AllowEdit'
      )[0]?.fieldValue;
    }
    if (this.type == 'add') this.default();
    else {
      this.data.settings =
        typeof this.data.settings === 'string'
          ? JSON.parse(this.data.settings)
          : this.data.settings;
      this.defaultValue();
    }

    if(!this.process?.documentControl) this.process.documentControl = [];
    this.formatDocument();
  }
  defaultValue() {
    if (this.data) {
      this.stage = this.listStage.filter(
        (x) => x.recID == this.data.stageID
      )[0];
      this.listUses = this.data.permissions || [];
      this.listUses2 = this.data.settings?.objects || [];
    }
  }

  formatDocument() {
    this.listDocument = JSON.parse(JSON.stringify(this.process.documentControl));
    let ids = [];
    this.listDocument.forEach((elm) => {
      if (elm.files && elm.files.length > 0) 
      {
        elm.files.forEach(element => {
          ids.push(element.fileID || element?.recID);
        });
      }
    });

    if(ids.length>0)
    {
      var str = JSON.stringify(ids);
      this.getFile(str)
    }
  }

  getDocRef(refStepID: any) {
    var index = null;
    if (refStepID) {
      var doc = this.process.documentControl.filter(
        (x) => x.recID == refStepID
      )[0];
      if (
        doc?.refStepID == '00000000-0000-0000-0000-000000000000' ||
        !doc?.refStepID
      ) {
        return this.process.documentControl.findIndex(
          (x) => x.recID == refStepID
        );
      } else {
        return this.getDocRef(doc.refStepID);
      }
    }
    index = this.process.documentControl.findIndex((x) => x.recID == refStepID);
    return index;
  }

  getFile(recID: any) {
    this.api
      .execSv('DM', 'DM', 'FileBussiness', 'GetListFile', recID)
      .subscribe((item:any) => {
        if (item) {
          item?.forEach(ix=>{
            let index = this.listDocument.findIndex(x=>x.files.some(x=>x.fileID == ix.recID));
            if(index>=0)
            {
              if(!this.listDocument[index]?.filess) this.listDocument[index].filess = [];
              this.listDocument[index].filess.push(ix);
            }
          });
          
          //this.listDocument[i].filess = item;
        }
      });
  }

  default() {
    var vllStage = this.vll.datas.filter((x) => x.value == 'Task')[0];
    let allowEdit = "0";
    if (this.process.settings && this.process.settings.length > 0) {
      allowEdit = this.process.settings.filter(
        (x) => x.fieldName == 'AllowEdit'
      )[0];
    }
    this.data = new BP_Processes_Steps();
    this.data.recID = Util.uid();
    this.data.stepNo = this.process.steps.length;
    this.data.stageID = this.stage.recID;
    this.data.parentID = this.parent.recID;
    this.data.activityType = 'Task';
    this.data.stepName = vllStage.text + ' ' + (this.parent.child.length + 1);
    this.data.reminder = this.process.reminder;
    this.data.eventControl = null;
    this.data.interval = '1';
    this.data.memo = '';
    this.data.duration = 0;
    this.data.location = '';
    this.data.settings = {
      icon: vllStage.icon,
      color: vllStage.color,
      backGround: vllStage.textColor,
      checkList: '',
      nextSteps: '',
      allowEdit: allowEdit
    };
    if (!this.process.documentControl) this.process.documentControl = [];
    this.dataChange.emit(this.data);
  }
  changeActivity() {
    var vllStage = this.vll.datas.filter(
      (x) => x.value == this.activityType
    )[0];
    this.data.settings.icon = vllStage.icon;
    this.data.settings.color = vllStage.color;
    this.data.settings.backGround = vllStage.textColor;
    this.data.activityType = this.activityType;
    if (this.parent?.child)
      this.data.stepName = vllStage.text + ' ' + (this.parent.child.length + 1);
    if (this.data.activityType == 'Form') {
      if (!this.data.extendInfo || this.data.extendInfo.length == 0) {
        this.isNewForm = true;
        this.data.extendInfo = [
          {
            recID: Util.uid(),
            fieldName: 'ten_bieu_mau_' + this.data?.stepNo,
            title: 'Tên biểu mẫu',
            dataType: 'String',
            fieldType: 'Title',
            controlType: 'TextBox',
            isRequired: true,
            defaultValue: null,
            description: '',
            columnOrder: 0,
            columnNo: 0,
          },
          {
            recID: 'c3f6287e-3e7b-4395-99db-e72dc0479117',
            fieldName: 'mo_ta_ngan_gon_' + this.data?.stepNo,
            title: 'Mô tả ngắn gọn',
            dataType: 'String',
            fieldType: 'SubTitle',
            controlType: 'TextBox',
            isRequired: true,
            defaultValue: 'Mô tả ngắn gọn',
            description: 'Câu trả lời',
            columnOrder: 1,
            columnNo: 0,
          },
        ];
      }
      if (
        this.data.settings?.isTemplate == undefined ||
        this.data.settings?.isTemplate == null
      )
        this.data.settings.isTemplate = false;
      // if (this.data.stepNo == 1) {
      //   this.hideOwner = true;
      //   this.data.permissions = [
      //     {
      //       objectID: this.user?.userID,
      //       objectName: this.user?.userName,
      //       objectType: 'U',
      //       roleType: 'O',
      //     },
      //   ];
      //   this.dataChange.emit(this.data);
      // }
      if(!this.data.permissions || (this.data.permissions && this.data.permissions.length == 0))
      {
        this.data.permissions = [
          {
            objectID: this.user?.userID,
            objectName: this.user?.userName,
            objectType: 'U',
            roleType: 'O',
          },
        ];
        this.dataChange.emit(this.data);
      }
    } else if (this.data.activityType == 'Task') {
      if (this.data.settings?.checkList) {
        this.checkList = this.data.settings.checkList.split(';');
      }
    } else if (
      this.data.activityType == 'Conditions' &&
      !this.data.settings.nextSteps
    )
      this.data.settings.nextSteps = [];
    else if (
      (this.data.activityType == 'Sign' || this.data.activityType == 'Check') &&
      !this.data?.settings?.approveMode
    )
      this.data.settings.approveMode = 1;
    else if (this.data.activityType == 'Email') {
      if (this.data.settings?.templateID) {
        this.api
          .execSv(
            'BG',
            'BG',
            'EmailsBusiness',
            'GetItemByRecIDAsync',
            this.data.settings?.templateID
          )
          .subscribe((item) => {
            if (item) {
              this.dataEmail = item;
              if (this.dataEmail.sendTo && this.dataEmail.sendTo.length > 0) {
                this.listTo = this.dataEmail?.sendTo || [];
                this.showEmail = true;
              }
            }
          });
      }
    } else if (
      this.data.activityType == 'Event' &&
      !this.data.settings?.eventType
    )
      this.data.settings.eventType = '1';
  }
  valueChange(e: any) {
    this.data[e?.field] = e?.data;
    this.dataChange.emit(this.data);
  }

  showCheck(e: any){
    console.log('show check: ', e)
    e.show = e?.item?.Show ?? false;
  }

  valueChangeUser(e: any) {
    if (e) {
      e.forEach((element) => {
        this.listUses.push({
          objectID: element.id,
          objectName: element.text,
          objectType: element?.objectType =="SYS061" ? element?.id : element?.objectType,
          roleType: 'O',
        });
      });
    }

    this.data.permissions = this.listUses;
    let approvers = [];
    if (this.listUses?.length > 0) {
      this.listUses?.forEach((per) => {
        approvers.push({
          approver: per?.objectID,
          roleType: per?.objectType,
          refID: this.data?.recID,
        });
      });
      if (approvers?.length > 0) {
        this.shareService
          .getApproverByRole(approvers, false, this.data?.createdBy)
          .subscribe((res) => {
            if (res) {
              this.data.pers = res?.map((x) => x.userID)?.join(';') ?? null;
              if (this.data.pers == null || this.data.pers?.length == 0) {
                this.data.pers = res?.map((x) => x.approver)?.join(';');
              }
            }
            this.dataChange.emit(this.data);
          });
      } else {
        this.dataChange.emit(this.data);
      }
    } else {
      this.dataChange.emit(this.data);
    }
  }

  valueChangeUserEvent(e: any) {
    if (e?.data?.dataSelected) {
      e?.data?.dataSelected.forEach((element) => {
        this.listUses2.push({
          objectID: element.id,
          objectName: element.text,
          objectType: 'U',
          roleType: '3',
        });
      });
    }

    this.data.settings.objects = this.listUses2;
    this.dataChange.emit(this.data);
  }

  deleteUser(index: any) {
    this.listUses.splice(index, 1);
    this.data.permissions = this.listUses;
    this.dataChange.emit(this.data);
  }

  deleteUser2(index: any) {
    this.listUses2.splice(index, 1);
    this.data.settings.objects = this.listUses;
    this.dataChange.emit(this.data);
  }
  changeStage(e: any) {
    this.stage = this.parent = e;
    this.data.stageID = this.stage.recID;
    this.data.parentID = this.parent.recID;
    this.dataChange.emit(this.data);
  }

  openAttach1() {
    this.dataChangeAttach.emit(true);
    this.attachment.uploadFile();
  }
  openAttach2() {
    this.dataChangeAttach.emit(true);
    this.attachment2.uploadFile();
  }

  fileSave(e: any) {
    let count = 0;
    var files = [];
    if (Array.isArray(e)) {
      e.forEach((elm) => {
        var f = {
          fileID: elm?.data?.recID,
          type: '1',
          eSign: false
        };
        files.push(f);
      });
      count = e.length;
    } else {
      var f = {
        fileID: e?.recID,
        type: '1',
        eSign: false
      };
      files.push(f);
      count = 1;
    }

    if (!this.data.attachments) this.data.attachments = 0;
    this.data.attachments += count;
    this.dataChange.emit(this.data);
    var documentControl = {
      recID: Util.uid(),
      title: this.data.stepName,
      isRequired: false,
      count: 0,
      listType: '1',
      stepID: this.data?.recID,
      stepNo: this.data?.stepNo,
      fieldID: this.data?.recID,
      memo: this.data?.memo,
      refID: '',
      files: files,
      permissions: 
      [
        {
          objectID: this.user?.userID,
          objectType: "U",
          download:true,
          read: true,
          update: true,
          delete: true
        }
      ]
    };
    let i = 0;
    this.listDocument.forEach((elm) => {
      if(!elm.permissions.some(x=>x.objectID == this.user.userID))
      {
        this.process.documentControl[i].permissions.push(
          {
            objectID: this.user?.userID,
            objectType: "U",
            download:true,
            read: true,
            update: true,
            delete: true
          }
        )
      }
      i++;
    });
    this.process.documentControl.push(documentControl);
    this.listDocument.push(documentControl);
    this.dataChangeProcess.emit(this.process);
    this.formatDocument();
    this.dataChangeAttach.emit(false);
  }

  fileDelete(e: any) {
    this.data.attachments--;
    this.dataChange.emit(this.data);
  }
  distinctArray(arr) {
    return [...new Map(arr.map((item) => [item['recID'], item])).values()];
  }
  openFormSetting(val: any = null, index = null) {
    
    this.process.steps = this.distinctArray(this.process.steps);

    let option = new DialogModel();
    option.FormModel = this.formModel;

    let listSteps = JSON.parse(JSON.stringify(this.process.steps));
    let listForm = listSteps.filter(
      (x) => x.stepNo < this.data.stepNo && x.activityType == 'Form'
    );

    listForm.forEach(elm=>{
      let data = JSON.parse(JSON.stringify(this.listRequester));
      data.forEach(elm2=>{
        elm2.fieldName = "form" + elm.stepNo + "_" + elm2.fieldName;
      })
      elm.extendInfo = elm.extendInfo.concat(data)
    });

    let dataSteps = this.process.steps.filter(
      (x) =>
        x.activityType != 'Stage' &&
        x.activityType != 'Conditions' &&
        x.activityType != 'StartEnd'
    );
    
    let popupDialog = this.callFuc.openForm(
      AddSettingConditionsComponent,
      '',
      700,
      700,
      '',
      { forms: listForm, dataStep: val, listSteps: dataSteps },
      '',
      option
    );
    popupDialog.closed.subscribe((res) => {
      if (res?.event) {
        if (typeof index === 'number')
          this.data.settings.nextSteps[index] = res?.event;
        else this.data.settings.nextSteps.push(res?.event);
        this.dataChange.emit(this.data);
      }
    });
  }
  openFormModeView() {
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 1010;
    let popupDialog = this.callFuc.openForm(
      ModeviewComponent,
      '',
      null,
      null,
      '',
      { extendInfo: this.data.extendInfo, stepNo: this.data.stepNo },
      '',
      option
    );
    popupDialog.closed.subscribe((res) => {
      if (res?.event) {
        this.isNewForm = false;
        this.data.extendInfo =
          res?.event?.length > 0 ? JSON.parse(JSON.stringify(res?.event)) : [];

        var index = this.process.steps.findIndex(x=>x.recID == this.data.recID);
        if(index >=0) 
        {
          if (this.data?.extendInfo) {
            this.data.extendInfo.forEach((element) => {
              if (element.controlType == 'Attachment') {
                if (!element?.documentControl || element?.documentControl.length == 0) {
                  var obj = 
                  {
                    recID: Util.uid(),
                    title: element.title,
                    isRequired: false,
                    count: 0,
                    isList: '1',
                    stepID: this.data?.steps[1].recID,
                    stepNo: this.data?.steps[1].stepNo,
                    fieldID: element.recID,
                    memo: this.data?.steps[1].memo,
                    permissions: 
                    [
                      {
                        objectID: this.user?.userID,
                        objectType: "U",
                        read: true,
                        update: true,
                        delete: true
                      }
                    ]
                  };
                  this.data.documentControl = [obj];
                } else if (
                  element.documentControl &&
                  element.documentControl.length > 0
                ) {
                  var doc = JSON.parse(JSON.stringify(this.data.documentControl));
                  if (!doc) doc = [];
                  element.documentControl.forEach((docu) => {
                    docu.stepID = this.data?.steps[index].recID;
                    docu.stepNo = this.data?.steps[index].stepNo;
                    docu.fieldID = element.recID;
                    docu.memo = this.data?.steps[index].memo;
                    docu.permissions =
                    [
                      {
                        objectID: this.user?.userID,
                        objectType: "U",
                        read: true,
                        update: true,
                        delete: true
                      }
                    ]
                    var index = doc.findIndex((x) => x.recID == docu.recID);
                    if (index >= 0) doc[index] = docu;
                    else doc.push(docu);
                  });
                  this.data.documentControl = doc;
                }
              }
  
              if (typeof element.documentControl != 'string') {
                element.documentControl =
                  element.documentControl?.length > 0
                    ? JSON.stringify(element.documentControl)
                    : null;
              }
  
              if (typeof element.dataFormat != 'string') {
                element.dataFormat =
                  element.dataFormat?.length > 0
                    ? JSON.stringify(element.dataFormat)
                    : null;
              }
              if (typeof element.tableFormat != 'string') {
                element.tableFormat = JSON.stringify(element.tableFormat) 
              }
            });
          }
          this.process.steps[index].extendInfo = this.data.extendInfo;
        }
        this.dataChange.emit(this.data);
        this.dataChangeProcess.emit(this.process);
      }
    });
  }
  getNextStepHTML(id: any) {
    let data = this.process.steps.filter((x) => x.recID == id)[0];
    if (data) {
      return this.sanitizer.bypassSecurityTrustHtml(
        '<i class="' +
          data.settings.icon +
          '" style="color:' +
          data.settings.color +
          '"></i><span class="ms-2">' +
          data.stepName +
          '</span>'
      );
    }
    return '';
  }
  valueChangeRadio(e: any) {
    this.data.settings.approveMode = e?.target?.value;
    this.dataChange.emit(this.data);
  }

  valueChangeSetting(e: any) {
    this.data.settings[e?.field] = e?.data;
    this.dataChange.emit(this.data);
  }
  addTemplate(val: any, type: any) {
    if (val == 'add') this.openFormTemplate(val, type);
    else {
      let business = 'WordTemplatesBusiness';
      if (type == 'excel') business = 'ExcelTemplatesBusiness';
      this.api
        .execSv(
          'SYS',
          'AD',
          business,
          'GetAsync',
          this.data.settings.template.templateID
        )
        .subscribe((item) => {
          this.openFormTemplate(val, type, item);
        });
    }
  }

  getFieldExport() {
    return this.process.steps.filter(
      (x) => x.activityType == 'Form' && x.stepNo <= this.data.stepNo
    );
  }

  openFormTemplate(val: any, type: any, data: any = null) {
    var option = new DialogModel();
    option.FormModel = this.formModel;
    if (type == 'word') option.IsFull = true;
    let popup = this.callFuc.openForm(
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
        data: data,
        groupField: this.getFieldExport(),
        isFristVer:true,
        isSign: this.data?.settings?.esign
      },
      '',
      option
    );

    popup.closed.subscribe((res) => {
      if (res && res?.event) {
        this.data.settings.template = {
          templateType: type,
          templateID: res?.event[0].recID,
          templateName: res?.event[0].templateName,
        };
        if (val == 'add') {
          var files =
          {
            fileID: res?.event[3].recID,
            type: '2',
            eSign: false
          };

          var documentControl = {
            recID: Util.uid(),
            title: this.data.stepName,
            isRequired: false,
            count: 0,
            listType: '0',
            stepID: this.data?.recID,
            stepNo: this.data?.stepNo,
            fieldID: this.data?.recID,
            memo: this.data?.memo,
            templateID: res?.event[0].recID,
            templateType: type,
            refID: '',
            files: [files],
            permissions: 
            [
              {
                objectID: this.user?.userID,
                objectType: "U",
                read: true,
                update: true,
                delete: true
              }
            ]
          };
          this.process.documentControl.push(documentControl);
        }

        this.dataChangeProcess.emit(this.process);
        this.dataChange.emit(this.data);
      }
    });
  }

  addCheckList() {
    this.checkList.push('');
  }
  valueChangeCheckList(e: any, i: any) {
    this.checkList[i] = e?.target?.value;
    let a = JSON.parse(JSON.stringify(this.checkList));
    this.data.settings.checkList = a.join(';');
    this.dataChange.emit(this.data);
  }

  deleteTemplate() {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    //SYS003
    this.notifySvr
      .alert('Thông báo', 'Thao tác sẽ hủy liên kết tệp tin với tất cả các quy trình. Bạn có chắc chắn muốn xóa ?', config)
      .closed.subscribe((x) => {
        if (x.event.status == 'Y') {
          var className =
            this.data?.settings?.template?.templateType == 'excel'
              ? 'ExcelTemplatesBusiness'
              : 'WordTemplatesBusiness';
          this.api
            .execSv(
              'SYS',
              'AD',
              className,
              'DeleteIDAsync',
              this.data.settings.template.templateID
            )
            .subscribe((item) => {
              if (item) {
                this.deleteDocByTemplateID(this.data.settings.template.templateID);
                this.notifySvr.notifyCode('RS002');
                delete this.data.settings.template;
                this.data.settings.isTemplate = false;
                this.dataChange.emit(this.data);
                this.dataChangeProcess.emit(this.process);
              } else {
                this.notifySvr.notifyCode('SYS022');
              }
            });
        }
      });
  }

  openFormFileProcess() {
    let option = new DialogModel();
    option.FormModel = this.formModel;
    let popup = this.callFuc.openForm(
      AddFileFromProcessComponent,
      null,
      800,
      700,
      null,
      {
        process: this.process,
        step: this.data,
        listDocument: this.listDocument,
      },
      '',
      option
    );
    popup.closed.subscribe((res) => {
      if (res?.event) {
        res?.event.forEach((element) => {
          var documentControl = {
            recID: Util.uid(),
            title: element?.title,
            isRequired: false,
            count: 0,
            isList: '0',
            stepID: this.data?.recID,
            stepNo: this.data?.stepNo,
            fieldID: this.data?.recID,
            memo: this.data?.memo,
            refStepNo: element?.stepNo,
            refStepID: element?.recID,
            refID: element?.refID,
          };
          this.process.documentControl.push(documentControl);
        });

        this.dataChangeProcess.emit(this.process);
        this.formatDocument();
      }
    });
  }

  valueChangeEmail(e: any, type: any) {
    if (e?.data?.dataSelected) {
      e?.data?.dataSelected.forEach((elm) => {
        var obj = {
          objectID: elm.id,
          objectType: elm.objectType || 'U',
          sendType: '2',
        };
        if (type == 'to') {
          this.listTo.push(obj);
        } else if (type == 'cc') {
          this.listCC.push(obj);
        }
      });
    }

    this.dataEmail.sendTo = this.listTo.concat(this.listCC);
    this.setTimeoutSaveDataEmail();
  }

  valueChangeTextEmail(e: any) {
    this.dataEmail[e?.field] = e?.data;
    this.setTimeoutSaveDataEmail();
  }

  settingEmail() {
    this.dataEmail = {
      recID: Util.uid(),
      category: '2',
      templateName: this.data?.stepName,
    };
    this.api
      .execSv('BG', 'BG', 'EmailsBusiness', 'SaveAsync', this.dataEmail)
      .subscribe((item: any) => {
        if (item) {
          this.data.settings.templateID = item.recID;
          this.dataEmail = item;
        }
      });

    this.showEmail = !this.showEmail;
  }
  saveDataTimeout = new Map();

  setTimeoutSaveDataEmail() {
    clearTimeout(this.saveDataTimeout?.get(this.dataEmail.recID));
    this.saveDataTimeout?.delete(
      this.saveDataTimeout?.get(this.dataEmail.recID)
    );
    this.saveDataTimeout.set(
      this.dataEmail.recID,
      setTimeout(this.onSave.bind(this), 1000)
    );
  }

  onSave() {
    this.api
      .execSv(
        'BG',
        'ERM.Business.BG',
        'EmailsBusiness',
        'UpdateAsync',
        this.dataEmail
      )
      .subscribe((res) => {});
  }

  sharePerm(share: any) {
    this.listCombobox = { P: 'PositionByOrgChart' };
    this.multiple = true;
    this.vllShare = 'BP017';
    this.typeShare = '1';
    let option = new DialogModel();
    option.zIndex = 1010;
    this.callFuc.openForm(share, '', 420, 600, null, null, null, option);
  }
  esign(){
    let result = JSON.parse(JSON.stringify(this.process));
    if(this.process?.steps?.find(x=>x?.recID == this.data?.recID)==null){
      result.steps?.push(this.data);
    }
    result.steps.forEach((elm: any) => {
      delete elm.child;
      if (typeof elm.settings === 'object')
        elm.settings = JSON.stringify(elm.settings);
      if (typeof elm.documentControl != 'string')
        elm.documentControl = JSON.stringify(elm.documentControl);
    });
    

    if(!this.data.permissions || this.data.permissions.length <=0) this.notifySvr.notify("Vui lòng chọn người thực hiện.");
    else 
    {
      this.api.execSv("BP","BP","ProcessesBusiness","UpdateProcessAsync",result).subscribe((item:any)=>{
      if(item?.steps){
        let savedData =item?.steps?.find(x=>x?.recID == this.data?.recID);
        if(savedData) this.data=savedData;
          this.esignB();
      }

      })
    }
  }

  esignB()
  {
    let fileIDs="";
    let dynamicApprovers=[];
    
    this.listDocument.forEach(doc=>{
      if(doc?.files?.length>0){
        var l = doc?.files?.filter(x=>x.eSign)
        if(l && l.length>0) fileIDs+= ";" + l.map(x=>x?.fileID)?.join(";");        
      }
    });

    this.data.permissions.forEach(per=>{
      if(per?.objectType!=null){
        let tempPer ={approver:per?.objectID,
        roleType:per?.objectType,  
        userName:per?.objectName,  
        signer:per?.recID  } 
        dynamicApprovers.push(tempPer);   
      }
    });
    if(fileIDs?.length>0 && dynamicApprovers?.length>0){
      let option = new DialogModel();
      option.IsFull = true;
      option.zIndex = 1010;
      let popupDialog = this.callFuc.openForm(
        BpSignPDFComponent,
        '',
        null,
        null,
        '',
        { fileIDs: fileIDs, dynamicApprovers: dynamicApprovers,processID:this.process?.recID },
        '',
        option
      );
      popupDialog.closed.subscribe((res) => {
        if (res?.event) {
          // this.isNewForm = false;
          // this.data.extendInfo =
          //   res?.event?.length > 0 ? JSON.parse(JSON.stringify(res?.event)) : [];
          // this.dataChange.emit(this.data);
        }

        this.dataChangeAttach.emit(true);
        this.api.execSv("BP","BP","ProcessesBusiness","GetAsync",this.process.recID).subscribe((item:any)=>{
          if(item){
            this.process.steps=item?.steps;            
            this.process.documentControl=item?.documentControl;
            this.dataChangeProcess.emit(this.process);
          }
          //if(item?.documentControl)
          //{
            // var listF = item.documentControl.filter(x=>x.stepID == this.data?.recID);
            // if(listF && listF.length>0)
            // {
            //   listF.forEach(element => {
            //     let index = this.process.documentControl.findIndex(x=>x.recID == element.recID);
            //     if(index >= 0)
            //     {
            //       this.process.documentControl[index]= element;
            //       if(element?.refID)
            //       {
            //         var indexRef = item.documentControl.findIndex(x=>x.recID == element.refID);
            //         if(indexRef >= 0)
            //         {
            //           var indexP = this.process.documentControl.findIndex(x=>x.recID == item.documentControl[indexRef].recID)
            //           if(indexP >= 0) this.process.documentControl[indexP] = item.documentControl[indexRef];
            //         }
            //       }
            //     }
            //   });
            //   this.dataChangeProcess.emit(this.process);
            //}
          //}
          this.dataChangeAttach.emit(false);
        })
      });
    }
    else{
      this.notifySvr.notify("Biểu mẫu và người ký không được bỏ trống, vui lòng kiểm tra lại!","2");
    }
  }

  fileCheckChange(evt: any, file: any) {
    this.listDocument.forEach(doc=>{
      if(doc?.filess?.length>0){
        let f= doc?.filess?.find(x=>x?.recID==file?.recID);       
        if(f!=null){
          f.esign =!f.esign;
        } 
      }
    });
  }

  //Xóa documentcontrol bỏi templateID
  deleteDocByTemplateID(tmpID:any)
  {
    var index = this.process.documentControl.findIndex(x=>x.templateID == tmpID);

    if(index>=0)
    {
      var id = this.process.documentControl[index].recID;
      this.process.documentControl = this.process.documentControl.filter(x=>x.refID != id);
    }
  }

  selectEsign(id:any , recID:any)
  {
    var indexP = this.process.documentControl.findIndex(x=>x.recID == recID)
    if(indexP >= 0)
    {
      if(this.process.documentControl[indexP]?.files && this.process.documentControl[indexP]?.files.length>0)
      {
        var index2 = this.process.documentControl[indexP].files.findIndex(x=>x.fileID == id);
        if(index2>=0) 
        {
          this.process.documentControl[indexP].files[index2].eSign = !this.process.documentControl[indexP].files[index2].eSign;
          this.listDocument[indexP].files[index2].eSign = !this.listDocument[indexP].files[index2].eSign;

          var mySelected = document.getElementById("esign"+id);
          if(mySelected)
          {
            if(this.listDocument[indexP].files[index2].eSign) mySelected.classList.add("text-primary");
            else mySelected.classList.remove("text-primary");
          }
        }
      }
    }
  }
}
