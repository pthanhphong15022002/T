import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  CodxGridviewV2Component,
  DialogData,
  DialogModel,
  DialogRef,
  NotificationsService,
  UrlUtil,
  Util,
} from 'codx-core';
import { CodxBpService } from 'projects/codx-bp/src/public-api';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { Subject, elementAt, firstValueFrom, forkJoin, isObservable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { ProcessTableExpandComponent } from './process-table-expand/process-table-expand.component';

@Component({
  selector: 'lib-add-process-default',
  templateUrl: './add-process-default.component.html',
  styleUrls: ['./add-process-default.component.css'],
})
export class AddProcessDefaultComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('attachmentUserInfo') attachmentUserInfo: AttachmentComponent;
  @ViewChildren('gridView') gridView: QueryList<CodxGridviewV2Component>;
  @Input() process: any;
  @Input() dataIns: any;
  @Input() type = 'add';
  @Input() stepID: any;
  @Input() taskID: any;
  @Input() privileged = true;
  @Output() dataChange = new EventEmitter<any>();
  @Output() dataTaskChange = new EventEmitter<any>();

  formModel = {
    funcID: '',
    formName: 'DynamicForms',
    gridViewName: 'grvDynamicForms',
    entityName: 'BP_Instances',
    currentData: null,
    bindValue: null,
  };
  data: any;
  dialog: any;
  table: any;
  dataTable = {};
  dataUserInfo = {};
  dynamicFormsForm: FormGroup;
  subTitle: any;
  tableField: any;
  user: any;
  isAttach = false;
  vllBP022: any;
  urlDefault =
    '../../../../../src/assets/themes/sys/default/img/Avatar_Default.svg';
  listFileUserInfo = {};
  indexUploadUserInfo = {};
  defaultFieldName = '';
  infoUser: any;
  listFieldAuto = [];
  gridViewSetup = [];
  listFieldDecimal = [];
  f_Visible = {};
  f_ParaVisible = [];
  formula = [];
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  constructor(
    private notifySvr: NotificationsService,
    private shareService: CodxShareService,
    private auth: AuthStore,
    private cache: CacheService,
    private api: ApiHttpService,
    private bpService: CodxBpService,
    private callFuc: CallFuncService,
    private dChange: ChangeDetectorRef,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.user = auth.get();
    this.dynamicFormsForm = new FormGroup({});
    this.process = this.process || dt?.data?.process;
    this.dataIns = this.dataIns || dt?.data?.dataIns;
    this.type = dt?.data?.type ? dt?.data?.type : this.type;
    this.dialog = dialog;
    this.formModel.funcID = this.dialog.formModel?.funcID;
    this.formModel.bindValue = new Subject();
  }
  ngOnInit(): void {
    if (this.type == 'add') {
      this.dataIns.recID = Util.uid();
      this.dataIns.documentControl = this.process?.documentControl || [];
    }
    this.getData();
    this.getVll();
    this.getInfoUser();
  }
  getVll() {
    this.vllBP022 = this.shareService.loadValueList('BP022');
    if (isObservable(this.vllBP022)) {
      this.vllBP022.subscribe((item) => {
        this.vllBP022 = item;
      });
    }
  }

  getData() {
    var index = 0;
    if (this.stepID) {
      var dts = this.process.steps.filter((x) => x.activityType == 'Form');
      if (dts) {
        index = dts.findIndex((x) => x.recID == this.stepID);
      }
    }
    this.data = this.process.steps.filter((x) => x.activityType == 'Form')[
      index
    ];
    this.data.settings =
      typeof this.data.settings === 'string'
        ? JSON.parse(this.data.settings)
        : this.data.settings;
    this.formatData();
  }

  formatData() {
    this.listFieldAuto = [];
    let indexTable = 0;
    var list = [];
    let extendInfo = JSON.parse(
      JSON.stringify(
        typeof this.data.extendInfo == 'string'
          ? JSON.parse(this.data.extendInfo)
          : this.data.extendInfo
      )
    );
    extendInfo.forEach((element) => {
      let field = element.fieldName.toLowerCase();

      this.gridViewSetup[field] = element;
      if (element.fieldType == 'Attachment') {
        element.documentControl =
          typeof element.documentControl == 'string'
            ? JSON.parse(element.documentControl)
            : element.documentControl;
      }

      if (element.fieldType == 'ComboBox') {
        element.validateControl =
          typeof element.validateControl == 'string'
            ? JSON.parse(element.validateControl)
            : element.validateControl;
      }

      if (element.fieldType != 'Title') {
        let validate = element.isRequired ? Validators.required : null;

        if (element.fieldType == 'Email') validate = Validators.email;
        else if (element.fieldType == 'Phone')
          validate = Validators.pattern('[0-9 ]{11}');
        else if (element.fieldType == 'DateTime') {
          if (element.defaultValue == 'Now') element.defaultValue = new Date();
          //Ngày không được bé hơn ngày hiện tại
          if (element.validateControl == '1')
            validate = this.customeValidatorDateValiControl(element);
          if (element.dependences)
            validate = this.customeValidatorDate(element);
        } else if (
          element.fieldType == 'Text' &&
          element.defaultValue == 'User'
        ) {
          element.defaultValue = this.user?.userName;
        }

        if (this.type == 'add' && !this.taskID) {
          this.dynamicFormsForm.addControl(
            field,
            new FormControl(element.defaultValue, validate)
          );
        } else {
          if (element.fieldType == 'Attachment') {
            if (element.documentControl) {
              this.dataIns.documentControl.forEach((x) => {
                let index = element.documentControl.findIndex(
                  (y) => y.recID == x.recID
                );
                if (index >= 0) element.documentControl[index] = x;
              });
            }
          }
          this.dataIns.datas =
            typeof this.dataIns.datas === 'string'
              ? JSON.parse(this.dataIns.datas)
              : this.dataIns.datas;
          let dataEdit = this.dataIns.datas;
          this.dynamicFormsForm.addControl(
            field,
            new FormControl(dataEdit[field], validate)
          );
        }
      }
      if (element.fieldType == 'SubTitle') this.subTitle = field;
      if (element.fieldType == 'Table') {
        element.dataFormat =
          typeof element.dataFormat == 'string'
            ? JSON.parse(element.dataFormat)
            : element.dataFormat;
        element.tableFormat =
          typeof element.tableFormat == 'string'
            ? JSON.parse(element.tableFormat)
            : element.tableFormat;
        element.columnsGrid = [];
        element.indexTable = indexTable;
        element.dataFormat.forEach((elm2) => {
          var obj = {
            headerText: elm2.title,
            controlType: elm2.controlType,
            field: elm2.fieldName,
            dataType: elm2.dataType,
            refType: elm2?.refType,
            refValue: elm2?.refValue,
            allowEdit: true,
            width: this.get_tex_width(elm2.title)
          };
          element.columnsGrid.push(obj);

          if (elm2.dataType == 'Decimal') {
            let field = element.fieldName + '_sum_' + elm2.fieldName;
            this.listFieldDecimal.push(field);
          }
        });
        this.dataTable[field] = [];
        if (element?.tableFormat?.hasIndexNo) {
          var obj2 = {
            headerText: 'STT',
            controlType: 'Numberic',
            field: 'indexNo',
            dataType: 'Number',
          };
          element.columnsGrid.unshift(obj2);
        }
        indexTable++;

        if (this.type == 'edit') {
          this.dataTable[field] = this.dataIns.datas[field];
        }
        // this.tableField = field;
        // if(this.type == 'add') {
        //   this.dataIns.datas = {};
        //   this.dataIns.datas[field] = [];
        // }
      }
      if (element.fieldType == 'UserInfo') {
        if (this.type == 'add' || this.taskID) {
          this.dataUserInfo[field] = {
            idCardType: '1',
          };
        } else {
          this.dataUserInfo[field] = this.dataIns.datas[field];
          this.listFileUserInfo[field] = [
            {
              fileID: this.dataUserInfo[field]?.idFront,
            },
            {
              fileID: this.dataUserInfo[field]?.idBack,
            },
            {
              fileID: this.dataUserInfo[field]?.idAvatar,
            },
          ];
          this.getFileUserInfo(field);
        }
        this.indexUploadUserInfo[field] = 0;
      }
      if(element.fieldType == "Note")
      {
        element.validateControl =
        typeof element.validateControl == 'string'
          ? JSON.parse(element.validateControl)
          : element.validateControl;
      }
      if (element.autoNumber?.autoNumberControl) {
        var objAuto = {
          field: field,
          autoNumberNo: element.autoNumber?.autoNumberNo,
        };
        this.listFieldAuto.push(objAuto);
      }
      if(element.fieldType == "Expression" && element.refValue)
      {
        var objExpress = 
        {
          field: field,
          refValue: typeof element.refValue == 'string' ? JSON.parse(element.refValue) : element.refValue
        }
        this.formula.push(objExpress);
      }
      //Kiem tra xem field co visiable khong?
      if (element.visibleControl) {
        element.visibleControl =
          typeof element?.visibleControl == 'string'
            ? JSON.parse(element?.visibleControl)
            : element?.visibleControl;
        this.f_Visible[element.fieldName] =
          element?.visibleControl?.visibleControl;
        if (element?.visibleControl?.visibleControl) {
          var obj3 = {
            fieldName: element.fieldName,
            paraValues: element?.visibleControl?.paraValues,
          };
          this.f_ParaVisible.push(obj3);
        }
      }
      var index = list.findIndex((x) => x.columnOrder == element.columnOrder);
      if (index >= 0) {
        list[index].child.push(element);
        list[index].child.sort((a, b) => a.columnNo - b.columnNo);
      } else {
        var obj = {
          columnOrder: element.columnOrder,
          child: [element],
        };
        list.push(obj);
      }
      extendInfo = extendInfo.filter(
        (x) =>
          x.columnOrder != element.columnOrder && x.columnNo != element.columnNo
      );
    });
    list.sort((a, b) => a.columnOrder - b.columnOrder);
    this.table = list;
  }

  customeValidatorDate(dt: any) {
    let field2 = dt.dependences.toLowerCase();
    return (control: AbstractControl): ValidationErrors | null => {
      const pass = control.value;
      const confirmPass = this.dynamicFormsForm.get(field2);
      if (dt?.isRequired && !pass) return { isRequired: true };
      if (!pass) return null;
      if (dt.validateControl == '1' && pass < new Date()) {
        return { pastDate: true };
      } else if (pass < confirmPass?.value) {
        let mess = dt?.fieldName + ' phải lớn hơn ' + field2;
        return { comparedate: true, mess: mess };
      }
      return null;
    };
  }

  customeValidatorDateValiControl(dt: any) {
    return (control: AbstractControl): ValidationErrors | null => {
      const pass = control.value;
      if (dt?.isRequired && !pass) return { isRequired: true };
      else if (pass && pass < new Date()) {
        return { pastDate: true };
      }
      return null;
    };
  }

  getInfoUser() {
    let paras = [this.user.userID];
    let keyRoot = 'BPUserInfo' + this.user.userID;
    this.infoUser = this.shareService.loadDataCache(
      paras,
      keyRoot,
      'HR',
      'HR',
      'EmployeesBusiness_Old',
      'GetTmpEmployeeAsync'
    );
    if (isObservable(this.infoUser)) {
      this.infoUser.subscribe((item) => {
        this.infoUser = item;
      });
    }
  }

  getField(key: string): string {
    if (!key) return '';
    key = key.toLowerCase();
    return Util.camelize(key);
  }

  getFileUserInfo(field: any) {
    let strID = this.listFileUserInfo[field].map((u) => u.fileID);
    this.api
      .execSv(
        'DM',
        'DM',
        'FileBussiness',
        'GetListFileByIDAsync',
        JSON.stringify(strID)
      )
      .subscribe((item: any) => {
        if (item) {
          item.forEach((element) => {
            var index = this.listFileUserInfo[field].findIndex(
              (x) => x.fileID == element.recID
            );
            if (index >= 0) {
              this.listFileUserInfo[field][index].avatar =
                environment.urlUpload + '/' + element.pathDisk;
            }
          });
        }
      });
  }
  dataUploadAttachment(e: any) {
    if (!e || e.length <= 0) return;
    this.attachment.fileUploadList = this.attachment.fileUploadList.concat(e);
  }
  async onSave(type = 1) {
    this.isSaving(true);
    var valueForm = this.dynamicFormsForm.value;
    var keysUserInfo = Object.keys(this.dataUserInfo);
    if (keysUserInfo.length > 0) {
      var flag = false;
      keysUserInfo.forEach((k) => {
        if (this.checkUserInfo(k)) flag = true;
        else {
          this.dynamicFormsForm.controls[k].setValue(this.dataUserInfo[k]);
        }
        valueForm[k] = this.dataUserInfo[k];
      });

      if (flag) {
        this.isSaving(false);
        return;
      }
    }

    if (!this.checkAttachment()) {
      this.isSaving(false);
      return;
    }
    if (this.dynamicFormsForm.invalid) this.findInvalidControls();
    else {
      var keysTable = Object.keys(this.dataTable);

      if (keysTable.length > 0) {
        keysTable.forEach((k) => {

          this.dataTable[k].forEach(element => {
            delete element.delete;
            delete element.isAddNew;
            delete element.updateColumns;
            delete element._isSelect;
            delete element._rowIndex;
            delete element._rowNo;
          });
          valueForm[k] = this.dataTable[k];

          let keysChildTable =
            this.dataTable[k] && this.dataTable[k][0]
              ? Object.keys(this.dataTable[k][0])
              : [];
          if (keysChildTable.length > 0) {
            if (this.listFieldDecimal.some((x) => x.includes(k))) {
              keysChildTable.forEach((kc) => {
                let fieldDecimal = k + '_sum_' + kc;
                if (this.listFieldDecimal.includes(fieldDecimal))
                  valueForm[fieldDecimal] = this.dataTable[k].reduce(
                    (a, b) => +a + +b[kc],
                    0
                  );
              });
            }
          }
        });
      }
      if (this.type == 'add') {
        this.dataIns.title = valueForm[this.subTitle];
        var instanceNoControl = '1';
        var instanceNo = '0';
        var index = this.process.settings.findIndex(
          (x) => x.fieldName == 'InstanceNoControl'
        );
        if (index >= 0)
          instanceNoControl = this.process.settings[index].fieldValue;

        if (instanceNoControl == '0') {
          instanceNo = await firstValueFrom(
            this.bpService.genAutoNumber(
              this.formModel?.funcID,
              this.formModel.entityName,
              'InstanceNo'
            )
          );
        }
        const observablesList = [];
        if (this.listFieldAuto.length > 0) {
          this.listFieldAuto.forEach(async (item) => {
            // valueForm[item.field] = await firstValueFrom(
            //   this.bpService.createAutoNumberByNo(item.autoNumberNo)
            // );
            observablesList.push(this.bpService.createAutoNumberByNo(item.autoNumberNo));
          });
        }

        if(observablesList.length>0)
        {
          forkJoin(observablesList).subscribe(response => {
            for(let i = 0 ; i < this.listFieldAuto.length ; i++)
            {
              valueForm[this.listFieldAuto[i].field] = response[i];
            }
            this.beforeSaveAdd(valueForm,instanceNo,type)
          })
        }
        else
        {
          this.beforeSaveAdd(valueForm,instanceNo,type)
        }
        
      } else if (this.type == 'edit') {
        if (!this.taskID) this.dataIns.title = valueForm[this.subTitle];
        (this.dataIns.modifiedOn = new Date()),
          (this.dataIns.modifiedBy = this.user?.userID);
        if (this.dataIns.datas) {
          if (typeof this.dataIns.datas == 'string')
            this.dataIns.datas = JSON.parse(this.dataIns.datas);

          let keys = Object.keys(valueForm);
          keys.forEach((k) => {
            this.dataIns.datas[k] = valueForm[k];
          });

          this.dataIns.datas = JSON.stringify(this.dataIns.datas);
        } else this.dataIns.datas = JSON.stringify(valueForm);

        if (
          this.attachment?.fileUploadList &&
          this.attachment?.fileUploadList?.length > 0
        ) {
          this.addFileAttach(type);
        } else {
          this.updateIns();
        }
      }
    }
  }

  beforeSaveAdd(valueForm,instanceNo,type)
  {
    var stageF = this.process.steps.filter(
      (x) => x.activityType == 'Stage'
    )[0];
    var stage = {
      recID: Util.uid(),
      instanceID: this.dataIns.recID,
      applyFor: this.process?.applyFor,
      status: '1',
      taskType: stageF?.activityType,
      activityType: stageF?.activityType,
      taskName: stageF?.stepName,
      memo: stageF.memo,
      location: stageF.location,
      interval: stageF.interval,
      duration: stageF.duration,
      settings: stageF.settings,
      stepID: stageF.recID,
      eventControl: stageF?.eventControl,
      extendInfo: stageF?.extendInfo,
      documentControl: stageF?.documentControl,
      reminder: stageF?.reminder,
      checkList: stageF?.checkList,
      note: stageF?.note,
      attachments: stageF?.attachments,
      comments: stageF?.comments,
      isOverDue: stageF?.isOverDue,
      owners: stageF?.owners,
      permissions: stageF?.permissions,
      indexNo: 0,
    };
    var step = {
      recID: Util.uid(),
      instanceID: this.dataIns.recID,
      applyFor: this.process?.applyFor,
      status: '1',
      taskType: this.data?.activityType,
      activityType: this.data?.activityType,
      taskName: this.data?.stepName,
      memo: this.data.memo,
      location: this.data.location,
      interval: this.data.interval,
      duration: this.data.duration,
      settings: JSON.stringify(this.data.settings),
      stepID: this.data.recID,
      eventControl: this.data?.eventControl,
      extendInfo: this.data?.extendInfo,
      documentControl: this.data?.documentControl,
      reminder: this.data?.reminder,
      checkList: this.data?.checkList,
      note: this.data?.note,
      attachments: this.data?.attachments,
      comments: this.data?.comments,
      isOverDue: this.data?.isOverDue,
      owners: this.data?.owners,
      permissions: [
        {
          objectID: this.user?.userID,
          objectName: this.user?.userName,
          objectType: 'U',
        },
      ],
      createdBy: this.user.userID,
      indexNo: 1,
    };
    let fieldName = 'f' + this.data.stepNo + '_owner';
    valueForm[fieldName] = {
      username: this.infoUser?.userName,
      createdon: new Date(),
      position: this.infoUser?.positionID,
      orgunit: this.infoUser?.orgUnitID,
      department: this.infoUser?.departmentID,
      company: this.infoUser?.companyID,
    };
    (this.dataIns.processID = this.process?.recID),
      (this.dataIns.instanceNo = instanceNo),
      (this.dataIns.instanceID = this.dataIns.recID),
      (this.dataIns.status = '1'),
      (this.dataIns.currentStage = stageF.recID),
      (this.dataIns.currentStep = step.recID),
      (this.dataIns.lastUpdate = null),
      (this.dataIns.closed = false),
      (this.dataIns.closedOn = null),
      (this.dataIns.startDate = null),
      (this.dataIns.endDate = null),
      (this.dataIns.progress = null),
      (this.dataIns.actualStart = null),
      (this.dataIns.actualEnd = null),
      (this.dataIns.createdOn = new Date()),
      (this.dataIns.createdBy = this.user?.userID),
      (this.dataIns.duration = this.process?.duration),
      (this.dataIns.datas = JSON.stringify(valueForm));
    this.dataIns.employeeID = this.infoUser?.employeeID;
    this.dataIns.positionID = this.infoUser?.positionID;
    this.dataIns.orgUnitID = this.infoUser?.orgUnitID;
    this.dataIns.departmentID = this.infoUser?.departmentID;
    this.dataIns.divisionID = this.infoUser?.divisionID;
    this.dataIns.buid = this.infoUser?.buid;
    this.dataIns.companyID = this.infoUser?.companyID;
    // if(!this.dataIns?.documentControl) this.dataIns.documentControl = [];
    // this.dataIns.documentControl = this.data?.documentControl.concat(this.dataIns.documentControl);
    var listTask = JSON.stringify([stage, step]);
    //Luu process Task
    this.api
      .execSv(
        'BP',
        'BP',
        'ProcessTasksBusiness',
        'SaveListTaskAsync',
        listTask
      )
      .subscribe();
    //Luu Instanes
    this.api
      .execSv(
        'BP',
        'BP',
        'ProcessInstancesBusiness',
        'SaveInsAsync',
        this.dataIns
      )
      .subscribe(async (item) => {
        //addFile nếu có
        this.addFileAttach(type);
      });
  }
  async addFileAttach(type: any) {
    if (
      this.attachment?.fileUploadList &&
      this.attachment?.fileUploadList?.length > 0
    ) {
      (await this.attachment.saveFilesObservable()).subscribe((item2) => {
        if (item2) {
          let arr = [];
          if (!Array.isArray(item2)) {
            arr.push(item2);
          } else arr = item2;
          arr.forEach((elm) => {
            var obj = {
              fileID: elm.data.recID,
              type: 1,
            };
            var index = this.dataIns.documentControl.findIndex(
              (x) => x.fieldID == elm.data.objectID
            );
            if (index >= 0) {
              if (!this.dataIns.documentControl[index]?.files)
                this.dataIns.documentControl[index].files = [];
              this.dataIns.documentControl[index].files.push(obj);
            }
          });
          this.api
            .execSv(
              'BP',
              'BP',
              'ProcessInstancesBusiness',
              'UpdateInsAsync',
              this.dataIns
            )
            .subscribe((savedIn) => {
              if (this.type == 'add') {
                this.bpService
                  .createTaskOnSaveInstance(this.dataIns.recID)
                  .subscribe((res) => {
                    if (type == 1) {
                      this.dialog.close(this.dataIns);
                    } else {
                      this.startInstance(this.dataIns.recID);
                    }
                  });
              } else {
                if (type == 1) {
                  this.dialog.close(this.dataIns);
                } else {
                  this.startInstance(this.dataIns.recID);
                }
              }
            });
          //this.dataIns.documentControl.
        }
      });
    } else {
      if (this.type == 'add') {
        this.bpService
          .createTaskOnSaveInstance(this.dataIns.recID)
          .subscribe((res) => {
            if (type == 1) {
              this.dialog.close(this.dataIns);
            } else {
              this.startInstance(this.dataIns.recID);
            }
          });
      } else {
        if (type == 1) {
          this.dialog.close(this.dataIns);
        } else {
          this.startInstance(this.dataIns.recID);
        }
      }
    }
  }

  checkUserInfo(data: any) {
    var isRequired = this.data.extendInfo.filter((x) => x.fieldName == data)[0]
      .isRequired;
    if (isRequired) {
      let arr = [];
      if (!this.dataUserInfo[data]?.userName) arr.push('Họ và tên');
      if (!this.dataUserInfo[data]?.idCardNo) arr.push('Số CMT/CCCD/Hộ chiếu');
      if (!this.dataUserInfo[data]?.email) arr.push('Email');
      if (!this.dataUserInfo[data]?.phone) arr.push('Phone');
      if (!this.dataUserInfo[data]?.idFront) arr.push('Ảnh mặt trước');
      if (!this.dataUserInfo[data]?.idBack) arr.push('Ảnh mặt trước');
      if (!this.dataUserInfo[data]?.idAvatar) arr.push('Ảnh chân dung');

      if (arr.length > 0) {
        var mess = arr.join(', ');
        this.notifySvr.notify(mess + ' không được để trống.');
        return true;
      }
    }
    return false;
  }

  updateIns() {
    this.api
      .execSv(
        'BP',
        'BP',
        'ProcessInstancesBusiness',
        'UpdateInsAsync',
        this.dataIns
      )
      .subscribe((item) => {
        this.dialog.close(this.dataIns);
        this.dataChange.emit(this.dataIns);
        if (this.taskID) {
          this.updateTaskStatus('5');
        }
      });
  }

  checkAttachment() {
    if (!this.dataIns.documentControl) return true;
    else {
      var arr = [];
      this.dataIns.documentControl.forEach((elm) => {
        if (elm.isRequired && (elm?.countAttach == 0 || !elm?.countAttach)) {
          arr.push(elm.title);
        }
      });

      if (arr.length > 0) {
        var name = arr.join(', ');
        name += ' ' + 'bắt buộc đính kèm mẫu';
        this.notifySvr.notify(name);
        return false;
      }
      return true;
    }
  }

  findInvalidControls() {
    const invalid = [];
    const email = [];
    const phone = [];
    const date = [];
    const pastDate = [];
    const controls = this.dynamicFormsForm.controls;
    for (const name in controls) {
      if (controls[name].invalid && controls[name].errors) {
        if (controls[name].errors?.email) email.push(name);
        else if (controls[name].errors?.pattern) phone.push(name);
        else if (controls[name].errors?.comparedate)
          date.push(controls[name].errors.mess);
        else if (controls[name].errors?.pastDate) pastDate.push(name);
        else invalid.push(name);
      } else if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    var name = invalid.join(' , ');
    var nameEmail = email.join(' , ');
    var namePhone = phone.join(' , ');
    var nameDate = date.join(' , ');
    var namePastDate = pastDate.join(' , ');
    if (
      email.length == 0 &&
      phone.length == 0 &&
      date.length == 0 &&
      pastDate.length == 0
    )
      this.notifySvr.notifyCode('SYS009', 0, name);
    else {
      var str = '';
      if (nameEmail) str += nameEmail + ' sai định dạng email. ';
      if (namePhone) str += namePhone + ' sai định dạng. ';
      if (nameDate) str += nameDate + ' ';
      if (namePastDate) str += namePastDate + ' không được nhập ngày quá khứ. ';
      if (name) str += name + 'không được phép bỏ trống.';
      this.notifySvr.notify(str);
      this.isSaving(false);
    }
  }

  dataChangeAttachmentGrid(e: any) {
    if (!this.dataIns.documentControl) this.dataIns.documentControl = [];
    if (Array.isArray(e)) {
      e.forEach((elm) => {
        var dt = JSON.parse(JSON.stringify(elm));
        var index = this.dataIns.documentControl.findIndex(
          (x) => x.recID == elm.recID
        );
        if (index >= 0) this.dataIns.documentControl[index] = dt;
        else this.dataIns.documentControl.push(dt);
      });
      //this.api.execSv("BP","BP","ProcessInstancesBusiness","UpdateInsAsync",this.dataIns).subscribe();
    }
  }

  editTable(index: any, e: any) {
    if (typeof this.dataIns.datas[this.tableField][index] === 'string') {
      this.dataIns.datas[this.tableField][index] = {};
    }
    this.dataIns.datas[this.tableField][index][e?.field] = e?.data;
  }

  startProcess(recID: any) {
    this.api
      .execSv(
        'BP',
        'ERM.Business.BP',
        'ProcessesBusiness',
        'StartProcessAsync',
        [recID]
      )
      .subscribe((res: any) => {
        if (res) {
          if (res?.recID) {
            this.dataIns = res;
          } else {
            this.dataIns.status = '3';
          }
          this.dialog.close(this.dataIns);
        }
      });
  }

  startInstance(recID: any) {
    this.bpService.startInstance(recID).subscribe((res: any) => {
      if (res) {
        if (res?.recID) {
          this.dataIns = res;
        } else {
          this.dataIns.status = '3';
        }
        this.dialog.close(this.dataIns);
      } else {
        this.isSaving(false);
        return;
      }
    });
  }
  dataChangeAttachment(e: any) {
    this.isAttach = e;
  }
  isSaving(saving: boolean) {
    this.isAttach = saving;
    this.dChange.detectChanges();
  }


  gridDs: any = [];
  addRow2(index = 0) {
    var grid = this.gridView.find((_, i) => i == index);
    var data = {
      delete : true
    };
    //if(!grid.dataSource) grid.dataSource = [];
    grid.addRow(data, grid.dataSource.length);
    //grid.refresh();
  }
  deleteRow(data: any, fieldName: any, index = 0, hasIndexNo = false) {
    this.dataTable[fieldName.toLowerCase()].splice(data.index, 1);
    if (hasIndexNo) {
      let i = 1;
      this.dataTable[fieldName.toLowerCase()].forEach((elm) => {
        elm.indexNo = i;
        i++;
      });
    }
    var grid = this.gridView.find((_, i) => i == index);
    grid.refresh();
  }

  clickMFGrid(e: any, data: any) {
    let funcID = e?.event?.functionID;
    switch (funcID) {
      // //Chỉnh sửa
      // case 'SYS03': {
      //   this.addRow(data.dataFormat, data.fieldName, data.indexTable, e.data);
      //   break;
      // }
      //Xóa
      case 'SYS02': {
        var config = new AlertConfirmInputConfig();
        config.type = 'YesNo';
        this.notifySvr
          .alert('Thông báo', 'Bạn có chắc chắn muốn xóa?', config)
          .closed.subscribe((x) => {
            if (x.event.status == 'Y')
              this.deleteRow(
                e?.data,
                data.fieldName,
                data.indexTable,
                data?.tableFormat?.hasIndexNo
              );
          });
        break;
      }
    }
  }

  clickUploadFile(index: any, fieldName: any, objectID: any) {
    this.defaultFieldName = fieldName;
    this.indexUploadUserInfo[fieldName] = index;
    this.attachmentUserInfo.objectId = objectID;
    this.attachmentUserInfo.uploadFile();
  }

  fileSave(e: any) {
    var obj = {
      avatar: environment.urlUpload + '/' + e?.pathDisk,
    };

    if (!this.listFileUserInfo[this.defaultFieldName])
      this.listFileUserInfo[this.defaultFieldName] = [];
    this.listFileUserInfo[this.defaultFieldName][
      this.indexUploadUserInfo[this.defaultFieldName]
    ] = obj;

    let fieldName = 'idAvatar';
    if (this.indexUploadUserInfo[this.defaultFieldName] == 0)
      fieldName = 'idFront';
    else if (this.indexUploadUserInfo[this.defaultFieldName] == 1)
      fieldName = 'idBack';
    this.dataUserInfo[this.defaultFieldName][fieldName] = e?.recID;
  }

  valueChangeUserInfo(e: any, fieldName: any) {
    if (e?.component?.type == 'radio' && !e?.component?.checked) return;
    if (!this.dataUserInfo[fieldName.toLowerCase()])
      this.dataUserInfo[fieldName.toLowerCase()] = {};

    this.dataUserInfo[fieldName.toLowerCase()][e?.field] = e?.data;
  }

  valueChange(e: any) {
    if (!this.dynamicFormsForm.get(e?.field).value)
      this.dynamicFormsForm.controls[e?.field].setValue(e?.data);
    else this.dynamicFormsForm.value[e?.field] = e?.data;

    this.checkVisisable(e);
    this.expression(e);
  }

  getUrl(field: any, index: any) {
    if (!this.listFileUserInfo[field]) return this.urlDefault;
    else {
      if (!this.listFileUserInfo[field][index]) return this.urlDefault;
      return this.listFileUserInfo[field][index]?.avatar || this.urlDefault;
    }
  }

  validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };

  updateTaskStatus(status) {
    //Update Task Status test
    this.api
      .execSv(
        'BP',
        'ERM.Business.BP',
        'ProcessesBusiness',
        'UpdateStatusTaskAsync',
        [this.taskID, status] //Hoàn tất
      )
      .subscribe((res) => {
        if (res) {
          this.dataTaskChange.emit([res, this.dataIns]);
          // if (this.data.activityType != 'Sign')
          //   this.notifySvr.notifyCode('SYS034');
          // this.dialog && this.dialog.close(res);
        }
      });
  }

  valueChangeInput(e: any) {
    this.checkVisisable(e);
    this.expression(e);
  }

  afterRender(evt: any, input: any, refersouce: any) {
    if (!refersouce) return;
    if (input.typecheck == 'combobox') {
      let predicate = this.buildReferedsource(refersouce);
      if (evt.predicates) {
        evt.dataService.predicates += ' and ' + predicate;
      } else evt.dataService.predicates = predicate;
    }
  }

  private buildReferedsource(referedSources: string): string {
    var refSources = referedSources.split(',');
    let pre = '';
    for (var i = 0; i < refSources.length; i++) {
      var refSource = refSources[i];
      var refValue = null;
      var referPredicate = '';

      if (refSource.indexOf('[') > 0) {
        referPredicate = UrlUtil.modifiedUrlByObj(refSource, this.dataIns, '"');
      } else {
        refValue = this.dataIns[refSource];
        if (refValue) {
          var arrRefValue = refValue.split(';');
          arrRefValue.forEach((element: any, index: number) => {
            if (index == 0) referPredicate = refSource + '=="' + element + '"';
            else referPredicate += ' or ' + refSource + '=="' + element + '"';
          });
        }
      }

      pre = referPredicate;
    }

    return pre;
  }

  checkVisisable(e) {
    this.f_ParaVisible.forEach((elm) => {
      for (var i = 0; i < elm.paraValues.filters.length; i++) {
        let elm2 = elm.paraValues.filters[i];
        this.f_Visible[elm.fieldName] = this.resultVisiable(elm2, e);

        if (
          (elm.paraValues.logic == 'and' && this.f_Visible[elm.fieldName]) ||
          (elm.paraValues.logic == 'or' && !this.f_Visible[elm.fieldName])
        ) {
          elm2.filters.forEach((elm3) => {
            if (this.f_Visible[elm3.field]) this.hideVisiableChild(elm3.field);
          });

          break;
        }
      }
    });
  }

  resultVisiable(data: any, e: any) {
    let result = false;
    data.filters.forEach((elm: any) => {
      result = !this.convertOperator(elm.field, elm.operator, elm.value, e);
      if ((!result && data.logic == 'and') || (result && data.logic == 'or'))
        return;
    });
    return result;
  }

  convertOperator(field, operator, value, e) {
    let comp = this.dynamicFormsForm.value[field];
    if (field == e?.field) comp = e?.data;
    if (!comp) return false;
    switch (operator.toLowerCase()) {
      case 'eq':
      case '=': {
        return comp == value;
      }
      case 'neq':
      case '<>':
      case '!=': {
        return comp != value;
      }
      case 'contains': {
        return comp.includes(value);
      }
      case 'nocontains': {
        return !comp.includes(value);
      }
      case 'startswitch': {
        return comp.startsWith(value);
      }
      case 'empty': {
        if (!comp) return true;
        return false;
      }
      case 'noempty': {
        if (comp) return true;
        return false;
      }
      case 'gte':
      case '>=': {
        return comp >= value;
      }
      case 'lte':
      case '<=': {
        return comp <= value;
      }
      case '<': {
        return comp < value;
      }
      case '>': {
        return comp > value;
      }
    }
    return false;
  }

  hideVisiableChild(e: any) {
    let arr = [];
    this.f_ParaVisible.forEach((elm) => {
      elm.paraValues.filters.forEach((elm2) => {
        let check = elm2.filters.some((x) => x.field == e);
        if (check) {
          if (!arr.includes(elm.fieldName)) arr.push(elm.fieldName);
        }
      });
    });
    if (arr.length > 0) {
      arr.forEach((elm) => {
        this.f_Visible[elm] = true;
        this.hideVisiableChild(elm);
      });
    }
  }

  expression(e:any)
  {
    for(var x=0; x< this.formula.length ; x++)
    {
      if(e?.field == this.formula[x].field) break;
      let data = "";
      for(var i=0; i < this.formula[x].refValue.length ; i++)
      {
        let result = this.caculator(this.formula[x].refValue[i],e);
        if(result) 
        {
          if(this.isExpression(result))
          {
            let a =  eval(result);
            data += a;
          }
          else
          {
            data += result;
          }
        }
        else
        {
          data = "";
          break;
        }
      }

      this.dynamicFormsForm.controls[this.formula[x]?.field].setValue(data);
    }
  }
 
  isExpression(s) {
    const re = /(?:(?:^|[-+_*/])(?:\s*-?\d+(\.\d+)?(?:[eE][+-]?\d+)?\s*))+$/;
    return re.test(s);
  }
  caculator(dt:any,e:any)
  {
    let result = "";
    for (var i = 0; i < dt.length; i++) {
      if(dt[i].startsWith("["))
      {
        let f = dt[i].slice(1,-1);
        let comp = this.dynamicFormsForm.value[f];
        if(f == e?.field) comp = e?.data;

        if(!comp) {
          result = "";
          break;
        }
        result += comp;
      }
      else result += dt[i];
    }
    
    return result;
  }

  get_tex_width(txt) {
    var l = txt.length * 10;
    if(l < 100)  l = 100;
    return l ;
  }

  //Mở rộng table nhập liệu
  expandTable(dt:any)
  {
    let data = 
    {
      headerText: dt?.title,
      columnsGrid: dt?.columnsGrid,
      dataSource: this.dataTable[dt?.fieldName],
      editSettings: this.editSettings,
      indexTable: dt?.indexTable,
      hasIndexNo: dt?.tableFormat?.hasIndexNo
    }
    let popup = this.callFuc.openForm(ProcessTableExpandComponent,"",1200,900,"",data);
    popup.closed.subscribe(res=>{
      if(res?.event) {
        this.dataTable[dt?.fieldName] = res?.event;
        var grid = this.gridView.find((_, i) => i == dt?.indexTable);
        grid.refresh();
      }
    })
  }
}
