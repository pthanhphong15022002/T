import { Injectable } from '@angular/core';
import {
  ApiHttpService,
  AuthService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogModel,
  FormModel,
  NotificationsService,
  TenantStore,
} from 'codx-core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import axios from 'axios';
import { lvFileClientAPI } from '@shared/services/lv.component';
import { SignalRService } from './_layout/drawers/chat/services/signalr.service';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { FileService } from '@shared/services/file.service';
import {
  ApproveProcess,
  Approver,
  ES_File,
  ES_SignFile,
  ExportData,
  ExportUpload,
  ResponseModel,
  TemplateInfo,
} from './models/ApproveProcess.model';
import { PopupAddSignFileComponent } from 'projects/codx-es/src/lib/sign-file/popup-add-sign-file/popup-add-sign-file.component';
import { CoDxGetTemplateSignFileComponent } from './component/codx-approval-procress/codx-get-template-sign-file/codx-get-template-sign-file.component';
import { CoDxViewReleaseSignFileComponent } from './component/codx-approval-procress/codx-view-release-sign-file/codx-view-release-sign-file.component';
import { CoDxAddApproversComponent } from './component/codx-approval-procress/codx-add-approvers/codx-add-approvers.component';

@Injectable({
  providedIn: 'root',
})
export class CodxCommonService {
  public setThemes = new BehaviorSubject<any>(null);
  isSetThemes = this.setThemes.asObservable();

  public setChangeThemes = new BehaviorSubject<any>(null);
  isSetChangeThemes = this.setChangeThemes.asObservable();

  public setLanguage = new BehaviorSubject<any>(null);
  isSetLanguage = this.setLanguage.asObservable();

  hideAside = new BehaviorSubject<any>(null);
  callBackComponent: any;

  private user: any;
  constructor(
    private api: ApiHttpService,
    private auth: AuthStore,
    private tenant: TenantStore,
    private authService: AuthService,
    private cache: CacheService,
    private signalRSV: SignalRService,
    private dmSV: CodxDMService,
    private fileService: FileService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService
  ) {
    this.user = this.auth.get();
  }

  logout() {
    let user = this.auth.get();
    this.signalRSV.disconnect(user);
    this.redirect('HCS', '', '', true);
    this.authService.logout('');
    // document.location.reload();
  }

  redirect(type, returnUrl, display = '', isLogout = false) {
    switch (type.toUpperCase()) {
      case 'HCS': {
        this.api
          .execSv(
            'SYS',
            'ERM.Business.AD',
            'UsersBusiness',
            'LoginHCSAsync',
            []
          )
          .subscribe((token) => {
            let url = '';
            if (isLogout) {
              url = `${environment.apiUrl}/hcs/UI2017/LogoutUser.aspx?tklid=${token}`;
              // window.open(url, '_blank');
              axios.get(url);
            } else {
              url = `${environment.loginHCS}/verifytoken.aspx?tklid=${token}&returnUrl=${returnUrl}`;
              if (url != '') {
                window.open(url, display == '3' ? '_blank' : '_self');
              }
            }
          });
        break;
      }
    }
  }

  getFormModel(functionID): Promise<FormModel> {
    return new Promise<FormModel>((resolve, rejects) => {
      this.cache.functionList(functionID).subscribe((funcList) => {
        var formModel = new FormModel();
        if (funcList) {
          formModel.entityName = funcList?.entityName;
          formModel.formName = funcList?.formName;
          formModel.gridViewName = funcList?.gridViewName;
          formModel.funcID = funcList?.functionID;
          formModel.entityPer = funcList?.entityPer;

          this.cache.gridView(formModel.gridViewName).subscribe((gridView) => {
            this.cache.setGridView(formModel.gridViewName, gridView);
            this.cache
              .gridViewSetup(formModel.formName, formModel.gridViewName)
              .subscribe((gridViewSetup) => {
                this.cache.setGridViewSetup(
                  formModel.formName,
                  formModel.gridViewName,
                  gridViewSetup
                );
                resolve(formModel);
              });
          });
        }
      });
    });
  }

