import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  Filters,
  FormModel,
  NotificationsService,
  QueryBuilderComponent,
} from 'codx-core';
// import { Approvers } from 'projects/codx-es/src/lib/codx-es.model';
// import { CodxEsService } from 'projects/codx-es/src/public-api';
import { Approvers, CodxShareService } from '../../../codx-share.service';
import { PopupAddApproverComponent } from '../popup-add-approver/popup-add-approver.component';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ShareType } from '../../../models/ApproveProcess.model';
import { PopupAddPersonSignerComponent } from '../popup-add-person-signer/popup-add-person-signer.component';

@Component({
  selector: 'lib-add-edit-approval-step',
  templateUrl: './add-edit-approval-step.component.html',
  styleUrls: ['./add-edit-approval-step.component.scss'],
})
export class AddEditApprovalStepComponent implements OnInit, AfterViewInit {
  @ViewChild('tabInfo', { static: true }) tabInfo: TemplateRef<any>;
  @ViewChild('tabQuery', { static: true }) tabQuery: TemplateRef<any>;
  @ViewChild('tabEmail', { static: true }) tabEmail: TemplateRef<any>;
  @ViewChild('tabAnother', { static: true }) tabAnother: TemplateRef<any>;
  @ViewChild('addApproverTmp', { static: true })
  addApproverTmp: TemplateRef<any>;
  @ViewChild('queryBuilder', { static: false })
  queryBuilder: QueryBuilderComponent;

  @Output() close = new EventEmitter();
  @Input() transId = '';
  @Input() stepNo = 1;
  @Input() vllShare = null;
  @Input() hideTabQuery = true;
  @Input() isSettingMode = true;
  dataEdit: any;

  isAfterRender = false;
  isAdd = true;
  formModel: FormModel;

  formModelCustom: FormModel;
  dialogApprovalStep: FormGroup;

  lstApproveMode: any;
  currentApproveMode: string;

  confirmControl: string = '0';
  negative: string = '0';
  allowEditAreas: boolean;
  positionDefault: string = '';

  dialog: DialogRef;
  lstStep;
  isSaved = false;
  header1 = 'Thiết lập quy trình duyệt';
  subHeaderText = 'Quy trình duyệt';
  defaultSignType = '';
  eSign: boolean = false;

  data: any = {};
  lstApprover: any = [];
  newAppr: any;
  headerText1;

  user; //Thông tin người đang nhập