  //-------------------------------------------Role--------------------------------------------//
  checkAdminModule(funcID: string) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.SYS',
      'RolesBusiness',
      'CheckAdminModuleAsync',
      [funcID]
    );
  }

  //-------------------------------------------WP--------------------------------------------//
  deleteGroup(recID: string) {
    return this.api.execSv(
      'WP',
      'ERM.Business.WP',
      'GroupBusiness',
      'DeleteGroupAsync',
      [recID]
    );
  }

  //-------------------------------------------------------------------------------------------//

  deleteByObjectsWithAutoCreate(
    objectIDs: string,
    module: string,
    delForever: boolean,
    autoCreate: string
  ) {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'DeleteByObjectsWithAutoCreateAsync',
      [objectIDs, module, delForever, autoCreate]
    );
  }
  convertFileToPDF(fileRecID: string, fileExtension: string) {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'ToPDFAsync',
      [fileRecID, fileExtension]
    );
  }
  createNewESSF(sf: any) {
    return this.api.execSv<any>(
      'ES',
      'ES',
      'SignFilesBusiness',
      'AddNewSignFileAsync',
      [sf]
    );
  }
  getSFByID(lstParams) {
    return this.api.execSv<any>(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'GetByIDAsync',
      lstParams
    );
  }
  getFileByObjectID(recID) {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetFilesByIbjectIDAsync',
      recID
    );
  }
  getTemplateSF(cateID, category) {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'GetTemplateSFAsync',
      [cateID, category]
    );
  }
  getListRpListByTemplateID(recIDs: any) {
    return this.api.execSv(
      'rptrp',
      'Codx.RptBusiness.RP',
      'ReportListBusiness',
      'GetListByTemplateIDAsync',
      [recIDs]
    );
  }

  exportTemplateData(module: string, exportUpload: ExportUpload) {
    return this.api.execSv(
      module,
      'ERM.Business.Core',
      'CMBusiness',
      'ExportUploadAsync',
      [exportUpload]
    );
  }
  deleteExportReleaseSF(recID: any): Observable<any> {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'DeleteExportReleaseSFAsync',
      [recID]
    );
  }
  copyFileByObjectID(
    oldRecID: string,
    newRecID: string,
    objectType: string,
    referType: string = '',
    copyFileInfo: tmpCopyFileInfo = null
  ): Observable<any> {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'CopyFileByObjectIDAsync',
      [oldRecID, newRecID, objectType, referType, copyFileInfo]
    );
  }
  //#region Codx Quy trình duyệt
  //-------------------------------------------Gửi duyệt--------------------------------------------//

  codxRelease(
    module: string, //Tên service
    recID: any, //RecID nghiệp vụ gốc
    processID: string, //Mã quy trình duyệt
    entityName: string, //EntityName nghiệp vụ gốc
    funcID: string, //FunctionID nghiệp vụ gốc
    userID: string, //Mã người dùng (ko bắt buộc - nếu ko có mặc định lấy UserID hiện hành)
    title: string, //Tiêu đề (truyền kiểu chuỗi thường)
    processType: string, //EntityName tùy chỉnh (lưu processType cho ES_ApprovalTrans)
    approvers: Array<Approver> = null, //Danh sách userID của RO
    customParam: string = null
  ): Observable<any> {
    let approveProcess = new ApproveProcess();
    approveProcess.recID = recID;
    approveProcess.processID = processID;
    approveProcess.userID = userID;
    approveProcess.entityName = entityName;
    approveProcess.funcID = funcID;
    approveProcess.htmlView = '<div>' + title + '</div>';
    approveProcess.module = module;
    approveProcess.processType = processType;
    approveProcess.approvers = approvers;
    approveProcess.title = title;
    approveProcess.customParam = customParam;

    return this.api.execSv(
      module,
      'ERM.Business.Core',
      'DataBusiness',
      'ReleaseAsync',
      [approveProcess]
    );
  }

  codxReleaseDynamic(
    //Tham số bắt buộc
    module: string, //Tên service
    data: any, //data nghiệp vụ gốc
    category: any, //Phân loại tài liệu hiện hành (ES_Categories) phục vụ cho việc kiểm tra loại quy trình gửi duyệt và tích hợp với form trình kí số.
    entityName: string, //EntityName nghiệp vụ gốc
    funcID: string, //FunctionID nghiệp vụ gốc
    title: string, //Tiêu đề (truyền kiểu chuỗi thường)
    releaseCallback: (response: ResponseModel, component: any) => void, //Hàm xử lí kết quả trả về
    //Tham số không bắt buộc
    userID: string = null, //Mã người dùng (ko bắt buộc - nếu ko có mặc định lấy UserID hiện hành)
    approvers: Array<Approver> = null, //Danh sách userID của RO hoặc người duyệt chỉ định
    processType: string = null, //EntityName tùy chỉnh (ko bắt buộc - xử lí cho trường hợp đặc biệt)
    releaseOnly: boolean = false, //tham số xử lí tại module ES - chỉ gửi duyệt mà ko kiểm tra thiết lập
    curComponent: any = null, //biến this: tại component gọi hàm
    exportData: ExportData = null, //biến lấy data export (funcID: Để lấy bộ EntityName, FormName, GridViewName; recID : Để lấy ra dữ liệu cần export ,data: data export lấy sẵn nếu có sẽ ưu tiên dùng thay cho việc dùng recID để đi lấy dữ liệu)
    customParam: string = null //Json string chứa tham số tùy chỉnh
  ) {
    let approveProcess = new ApproveProcess();
    approveProcess.recID = data?.recID;
    approveProcess.processID = category?.processID;
    approveProcess.userID = userID;
    approveProcess.entityName = entityName;
    approveProcess.funcID = funcID;
    approveProcess.htmlView = '<div>' + title + '</div>';
    approveProcess.module = module;
    approveProcess.title = title;
    approveProcess.processType = processType;
    approveProcess.approvers = approvers;
    approveProcess.category = category;
    approveProcess.data = data;
    approveProcess.exportData = exportData;
    approveProcess.customParam = customParam;
    if (approveProcess.approvers == null) {
      approveProcess.approvers = [];
    }
    this.callBackComponent = curComponent;

    //Gọi gửi duyệt thẳng (Dùng cho nội bộ ES_SignFile)
    if (releaseOnly) {
      this.apBaseRelease(approveProcess, releaseCallback);
    } else {
      //Kiểm tra tham số editApprovers
      if (category?.editApprovers == true && category?.eSign == false) {
        this.deleteExportReleaseSF(approveProcess.recID).subscribe((res) => {
          this.getFileByObjectID(approveProcess.recID).subscribe(
            (lstFile: any) => {
              let signFile = this.apCreateSignFile(approveProcess, lstFile);
              this.apOpenPopupSignFile(
                approveProcess,
                releaseCallback,
                signFile,
                lstFile
              );
            }
          );
        });

        // let dialogApprove = this.callfunc.openForm(
        //   CodxAddApproversComponent,
        //   '',
        //   400,
        //   250,
        //   '',
        //   {},
        //   ''
        // );
        // dialogApprove.closed.subscribe((res) => {
        //   if (res?.event) {
        //     approveProcess.approvers = res?.event;
        //     //Gửi duyệt
        //     this.apCheckReleaseESign(approveProcess, releaseCallback);
        //   } else {
        //     //Tắt form chọn người duyệt
        //     return null;
        //   }
        // });
      } else {
        //Gửi duyệt
        this.apCheckReleaseESign(approveProcess, releaseCallback);
      }
    }
  }

  apCheckReleaseESign(
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, component: any) => void
  ) {
    if (approveProcess?.category?.eSign) {
      this.deleteExportReleaseSF(approveProcess.recID).subscribe((deleteSF) => {
        switch (approveProcess?.category?.releaseControl) {
          //Gửi duyệt kèm SignFile
          case null:
          case '1':
            this.getFileByObjectID(approveProcess.recID).subscribe(
              (listFiles: any) => {
                if (listFiles) {
                  //Gửi kí số kèm file cũ
                  this.apReleaseWithOldFile(
                    approveProcess,
                    releaseCallback,
                    listFiles
                  );
                } else {
                  //Thêm trình kí ko có file
                  this.apReleaseWithEmptySignFile(
                    approveProcess,
                    releaseCallback
                  );
                }
              }
            );
            break;

          case '2': //Export và tạo ES_SignFiles để gửi duyệt
          case '3': //Export và view trc khi gửi duyệt (ko tạo ES_SignFiles)
          case '4': //Export và gửi duyệt ngầm (ko tạo ES_SignFiles)
            //Xóa file export cũ và trình kí số cũ nếu có
            this.getTemplateSF(
              approveProcess?.category?.categoryID,
              approveProcess?.category?.category
            ).subscribe((sfTemplates: any) => {
              if (sfTemplates?.length >= 1) {
                this.apGetTemplateSF(
                  sfTemplates,
                  approveProcess,
                  releaseCallback
                );
              } else {
                // Ko tìm thấy template mẫu của Category hiện tại
                this.notiService.notify(
                  'Không tìm thấy mẫu thiết lập, vui lòng kiểm tra lại',
                  '2',
                  null
                );
                return;
              }
            });
            break;
        }
      });
    } else {
      //Gửi duyệt thường
      this.apBaseRelease(approveProcess, releaseCallback);
    }
  }

  apBaseRelease(
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, cur: any) => void
  ) {
    this.api
      .execSv(
        approveProcess?.module,
        'ERM.Business.Core',
        'DataBusiness',
        'ReleaseAsync',
        [approveProcess]
      )
      .subscribe((res: ResponseModel) => {
        if (res) {
          //Thông báo khi gửi duyệt thành công và category?.releaseControl == "4" (Dạng ko mở popup ký số)
          if (
            !res?.msgCodeError &&
            res?.rowCount > 0 &&
            approveProcess?.category?.releaseControl == '4'
          ) {
            this.notiService.notifyCode('SYS034');
          }
          releaseCallback && releaseCallback(res, this.callBackComponent);
        }
      });
  }

  apCreateSignFile(
    approveProcess: ApproveProcess,
    listFiles: any = null,
    template: any = null
  ): ES_SignFile {
    let signFile = new ES_SignFile();
    signFile.recID = approveProcess?.recID;
    signFile.approveControl = '2';
    signFile.processID = approveProcess?.category?.recID;
    signFile.categoryID = approveProcess?.category?.categoryID;
    signFile.category = approveProcess?.category?.category;
    signFile.refID = approveProcess?.recID;
    signFile.refType = approveProcess?.entityName;
    signFile.title = approveProcess?.title;
    signFile.files = [];
    if (listFiles != null && listFiles?.length > 0) {
      for (let i = 0; i < listFiles?.length; i++) {
        let file = new ES_File();
        file.fileID = listFiles[i]?.recID;
        file.fileName = listFiles[i]?.fileName;
        file.createdOn = listFiles[i]?.createdOn;
        file.createdBy = listFiles[i]?.createdBy;
        file.comment = listFiles[i]?.extension;
        file.eSign = true;
        signFile.files.push(file);
      }
    }
    // if (template != null) {
    //   signFile.templateID = template[0].templateID;
    // }
    if (approveProcess?.template?.length > 0) {
      if (
        signFile.files?.length == 1 &&
        approveProcess?.template?.length == 1 &&
        approveProcess?.template[0]?.files?.length == 1
      ) {
        signFile.files[0].areas = approveProcess?.template[0]?.files[0]?.areas;
      } else {
        Array.from(approveProcess?.template).forEach((tp: any) => {
          if (tp?.files?.length > 0) {
            tp?.files?.forEach((file) => {
              if (file?.areas?.length > 0) {
                let fName = file?.fileName?.split('.')[0];
                if (fName != null && fName != '') {
                  let sfNewFile = signFile.files.filter((x) =>
                    x.fileName?.startsWith(fName)
                  );
                  if (sfNewFile?.length > 0) {
                    sfNewFile?.forEach((sfn: any) => {
                      sfn.areas = file?.areas;
                    });
                  }
                }
              }
            });
          }
        });
      }
    }
    return signFile;
  }

  apOpenPopupSignFile(
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, component: any) => void,
    signFile: ES_SignFile,
    listFile: Array<any> = []
  ) {
    let dialogModel = new DialogModel();
    dialogModel.IsFull = true;

    let dialogSF = this.callfunc.openForm(
      PopupAddSignFileComponent,
      'Thêm mới',
      700,
      650,
      '',
      {
        oSignFile: signFile,
        files: listFile,
        //cbxCategory: this.gridViewSetup['CategoryID']?.referedValue,
        disableCateID: true,
        refType: approveProcess.entityName,
        refID: approveProcess.recID,
        editApprovers: approveProcess.category?.editApprovers,
        approvers: approveProcess.approvers,
        approverProcess: approveProcess,
      },
      '',
      dialogModel
    );
    dialogSF.closed.subscribe((res) => {
      if (res?.event && res?.event?.approved == true) {
        let respone = new ResponseModel();
        respone.msgCodeError = res?.event?.responseModel?.msgCodeError;
        respone.rowCount = res?.event?.responseModel?.rowCount;
        releaseCallback && releaseCallback(respone, this.callBackComponent);
      } else {
        //Lưu - Tắt form kí số khi chưa gửi duyệt
      }
    });
  }

  apReleaseWithEmptySignFile(
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, component: any) => void
  ) {
    let signFile = this.apCreateSignFile(approveProcess);
    this.apOpenPopupSignFile(approveProcess, releaseCallback, signFile);
  }

  apReleaseWithOldFile(
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, component: any) => void,
    listFiles: any
  ) {
    let signFile = this.apCreateSignFile(approveProcess, listFiles);
    this.apOpenPopupSignFile(
      approveProcess,
      releaseCallback,
      signFile,
      listFiles
    );
  }

  apGetTemplateSF(
    sfTemplates: any,
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, component: any) => void,
    releaseBackground: boolean = false
  ) {
    if (sfTemplates?.length > 1) {
      let dialogTemplate = this.callfunc.openForm(
        CoDxGetTemplateSignFileComponent,
        '',
        700,
        500,
        '',
        { sfTemplates: sfTemplates },
        ''
      );
      dialogTemplate.closed.subscribe((res) => {
        if (res?.event) {
          let template = res?.event;
          //Gửi duyệt
          let missingTemplate = template.filter(
            (x) => x?.templateID == null || x?.templateType == null
          );
          if (missingTemplate?.length > 0) {
            this.notiService.notify('Không tìm thấy mẫu xuất dữ liệu', '2');
            return null;
          } else {
            this.apExportFileWithMultiTemplate(
              approveProcess,
              releaseCallback,
              template,
              releaseBackground
            );
          }
        } else {
          //Tắt form chọn người duyệt
          return null;
        }
      });
    } else if (sfTemplates?.length == 1) {
      //Gửi duyệt
      let missingTemplate = sfTemplates.filter(
        (x) => x?.templateID == null || x?.templateType == null
      );
      if (missingTemplate?.length > 0) {
        this.notiService.notify('Không tìm thấy mẫu xuất dữ liệu', '2');
        return null;
      } else {
        this.apExportFileWithMultiTemplate(
          approveProcess,
          releaseCallback,
          sfTemplates,
          releaseBackground
        );
      }
    }
  }

  apExportFileWithMultiTemplate(
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, component: any) => void,
    templates: any,
    releaseBackground: boolean = false
  ) {
    approveProcess.template = templates;
    let exportUpload = new ExportUpload();
    exportUpload.convertToPDF = false;
    exportUpload.title = approveProcess.title;
    exportUpload.entityName = approveProcess.entityName;
    exportUpload.module = approveProcess.module;
    exportUpload.objectID = approveProcess.recID;
    exportUpload.objectType = approveProcess.entityName;
    exportUpload.referType = 'source';
    exportUpload.functionID = approveProcess.funcID;
    exportUpload.dataJson = JSON.stringify(approveProcess?.data);
    exportUpload.templates = [];
    exportUpload.exportData = approveProcess.exportData;

    let listTemplateRecID = [];
    for (let temp of templates) {
      let tmp = new TemplateInfo();
      tmp.templateID = temp?.templateID;
      tmp.templateType = temp?.templateType;
      tmp.exportFileName = temp?.files[0]?.fileName?.split('.')[0];
      listTemplateRecID.push(temp?.templateID);
      exportUpload.templates.push(tmp);
    }

    this.getListRpListByTemplateID(listTemplateRecID).subscribe(
      (rpLists: any) => {
        if (rpLists?.length > 0) {
          for (let temp of exportUpload.templates) {
            let curRpList = rpLists.filter(
              (x) => x.templateID == temp.templateID
            );
            if (curRpList?.length > 0) {
              temp.reportID = curRpList[0]?.recID;
            }
          }
        }
        // this.apCreateExportFile(
        //   approveProcess,
        //   releaseCallback,
        //   exportUpload
        // );
        this.exportTemplateData(approveProcess.module, exportUpload).subscribe(
          (exportedFiles: any) => {
            //Nhận thông tin file trả lên sau khi export
            if (exportedFiles?.length > 0) {
              switch (approveProcess?.category?.releaseControl) {
                case '2': //Export và tạo ES_SignFiles để gửi duyệt
                  this.getFileByObjectID(approveProcess.recID).subscribe(
                    (lstFile: any) => {
                      let signFile = this.apCreateSignFile(
                        approveProcess,
                        lstFile
                      );
                      debugger;
                      if (lstFile?.length > 0) {
                        this.apOpenPopupSignFile(
                          approveProcess,
                          releaseCallback,
                          signFile,
                          lstFile
                        );
                      } else {
                        this.notiService.notify(
                          'Không tìm thấy tài liệu!',
                          '2'
                        );
                      }
                    }
                  );
                  break;

                case '3': //Export và view trc khi gửi duyệt (ko tạo ES_SignFiles)
                case '4': //Export và gửi duyệt ngầm (ko tạo ES_SignFiles)
                  //Kiểm tra file export có phải file pdf ko, nếu ko thì chuyển sang pdf để kí số
                  let nonPDFFile = exportedFiles.filter(
                    (x) => x.extension != '.pdf'
                  );
                  if (nonPDFFile?.length > 0) {
                    let index = 0;
                    for (let file of nonPDFFile) {
                      if (file?.extension != '.pdf') {
                        this.convertFileToPDF(
                          file?.recID,
                          file?.extension
                        ).subscribe((res) => {
                          if (res) {
                            index++;
                            if (index == nonPDFFile?.length) {
                              this.apReleaseWithoutSignFile(
                                approveProcess,
                                releaseCallback
                              );
                            }
                          } else {
                            //Xuát file lỗi xóa file export đã tạo
                            this.deleteByObjectsWithAutoCreate(
                              approveProcess.recID,
                              '',
                              true,
                              '3'
                            ).subscribe();
                            this.notiService.notify(
                              'Xuất tài liệu PDF thất bại!',
                              '2'
                            );

                            return;
                          }
                        });
                      }
                    }
                  } else {
                    this.apReleaseWithoutSignFile(
                      approveProcess,
                      releaseCallback
                    );
                  }
                  break;
              }
            } else {
              this.notiService.notify('Xuất tài liệu thất bại!', '2');
            }
          }
        );
      }
    );
  }

  apReleaseWithoutSignFile(
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, component: any) => void
  ) {
    switch (approveProcess?.category?.releaseControl) {
      case '3': //Export và view trc khi gửi duyệt (ko tạo ES_SignFiles)
        this.getFileByObjectID(approveProcess.recID).subscribe(
          (lstFile: any) => {
            if (lstFile?.length > 0) {
              let signFile = this.apCreateSignFile(approveProcess, lstFile);
              this.createNewESSF(signFile).subscribe((res) => {
                if (res) {
                  this.apOpenViewSignFile(
                    approveProcess,
                    releaseCallback,
                    res,
                    lstFile
                  );
                }
              });
            } else {
              this.notiService.notify('Không tìm thấy tài liệu!', '2');
            }
          }
        );
        break;

      case '4': //Export và gửi duyệt ngầm (ko tạo ES_SignFiles)
        this.getFileByObjectID(approveProcess.recID).subscribe(
          (lstFile: any) => {
            let signFile = this.apCreateSignFile(approveProcess, lstFile);
            this.createNewESSF(signFile).subscribe((res) => {
              if (res) {
                this.getSFByID([
                  res?.recID,
                  this.user?.userID,
                  false,
                  true,
                  null,
                  approveProcess.approvers,
                  false,
                ]).subscribe((res: any) => {
                  this.apBaseRelease(approveProcess, releaseCallback);
                });
              }
            });
          }
        );
        break;
    }
  }
  apOpenViewSignFile(
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, component: any) => void,
    signFile: ES_SignFile,
    listFile: Array<any> = []
  ) {
    let dialogModel = new DialogModel();
    dialogModel.IsFull = true;

    let dialogSF = this.callfunc.openForm(
      CoDxViewReleaseSignFileComponent,
      'Thêm mới',
      700,
      650,
      '',
      {
        signFile: signFile,
        files: listFile,
        approveProcess: approveProcess,
      },
      '',
      dialogModel
    );
    dialogSF.closed.subscribe((res) => {
      if (res?.event) {
        releaseCallback && releaseCallback(res?.event, this.callBackComponent);
      } else {
        //Tắt form ko làm gì
      }
    });
  }

  //-------------------------------------------Hủy yêu cầu duyệt--------------------------------------------//
  codxCancel(
    module: string, //Tên service
    recID: string, //RecID nghiệp vụ gốc
    entityName: string, //EntityName nghiệp vụ gốc
    comment: string, //ghi chú (ko bắt buộc)
    userID: string //Mã người dùng (ko bắt buộc - nếu ko có mặc định lấy UserID hiện hành)
  ) {
    let approveProcess = new ApproveProcess();
    approveProcess.recID = recID;
    approveProcess.entityName = entityName;
    approveProcess.module = module;
    approveProcess.comment = comment;
    approveProcess.userID = userID;

    return this.api.execSv(
      module,
      'ERM.Business.Core',
      'DataBusiness',
      'CancelAsync',
      [approveProcess]
    );
  }

  //-------------------------------------------Khôi phục--------------------------------------------//
  codxUndo(
    tranRecID: string, //RecID của ES_ApprovalTrans hiện hành
    userID: string //Mã người dùng (ko bắt buộc - nếu ko có mặc định lấy UserID hiện hành)
  ) {
    let approveProcess = new ApproveProcess();
    approveProcess.tranRecID = tranRecID;
    approveProcess.userID = userID;
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'UndoAsync',
      [approveProcess]
    );
  }
  //-------------------------------------------Duyệt/Làm lại/Từ chối--------------------------------------------//
  codxApprove(
    tranRecID: any, //RecID của ES_ApprovalTrans hiện hành
    status: string, //Trạng thái
    reasonID: string = null, //Mã lí do (ko bắt buộc)
    comment: string = null, //Bình luận (ko bắt buộc)
    userID: string = null //Người thực hiện (ko bắt buộc)
  ): Observable<any> {
    let approveProcess = new ApproveProcess();
    approveProcess.tranRecID = tranRecID;
    approveProcess.status = status;
    approveProcess.reasonID = reasonID;
    approveProcess.comment = comment;
    approveProcess.userID = userID;

    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'ApproveAsync',
      [approveProcess]
    );
  }
  //-------------------------------------------Uỷ quyền--------------------------------------------//
  codxAuthority(
    tranRecID: any, //RecID của ES_ApprovalTrans hiện hành
    releaseCallback: (response: ResponseModel, component: any) => void //Hàm xử lí kết quả trả về
  ) {
    let approveProcess = new ApproveProcess();
    approveProcess.tranRecID = tranRecID;
    let dialogAP = this.callfunc.openForm(
      CoDxAddApproversComponent,
      '',
      500,
      250,
      ''
    );
    dialogAP.closed.subscribe((res) => {
      if (res?.event) {
        let model = new ApproveProcess();
        model.tranRecID = tranRecID;

        this.api
          .execSv(
            'ES',
            'ERM.Business.ES',
            'ApprovalTransBusiness',
            'AuthorityAsync',
            [model, res?.event]
          )
          .subscribe((authority: ResponseModel) => {
            if (authority?.rowCount > 0 && authority.msgCodeError == null) {
              this.notiService.notifyCode('SYS034');
              releaseCallback && releaseCallback(authority, null);
            }
          });
      }
    });
  }
  //#endregion Codx Quy trình duyệt

  //#region File
  getThumbByUrl(url: any, width = 30) {
    if (url) {
      var wt = width;
      var widthThumb = 1.2;
      var arr = url.split('/');
      var uploadID = arr[arr.length - 2];

      if (width <= 30 * widthThumb) wt = 30;
      else if (width <= 60 * widthThumb) wt = 60;
      else if (width <= 120 * widthThumb) wt = 120;
      else if (width <= 300 * widthThumb) wt = 300;
      else if (width <= 500 * widthThumb) wt = 500;
      else if (width <= 650 * widthThumb) wt = 600;

      let tenant = this.tenant.getName();
      return (
        environment.urlUpload +
        '/api/' +
        tenant +
        '/thumbs/' +
        uploadID +
        '/' +
        wt +
        '.webp'
      );
    }
    return '';
  }

  async registerFile(appName: any, uploadFile: any, ChunkSizeInKB: any) {
    lvFileClientAPI.setUrl(environment.urlUpload); //"http://192.168.18.36:8011");
    return await lvFileClientAPI.postAsync(`api/${appName}/files/register`, {
      Data: {
        FileName: uploadFile?.name,
        ChunkSizeInKB: ChunkSizeInKB,
        FileSize: uploadFile?.size,
        thumbSize: {
          width: 200, //Kích thước của file ảnh Thum bề ngang
          height: 200, //Kích thước của file ảnh Thum bề dọc
        },
        IsPublic: true,
        ThumbConstraints: '60,200,450,900',
      },
    });
  }

  async uploadFileAsync(uploadFile: any, appName: any, chunkSizeInKB: any) {
    lvFileClientAPI.setUrl(environment.urlUpload);
    var retUpload = await this.registerFile(appName, uploadFile, chunkSizeInKB);
    if (retUpload == '401') {
      await this.dmSV.getToken();
      retUpload = await this.registerFile(appName, uploadFile, chunkSizeInKB);
    }
    var chunSizeInfBytes = chunkSizeInKB * 1024;
    var sizeInBytes = uploadFile?.size;
    var numOfChunks = Math.floor(uploadFile.size / chunSizeInfBytes);
    if (uploadFile?.size % chunSizeInfBytes > 0) {
      numOfChunks++;
    }
    for (var i = 0; i < numOfChunks; i++) {
      var start = i * chunSizeInfBytes; //Vị trí bắt đầu băm file
      var end = start + chunSizeInfBytes; //Vị trí cuối
      if (end > sizeInBytes) end = sizeInBytes; //Nếu điểm cắt cuối vượt quá kích thước file chặn lại
      var blogPart = uploadFile.slice(start, end); //Lấy dữ liệu của chunck dựa vào đầu cuối
      var fileChunk = new File([blogPart], uploadFile.name, {
        type: uploadFile.type,
      }); //Gói lại thành 1 file chunk để upload
      try {
        var uploadChunk = await lvFileClientAPI.formPostWithToken(
          `api/${appName}/files/upload`,
          {
            FilePart: fileChunk,
            UploadId: retUpload.Data?.UploadId,
            Index: i,
          }
        );
        console.log(uploadChunk);
      } catch (ex) {}
    }
    return retUpload;
  }

  addFile(fileItem: any, actionType: any, entityName: any) {
    this.fileService
      .addFile(fileItem, actionType, entityName, false, null)
      .toPromise();
  }

  //Lấy icon Folder/File
  getIconFile(ex: string) {
    if (!ex) return 'file.svg';
    var ext = ex.toLocaleLowerCase();
    switch (ext) {
      case '.txt':
        return 'txt.svg';
      case '.doc':
      case '.docx':
        return 'doc.svg';
      case '.7z':
      case '.rar':
      case '.zip':
        return 'zip.svg';
      case '.jpg':
      case '.jpeg':
      case '.jfif':
        return 'jpg.svg';
      case '.mp4':
        return 'mp4.svg';
      case '.xls':
      case '.xlsx':
        return 'xls.svg';
      case '.pdf':
        return 'pdf.svg';
      case '.png':
        return 'png.svg';
      case '.js':
        return 'javascript.svg';
      case '.apk':
        return 'android.svg';
      case '.ppt':
        return 'ppt.svg';
      case '.mp3':
      case '.wma':
      case '.wav':
      case '.flac':
      case '.ogg':
      case '.aiff':
      case '.aac':
      case '.alac':
      case '.lossless':
      case '.wma9':
      case '.aac+':
      case '.ac3':
        return 'audio.svg';
      default:
        return 'file.svg';
    }
  }
  //#endregion
}
export class tmpCopyFileInfo {
  objectID: string;
  objectType: string;
  referType: string;
}