  title = '';
  listTab: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'tabInfo' },
    // { icon: 'icon-rule', text: 'Điều kiện', name: 'tabQuery' },
    {
      icon: 'icon-email',
      text: 'Email/thông báo',
      name: 'tabEmail',
    },
    {
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'tabAnother',
    },
  ];
  qbFilter: any;
  vllStepType = [];
  userOrg: any;
  lblAllowEditAreas: any;
  lblConfirmControl: any;
  indexAppr = -1;
  stepGrv: any;
  setTitle(e: any) {
    console.log(e);
  }

  buttonClick(e: any) {
    if (e.nextId == 'tabQuery') {
      setTimeout(() => {
        document
          .getElementsByTagName('codx-query-builder')[0]
          ?.querySelector('.card-header')
          .classList.add('d-none');
        document
          .getElementsByTagName('codx-query-builder')[0]
          ?.querySelector('.card-footer')
          .classList.add('d-none');
      }, 200);
    }
    console.log(e);
  }

  constructor(
    // private esService: CodxEsService,
    private auth: AuthStore,
    private codxService: CodxShareService,
    private cr: ChangeDetectorRef,
    private notifySvr: NotificationsService,
    private cache: CacheService,
    private callfc: CallFuncService,
    private api: ApiHttpService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.user = this.auth.get();
    this.dialog = dialog;
    this.transId = data?.data?.transID;
    this.stepNo = data?.data?.stepNo;
    this.lstStep = data?.data?.lstStep;
    this.isAdd = data?.data?.isAdd;
    this.dataEdit = data?.data?.dataEdit;
    this.defaultSignType = data?.data?.signatureType;

    this.allowEditAreas = data?.data?.allowEditAreas;
    this.confirmControl = data?.data?.confirmControl;
    //this.negative = data?.data?.negative ?? "0";

    this.eSign = data?.data?.eSign ?? false;
    let vllStepTypeName = this.eSign ? 'ES002' : 'ES026';
    this.cache.valueList(vllStepTypeName).subscribe((vllStepType) => {
      if (vllStepType) {
        this.vllStepType = vllStepType?.datas;
      }
    });
    this.data = JSON.parse(JSON.stringify(data?.data.dataEdit));
    if (this.vllShare == null) {
      this.vllShare =
        data?.data?.vllShare != null ? data?.data?.vllShare : 'ES014';
    }

    //this.hideTabQuery = data?.data?.hideTabQuery ?? true;
    if (this.isAdd) {
      this.qbFilter = new Filters();
      this.qbFilter.logic = 'or';
      this.qbFilter.filters = [];
    } else {
      if (this.data?.constraints?.length > 0) {
        this.qbFilter = this.data?.constraints[0];
      } else {
        this.qbFilter = new Filters();
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.dialog) {
      this.dialog.closed.subscribe((res) => {
        if (!this.isSaved) {
        }
      });
    }
  }

  ngOnInit(): void {
    this.cache.getCompany(this.user?.userID).subscribe((userOrg) => {
      if (userOrg) {
        this.userOrg = userOrg;
      }
    });
    this.cache
      .gridViewSetup('ApprovalSteps_Approvers', 'grvApprovalSteps_Approvers')
      .subscribe((grv) => {
        if (grv) {
          this.lblAllowEditAreas = grv?.AllowEditAreas?.headerText;
          this.lblConfirmControl = grv?.ConfirmControl?.headerText;
        }
      });
    if (this.isAdd) {
      this.codxService
        .getDataValueOfSetting('ESParameters', null, '1')
        .subscribe((res: any) => {
          if (res) {
            let esSetting = JSON.parse(res);
            if (esSetting != null) {
              let esAllowEditAreas = false;
              this.confirmControl =
                this.confirmControl == null
                  ? esSetting?.ConfirmControl
                  : this.confirmControl;
              if (
                esSetting?.AllowEditAreas == '1' ||
                esSetting?.AllowEditAreas == true
              ) {
                esAllowEditAreas = true;
              }
              this.allowEditAreas =
                this.allowEditAreas == null
                  ? esAllowEditAreas
                  : this.allowEditAreas;
            }
          }
        });
    }
    this.formModelCustom = new FormModel();
    this.formModelCustom.formName = 'ApprovalSteps_Approvers';
    this.formModelCustom.gridViewName = 'grvApprovalSteps_Approvers';
    this.codxService.getFormModel('EST04').then((res) => {
      if (res) {
        this.formModel = res;
        this.dialog.formModel = this.formModel;
      }
      this.cache.valueList('ES016').subscribe((vllMode) => {
        if (vllMode) {
          this.lstApproveMode = vllMode.datas;
        }
      });
      this.initForm();
    });
  }

  initForm() {
    this.cache
      .gridViewSetup('ApprovalSteps_Approvers', 'grvApprovalSteps_Approvers')
      .subscribe((grv) => {
        if (grv) {
          this.positionDefault = grv['Position']['headerText'];
        }
      });
    this.codxService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.dialogApprovalStep = item;

        if (this.isAdd) {
          this.codxService
            .getESDataDefault('EST04', this.formModel.entityName, 'recID')
            .subscribe((res: any) => {
              if (res) {
                this.data = res.data;
                if (this.data.stepName == '' || this.data.stepName == null) {
                  // let vllName = this.eSign == true ? 'ES002' : 'ES026';
                  // this.cache.valueList(vllName).subscribe((res) => {
                  //   if (res?.datas) {
                  //     let i = res.datas.findIndex(
                  //       (p) => p.value == this.data.stepType
                  //     );
                  //     this.data.stepName = res.datas[i]?.text;
                  //     this.dialogApprovalStep.patchValue({
                  //       stepName: this.data.stepName,
                  //     });
                  //   }
                  // });
                  if (this.vllStepType?.length > 0) {
                    let stepType = this.vllStepType.filter(
                      (p) => p.value == this.data.stepType
                    );
                    if (stepType?.length > 0) {
                      this.data.stepName = stepType[0]?.text;
                      this.dialogApprovalStep.patchValue({
                        stepName: this.data.stepName,
                      });
                      this.cr.detectChanges();
                    }
                  }
                }
                this.data.stepNo = this.stepNo;
                this.data.transID = this.transId;
                this.data.constraints = [this.qbFilter];
                this.data.signatureType = this.defaultSignType;
                this.dialogApprovalStep.patchValue(this.data);

                this.codxService.getNewDefaultEmail().subscribe((emailTmp) => {
                  this.data.emailTemplates = emailTmp;
                  this.dialogApprovalStep.patchValue({
                    emailTemplates: emailTmp,
                  });
                });
                this.currentApproveMode = '1';
                this.formModel.currentData = this.data;
                this.isAfterRender = true;
              } else {
                this.notifySvr.notifyCode('208');
                this.dialog && this.dialog.close();
              }
            });
        } else {
          this.dialogApprovalStep.patchValue(this.dataEdit);
          this.lstApprover = JSON.parse(
            JSON.stringify(this.dataEdit?.approvers)
          );
          if (this.lstApprover?.length > 0) {
            this.lstApprover.forEach((element) => {
              this.confirmControl = element?.confirmControl ?? '0';
              //this.negative = element?.negative ?? '0';
              this.allowEditAreas = element?.allowEditAreas ?? false;

              if (element.roleType == 'PA' || element.roleType == 'PE')
                element.write = true;
              else element.write = false;

              element.delete = true;
              element.share = false;
              element.assign = false;
            });
          }
          this.currentApproveMode = this.dataEdit?.approveMode;
          this.formModel.currentData = this.data;
          this.isAfterRender = true;

          if (!this.dialogApprovalStep.value.emailTemplates) {
            this.codxService.getNewDefaultEmail().subscribe((res) => {
              this.dialogApprovalStep.patchValue({ emailTemplates: res });
            });
          }
        }
      });
  }

  valueChange(event) {
    if (event?.field && event?.component) {
      switch (event.field) {
        case 'allowEditAreas': {
          this.allowEditAreas = event?.data;
          break;
        }
        case 'stepType': {
          this.data[event?.field] = event?.data;
          this.dialogApprovalStep.patchValue({ [event?.field]: event.data });

          if (this.vllStepType?.length > 0) {
            let stepType = this.vllStepType.filter(
              (p) => p.value == event.data
            );
            if (stepType?.length > 0) {
              this.data.stepName = stepType[0]?.text;
              this.dialogApprovalStep.patchValue({
                stepName: this.data.stepName,
              });
              this.cr.detectChanges();
            }
          }

          //Loại cấp phát -> duyệt đại diện
          if (this.data.stepType == 'I') {
            this.data.approveMode = '3';
            this.dialogApprovalStep.patchValue({
              approveMode: this.data.approveMode,
            });
            this.currentApproveMode = this.data.approveMode;
            this.cr.detectChanges();
          }
          break;
        }
        case 'overdueControl': {
          if (event.data == '3') {
            this.data.loops = 1;
            this.dialogApprovalStep?.patchValue({ loops: this.data.loops });
          } else {
            this.data.loops = 0;
            this.dialogApprovalStep?.patchValue({ loops: this.data.loops });
          }

          break;
        }
        case 'approveMode': {
          if (
            this.lstApprover?.filter((x) => x.negative == '1')?.length > 0 &&
            event?.data != '2'
          ) {
            this.notifySvr.alertCode('ES038').subscribe((x) => {//Đổi mode duyệt xóa quyền phủ quyết
              if (x.event?.status == 'Y') {
                this.lstApprover?.forEach((apr) => {
                  apr.negative = '0';
                  this.currentApproveMode = event?.data;
                  this.data.approveMode = event?.data;
                  this.dialogApprovalStep?.patchValue({
                    approveMode: this.data.approveMode,
                  });
                });
              } else {
                this.data.approveMode = this.data.approveMode;
                this.dialogApprovalStep?.patchValue({
                  approveMode: this.data.approveMode,
                });
              }
            });
          } else {
            this.currentApproveMode = event?.data;
            this.data.approveMode = event?.data;
            this.dialogApprovalStep?.patchValue({
              approveMode: this.data.approveMode,
            });
          }
          break;
        }
        default: {
          this.data[event?.field] = event?.data;
          this.dialogApprovalStep.patchValue({ [event?.field]: event?.data });
        }
      }
      this.cr.detectChanges();
    }
  }
  valueApprChange(evt: any) {
    if (evt?.field) {
      switch (evt?.field) {
        case 'confirmControl':
          this.newAppr.confirmControl = evt?.data ? '1' : '0';
          break;
        case 'negative':
          this.newAppr.negative = evt?.data ? '1' : '0';
          break;
        default:
          this.newAppr[evt?.field] = evt?.data;
          break;
      }
      this.cr.detectChanges();
    }
  }
  addAppr() {
    this.newAppr = new Approvers();
    this.newAppr.signatureType = '2';
    this.newAppr.stepType = 'A2';
    this.newAppr.idCardType = '1';
    this.newAppr.confirmControl = this.confirmControl ?? '0';
    this.newAppr.negative = '0';
    this.newAppr.allowEditAreas = this.allowEditAreas ?? true;
    this.newAppr.createdBy = this.user?.userID;
    this.indexAppr = -1;
    this.cr.detectChanges();
    let dialog = this.callfc.openForm(this.addApproverTmp, '', 400, 450);
  }
  clickMFApprover(evt: any) {
    if (evt) {
      switch (evt?.functionID) {
        case 'SYS02':
          this.newAppr = new Approvers();
          this.newAppr.signatureType = '2';
          this.newAppr.stepType = 'A2';
          this.newAppr.idCardType = '1';
          this.newAppr.confirmControl = this.confirmControl ?? '0';
          this.newAppr.negative = '0';
          this.newAppr.allowEditAreas = this.allowEditAreas ?? true;
          this.newAppr.createdBy = this.user?.userID;
          this.cr.detectChanges();
          break;
      }
    }
  }
  saveApprover(dialog: any, index: number) {
    if (this.newAppr?.roleType != null) {
      if (this.lstApprover?.length == 0) this.lstApprover = [];
      if (index >= 0) {
        if (
          (this.newAppr.negative == '1' || this.newAppr.negative == true) &&
          this.currentApproveMode != '2'
        ) {
          this.notifySvr.alertCode('ES037').subscribe((x) => {//Bật quyền phủ quyết bật mode song song
            if (x.event?.status == 'Y') {
              this.dialogApprovalStep?.patchValue({ approveMode: '2' });
              this.data.approveMode = '2';
              this.currentApproveMode = '2';
              this.cr.detectChanges();
              this.lstApprover[index] = this.newAppr;
            } else {
              this.newAppr.negative = '0';              
              this.lstApprover[index] = this.newAppr;
              this.cr.detectChanges();
            }
          });
        } else {
          this.lstApprover[index] = this.newAppr;
        }
      } else {
        if (
          this.newAppr?.approver != null &&
          this.newAppr?.approver != this.newAppr?.roleType
        ) {
          this.lstApprover = this.lstApprover.filter(
            (x) => x?.approver != this.newAppr?.approver
          );
        } else {
          this.lstApprover = this.lstApprover.filter(
            (x) => x?.roleType != this.newAppr.roleType
          );
        }
        if (
          (this.newAppr.negative == '1' || this.newAppr.negative == true) &&
          this.currentApproveMode != '2'
        ) {
          this.notifySvr.alertCode('ES037').subscribe((x) => {//Bật quyền phủ quyết bật mode song song
            if (x.event?.status == 'Y') {
              this.dialogApprovalStep?.patchValue({ approveMode: '2' });
              this.data.approveMode = '2';
              this.currentApproveMode = '2';
              this.cr.detectChanges();
              this.lstApprover.push(this.newAppr);
            } else {
              this.newAppr.negative = '0';
              this.cr.detectChanges();
            }
          });
        } else {
          this.lstApprover.push(this.newAppr);
        }
      }
      this.cr.detectChanges();
      dialog && dialog?.close();
    }
  }
  editApprover(index: number) {
    this.newAppr = { ...this.lstApprover[index] };
    this.newAppr.signatureType = this.newAppr?.signatureType ?? '2';
    this.newAppr.stepType = this.newAppr?.stepType ?? 'A2';
    this.cr.detectChanges();
    this.indexAppr = index;
    let dialog = this.callfc.openForm(this.addApproverTmp, '', 400, 450);
  }
  deleteApprover(index: number) {
    this.lstApprover.splice(index, 1);
    this.cr.detectChanges();
  }

  applyApprover(event) {
    if (event) {
      event?.data?.forEach((element) => {
        //let appr = new Approvers();
        this.newAppr.name = element?.text;
        this.newAppr.roleType =
          element?.objectType == 'SYS061' ? element?.id : element?.objectType;
        this.newAppr.icon = element?.icon;
        switch (element?.objectType) {
          //----------------------------------------------------------------------------------//
          case ShareType.ResourceOwner: //	Chủ sở hữu nguồn lực
          case ShareType.Owner: //	Người sở hữu
          case ShareType.Employee: //	Nhân viên
          case ShareType.Created: //	Người tạo
          case ShareType.TeamLead: //	Trưởng nhóm
          case ShareType.AM: //	Thư ký phòng
          case ShareType.DM: //	Phó phòng
          case ShareType.MA: //	Trưởng phòng
          case ShareType.AD: //	Thư ký Giám đốc khối
          case ShareType.DD: //	Phó Giám đốc khối
          case ShareType.DI: //	Giám đốc khối
          case ShareType.DR: //	Báo cáo trực tiếp
          case ShareType.IR: //	Báo cáo gián tiếp
            //appr.approver = element?.objectType;
            this.newAppr.position = element?.objectName;
            //this.lstApprover.push(appr);
            break;
          //----------------------------------------------------------------------------------//
          case ShareType.Partner: //	Đối tác
            this.newAppr.write = true;
            this.newAppr.roleType = element.objectType;
            let popupApprover = this.callfc.openForm(
              PopupAddApproverComponent,
              '',
              550,
              screen.height,
              '',
              {
                approverData: this.newAppr,
                lstApprover: this.lstApprover,
                isAddNew: true,
              }
            );
            popupApprover.closed.subscribe((res) => {
              if (res.event) {
                this.newAppr = res?.event;
                //this.lstApprover.push(res.event);
              } else {
                this.newAppr.roleType = null;
              }
            });
            break;

          //----------------------------------------------------------------------------------//
          case ShareType.Personal: //	Đối tác
            this.newAppr.write = true;
            this.newAppr.roleType = element.objectType;
            this.newAppr.position = element.objectName;
            // let popupApproverPE = this.callfc.openForm(
            //   PopupAddPersonSignerComponent,
            //   '',
            //   550,
            //   screen.height,
            //   '',
            //   {
            //     approverData: this.newAppr,
            //     lstApprover: this.lstApprover,
            //     isAddNew: true,
            //   }
            // );
            // popupApproverPE.closed.subscribe((res) => {
            //   if (res.event) {
            //     this.newAppr = res?.event;
            //     //this.lstApprover.push(res.event);
            //   }
            //   else{
            //     this.newAppr.roleType=null;
            //   }
            // });
            break;

          //----------------------------------------------------------------------------------//
          case ShareType.AC: //	Thư ký Giám đốc công ty
          case ShareType.DC: //	Phó Giám đốc công ty
          case ShareType.CEO: //	Giám đốc công ty
            this.codxService
              .getCompanyApprover(this.userOrg?.companyID, element?.objectType)
              .subscribe((companyAppr) => {
                if (companyAppr) {
                  this.newAppr.position =
                    companyAppr?.position ?? element?.objectName;
                  this.newAppr.userID = companyAppr?.userID;
                  this.newAppr.userName = companyAppr?.userName;
                  this.newAppr.orgUnitName = companyAppr?.orgUnitName;
                  this.newAppr.email = companyAppr?.email;
                  this.newAppr.phone = companyAppr?.phone;
                }
                //this.lstApprover.push(appr);
              });
            break;
          //----------------------------------------------------------------------------------//
          case ShareType.User: //	Người dùng
            this.newAppr.approver = element?.id;
            this.newAppr.position = element?.dataSelected?.PositionName;
            this.newAppr.userID = element?.dataSelected?.UserID;
            this.newAppr.userName = element?.dataSelected?.UserName;
            this.newAppr.orgUnitName = element?.dataSelected?.OrgUnitName;
            this.newAppr.email = element?.dataSelected?.Email;
            this.newAppr.phone = element?.dataSelected?.phone;
            //this.lstApprover.push(appr);
            break;
          //----------------------------------------------------------------------------------//
          case ShareType.Position: //	Chức danh công việc
            if (element?.id != null) {
              this.codxService
                .getUserIDByPositionsID(element?.id)
                .subscribe((lstUserInfo) => {
                  if (lstUserInfo) {
                    if (lstUserInfo != null && lstUserInfo.length >= 2) {
                      this.notifySvr.alertCode('ES033').subscribe((x) => {
                        if (x.event?.status == 'Y') {
                          this.newAppr.approver = element?.id;
                          this.newAppr.roleType = element?.objectType;
                          this.newAppr.name = element?.text;
                          this.newAppr.position =
                            element?.dataSelected?.PositionName;
                          this.newAppr.userIDs = lstUserInfo
                            ?.map((x) => x?.userID)
                            ?.join(';');
                          this.dialogApprovalStep?.patchValue({
                            approveMode: '3',
                          });
                          this.data.approveMode = '3';
                          this.currentApproveMode = '3';
                          this.cr.detectChanges();
                        } else {
                          return;
                        }
                      });
                    } else {
                      this.newAppr.approver = element?.id;
                      this.newAppr.roleType = element?.objectType;
                      this.newAppr.name = element?.text;
                      this.newAppr.position =
                        element?.dataSelected?.PositionName;
                      this.newAppr.userID = lstUserInfo[0]?.userID;
                      this.newAppr.userName = lstUserInfo[0]?.userName;
                      this.newAppr.orgUnitName = lstUserInfo[0]?.orgUnitName;
                      this.newAppr.email = lstUserInfo[0]?.email;
                      this.newAppr.phone = lstUserInfo[0]?.phone;
                      //this.lstApprover.push(appr);
                    }
                  }
                });
            }
            break;

          //----------------------------------------------------------------------------------//
        }
      });
    }
  }

  changeConfirm(event) {
    if (event?.field && event?.field == 'confirmControl' && event?.component) {
      this.confirmControl = event?.data ? '1' : '0';
      this.cr.detectChanges();
    }
  }

  MFClick(event, data, index) {
    //delete
    if (event?.functionID == 'SYS02') {
      this.notifySvr.alertCode('SYS030').subscribe((x) => {
        if (x.event.status == 'Y') {
          let i = this.lstApprover.indexOf(data);

          if (i != -1) {
            this.lstApprover.splice(i, 1);
          }
        }
      });
    }
    //edit PA
    else if (event?.functionID == 'SYS03') {
      let popupApprover = this.callfc.openForm(
        PopupAddApproverComponent,
        '',
        550,
        screen.height,
        '',
        {
          approverData: data,
          lstApprover: this.lstApprover,
          isAddNew: false,
        }
      );

      popupApprover.closed.subscribe((res) => {
        if (res.event) {
          this.lstApprover[index] = res.event;
        }
      });
    }
  }

  beforeSave() {
    console.log(this.queryBuilder);
    if (this.queryBuilder) {
      this.queryBuilder.saveForm();
      return;
    } else {
      this.onSaveForm();
    }
  }

  saveFilterChange(event) {
    this.data.constraints = [event];
    this.onSaveForm();
  }

  onSaveForm() {
    this.isSaved = true;
    if (this.dialogApprovalStep.invalid == true) {
      this.codxService.notifyInvalid(this.dialogApprovalStep, this.formModel);
      return;
    }
    if (this.lstApprover.length == 0) {
      if (this.stepGrv == null) {
        this.cache
          .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
          .subscribe((res) => {
            if (res) {
              this.notifySvr.notifyCode(
                'SYS009',
                0,
                '"' + res['Approvers'].headerText + '"'
              );
            }
          });
      } else {
        this.notifySvr.notifyCode(
          'SYS009',
          0,
          '"' + this.stepGrv?.Approvers?.headerText + '"'
        );
      }

      return;
    }
    this.lstApprover.forEach((appr) => {
      appr.confirmControl = appr?.confirmControl ?? this.confirmControl;
      appr.allowEditAreas = appr?.allowEditAreas ?? this.allowEditAreas;
      appr.stepType = appr?.stepType ?? this.data?.stepType;
      appr.signatureType = appr?.signatureType ?? this.data.signatureType;
      // appr.confirmControl = this.confirmControl;
      // appr.allowEditAreas = this.allowEditAreas;
    });
    if (this.lstApprover?.length == 1) {
      this.currentApproveMode = '1';
    }
    this.dialogApprovalStep?.patchValue({
      approveMode: this.currentApproveMode,
      approvers: this.lstApprover,
    });
    if (this.data?.constraints == null) {
      this.data.constraints = [this.qbFilter];
    }
    this.data.approveMode = this.currentApproveMode;
    this.data.approvers = this.lstApprover;
    if (this.isAdd) {
      this.lstStep.push(this.data);
      this.dialog && this.dialog.close(this.data);
    } else {
      let i = this.lstStep.indexOf(this.dataEdit);
      if (i != -1) {
        this.lstStep[i] = this.data;
        this.dialog && this.dialog.close(this.data);
      }
    }
  }

  openSetupEmail(email) {
    if (email?.isEmail == '1') {
      let data = {
        // formGroup: this.dialogApprovalStep,
        templateID: email?.templateID,
        showIsTemplate: true,
        showIsPublish: true,
        showSendLater: true,
        showFrom: true,
        isAddNew: false,
      };
      if (!email.modifiedBy && !email.modifiedOn) {
        data.isAddNew = true;
      }

      let dialogEmail = this.callfc.openForm(
        CodxEmailComponent,
        '',
        800,
        screen.height,
        '',
        data
      );
      dialogEmail.closed.subscribe((res) => {
        if (res.event) {
          let result = res.event;
          let emailTemplateLst = this.dialogApprovalStep?.value.emailTemplates;
          let i = emailTemplateLst?.findIndex(
            (p) => p.emailType == result.templateType
          );
          if (i >= 0) {
            emailTemplateLst[i].templateID = result.recID;
            emailTemplateLst[i].modifiedOn = new Date();
            emailTemplateLst[i].modifiedBy = this.user?.userID;
            // if (this.attachment.fileUploadList.length > 0) {
            //   this.attachment.objectId = res.recID;
            //   this.attachment.saveFiles();
            // }

            this.data.emailTemplates = emailTemplateLst;
            this.dialogApprovalStep.patchValue({
              emailTemplates: emailTemplateLst,
            });
          }
        }
      });
    }
  }

  valueModeChange(event, item) {
    if (event?.component) {
      this.currentApproveMode = item?.value;
    }
  }

  valueEmailChange(event, eTemplate) {
    let index = this.data?.emailTemplates.indexOf(eTemplate);
    if (index >= 0) {
      this.data.emailTemplates[index][event.field] = event.data ? '1' : '0';
      this.dialogApprovalStep.patchValue({
        emailTemplates: this.dialogApprovalStep.value.emailTemplates,
      });
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.lstApprover, event.previousIndex, event.currentIndex);
    console.log('list', this.lstApprover);
  }

  clickToScroll(event) {
    console.log('clickToScroll', event);
  }
}
