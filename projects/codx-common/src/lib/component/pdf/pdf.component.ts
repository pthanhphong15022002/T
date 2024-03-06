import { filter } from 'rxjs';
import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  IterableDiffers,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  OnDestroy,
  TemplateRef,
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import {
  AuthStore,
  ImageViewerComponent,
  NotificationsService,
  ScrollComponent,
  UIComponent,
  UrlUtil,
  Util,
} from 'codx-core';
import Konva from 'konva';
import { qr } from './model/mode';
import {
  PDF_SignModel,
  comment,
  highLightTextArea,
  location,
  tmpAreaName,
  tmpSignArea,
} from './model/tmpSignArea.model';
import {
  NgxExtendedPdfViewerComponent,
  NgxExtendedPdfViewerService,
  pdfDefaultOptions,
  TextLayerRenderedEvent,
} from 'ngx-extended-pdf-viewer';
import { CodxEsService } from 'projects/codx-es/src/lib/codx-es.service';
import { PopupCaPropsComponent } from 'projects/codx-es/src/lib/sign-file/popup-ca-props/popup-ca-props.component';
import { PopupSelectLabelComponent } from 'projects/codx-es/src/lib/sign-file/popup-select-label/popup-select-label.component';
import { PopupSignatureComponent } from 'projects/codx-es/src/lib/setting/signature/popup-signature/popup-signature.component';
import { SetupShowSignature } from 'projects/codx-es/src/lib/codx-es.model';
import { environment } from 'src/environments/environment';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { CodxCommonService } from '../../codx-common.service';
import {
  ResponseModel,
  tempLoadPDF,
  tempSignPDFInput,
} from '../../models/ApproveProcess.model';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'lib-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss'],
  providers: [NgxExtendedPdfViewerService],
})
export class PdfComponent
  extends UIComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  paSignature: any;
  passwordPublicSign: any;
  emailPublicSign: any;
  publicSignStatus: any;
  isSigned = false;
  constructor(
    private inject: Injector,
    private authStore: AuthStore,
    private esService: CodxEsService,
    private codxCommonService: CodxCommonService,
    private datePipe: DatePipe,
    private notificationsService: NotificationsService,
    private http: HttpClient
  ) {
    // pdfDefaultOptions.renderInteractiveForms = false;
    // pdfDefaultOptions.annotationEditorEnabled = false;
    pdfDefaultOptions.doubleTapZoomFactor = null;
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.router.snapshot.params['funcID'];
  }

  env = environment;
  //Input
  @Input() recID = '';
  @Input() modeView = '1'; //Cơ chế chạy: 1: chạy theo ES; 2: chạy theo BP
  @Input() isEditable = true;
  @Input() isConfirm = false;
  @Input() hasPermission = false;
  @Input() isApprover;
  @Input() stepNo = -1;
  @Input() inputUrl = null;
  @Input() transRecID = null;
  @Input() oSignFile = null;
  @Input() oURL = [];
  @Input() curFileName: string = ''; //Tên file đang view (tên file khi tải xuống)
  @Input() oApprovalTrans;
  @Input() isPublic: boolean = false; // ký ngoài hệ thống
  @Input() isSettingMode: boolean = false; // Thiết lập mẫu ko lấy danh sách người duyệt theo role dynamic
  @Input() approver: string = ''; // ký ngoài hệ thống
  @Output() confirmChange = new EventEmitter<boolean>();

  @Input() needSuggest: boolean = true; //Gợi ý vùng ký => roll xuống trang dưới cùng
  @Input() hideActions = false;
  @Input() isSignMode = false;
  @Input() dynamicApprovers = [];
  @Input() hideThumbnail: boolean = false; //thumbnail  
  @Input() fileIDs = '';
  @Output() changeSignerInfo = new EventEmitter();
  @Output() eventHighlightText = new EventEmitter();

  //Func
  // GetByIDAsync
  // GetAllAreasAsync
  // GetSignFormatAsync
  // GetCAInPDFAsync
  // ChangeSignFileAsync
  // GetListHighlightAsync

  //View Child
  @ViewChildren('actions') actions: QueryList<ElementRef>;
  @ViewChild('thumbnailTab') thumbnailTab: ElementRef;
  @ViewChild('ngxPdfView') ngxPdfView: NgxExtendedPdfViewerComponent;
  @ViewChild('rightToolbar') rightToolbar: TabComponent;
  @ViewChild('publicSignInfo') publicSignInfo: TemplateRef<any>;

  //core
  dialog: import('codx-core').DialogRef;
  user: any = {};

  //virtual layer for sign areas
  url: string = '';
  xAt100 = 793;
  yAt100 = 1122;
  xScale = 1;
  yScale = 1;

  vcWidth = 0;
  vcHeight = 0;
  vcTop = 0;
  vcLeft = 0;
  rotate = 0;
  rotateEnable = false;

  contextMenu: any;
  needAddKonva = null;
  tr: Konva.Transformer;
  showHand = true;

  //highlight
  canHighLight = false;
  isInteractPDF = false;
  lstHighlightTextArea: Array<highLightTextArea> = [];
  lstKey: Array<string> = [];
  curSelectedHLA: highLightTextArea;
  curCmtContent = '';
  deleteHLAMode = true;
  sfEdited = false;
  defaultColor = 'rgb(255, 255, 40)';
  defaultAddedColor = 'transparent';
  selectedColor = 'rgb(114, 255, 234)';

  //vll
  ovllActions;
  vllActions;

  //page
  pageMax;
  getSignAreas;
  pageStep;
  curPage = 1;

  //zoom
  zoomValue: any = 100;
  lstZoomValue = [10, 25, 30, 50, 90, 100, 150, 200, 250, 300, 350, 400];
  // zoomFields = { text: 'show', value: 'realValue' };
  // lstZoomValue = [
  //   { realValue: '10', show: 10 },
  //   { realValue: '25', show: 20 },
  //   { realValue: '30', show: 30 },
  //   { realValue: '50', show: 50 },
  //   { realValue: '90', show: 90 },
  //   { realValue: '100', show: 100 },
  // ];

  //sign area
  holding: number = 0;
  curSelectedArea: any;
  lstAreas: Array<tmpSignArea> = [];
  lstCA;
  lstCACollapseState: Array<any> = [];
  curSelectedCA;

  lstSignDateType = [];
  curSignDateType;

  curSelectedAnnotID;
  curSelectedPageGroup;
  formAnnot: FormGroup;
  renderQRAllPage = false;

  imgConfig = ['S1', 'S2', 'S3', '8', '9'];
  fullAnchor = [
    'top-left',
    'top-center',
    'top-right',
    'middle-right',
    'middle-left',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ];
  textAnchor = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  //save to db
  after_X_Second: number = 100;

  //signer info
  lstSigners: Array<any> = [];
  curSignerID;
  curSignerRecID;
  signerInfo: any;
  person: Object = { text: 'authorName', value: 'recID' };

  //file info
  lstFiles: Array<Object> = [];
  fileInfo: any;
  file: Object = { text: 'fileName', value: 'fileID' };
  fileIdx = 0;
  curFileID;
  curFileUrl;
  //font
  lstAnnotFontStyle = [];
  curAnnotFontStyle;

  //size
  lstAnnotFontSize = [];
  curAnnotFontSize;

  //date
  lstAnnotDateFormat = [];
  curAnnotDateFormat;

  //style
  isBold = false;
  isItalic = false;
  isUnd = false;
  isLineThrough = false;
  curDecor = '';
  //

  //Multi line text
  minLineW = 20;
  maxLineW = 300;
  //

  //auto sign
  autoSignState: boolean = false;
  signPerRow;
  direction;
  align;
  isAwait;
  areaControl;
  maxTop = -1;
  maxTopDiv;
  labels = [];

  //ca
  gotLstCA = false;
  caStepConfig = ['S1', 'S2', 'S3'];

  //css ???
  public cssClass: string = 'e-list-template';

  //tab
  public headerRightName = [
    { text: 'Công cụ' },
    { text: 'Vùng ký' },
    { text: 'History' },
    { text: 'Comment' },
    { text: 'Highlight' },
  ];
  public headerLeftName = [{ text: 'Xem nhanh' }, { text: 'Chữ ký số' }];

  vllSupplier: any;
  oSignfile: any;

  //region format

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  onInit() {
    this.curSelectedHLA = null;

    this.cache.valueList('ES029').subscribe((res) => {
      if (res) {
        this.vllSupplier = res?.datas?.filter((x) => x?.value != 4);
      }
    });

    if (this.isPublic) {
      this.user.userID = this.approver;
    }
    //if (this.isPublic) {
    // this.headerRightName = [
    //   { text: 'Thông tin người kí' },
    //   { text: 'Trao đổi' },
    //   { text: 'Hướng dẫn ký số' },
    // ];
    //}
    //Mode cho ES
    if (this.inputUrl == null) {
      if (this.modeView == '1') {
        this.getSFByID();
      } else {
        this.getProcessESign();
      }
      this.getSettingValue();
      this.getCacheData();

      //this.detectorRef.detectChanges();
    }
    //Mode view File pdf cho DM, RP
    else {
      this.curFileUrl = this.inputUrl;
      this.detectorRef.detectChanges();
    }
    this.tr = new Konva.Transformer({
      rotateEnabled: this.rotateEnable,
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['inputUrl'] &&
      changes['inputUrl']?.currentValue != changes['inputUrl']?.previousValue
    ) {
      this.curFileUrl = changes['inputUrl']?.currentValue;
      this.detectorRef.detectChanges();
    }
  }

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
    if (this.isEditable) {
      this.contextMenu = document.getElementById('contextMenu');
      document
        .getElementById('delete-btn')
        ?.addEventListener('click', (e: any) => {
          if (this.contextMenu) {
            this.contextMenu.style.display = 'none';
            this.removeArea();
          }
        });
    }
    if (document) {
      document.onclick = (e) => {
        let hlaCmt = document.getElementById('hla-Cmt');
        if (hlaCmt) {
          if (
            e.target &&
            (e.target as HTMLElement).classList.contains('highlighted')
          ) {
            hlaCmt.style.display = 'initial';
            hlaCmt.style.top = e.clientY + 20 + 'px';
            hlaCmt.style.left = e.clientX + 5 + 'px';
            this.curCmtContent = this.curSelectedHLA.comment?.content ?? '';
            let inputCmt = document.getElementById(
              'input-Cmt'
            ) as HTMLInputElement;
            inputCmt.value = this.curCmtContent;
          } else {
            if (!(e.target as HTMLElement).classList.contains('hla-Cmt')) {
              hlaCmt.style.display = 'none';
            }
          }
        }
      };
      if (document.getElementById('add-cmt-btn')) {
        //add cmt
        document.getElementById('add-cmt-btn').onclick = (e) => {
          this.curCmtContent = (
            document.getElementById('input-Cmt') as HTMLInputElement
          ).value;
          let tmpCmt: comment = {
            author: this.user.userName,
            content: this.curCmtContent,
          };
          this.curSelectedHLA.comment = tmpCmt;
          this.changeHLComment();
        };
      }
      if (document.getElementById('delete-cmt-btn')) {
        //remove cmt
        document.getElementById('delete-cmt-btn').onclick = (e) => {
          this.curSelectedHLA.comment = {
            author: '',
            content: '',
          };
          this.curCmtContent = '';
          (document.getElementById('input-Cmt') as HTMLInputElement).value = '';
          this.changeHLComment();
        };
      }
    }

    //this.hideShowTab();
  }

  ngOnDestroy() {}
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache/Setting-----------------------------//
  //---------------------------------------------------------------------------------//

  getCacheData() {
    this.cache.valueList('ES015').subscribe((res) => {
      this.ovllActions = res.datas;
      this.vllActions = res.datas;
    });
    this.cache.valueList('ES024').subscribe((res) => {
      res?.datas?.forEach((font) => {
        this.lstAnnotFontStyle.push(font.text);
      });
      this.curAnnotFontStyle = this.lstAnnotFontStyle[0];
      this.detectorRef.detectChanges();
    });

    this.cache.valueList('ES025').subscribe((res) => {
      res?.datas?.forEach((size) => {
        this.lstAnnotFontSize.push(Number(size.value.replace('px', '')));
      });
      this.curAnnotFontSize = this.lstAnnotFontSize[0];
      this.detectorRef.detectChanges();
    });

    this.cache.valueList('L0052').subscribe((res) => {
      res?.datas?.forEach((dateType) => {
        this.lstAnnotDateFormat.push(dateType.value);
      });
      this.curAnnotDateFormat = this.lstAnnotDateFormat[0];
      this.detectorRef.detectChanges();
    });

    this.cache.valueList('ES027').subscribe((res) => {
      res?.datas?.forEach((type) => {
        this.lstSignDateType.push(type.text);
      });
      this.curSignDateType = this.lstSignDateType[0];
      this.detectorRef.detectChanges();
    });

    this.formAnnot = new FormGroup({
      content: new FormControl(),
      fontStyle: new FormControl(this.curAnnotFontStyle),
      fontSize: new FormControl(this.curAnnotFontSize),
      dateFormat: new FormControl(this.curAnnotDateFormat),
    });
  }

  getSettingValue() {
    this.esService.getSignFormat().subscribe((res: any) => {
      this.signPerRow = res?.SignPerRow;
      this.align = res?.Align;
      this.direction = res?.Direction;
      this.areaControl = res?.AreaControl == '1';
      this.isAwait = res?.Await == '1';
      this.labels = res?.Label?.filter((label) => {
        return label.Language == this.user.language;
      });
      this.canHighLight =
        res.AllowHighlight == null
          ? false
          : res.AllowHighlight == '0'
          ? false
          : true;
      this.detectorRef.detectChanges();
    });
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
  getPASignature() {
    this.esService
      .getApproverSignature(
        this.signerInfo.email,
        this.signerInfo?.signType,
        null,
        null
      )
      .subscribe((signature) => {
        if (signature) {
          this.paSignature = signature[0];
          this.paSignature.modifiedOn = new Date();
          this.detectorRef.detectChanges();
        }
      });
  }

  //Lấy data ký số theo ES_SignFiles (Cơ chế gốc)
  getSFByID() {
    this.esService
      .getSFByID([
        this.recID,
        this.user?.userID,
        this.isApprover,
        this.isEditable,
        this.transRecID,
        this.dynamicApprovers,
        this.isSettingMode,
      ])
      .subscribe((res: any) => {
        console.table('sf', res);
        //Gán template để hiển thị form ký số (ApproveControl==3 hoặc 4 ko tạo ES_SignFiles, view vùng kí mẫu qua template)
        //Hiện tạm ngừng dùng do vẫn tạo ES_SignFiles như các ApproveControl khác)
        if (this.oURL?.length > 0) {
          res.urls = this.oURL;
        }
        let sf = this.oSignFile ?? res?.signFile;
        //---------------------
        if (sf) {
          sf.files.forEach((file: any, index) => {
            if (file?.eSign) {
              //Lấy ds files cho cbx
              this.lstFiles.push({
                fileName: file.fileName,
                fileRefNum: sf.refNo,
                fileID: file.fileID,
                fileUrl: environment.urlUpload + '/' + res.urls[index],
                signers: res?.approvers,
                areas: file.areas,
                fileIdx: index,
              });
            }
          });

          //Lấy danh sách người duyệt
          this.lstSigners = res.approvers;

          //Gán lại URL đầy đủ cho hình chữ ký con dấu
          this.lstSigners.forEach((signer) => {
            if (signer.signature1)
              signer.signature1 =
                environment.urlUpload + '/' + signer.signature1;
            if (signer.signature2)
              signer.signature2 =
                environment.urlUpload + '/' + signer.signature2;
            if (signer.stamp)
              signer.stamp = environment.urlUpload + '/' + signer.stamp;
          });

          //Lấy thông tin Approver hiện tại
          if (this.isApprover) {
            this.signerInfo = res?.approvers.find(
              (approver) => approver.authorID == this.oApprovalTrans.stepRecID
            );
            //Trả về cho form ký duyệt để xét nghiệp vụ OTP,loại chữ ký
            this.changeSignerInfo.emit(this.signerInfo);
          } else {
            this.signerInfo = res.approvers[0];
          }

          //Load lại danh sách action khả dụng theo từng người/step
          //this.reloadAction();

          //Lấy thông tin chữ kí công cộng bên ngoài
          if (this.isPublic) {
            this.getPASignature();
          }
          //Thông tin file hiện tại, người kí/duyệt hiện tại
          this.curFileID = this.lstFiles[0]['fileID'];
          this.curFileUrl = this.lstFiles[0]['fileUrl'] ?? '';
          this.curFileName = this.lstFiles[0]['fileName'] ?? '';
          this.curSignerID = this.signerInfo?.authorID;
          this.curSignerRecID = this.signerInfo?.recID;
        }
        this.detectorRef.detectChanges();
      });

    this.detectorRef.detectChanges();
  }

  //Lấy data ký số theo cơ chế mới cho quy trình động
  getProcessESign() {
    let request = new tempLoadPDF();
    request.recID = this.recID;
    request.dynamicApprovers = this.dynamicApprovers;
    request.isSettingMode=this.isSettingMode;
    request.fileIDs=this.fileIDs;
    this.api
      .execSv('BP', 'BP', 'ProcessesBusiness', 'GetPDFFormAsync', [request])
      .subscribe((res: any) => {
        if (res) {
          if (res?.listFile?.length > 0) {
            res?.listFile?.forEach((file: any, index) => {
              if (file) {
                file.fileUrl = environment.urlUpload + '/' + file.fileUrl;
                file.fileIdx = index;
                file.signers = res?.approvers;
              }
            });
            this.lstFiles = res?.listFile;
          }

          //Lấy danh sách người duyệt
          this.lstSigners = res.approvers;

          //Gán lại URL đầy đủ cho hình chữ ký con dấu
          this.lstSigners.forEach((signer) => {
            if (signer.signature1)
              signer.signature1 =
                environment.urlUpload + '/' + signer.signature1;
            if (signer.signature2)
              signer.signature2 =
                environment.urlUpload + '/' + signer.signature2;
            if (signer.stamp)
              signer.stamp = environment.urlUpload + '/' + signer.stamp;
          });

          //Lấy thông tin Approver hiện tại
          if (this.isApprover) {
            this.signerInfo = res?.approvers.find(
              (approver) => approver.userID == this.user?.userID
            );
            //Trả về cho form ký duyệt để xét nghiệp vụ OTP,loại chữ ký
            this.changeSignerInfo.emit(this.signerInfo);
          } else {
            this.signerInfo = res.approvers[0];
          }
          //Load lại danh sách action khả dụng theo từng người/step
          //this.reloadAction();

          //Lấy thông tin chữ kí công cộng bên ngoài
          if (this.isPublic) {
            this.getPASignature();
          }
          //Thông tin file hiện tại, người kí/duyệt hiện tại
          this.curFileID = this.lstFiles[0]['fileID'];
          this.curFileUrl = this.lstFiles[0]['fileUrl'] ?? '';
          this.curFileName = this.lstFiles[0]['fileName'] ?? '';
          this.curSignerID = this.signerInfo?.authorID;
          this.curSignerRecID = this.signerInfo?.recID;
        }
        this.detectorRef.detectChanges();
      });

    this.detectorRef.detectChanges();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//

  valueChange(event) {
    if (event?.field) {
      if (event?.field == 'emailPublicSign') {
        this.paSignature.email = event?.data;
      } else if (event?.field == 'passwordPublicSign') {
        this.paSignature.password = event?.data;
      }
      this.detectorRef.detectChanges();
    }
  }

  //loaded pdf
  loadedPdf(e: any) {
    if (e.pagesCount > 0) {
      this.pageMax = e.pagesCount;

      let ngxService: NgxExtendedPdfViewerService =
        new NgxExtendedPdfViewerService();

      //trinh ky
      if (!this.isSignMode) {
        // this.curPage == 1 &&
        if (this.needSuggest) {
          this.curPage = this.pageMax;
        }
      } else {
        let firstAreaOfSigner = null;
        if (this.lstAreas?.length > 0) {
          firstAreaOfSigner = this.lstAreas?.reduce((prev, curr) => {
            if (curr.signer != this.curSignerID) return null;
            else {
              return prev?.location?.pageNumber < curr?.location?.pageNumber
                ? prev
                : curr;
            }
          });
        }
        if (firstAreaOfSigner != null) {
          this.curPage = firstAreaOfSigner.location.pageNumber + 1;
          // this.curPage == 1 &&
        } else if (this.needSuggest) {
          this.curPage = this.pageMax;
        }
      }
      ngxService.addPageToRenderQueue(this.curPage);
    }
  }

  pdfDownloaded(e: any) {}
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//
  hideShowTab() {
    this.rightToolbar.hideTab(
      0,
      !(this.isEditable && !this.isPublic && !this.isInteractPDF)
    );
    this.rightToolbar.hideTab(
      1,
      !(this.inputUrl == null && !this.isInteractPDF)
    );
    this.rightToolbar.hideTab(2, !this.isApprover);
    this.rightToolbar.hideTab(3, !this.isApprover);
    // if (this.lstKey) this.rightToolbar.hideTab(4, false);
    // else this.rightToolbar.hideTab(4, true);
  }

  crrType: any;

  changeAnnotationItem(type: any) {
    let curStepType = this.signerInfo.stepType;
    // let hasCA = false;
    // if (curStepType != 'S') {
    //   let hasCAStep = this.lstSigners.find(
    //     (signer) => signer.stepNo < this.stepNo && signer.stepType == 'S'
    //   );
    //   if (hasCAStep) {
    //     hasCA = true;
    //   }
    // }

    // if (hasCA) {
    //   this.notificationsService.notifyCode('ES022');
    //   return;
    // }
    if (!type) return;
    /** action: object vll
    {value: 'S1', text: 'Chữ ký chính', default: 'Chữ ký chính', color: null, textColor: null, …}
    {value: 'S2', text: 'Ký nháy', default: 'Ký nháy', color: null, textColor: null, …}
    {value: 'S3', text: 'Con dấu', default: 'Con dấu', color: null, textColor: null, …}
    {value: '3', text: 'Tên đầy đủ', default: 'Tên đầy đủ', color: null, textColor: null, …}
    {value: '4', text: 'Chức danh', default: 'Chức danh', color: null, textColor: null, …}
    {value: '5', text: 'Ngày giờ', default: 'Ngày giờ', color: null, textColor: null, …}
    {value: '6', text: 'Ghi chú', default: 'Ghi chú', color: null, textColor: null, …}
    {value: '7', text: 'Số văn bản', default: 'Số văn bản', color: null, textColor: null, …}
    {value: '8', text: 'QR Code', default: 'QR Code', color: null, textColor: null, …}
    {value: '9', text: 'Nhãn', default: 'Nhãn', color: null, textColor: null, …} */
    if (this.needAddKonva) {
      this.needAddKonva?.destroy();
    }

    this.crrType = type;
    if (this.signerInfo.allowEditAreas == false) {
      //thong bao khong duoc dung
      this.notificationsService.notifyCode('ES036');
      return;
    }

    if (this.isEditable) {
      this.holding = type?.value;
      let transformable = this.signerInfo.allowEditAreas;
      switch (type?.value) {
        case 'S1':
          // if (!this.signerInfo?.signature1) {
          //   // thiet lap chu ki nhay
          //   let setupShowForm = new SetupShowSignature();
          //   setupShowForm.showSignature1 = true;
          //   this.addSignature(setupShowForm);
          //   return;
          // }
          this.url = this.signerInfo?.signature1 ?? '';
          break;
        case 'S2':
          // if (!this.signerInfo?.signature2) {
          //   // thiet lap chu ki nhay
          //   let setupShowForm = new SetupShowSignature();
          //   setupShowForm.showSignature2 = true;
          //   this.addSignature(setupShowForm);
          //   return;
          // }
          this.url = this.signerInfo?.signature2 ?? '';
          break;
        case 'S3':
          // if (!this.signerInfo?.stamp) {
          //   // thiet lap con dau
          //   let setupShowForm = new SetupShowSignature();
          //   setupShowForm.showStamp = true;
          //   this.addSignature(setupShowForm);
          //   return;
          // }
          this.url = this.signerInfo?.stamp ?? '';
          break;

        case '3':
          this.url = this.signerInfo?.fullName
            ? this.signerInfo?.fullName
            : type?.text;
          break;
        case '4':
          this.url = this.signerInfo?.position
            ? this.signerInfo?.position
            : type?.text;
          break;
        case '5':
          this.url = this.curSignDateType;
          break;
        case '6':
          this.url = type?.text;
          break;
        case '7':
          this.url = this.fileInfo?.fileRefNum;
          break;
        case '8':
          this.url = qr;
          break;
        case '9': {
          let stampDialog = this.callfc.openForm(
            PopupSelectLabelComponent,
            '',
            900,
            700,
            this.funcID,
            {
              title: 'Chọn Nhãn',
              labels: this.labels,
            }
          );
          stampDialog.closed.subscribe((res) => {
            if (
              res.event &&
              !this.lstAreas.find((area) => area.labelType == '9')
            ) {
              let curLabelUrl = res.event;
              this.url = '';
              if (curLabelUrl && curLabelUrl != '') {
                this.addArea(
                  curLabelUrl,
                  'img',
                  type?.value,
                  transformable,
                  true,
                  this.curSignerID,
                  this.signerInfo.stepNo
                );
              }
            }
          });
          return;
        }
        default:
          this.url = '';
          break;
      }
      if (this.imgConfig.includes(type.value)) {
        if (this.url != '') {
          this.addArea(
            this.url,
            'img',
            type?.value,
            transformable,
            true,
            this.curSignerID,
            this.signerInfo.stepNo
          );
        } else {
          this.addArea(
            this.signerInfo.fullName + '-' + type.text,
            'text',
            type?.value,
            transformable,
            true,
            this.curSignerID,
            this.signerInfo.stepNo
          );
        }
      } else {
        this.addArea(
          this.url,
          'text',
          type?.value,
          transformable,
          true,
          this.curSignerID,
          this.signerInfo.stepNo
        );
      }
    } else {
      this.holding = 0;
    }
  }

  changeShowThumbnailState() {
    this.hideThumbnail = !this.hideThumbnail;
  }

  changeShowActionsState() {
    this.hideActions = !this.hideActions;
  }

  changeFontWeight(type) {
    switch (type) {
      case 1:
        this.isBold = !this.isBold;
        break;
      case 2:
        this.isItalic = !this.isItalic;
        break;
      case 3:
        this.isUnd = !this.isUnd;
        break;
      case 4:
        this.isLineThrough = !this.isLineThrough;
        break;
    }
    this.curDecor =
      (this.isUnd ? 'underline' : '') +
      (this.isLineThrough ? ' line-through' : '');
    this.detectorRef.detectChanges();
  }
  changeSignFile(e: any) {
    this.lstSigners = e.itemData.signers;
    this.fileInfo = e.itemData;
    this.curFileID = this.fileInfo.fileID;
    this.autoSignState = false;
    this.curPage = 1;
    this.lstAreas = [];
    this.getListCA();
    this.esService
      .getSignAreas(
        this.recID,
        this.fileInfo.fileID,
        this.isApprover,
        this.user.userID,
        this.stepNo,
        this.modeView,
        this.isSettingMode,
      )
      .subscribe((res) => {
        if (res) {
          this.lstAreas = res;
          this.detectorRef.detectChanges();
        }
        this.curFileUrl = this.fileInfo.fileUrl;
        this.curFileName = this.fileInfo.fileName;
        this.detectorRef.detectChanges();
      });
    this.esService
      .changeSFCacheBytes(
        this.curFileUrl.replace(environment.urlUpload + '/', '')
      )
      .subscribe((res) => {
        console.log('change sf url', res);
      });
    // this.detectorRef.detectChanges();
  }

  changeZoom(type: string, e?: any) {
    let idx = this.lstZoomValue.findIndex((x) => x == this.zoomValue);
    switch (type) {
      case 'out': {
        if (idx > 0) {
          idx -= 1;
        }
        break;
      }

      case 'in': {
        if (idx < this.lstZoomValue.length) {
          idx += 1;
        }
        break;
      }
      case 'to': {
        idx = this.lstZoomValue.findIndex((x) => x == e?.value);
      }
    }
    this.zoomValue = this.lstZoomValue.at(idx);

    this.detectorRef.detectChanges();
    if (this.curSelectedArea) {
      this.tr?.forceUpdate();
      this.tr?.draw();
    }
  }

  exportExcel(e: any) {
    let url = UrlUtil.setUrl(this.inputUrl, 'isPdf', 'false');
    this.http
      .get(url, { responseType: 'blob' as 'json' })
      .subscribe((res: Blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(res);
        link.download = 'excel.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  }

  changeSigner(e: any) {
    //reset
    if (this.needAddKonva) {
      this.url = '';
      this.holding = 0;
      this.needAddKonva?.destroy();
      this.needAddKonva = null;
    }
    this.signerInfo = e.itemData;
    this.curSignerID = this.signerInfo.authorID;
    this.stepNo = this.signerInfo.stepNo;
    this.curSignerRecID = this.signerInfo.recID;
    //this.reloadAction();
    this.detectorRef.detectChanges();
  }
  //Load lại danh sách action khả dụng theo từng người/step
  reloadAction() {
    if (this.ovllActions?.length > 0 && this.signerInfo != null) {
      switch (this.signerInfo?.stepType) {
        case 'S':
          this.vllActions = [...this.ovllActions];
          break;
        default:
          this.vllActions = [
            ...this.ovllActions?.filter(
              (x) => x.value != 'S3' && x.value != 'S2' && x.value != 'S1'
            ),
          ];
          break;
      }
      this.detectorRef.detectChanges();
    }
  }
  changeSuggestState(e: any) {
    if (this.isEditable) {
      this.needSuggest = e.data;
      if (this.needSuggest) {
        this.curPage = this.pageMax;
      }
      this.detectorRef.detectChanges();
    }
  }

  changeAutoSignState(e: any, mode: number) {
    if (this.isEditable) {
      if (e.data && !this.autoSignState) {
        this.curPage = this.pageMax;
        setTimeout(this.autoSign.bind(this), 1000);
      }
      this.autoSignState = e.data;
      this.detectorRef.detectChanges();
    }
  }
  //remove area
  removeArea() {
    this.esService
      .deleteAreaById(
        this.recID,
        this.fileInfo.fileID,
        this.curSelectedArea.id(),
        this.modeView,
        this.isSettingMode,
      )
      .subscribe((res) => {
        if (res) {
          this.esService
            .getSignAreas(
              this.recID,
              this.fileInfo.fileID,
              this.isApprover,
              this.user.userID,
              this.stepNo,
              this.modeView,
              this.isSettingMode,
            )
            .subscribe((res) => {
              if (res) {
                this.lstAreas = res;
                this.detectorRef.detectChanges();
              }
            });
          this.curSelectedArea.destroy();
          this.tr?.remove();
        }
      });
  }

  //#region Public Signing
  currentTab = 0;
  checkedConfirm: boolean = true;
  @ViewChild('imgSignature1', { static: false })
  imgSignature1: ImageViewerComponent;
  @ViewChild('imgSignature2', { static: false })
  imgSignature2: ImageViewerComponent;
  @ViewChild('imgStamp', { static: false }) imgStamp: ImageViewerComponent;

  changeTab(currTab) {
    this.currentTab = currTab;
  }

  changeEditMode() {
    this.isInteractPDF = !this.isInteractPDF;

    this.showHand = false;
    let lstLayer = document.getElementsByClassName('manualCanvasLayer');
    Array.from(lstLayer).forEach((ele: HTMLElement) => {
      ele.style.zIndex = this.isInteractPDF ? '-1' : '2';
    });
    this.detectorRef.detectChanges();

    // this.hideShowTab();

    // if (!this.isInteractPDF) {
    //   this.rightToolbar && this.rightToolbar.select(0);
    // } else this.rightToolbar && this.rightToolbar.select(4);
  }

  goToSelectedHighlightText(key) {
    this.curSelectedHLA = this.lstHighlightTextArea.find((x) => x.group == key);
    let curSelectHL = document.getElementsByClassName('highlighted');
    let selectedSpans = Array.from(curSelectHL).filter((ele: HTMLElement) => {
      return ele.dataset.id == key;
    });
    selectedSpans.forEach((ele: HTMLElement) => {
      ele.style.backgroundColor = this.selectedColor;
    });

    let unselectedSpans = Array.from(curSelectHL).filter((ele: HTMLElement) => {
      return ele.dataset.id != key;
    });
    unselectedSpans?.forEach((ele: HTMLElement) => {
      ele.style.backgroundColor = this.defaultColor;
    });

    let curSelectHLLst = document.getElementsByClassName('highlightedList');
    this.curPage = this.curSelectedHLA.locations[0].pageNumber;
    Array.from(curSelectHLLst).forEach((ele: HTMLElement) => {
      if (ele.dataset.id != key) {
        ele.style.backgroundColor = this.defaultColor;
      } else {
        ele.style.backgroundColor = this.selectedColor;
      }
    });
    this.detectorRef.detectChanges();
  }

  changeHLComment() {
    this.esService
      .changeHLComment(
        this.curFileUrl.replace(environment.urlUpload + '/', ''),
        this.fileInfo.fileID,
        this.fileInfo.fileName,
        this.curSelectedHLA.group,
        this.curCmtContent,
        this.curPage
      )
      .subscribe((res) => {
        console.log('doi cmt', this.curCmtContent);
      });
  }

  removeHLA(key: string) {
    let idx = this.lstHighlightTextArea.findIndex((x) => x.group == key);
    if (idx != -1 && this.lstHighlightTextArea[idx].isAdded == false) {
      this.lstHighlightTextArea.splice(idx, 1);
      this.lstKey.splice(idx, 1);
      this.detectorRef.detectChanges();
    }
  }

  changeRemoveHLAMode() {
    this.deleteHLAMode = !this.deleteHLAMode;
  }

  //go to
  goToSelectedCA(ca, idx) {
    this.lstCACollapseState[idx].open = !this.lstCACollapseState[idx].open;
    this.curPage = this.lstCA[idx].signedPosPage;
    if (!ca.isVerified) {
      this.lstCACollapseState[idx].verifiedFailed =
        !this.lstCACollapseState[idx].verifiedFailed;
    }
    this.curPage = ca.signedPosPage;
    if (this.curSelectedCA) {
      this.curSelectedCA.opacity(1);
    }
    let layer = this.lstLayer.get(ca.signedPosPage);
    let curID = 'CertificateAuthencation' + idx;
    let caRect = layer.children.find((child) => child.id() == curID);
    this.curSelectedCA = caRect;
    this.curSelectedCA.opacity(0);
    this.tr?.draggable(false);
    this.tr?.resizeEnabled(false);
    this.tr?.rotateEnabled(this.rotateEnable);
    this.tr?.nodes([this.curSelectedCA]);
    layer?.add(this.tr);
    layer?.draw();
  }

  goToPage(e) {
    if (e.data == 0) {
      this.curPage = 1;
    } else if (e.data != this.curPage) {
      this.curPage = e.data;

      if (this.curPage > this.pageMax) {
        this.curPage = this.pageMax;
      }

      this.detectorRef.detectChanges();
    }
    console.log('this.curPage', this.curPage);
  }

  goToSelectedAnnotation(area: tmpSignArea) {
    if (this.curPage != area.location.pageNumber + 1) {
      this.curPage = area.location.pageNumber + 1;
    }
    if (area.labelType != '8') {
      this.curSelectedArea = this.lstLayer
        .get(area.location.pageNumber + 1)
        .children?.find((node) => {
          return node?.attrs?.id == area.recID;
        });
      let isCA = false;
      if (this.curSelectedArea == null) {
        let curSelectedSignerInfo = this.lstSigners?.find(
          (signer) => signer.authorID == area.signer
        );
        let idx = this.lstCA?.findIndex(
          (ca) => ca.certificate.commonName == curSelectedSignerInfo?.email
        );
        if (idx && idx != -1) {
          isCA = true;
          this.goToSelectedCA(this.lstCA[idx], idx);
        }
      }

      let isUrl = this.curSelectedArea.attrs?.image != null;

      if (this.curSelectedArea != null && !isCA) {
        this.tr?.remove();
        let layerChildren = this.lstLayer.get(area.location.pageNumber + 1);
        if (this.isEditable && !this.isApprover) {
          this.tr?.resizeEnabled(true);
          this.tr?.draggable(true);
          this.tr?.enabledAnchors(
            this.imgConfig.includes(area.labelType)
              ? isUrl
                ? this.fullAnchor
                : this.textAnchor
              : this.textAnchor
          );
        } else {
          this.tr?.resizeEnabled(
            this.isEditable == false
              ? false
              : area.allowEditAreas == false
              ? false
              : area.isLock == true
              ? false
              : true
          );

          this.tr?.enabledAnchors(
            this.isEditable == false
              ? []
              : area.allowEditAreas == false
              ? []
              : area.isLock == true
              ? []
              : this.imgConfig.includes(area.labelType)
              ? isUrl //this.checkIsUrl(area.labelValue)
                ? this.fullAnchor
                : this.textAnchor
              : this.textAnchor
          );
          this.tr?.draggable(
            this.isEditable == false
              ? false
              : area.allowEditAreas == false
              ? false
              : area.isLock == true
              ? false
              : true
          );
        }

        this.tr?.forceUpdate();
        this.curSelectedArea.draggable(this.tr.draggable());
        this.tr?.nodes([this.curSelectedArea]);
        layerChildren.add(this.tr);
        if (this.curSelectedAnnotID != area.recID) {
          this.formAnnot.controls['content'].setValue(area.labelValue);
          this.isBold = area.fontFormat?.includes('bold') ? true : false;
          this.isItalic = area.fontFormat?.includes('italic') ? true : false;
          this.isUnd = area.fontFormat?.includes('underline') ? true : false;
          this.isLineThrough = area.fontFormat?.includes('line-through')
            ? true
            : false;
          this.curAnnotFontSize = area.fontSize;
          this.curAnnotFontStyle = area.fontStyle;
          this.curAnnotDateFormat = area.dateFormat;
          this.useSignDate = area.signDate;
          this.curSignDateType = area.signDate
            ? this.lstSignDateType[1]
            : this.lstSignDateType[0];
          this.curSelectedAnnotID = area.recID;
        }
        this.showHand = false;
        this.detectorRef.detectChanges();
      }
    } else {
      // console.log('top', area.location.top);
      // let qrRect = new Konva.Rect({
      //   x: area.location.left,
      //   y: area.location.top / this.yScale,
      //   width: 150 * area.location.width,
      //   height: 150 * area.location.height,
      //   opacity: 0,
      //   id: 'qr',
      // });
      // qrRect.scale({ x: this.xScale, y: this.yScale });
      // let layer = this.lstLayer.get(area.location.pageNumber + 1);
      // this.tr?.nodes([qrRect]);
      // layer?.add(qrRect);
      // layer?.add(this.tr);
    }
  }

  pageRendered(e: any) {
    // if (this.inputUrl == null) {
    let rendedPage = Array.from(document.getElementsByClassName('page'))?.find(
      (ele) => {
        return ele.getAttribute('data-page-number') == e.pageNumber;
      }
    );
    let warpper = rendedPage?.querySelector('.canvasWrapper');
    if (warpper) {
      let virtual = document.createElement('div');
      let id = 'layer' + e.pageNumber.toString();
      let addedLayer = document.getElementById(id);
      if (addedLayer) {
        addedLayer.remove();
      }
      virtual.id = id;
      virtual.className = 'manualCanvasLayer';
      virtual.style.zIndex = this.isInteractPDF ? '-1' : '2';
      virtual.style.border = '1px solid blue';
      virtual.style.position = 'absolute';
      virtual.style.top = '0';

      let canvasBounds: any;

      if (warpper) {
        warpper.appendChild(virtual);
        canvasBounds = (warpper.firstChild as Element).getBoundingClientRect();
        this.pageW = canvasBounds.width;
        this.pageH = canvasBounds.height;
        let stage = new Konva.Stage({
          container: id,
          id: id,
          width: canvasBounds.width,
          height: canvasBounds.height,
        });
        if (this.zoomValue == 100) {
          this.xAt100 = canvasBounds.width;
          this.yAt100 = canvasBounds.height;
        }
        this.xScale = canvasBounds.width / this.xAt100;
        this.yScale = canvasBounds.height / this.yAt100;

        let layer = new Konva.Layer({
          id: id,
          opacity: 1,
        });

        this.lstLayer.set(e.pageNumber, layer);

        let lstAreaOnPage = this.lstAreas?.filter((area) => {
          return area.location.pageNumber + 1 == e.pageNumber;
        });
        lstAreaOnPage?.forEach((area) => {
          let isRender = false;
          if (
            (area.labelType != '8' && !this.isApprover && !area.isLock) ||
            (this.isApprover &&
              area.signer == this.curSignerID &&
              area.stepNo == this.stepNo)
          ) {
            isRender = true;
          }
          if (area.labelType == '8' && area.isLock == false) {
            isRender = true;
          }
          let transformable =
            this.isEditable == false
              ? false
              : area.allowEditAreas == false
              ? false
              : !area.isLock;
          if (isRender) {
            let curSignerInfo = null;
            if (area?.objectID != null) {
              curSignerInfo = this.lstSigners.find(
                (signer) =>
                  signer?.authorID == area?.signer &&
                  signer?.userID == area?.objectID
              );
            } else {
              curSignerInfo = this.lstSigners.find(
                (signer) => signer?.authorID == area?.signer
              );
            }
            let url = '';
            let isChangeUrl = false;
            switch (area.labelType) {
              case 'S1': {
                url = curSignerInfo?.signature1 ?? area.labelValue;
                if (
                  area.labelValue != url &&
                  url != environment.urlUpload + '/' + area.labelValue
                ) {
                  isChangeUrl = true;
                }
                let isUrl = this.checkIsUrl(url);
                this.addArea(
                  url,
                  isUrl ? 'img' : 'text',
                  area.labelType,
                  transformable,
                  false,
                  area.signer,
                  area.stepNo,
                  area,
                  isChangeUrl
                );
                break;
              }
              case 'S2': {
                url = curSignerInfo?.signature2 ?? area.labelValue;
                if (
                  area.labelValue != url &&
                  url != environment.urlUpload + '/' + area.labelValue
                ) {
                  isChangeUrl = true;
                }
                let isUrl = this.checkIsUrl(url);
                this.addArea(
                  url,
                  isUrl ? 'img' : 'text',
                  area.labelType,
                  transformable,
                  false,
                  area.signer,
                  area.stepNo,
                  area,
                  isChangeUrl
                );
                break;
              }
              case 'S3': {
                url = curSignerInfo?.stamp ?? area.labelValue;
                if (
                  area.labelValue != url &&
                  url != environment.urlUpload + '/' + area.labelValue
                ) {
                  isChangeUrl = true;
                }
                let isUrl = this.checkIsUrl(url);
                this.addArea(
                  url,
                  isUrl ? 'img' : 'text',
                  area.labelType,
                  transformable,
                  false,
                  area.signer,
                  area.stepNo,
                  area,
                  isChangeUrl
                );
                break;
              }
              case '8': {
                if (!area.isLock) {
                  this.addArea(
                    qr,
                    'img',
                    area.labelType,
                    transformable,
                    false,
                    area.signer,
                    area.stepNo,
                    area
                  );
                }
                break;
              }
              case '9': {
                this.addArea(
                  area.labelValue,
                  'img',
                  area.labelType,
                  transformable,
                  false,
                  area.signer,
                  area.stepNo,
                  area
                );
                break;
              }
              case '3':
              case '4':
              case '5':
              case '6':
              case '7': {
                this.addArea(
                  area.labelValue,
                  'text',
                  area.labelType,
                  transformable,
                  false,
                  area.signer,
                  area.stepNo,
                  area
                );
                break;
              }
            }
          }
        });

        if (this.inputUrl && !this.gotLstCA) {
          this.esService
            .getListCAByBytes(
              this.curFileUrl.replace(environment.urlUpload + '/', '')
            )
            .subscribe((res) => {
              this.lstCA = res;
              this.lstCA?.forEach((ca) => {
                this.lstCACollapseState.push({
                  open: false,
                  verifiedFailed: false,
                  detail: false,
                });
              });
              let lstCAOnPage = this.lstCA?.filter(
                (childCA) => childCA.signedPosPage == this.curPage
              );
              lstCAOnPage?.forEach((ca, idx) => {
                let caW =
                  ((ca?.signedPosRight - ca.signedPosLeft) / 0.75) *
                  this.xScale;
                let caH =
                  ((ca?.signedPosBottom - ca?.signedPosTop) / 0.75) *
                  this.yScale;
                let caRect = new Konva.Rect({
                  x: (ca.signedPosLeft / 0.75) * this.xScale,
                  y: this.pageH - (ca?.signedPosTop / 0.75) * this.yScale - caH,
                  width: caW,
                  height: caH,
                  opacity: 0,
                  id: 'CertificateAuthencation' + idx,
                  name: ca.certificate?.commonName,
                });
                layer.add(caRect);
              });
            });
          this.gotLstCA = true;
        }
        stage.add(layer);
        this.detectorRef.detectChanges();
        // }
        //stage event
        stage.on('mouseenter', (mouseover: any) => {
          if (this.needAddKonva) {
            let attrs = this.needAddKonva.attrs;
            let name: tmpAreaName = JSON.parse(attrs.name);

            let transformable = false;
            if (this.isEditable && !this.isApprover) {
              transformable = true;
            } else {
              transformable = this.signerInfo.allowEdit; //== false ? false : true;
            }

            this.tr?.rotateEnabled(this.rotateEnable);
            this.tr?.draggable(transformable);
            this.tr?.enabledAnchors(
              !transformable
                ? []
                : name.Type == 'img'
                ? this.checkIsUrl(name.LabelValue)
                  ? this.fullAnchor
                  : this.textAnchor
                : this.textAnchor
            );
            this.tr?.resizeEnabled(transformable);
            this.tr?.nodes([this.needAddKonva]);
            this.tr?.forceUpdate();
            stage.children[0].add(this.tr);
            stage.children[0].add(this.needAddKonva);
            this.needAddKonva.position(stage.getPointerPosition());
            this.needAddKonva.startDrag();

            this.needAddKonva.on('dragend', (dragEnd) => {
              if (dragEnd?.evt?.toElement?.tagName == 'CANVAS') {
                if (this.needAddKonva) {
                  this.holding = 0;

                  switch (name.Type) {
                    case 'text': {
                      this.saveNewToDB(
                        attrs.text,
                        name.Type,
                        name.LabelType,
                        name.Signer,
                        this.stepNo,
                        this.needAddKonva
                      );

                      break;
                    }
                    case 'img': {
                      this.saveNewToDB(
                        name.LabelValue,
                        name.Type,
                        name.LabelType,
                        name.Signer,
                        this.stepNo,
                        this.needAddKonva
                      );
                      break;
                    }
                  }
                  // } else {
                  //   this.needAddKonva.destroy();
                  //   this.tr?.remove();
                  // }
                }
                this.needAddKonva = null;
              } else {
                this.needAddKonva.startDrag();
              }
            });
          }
        });

        //left click
        stage.on('click', (click: any) => {
          let layerChildren = this.lstLayer.get(e.pageNumber);
          if (click.target == stage) {
            this.showHand = true;
            if (this.contextMenu) {
              this.contextMenu.style.display = 'none';
            }
            if (this.curSelectedCA) {
              this.curSelectedCA = null;
            }
            this.tr?.remove();
            this.tr?.nodes([]);
          } else {
            this.curSelectedArea = click.target;
            if (
              !this.curSelectedArea.id().includes('CertificateAuthencation')
            ) {
              let tmpArea = this.lstAreas.find(
                (area) => area.recID == this.curSelectedArea.id()
              );
              this.goToSelectedAnnotation(tmpArea);
            } else {
              let idx = this.curSelectedArea
                .id()
                .replace('CertificateAuthencation', '');
              this.goToSelectedCA(this.lstCA[idx], idx);
            }
          }
        });

        //right click
        stage.on('contextmenu', (e: any) => {
          e.evt.preventDefault();
          if (e.target === stage && this.contextMenu) {
            this.contextMenu.style.display = 'none';
            return;
          }
          this.curSelectedArea = e.target;

          if (
            this.isEditable &&
            this.curSelectedArea.draggable() &&
            this.contextMenu
          ) {
            this.contextMenu.style.display = 'initial';
            this.contextMenu.style.zIndex = '2';

            this.contextMenu.style.top = e.evt.pageY + 'px';
            this.contextMenu.style.left = e.evt.pageX + 'px';
          }
        });
      }
    }
    let ngxService: NgxExtendedPdfViewerService =
      new NgxExtendedPdfViewerService();
    if (ngxService.isRenderQueueEmpty()) {
      this.getListHighlights();
    }
  }

  getTextLayerInfo(txtLayer: TextLayerRenderedEvent) {
    if (txtLayer?.source?.textLayer?.div?.nextElementSibling != null) {
      (
        txtLayer?.source.textLayer?.div.nextElementSibling as HTMLElement
      ).style.zIndex = '-1';
    }
    if (txtLayer.pageNumber == this.pageMax) {
      txtLayer?.source.textLayer?.textDivs.forEach((div) => {
        // if (Number(div.style.top.replace('px', '')) > this.maxTop) {
        if (div.offsetTop > this.maxTop) {
          // this.maxTop = Number(div.style.top.replace('px', ''));
          this.maxTop = div.offsetTop;
          this.maxTopDiv = div;
        }
      });
    }
  }
  //create area
  /*
    type = 'text' || 'img' || 'group'
    labelType = 1;Chữ ký;2;Con dấu;3;Tên đầy đủ;4;Chức danh;5;Ngày giờ;6;Ghi chú;7;Số văn bản;8;QR Code;9;Nhãn

  */
  saveQueue = new Map();
  saveAfterX = 500;

  resetTime(tmpArea: tmpSignArea) {
    clearTimeout(this.saveQueue?.get(tmpArea.recID));
    this.saveQueue?.delete(this.saveQueue?.get(tmpArea.recID));
    this.saveQueue.set(
      tmpArea.recID,
      setTimeout(
        this.saveToDB.bind(this),
        this.saveAfterX,
        tmpArea,
        tmpArea.recID
      )
    );
  }

  //-----------------------------------Area----------------------------------//

  addArea(
    url,
    type: string,
    labelType,
    draggable: boolean,
    isSaveToDB: boolean,
    stepRecID: string,
    stepNo: number,
    area?: tmpSignArea,
    isChangeUrl: boolean = false
  ) {
    let tmpName: tmpAreaName = {
      Signer: stepRecID,
      Type: type,
      PageNumber: this.curPage - 1,
      StepNo: stepNo,
      LabelType: labelType,
      LabelValue: url,
    };
    let recID = Guid.newGuid();

    let imgX = Number(area?.location?.left ?? 0) * this.xScale;
    let imgY = Number(area?.location?.top ?? 0) * this.yScale;

    let deg = this.rotate + area?.location?.fileRotate ?? 0;
    if (deg < 0) {
      deg += 360;
    }
    let x_ = imgX;

    //ngx quay theo chieu kim dong ho
    switch (deg) {
      case 0: {
        break;
      }
      case 90: {
        imgX = this.pageW - imgY;
        imgY = x_;
        break;
      }
      case 180: {
        imgX = this.pageW - imgX;
        imgY = this.pageH - imgY;
        break;
      }

      case 270: {
        imgX = imgY;
        imgY = this.pageH - x_;
        break;
      }
    }

    switch (type) {
      case 'text':
        let textArea = new Konva.Text({
          text: url,
          fontSize: 14,
          fontFamily: 'Arial',
          // text: "COMPLEX TEXT\n\nAll the world's a stage, and all the men and women merely players. They have their exits and their entrances.",
          draggable: draggable,
          name: JSON.stringify(tmpName),
          id: recID,
          align: 'left',
          scaleX: 1,
          scaleY: 1,
        });

        textArea.on('transform', () => {
          textArea.setAttrs({
            width: Math.max(
              textArea.width() * textArea.scaleX(),
              this.minLineW
            ),
            scaleX: 1,
            scaleY: 1,
            fontSize: textArea.fontSize(),
            fontFamily: textArea.fontFamily(),
            fontStyle: textArea.fontStyle(),
          });
        });
        if (isSaveToDB) {
          textArea.scale({
            x: this.xScale,
            y: this.yScale,
          });
          textArea.width(Math.min(this.maxLineW, textArea.width()));
          this.stepNo = stepNo;

          this.needAddKonva = textArea;

          // });
        } else {
          textArea.id(area.recID ? area.recID : textArea.id());
          textArea.draggable(!area.allowEditAreas ? false : !area.isLock);
          textArea.width(Number(area.location?.width));
          textArea.scale({
            x: 1,
            y: 1,
          });
          textArea.rotate(area.location.fileRotate + this.rotate);
          textArea.fontSize(area.fontSize);
          textArea.fontStyle(
            area.fontFormat.replace('line-through', '').replace('underline', '')
          );
          let decorate =
            (area.fontFormat.includes('underline') ? 'underline ' : '') +
            (area.fontFormat.includes('line-through') ? 'line-through' : '');

          textArea.textDecoration(decorate);
          textArea.fontFamily(area.fontStyle);

          textArea.x(imgX);
          textArea.y(imgY);

          this.lstLayer.get(area.location.pageNumber + 1).add(textArea);
          textArea.on('dragend transformend', (e: any) => {
            this.addDragResizeEevent(
              area,
              e.type,
              textArea.getPosition(),
              textArea.scale(),
              textArea.attrs.rotation,
              textArea.width()
            );
          });

          this.detectorRef.detectChanges();
        }
        break;

      case 'img': {
        const img = document.createElement('img') as HTMLImageElement;
        console.log('run addArea', url);

        // img.setAttribute('crossOrigin', 'anonymous');
        // img.referrerPolicy = 'noreferrer';
        img.src = url;
        img.onload = () => {
          let imgFixW = 200;
          let imgFixH = 200;

          //yeu cau ngay 12/09 chu ky nhay se nho hon 1/2 so voi chu ky chinh

          if (labelType == 'S2') {
            imgFixW = imgFixW / 2;
            imgFixH = imgFixH / 2;
          }
          let scaleW = imgFixW / img.width;
          let scaleH = scaleW * (img.height / img.width) * this.yScale;
          if (img.width < imgFixW) {
            scaleW = 1;
          }
          if (img.height < imgFixH) {
            scaleH = 1;
          }

          scaleW *= this.xScale;
          let imgArea = new Konva.Image({
            image: img,
            // width: 200,
            // height: tmpName.LabelType == '8' ? 200 : 100,
            id: recID,
            name: JSON.stringify(tmpName),
            draggable: draggable,
          });

          if (isSaveToDB) {
            imgArea.scale({
              x: scaleW,
              y: scaleH,
            });
            this.needAddKonva = imgArea;
          } else {
            if (isChangeUrl) {
              area.labelValue = url;
              if (this.imgConfig.includes(area.labelType)) {
                area.labelValue = area.labelValue.replace(
                  environment.urlUpload + '/',
                  ''
                );
                area.location.width = scaleW / this.xScale;
                area.location.height = scaleH / this.yScale;
              }
              this.esService
                .addOrEditSignArea(
                  this.recID,
                  this.curFileID,
                  area,
                  area.recID,
                  this.modeView,
                  this.isSettingMode,
                )
                .subscribe((res) => {});
            } else {
            }
            imgArea.id(area.recID);
            imgArea.draggable(!area.allowEditAreas ? false : !area.isLock);
            imgArea.rotate(area.location.rotate + this.rotate);

            imgArea.scale({
              x: +area.location.width * this.xScale,
              y: +area.location.height * this.yScale,
            });

            imgArea.x(imgX);
            imgArea.y(imgY);
            imgArea.on('dragend transformend  ', (e: any) => {
              this.addDragResizeEevent(
                area,
                e.type,
                imgArea.getPosition(),
                imgArea.scale(),
                imgArea.attrs.rotation,
                1
              );
            });
            this.lstLayer.get(area.location.pageNumber + 1).add(imgArea);
            this.detectorRef.detectChanges();
          }
        };
        break;
      }
      default:
        break;
    }
  }

  addDragResizeEevent(
    tmpArea: tmpSignArea,
    event,
    newPos?: { x: number; y: number },
    newScale?: { x: number; y: number },
    rotate?: number,
    width?: number
  ) {
    switch (event) {
      case 'dragend': {
        tmpArea.location.top =
          (newPos ? newPos.y : tmpArea.location.top) / this.yScale;
        tmpArea.location.left =
          (newPos ? newPos.x : tmpArea.location.left) / this.xScale;
        break;
      }

      case 'transformend': {
        tmpArea.location.width = newScale.x * width;
        tmpArea.location.height = newScale.y;
        tmpArea.location.top =
          (newPos ? newPos.y : tmpArea.location.top) / this.yScale;
        tmpArea.location.left =
          (newPos ? newPos.x : tmpArea.location.left) / this.xScale;
        tmpArea.location.fileRotate = -this.rotate;
        tmpArea.location.rotate = rotate - this.rotate;
        break;
      }
    }
    this.resetTime(tmpArea);
  }
  //-----------------------------------Area----------------------------------//

  //change
  useSignDate: boolean = true;

  changeDateType(isSignDate: boolean) {
    this.useSignDate = isSignDate;
    if (isSignDate) {
      this.curSignDateType = this.lstSignDateType[1];
    } else {
      this.curSignDateType = this.lstSignDateType[0];
    }
    this.detectorRef.detectChanges();
  }
  changeConfirmState(e: any) {
    if (this.isSigned) {
      this.confirmChange.emit(this.isSigned);
    }
  }

  changeSignature_StampImg(area: tmpSignArea) {
    let setupShowForm = new SetupShowSignature();
    let userID = this.oApprovalTrans.approver;
    // if (userID == this.curSignerType) {
    //   userID = this.lstSigners.find((x) => x.roleType == userID)?.authorID;
    // }

    if (userID == '') {
      return;
    }
    let model = {
      userID: userID,
      signatureType: area.signatureType,
      email: this.signerInfo?.email,
    };
    let data = {
      data: model,
      setupShowForm: setupShowForm,
      isPublic: this.isPublic,
    };

    switch (area.labelType) {
      case 'S1': {
        // thiet lap chu ki nhay
        setupShowForm.showSignature1 = true;
        break;
      }
      case 'S2': {
        // thiet lap chu ki nhay
        setupShowForm.showSignature2 = true;
        break;
      }
      case 'S3': {
        // thiet lap con dau
        setupShowForm.showStamp = true;
        break;
      }
    }
    let popupSignature = this.callfc.openForm(
      PopupSignatureComponent,
      '',
      800,
      600,
      '',
      data
    );
    popupSignature.closed.subscribe((res) => {
      if (res == null || res.event == null) {
        return;
      }
      if (res?.event[0]) {
        // environment.urlUpload + '/' +
        area.labelValue = res.event[0].pathDisk;
        this.detectorRef.detectChanges();
        console.log('run changeSignature_StampImg');

        this.changeAnnotPro(area.labelType, area.recID, area.labelValue);
      }
    });
  }

  changeSignature_StampImg_Area_Immediate(curArea: tmpSignArea, file) {
    let curLayer = this.lstLayer.get(curArea.location.pageNumber + 1);
    console.log('run changeSignature_StampImg_Area_Immediate');

    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      const img = document.createElement('img') as HTMLImageElement;
      // img.setAttribute('crossOrigin', 'anonymous');
      // img.referrerPolicy = 'noreferrer';
      img.src = fileReader.result.toString();
      let min = 0;
      let scale = 1;
      if (this.curSelectedArea?.attrs?.text) {
        let textW = this.curSelectedArea.width();
        let textH = this.curSelectedArea.height();
        min = Math.min(textW, textH);
        scale = Math.min(img.width, img.height) / min;
      }
      img.onload = () => {
        let tmpName: tmpAreaName = {
          Signer: curArea.signer,
          Type: 'img',
          PageNumber: this.curPage - 1,
          StepNo: curArea.stepNo,
          LabelType: curArea.labelType,
          LabelValue: '',
        };

        let imgArea = new Konva.Image({
          image: img,
          width: img.width / scale,
          height: img.height / scale,
          x: curArea.location.left * this.xScale,
          y: curArea.location.top * this.yScale,
          id: curArea.recID,
          draggable: true,
          name: JSON.stringify(tmpName),
        });
        imgArea?.scale({ x: this.xScale, y: this.yScale });
        this.curSelectedArea.destroy();
        this.curSelectedArea = imgArea;

        this.tr?.nodes([this.curSelectedArea]);
        curLayer.add(this.curSelectedArea);
        curLayer?.add(this.tr);
        curLayer?.draw();
      };
    };
    fileReader.readAsDataURL(file);
  }

  changeSignature_StampImg_Public(area: tmpSignArea) {
    switch (area.labelType) {
      case 'S1': {
        // thiet lap chu ki nhay
        let setupShowForm = new SetupShowSignature();
        setupShowForm.showSignature1 = true;
        console.log('run changeSignature_StampImg_Public');

        this.addSignature(setupShowForm, area);
        return;
        this.url = this.signerInfo?.signature1
          ? this.signerInfo?.signature1
          : '';
        break;
      }
      case 'S2': {
        // thiet lap chu ki nhay
        let setupShowForm = new SetupShowSignature();
        setupShowForm.showSignature2 = true;
        this.addSignature(setupShowForm);
        return;
        this.url = this.signerInfo?.signature2
          ? this.signerInfo?.signature2
          : '';
        break;
      }
      case 'S3': {
        // thiet lap con dau
        let setupShowForm = new SetupShowSignature();
        setupShowForm.showStamp = true;
        this.addSignature(setupShowForm);
        return;
        this.url = this.signerInfo?.stamp ? this.signerInfo?.stamp : '';
        break;
      }
    }
  }

  changeLeftTab(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

  changeRightTab(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

  //dang lam
  changeAnnotPro(type, recID, newUrl = null) {
    // switch (type.toString()) {
    let tmpName: tmpAreaName = JSON.parse(this.curSelectedArea?.attrs?.name);
    let textContent = '';
    let style = 'normal';
    let curArea = this.lstAreas.find((area) => area.recID == recID);
    if (curArea == null) return;
    let isTxt = false;
    if (this.imgConfig.includes(type)) {
      if (!newUrl) return;
      else {
        curArea.labelValue = newUrl;
        let curLayer = this.lstLayer.get(curArea?.location.pageNumber + 1);
        let curImgEle = document.getElementById(recID) as HTMLImageElement;
        console.log('run addArea', newUrl);

        curImgEle.src = environment.urlUpload + '/' + curArea.labelValue;
        let min = 0;
        let scale = 1;
        let scaleW = this.curSelectedArea.scaleX();
        let scaleH = this.curSelectedArea.scaleY();
        curImgEle.onload = () => {
          console.log('run changeAnnotPro', curArea.labelValue);

          let isText = this.curSelectedArea.attrs?.text ? true : false;
          if (isText) {
            // let textW = this.curSelectedArea.width();
            // let textH = this.curSelectedArea.height();
            // min = Math.min(textW, textH);
            // scale = Math.min(curImgEle.width, curImgEle.height) / min;
            let imgFixW = 200;
            let imgFixH = 200;
            if (curArea.labelType == 'S2') {
              imgFixW = imgFixW / 2;
              imgFixH = imgFixH / 2;
            }
            scaleW = imgFixW / curImgEle.width;
            scaleH =
              scaleW * (curImgEle.height / curImgEle.width) * this.yScale;
            if (curImgEle.width < imgFixW) {
              scaleW = 1;
            }
            if (curImgEle.height < imgFixH) {
              scaleH = 1;
            }

            scaleW *= this.xScale;
          }
          let imgArea = new Konva.Image({
            image: curImgEle,
            width: isText
              ? curImgEle.width / scale
              : this.curSelectedArea.width(),
            height: isText
              ? curImgEle.height / scale
              : this.curSelectedArea.height(),
            x: curArea.location.left * this.xScale,
            y: curArea.location.top * this.yScale,
            id: curArea.recID,
            draggable: true,
            name: this.curSelectedArea.name(),
            fileRotate: curArea.location.fileRotate,
          });
          // imgArea?.scale(this.curSelectedArea.scale());
          imgArea.scale({
            x: scaleW,
            y: scaleH,
          });
          this.curSelectedArea.destroy();
          this.curSelectedArea = imgArea;

          this.tr?.nodes([this.curSelectedArea]);
          curLayer.add(this.curSelectedArea);
          curLayer?.add(this.tr);
          curLayer?.draw();
        };
      }
    }

    // [3, 4, 5, 6, 7]
    else {
      isTxt = true;
      let isChangeText = false;
      if (type != '5') {
        textContent = this.formAnnot.value.content;
        isChangeText = textContent != curArea.labelValue;
      } else {
        textContent = this.curSignDateType;
      }
      let transformable = this.curSelectedArea.draggable();
      if (this.isBold && this.isItalic) {
        style.replace('normal', '');
        style = 'bold italic';
      } else if (this.isBold) {
        style.replace('normal', '');
        style = 'bold';
      } else if (this.isItalic) {
        style.replace('normal', '');
        style = 'italic';
      }

      let curInput = document.getElementById(recID);
      let inputW = curInput?.clientWidth ?? this.maxLineW;
      let position = this.curSelectedArea.getPosition();
      let textArea = new Konva.Text({
        text: textContent,
        fontSize: this.curAnnotFontSize,
        fontFamily: this.curAnnotFontStyle,
        fontStyle: style,
        textDecoration:
          (this.isUnd ? 'underline' : '') +
          (this.isLineThrough ? ' line-through' : ''),
        x: position.x,
        y: position.y,
        draggable: transformable,
        name: JSON.stringify(tmpName),
        id: recID,
        align: 'left',
        rotation: curArea.location.fileRotate + this.rotate,
      });

      let size = textArea.measureSize(textContent);
      textArea.width(Math.min(this.maxLineW, inputW, size.width));

      textArea.scale(this.curSelectedArea.scale());
      if (isTxt) {
        textArea.on('transform', () => {
          textArea.setAttrs({
            width: Math.max(
              textArea.width() * textArea.scaleX(),
              this.minLineW
            ),
            scaleX: 1,
            scaleY: 1,
            fontSize: textArea.fontSize(),
            fontFamily: textArea.fontFamily(),
            fontStyle: textArea.fontStyle(),
          });
        });
      }
      this.curSelectedArea.destroy();
      this.curSelectedArea = textArea;
      let curLayer = this.lstLayer.get(curArea?.location.pageNumber + 1); //xoa cho nay ne

      this.tr?.nodes([this.curSelectedArea]);
      curLayer.add(this.curSelectedArea);
      curLayer?.add(this.tr);
      curLayer?.draw();
    }

    this.curSelectedArea.draw();
    this.tr?.forceUpdate();
    this.tr?.draw();
    //save to db
    let y = this.curSelectedArea.position().y;
    let x = this.curSelectedArea.position().x;
    let w =
      this.curSelectedArea.scale().x *
      (isTxt ? this.curSelectedArea.width() : 1);
    let h =
      this.curSelectedArea.scale().y *
      (isTxt ? this.curSelectedArea.height() : 1);

    let tmpArea: tmpSignArea = {
      signer: tmpName.Signer,
      labelType: tmpName.LabelType,
      labelValue: this.imgConfig.includes(type)
        ? newUrl.replace(environment.urlUpload + '/', '')
        : textContent,
      isLock: !this.curSelectedArea.draggable(),
      allowEditAreas: this.signerInfo.allowEditAreas,
      signDate:
        tmpName.LabelType != '5'
          ? false
          : this.curSignDateType == this.lstSignDateType[1],
      dateFormat: this.imgConfig.includes(type) ? '' : this.curAnnotDateFormat,
      location: {
        top: y / this.yScale,
        left: x / this.xScale,
        width: w / this.xScale,
        height: h / this.yScale,
        pageNumber: curArea?.location.pageNumber,
        fileRotate: curArea.location.fileRotate,
        rotate: curArea.location.rotate,
      },
      stepNo: tmpName.StepNo,
      fontStyle: this.imgConfig.includes(type) ? '' : this.curAnnotFontStyle,
      fontFormat: this.imgConfig.includes(type)
        ? ''
        : style + ' ' + this.curSelectedArea.attrs?.textDecoration ?? '',
      fontSize: this.imgConfig.includes(type)
        ? 0
        : +this.curAnnotFontSize * this.xScale,
      signatureType: 2,
      comment: '',
      createdBy: tmpName.Signer,
      modifiedBy: tmpName.Signer,
      recID: this.curSelectedArea.attrs.id,
      objectID: this.signerInfo?.userID,
    };

    this.esService
      .addOrEditSignArea(
        this.recID,
        this.curFileID,
        tmpArea,
        tmpArea.recID,
        this.modeView,
        this.isSettingMode,
      )
      .subscribe((res) => {
        this.esService
          .getSignAreas(
            this.recID,
            this.fileInfo.fileID,
            this.isApprover,
            this.user.userID,
            this.stepNo,
            this.modeView,
            this.isSettingMode,
          )
          .subscribe((res) => {
            if (res) {
              this.lstAreas = res;
              this.detectorRef.detectChanges();
            }
          });
      });
  }

  changeQRRenderState(e) {
    this.renderQRAllPage = !this.renderQRAllPage;
  }

  changeRotation(e) {
    console.log('rotate', e);
  }

  addComment() {}

  change(event, type) {
    if (event?.keyCode == 32) {
      event.stopPropagation();
    }
  }

  removeCA() {
    this.esService.removeCA().subscribe((res) => {
      console.log('remove', res);
    });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  lstLayer: Map<number, Konva.Layer> = new Map();
  //          <pageNumber, Layer>
  pageW = 0;
  pageH = 0;

  checkIsUrl(string: string) {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return url.protocol === 'http:' || url.protocol === 'https:';
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  //sign pdf
  signPDF(mode, comment, cert = null, supplier = null): any {
    if (this.isEditable) {
      //&& this.transRecID
      // let hasCA = this.lstCA ? (this.lstCA.length != 0 ? true : false) : false;
      if (this.modeView == '1') {
        return new Promise<any>((resolve, rejects) => {
          this.codxCommonService
            .codxApprove(
              this.transRecID,
              mode,
              null,
              comment,
              null,
              cert,
              supplier
            )
            .subscribe((res: ResponseModel) => {
              resolve(res);
            });
        });
      } else {
        let request = new tempSignPDFInput();
        request.taskID = this.recID;
        request.fileIDs = '';
        this.lstFiles.forEach((file: any) => {
          if (file?.fileID) {
            request.fileIDs += file?.fileID + ';';
          }
        });
        return new Promise<any>((resolve, rejects) => {
          this.api
            .execSv(
              'ES',
              'ERM.Business.ES',
              'ApprovalTransBusiness',
              'SignBPAsync',
              [request] //Hoàn tất
            )
            .subscribe((res) => {
              if (res) {
                let resp = new ResponseModel();
                resp.msgCodeError = null;
                resp.rowCount = 1;
                resp.returnStatus = '5';
                resolve(resp);
              }
            });
        });
      }
    }
  }
  publicESign(dialog) {
    this.esService.editSignature(this.paSignature).subscribe((res) => {
      if (res && this.transRecID) {
        this.codxCommonService
          .codxApprove(
            this.transRecID,
            this.publicSignStatus,
            null,
            null,
            null,
            null,
            '3'
          )
          .subscribe((res: ResponseModel) => {
            if (res?.msgCodeError == null && res?.rowCount > 0) {
              this.notificationsService.notifyCode('SYS034');
              //this.canOpenSubPopup = false;
              dialog && dialog?.close();
              this.isSigned = true;
              this.detectorRef.detectChanges();
              this.changeConfirmState(res);
            }
          });
      }
    });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//
  //get
  getAreaOwnerName(authorID, objectID) {
    if (objectID != null) {
      return (
        this.lstSigners.find(
          (signer) => signer?.authorID == authorID && signer?.userID == objectID
        )?.fullName ?? ''
      );
    } else {
      return (
        this.lstSigners.find((signer) => signer?.authorID == authorID)
          ?.fullName ?? ''
      );
    }
  }

  autoSign() {
    //da co vung ky
    let lstSigned = this.lstAreas.filter((area) => {
      return (
        area.signer &&
        area.labelType != '9' &&
        area.labelType != '8' &&
        this.imgConfig.includes(area.labelType) &&
        area.location.pageNumber + 1 == this.pageMax
      );
    });

    //lst da ky id
    let lstSignedID = [];
    lstSigned.forEach((area) => lstSignedID.push(area.signer));

    //lst chua ky
    let lstUnsign = this.lstSigners.filter((signer) => {
      return !lstSignedID.includes(signer.authorID);
    });

    //create sign area
    let areaW = (this.pageW - 20) / this.signPerRow;
    let imgW = areaW > 220 ? 200 : areaW;

    let unsignIdx = [];
    for (let index = 0; index < this.signPerRow; index++) {
      unsignIdx.push(areaW * index + 10);
    }
    //can le
    switch (this.align) {
      //can trai
      case '2': {
        break;
      }

      //can phai
      case '3': {
        let moveR = areaW - imgW;
        unsignIdx = unsignIdx.map((area) => {
          return area + moveR;
        });
        break;
      }

      //can giua
      default: {
        let moveC = areaW - imgW;
        unsignIdx = unsignIdx.map((area) => {
          return area + moveC / 2;
        });
        break;
      }
    }
    //chieu chu ky
    if (this.direction == '2') {
      unsignIdx = unsignIdx.reverse();
    }
    let remain = lstUnsign.length;
    lstUnsign.forEach((person, idx) => {
      let url = person.signature1;
      let labelType = 'S1';
      let layer = this.lstLayer.get(this.pageMax);
      layer = this.lstLayer.get(this.pageMax);

      if (layer && labelType != '') {
        let recID = Guid.newGuid();
        let row = Math.floor(idx / Number(this.signPerRow));
        let tmpName: tmpAreaName = {
          Signer: person.authorID,
          Type: 'img',
          PageNumber: this.curPage - 1,
          StepNo: person.stepNo,
          LabelType: 'S1',
          LabelValue: url,
        };

        let transformable =
          this.isEditable == false ? false : this.signerInfo.allowEditAreas;
        if (!url || url == '') {
          let textArea = new Konva.Text({
            text: person.fullName + ' - ' + this.vllActions[0]?.text,
            fontSize: 14,
            fontFamily: 'Arial',
            draggable: transformable,
            name: JSON.stringify(tmpName),
            id: recID,
            x: unsignIdx[idx],
            y: this.maxTop + row * 100 + 10,
            align: 'left',
            rotation: this.rotate,
          });
          textArea.scale({
            x: this.xScale,
            y: this.yScale,
          });
          //save to db
          let y = textArea.position().y;
          let x = textArea.position().x;
          let w = this.xScale;
          let h = this.yScale;
          let tmpArea: tmpSignArea = {
            signer: person.authorID,
            labelType: 'S1',
            labelValue: person.fullName + ' - ' + this.vllActions[0]?.text,
            isLock: false,
            allowEditAreas: this.signerInfo.allowEditAreas,
            signDate: false,
            dateFormat: '1',
            location: {
              top: y / this.yScale,
              left: x / this.xScale,
              width: w / this.xScale,
              height: h / this.yScale,
              pageNumber: this.curPage - 1,
              fileRotate: -this.rotate,
              rotate: -this.rotate,
            },
            stepNo: person.stepNo,
            fontStyle: 'Arial',
            fontFormat: 'normal',
            fontSize: 14,
            signatureType: 2,
            comment: '',
            createdBy: person.authorID,
            modifiedBy: person.authorID,
            recID: recID,
            objectID: this.signerInfo?.userID,
          };

          layer?.add(textArea);
          this.esService
            .addOrEditSignArea(
              this.recID,
              this.curFileID,
              tmpArea,
              recID,
              this.modeView,
              this.isSettingMode,
            )
            .subscribe((res) => {
              if (res) {
                textArea?.id(res);
                textArea?.off('dragend');
                textArea?.on('dragend transformend ', (e: any) => {
                  this.addDragResizeEevent(
                    tmpArea,
                    e.type,
                    textArea?.getPosition(),
                    textArea?.scale(),
                    textArea.attrs.rotation,
                    textArea.width()
                  );
                });
                textArea.draw();
                this.curSelectedArea = this.lstLayer
                  .get(tmpArea.location.pageNumber + 1)
                  .find((child) => child.id() == tmpArea.recID);

                remain--;
                if (remain == 0) {
                  this.esService
                    .getSignAreas(
                      this.recID,
                      this.fileInfo.fileID,
                      this.isApprover,
                      this.user.userID,
                      this.stepNo,
                      this.modeView,
                      this.isSettingMode,
                    )
                    .subscribe((res) => {
                      if (res) {
                        this.lstAreas = res;
                        this.detectorRef.detectChanges();
                      }
                    });
                }
              }
            });
        } else {
          const img = document.createElement('img') as HTMLImageElement;
          // img.setAttribute('crossOrigin', 'anonymous');
          // img.referrerPolicy = 'noreferrer';

          img.src = url;
          img.onload = () => {
            let imgFixW = 200;
            let imgFixH = 200;

            //yeu cau ngay 12/09 chu ky nhay se nho hon 1/2 so voi chu ky chinh

            if (labelType == 'S2') {
              imgFixW = imgFixW / 2;
              imgFixH = imgFixH / 2;
            }
            let scaleW = imgFixW / img.width;
            let scaleH = scaleW * (img.height / img.width) * this.yScale;
            if (img.width < imgFixW) {
              scaleW = 1;
            }
            if (img.height < imgFixH) {
              scaleH = 1;
            }

            scaleW *= this.xScale;

            let imgArea = new Konva.Image({
              image: img,
              // width: imgW,
              // height: 100,
              x: unsignIdx[idx],
              y: this.maxTop + row * 100 + 10,
              id: recID,
              name: JSON.stringify(tmpName),
              draggable: transformable,
              rotation: this.rotate,
            });
            // imgArea.scale({ x: this.xScale, y: this.yScale });
            imgArea.scale({
              x: scaleW,
              y: scaleH,
            });

            //save to db
            let y = imgArea.position().y;
            let x = imgArea.position().x;
            let w = scaleW / this.xScale;
            let h = scaleH / this.yScale;

            let tmpArea: tmpSignArea = {
              signer: person.authorID,
              labelType: 'S1',
              labelValue: url.replace(environment.urlUpload + '/', ''),
              isLock: false,
              allowEditAreas: this.signerInfo.allowEditAreas,
              signDate: false,
              dateFormat: '1',
              location: {
                top: y / this.yScale,
                left: x / this.xScale,
                width: w / this.xScale,
                height: h / this.yScale,
                pageNumber: this.curPage - 1,
                fileRotate: -this.rotate,
                rotate: -this.rotate,
              },
              stepNo: person.stepNo,
              fontStyle: '',
              fontFormat: '',
              fontSize: 1,
              signatureType: 2,
              comment: '',
              createdBy: person.authorID,
              modifiedBy: person.authorID,
              recID: recID,
              objectID: this.signerInfo?.userID,
            };

            layer?.add(imgArea);
            this.esService
              .addOrEditSignArea(
                this.recID,
                this.curFileID,
                tmpArea,
                recID,
                this.modeView,
                this.isSettingMode,
              )
              .subscribe((res) => {
                if (res) {
                  imgArea?.id(res);
                  imgArea?.off('dragend');
                  imgArea?.on('dragend transformend  ', (e: any) => {
                    this.addDragResizeEevent(
                      tmpArea,
                      e.type,
                      imgArea?.getPosition(),
                      imgArea?.scale(),
                      imgArea.attrs.rotation,
                      1
                    );
                  });
                  imgArea.draw();
                  this.curSelectedArea = this.lstLayer
                    .get(tmpArea.location.pageNumber + 1)
                    .find((child) => child.id() == tmpArea.recID);
                  remain--;
                  if (remain == 0) {
                    this.esService
                      .getSignAreas(
                        this.recID,
                        this.fileInfo.fileID,
                        this.isApprover,
                        this.user.userID,
                        this.stepNo,
                        this.modeView,
                        this.isSettingMode,
                      )
                      .subscribe((res) => {
                        if (res) {
                          this.lstAreas = res;
                          this.detectorRef.detectChanges();
                        }
                      });
                  }
                }
              });
          };
        }
      }
    });
  }
  getListCA() {
    this.esService
      .getListCA(this.recID, this.fileInfo.fileID)
      .subscribe((res) => {
        this.lstCA = res;
        this.lstCA?.forEach((ca, idx) => {
          this.lstCACollapseState.push({
            open: false,
            verifiedFailed: false,
            detail: false,
          });
        });

        this.detectorRef.detectChanges();
      });
  }
  saveToDB(tmpArea: tmpSignArea) {
    let es_SignArea = tmpArea;
    if (this.imgConfig.includes(tmpArea.labelType)) {
      tmpArea.labelValue = tmpArea.labelValue.replace(
        environment.urlUpload + '/',
        ''
      );
    }
    //es_SignArea.labelValue
    this.esService
      .addOrEditSignArea(
        this.recID,
        this.curFileID,
        tmpArea,
        tmpArea.recID,
        this.modeView,
        this.isSettingMode,
      )
      .subscribe((res) => {
        if (res) {
          this.esService
            .getSignAreas(
              this.recID,
              this.fileInfo.fileID,
              this.isApprover,
              this.user.userID,
              this.stepNo,
              this.modeView,
              this.isSettingMode,
            )
            .subscribe((res) => {
              if (res) {
                this.lstAreas = res;
                this.detectorRef.detectChanges();
              }
            });
        }
      });
  }

  saveNewToDB(
    url,
    type: string,
    labelType,
    authorID: string,
    stepNo: number,
    konva: any
  ) {
    let recID = Guid.newGuid();

    let y = konva.position().y;
    let x = konva.position().x;
    let w =
      konva.scale().x * this.xScale * (type == 'text' ? konva.width() : 1);
    let h = konva.scale().y * this.yScale;

    let tmpArea: tmpSignArea = {
      signer: authorID,
      labelType: labelType,
      labelValue: url.replace(environment.urlUpload + '/', ''),
      isLock: false,
      allowEditAreas: this.signerInfo.allowEditAreas,
      signDate: this.curSignDateType == this.lstSignDateType[0] ? false : true,
      dateFormat: this.curAnnotDateFormat,
      location: {
        top: y / this.yScale,
        left: x / this.xScale,
        width: w / this.xScale,
        height: h / this.yScale,
        pageNumber:
          Number(konva?.parent?.id().replace('layer', '')) - 1 ??
          this.curPage - 1,
        rotate: -this.rotate,
        fileRotate: -this.rotate,
      },
      stepNo: stepNo,
      fontStyle: type == 'text' ? konva.fontFamily() : '',
      fontFormat:
        type == 'text' ? konva.fontStyle() + ' ' + konva.textDecoration() : '',
      fontSize: type == 'text' ? konva.fontSize() : '',
      signatureType: this.signerInfo.signType,
      comment: '',
      createdBy: authorID,
      modifiedBy: authorID,
      recID: recID,
      objectID: this.signerInfo.userID,
    };
    if (this.needAddKonva) {
      if (this.imgConfig.includes(tmpArea.labelType)) {
        tmpArea.labelValue = tmpArea.labelValue.replace(
          environment.urlUpload + '/',
          ''
        );
      }
      this.esService
        .addOrEditSignArea(
          this.recID,
          this.curFileID,
          tmpArea,
          recID,
          this.modeView,
          this.isSettingMode,
        )
        .subscribe((res) => {
          if (res) {
            konva?.id(res);
            konva?.off('dragend');
            konva?.on('dragend transformend  ', (e: any) => {
              this.addDragResizeEevent(
                tmpArea,
                e.type,
                konva?.getPosition(),
                konva?.scale(),
                konva.attrs.rotation,
                type == 'text' ? konva.width() : 1
              );
            });
            konva.draw();
            this.curSelectedArea = this.lstLayer
              .get(tmpArea.location.pageNumber + 1)
              .find((child) => child.id() == tmpArea.recID);
            this.esService
              .getSignAreas(
                this.recID,
                this.fileInfo.fileID,
                this.isApprover,
                this.user.userID,
                this.stepNo,
                this.modeView,
                this.isSettingMode,
              )
              .subscribe((res) => {
                if (res) {
                  this.lstAreas = res;
                  this.detectorRef.detectChanges();
                }
              });
          }
        });
      this.detectorRef.detectChanges();
    }
  }

  removeUnsaveHLA() {
    window.getSelection().empty();
    let lstUnsave = this.lstHighlightTextArea.filter(
      (hla) => hla.isAdded == false
    );
    lstUnsave.forEach((hla) => {
      let lstSpan = document.querySelectorAll(
        `.highlighted[data-id='${hla.group}']`
      );
      Array.from(lstSpan).forEach((ele: HTMLElement) => {
        ele.remove();
      });
      this.lstKey = this.lstKey.filter((key) => key != hla.group);
    });
    this.changeEditMode();
    this.eventHighlightText.emit({
      event: 'cancel',
      isInteractPDF: this.isInteractPDF,
      isEdited: this.sfEdited,
      fileInfo: this.fileInfo,
    });
    this.detectorRef.detectChanges();
  }
  confirmRemoveHLA() {
    let lstDelHLA = document.getElementsByClassName('hla-check-delete');
    let isChange = false;
    let lstRemoveHLA = [];
    Array.from(lstDelHLA).forEach((hla: HTMLElement) => {
      if (hla.querySelector('.e-check')) {
        let delKey = hla.parentElement.dataset.id;
        let delHLA = this.lstHighlightTextArea.find((hl) => {
          if (hl.isAdded) {
            isChange = true;
          }
          return hl.group == delKey;
        });
        lstRemoveHLA.push(delHLA);
        this.lstKey = this.lstKey.filter((key) => key != delKey);
      }
    });
    if (isChange == false || lstRemoveHLA.length == 0) return;
    this.esService
      .removeHighlightText(
        this.curFileUrl.replace(environment.urlUpload + '/', ''),
        this.fileInfo.fileID,
        this.fileInfo.fileName,
        lstRemoveHLA
      )
      .subscribe((res) => {
        this.curFileUrl = '';
        setTimeout(
          (tmpUrl) => {
            let curFile = this.lstFiles.find((x) => x == this.fileInfo);
            (curFile as any).fileUrl = environment.urlUpload + '/' + res;
            this.fileInfo.fileUrl = environment.urlUpload + '/' + res;
            this.curFileUrl = environment.urlUpload + '/' + res;
          },
          10,
          res
        );
      });
    // this.lstHighlightTextArea.forEach((area) => (area.isAdded = false));
    // this.confirmHighlightText(true, rerenderPages);
    this.detectorRef.detectChanges();
  }

  confirmHighlightText(isClearHLA: boolean, rerenderPages = []) {
    let needHLList = this.lstHighlightTextArea.filter(
      (area) => area.isAdded == false
    );
    if (needHLList.length < 1 && !isClearHLA) return;
    this.esService
      .highlightText(
        this.recID,
        this.sfEdited,
        this.curFileUrl.replace(environment.urlUpload + '/', ''),
        this.fileInfo.fileID,
        this.fileInfo.fileName,
        isClearHLA,
        needHLList,
        rerenderPages
      )
      .subscribe((res) => {
        // this.detectorRef.detectChanges();
        this.sfEdited = true;
        this.curFileUrl = '';
        setTimeout(
          (tmpUrl) => {
            let curFile = this.lstFiles.find((x) => x == this.fileInfo);
            (curFile as any).fileUrl = environment.urlUpload + '/' + res;
            this.fileInfo.fileUrl = environment.urlUpload + '/' + res;
            this.curFileUrl = environment.urlUpload + '/' + res;
            this.getListHighlights();
            this.eventHighlightText.emit({
              event: 'save',
              isInteractPDF: this.isInteractPDF,
              isEdited: this.sfEdited,
              fileInfo: this.fileInfo,
            });
          },
          10,
          res
        );
      });
  }

  getListHighlights() {
    let exHLLst = document.getElementsByClassName('highlighted');
    Array.from(exHLLst).forEach((ele: HTMLElement) => {
      ele.remove();
    });
    let ngxService: NgxExtendedPdfViewerService =
      new NgxExtendedPdfViewerService();

    this.esService
      .getListAddedAnnoataion(
        this.curFileUrl.replace(environment.urlUpload + '/', ''),
        ngxService.currentlyRenderedPages()
      )
      .subscribe((lst: Map<string, Array<location>>) => {
        if (lst == null || Object.entries(lst).length == 0) return;

        this.lstKey = [];
        this.lstHighlightTextArea = [];
        let lstTextLayer = document.getElementsByClassName('textLayer');
        for (let [key, value] of Object.entries(lst)) {
          let textLayer = Array.from(lstTextLayer).find(
            (tLayer: HTMLElement) => {
              let pNum = tLayer.parentElement?.dataset?.pageNumber;
              return pNum == value?.locations[0]?.pageNumber;
            }
          );
          if (textLayer) {
            let textLayerRect = textLayer?.getBoundingClientRect();
            let top = textLayerRect.top;
            let left = textLayerRect.left;
            let width = textLayerRect.width;
            let height = textLayerRect.height;
            this.lstKey.push(key);
            let isFromAnotherApp = value.fromAnotherApp == true ? 0 : 1;
            value?.locations?.forEach((location: location) => {
              let span = document.createElement('span');
              span.style.height = location.height * this.yScale + 'px';
              span.style.width = location.width * this.xScale + 'px';
              span.style.top =
                (location.top - location.height * isFromAnotherApp) *
                  this.yScale +
                'px';
              span.style.left =
                (location.left - location.width * isFromAnotherApp) *
                  this.xScale +
                'px';
              span.style.zIndex = '2';
              span.dataset.id = key;
              span.classList.add('highlighted');
              span.style.backgroundColor = this.defaultAddedColor;
              span.onclick = () => {
                this.goToSelectedHighlightText(key);
              };
              textLayer.appendChild(span);
            });
            value?.locations?.forEach((location: location) => {
              location.height = location.height / this.yScale;
              location.width = location.width / this.xScale;
              location.top = (location.top - location.height) / this.yScale;
              location.left = (location.left - location.width) / this.xScale;
            });
            this.lstHighlightTextArea.push(value);
          }
        }
      });
  }
  getHLText(key): highLightTextArea {
    let hla = this.lstHighlightTextArea.find((x) => x.group == key);
    return hla;
  }
  clickHighlightText() {
    let selection = window.getSelection().getRangeAt(0);

    let rects = selection.getClientRects();
    if (rects.length == 0) return;
    let lstTextLayer = document.getElementsByClassName('textLayer');

    let textLayer = Array.from(lstTextLayer).find((tLayer: HTMLElement) => {
      let pNum = tLayer.parentElement?.dataset?.pageNumber;
      return pNum == this.curPage.toString();
    });

    let textLayerRect = textLayer?.getBoundingClientRect();
    let top = textLayerRect.top;
    let left = textLayerRect.left;
    let width = textLayerRect.width;
    let height = textLayerRect.height;
    let tmpLstHLA: Array<highLightTextArea> = [];
    let tmpGroup = Guid.newGuid().toString();
    this.lstKey.push(tmpGroup);
    Array.from(rects).forEach((rect) => {
      let span = document.createElement('span');
      span.style.height = rect.height + 'px';
      span.style.width = rect.width + 'px';
      span.style.top = rect.top - top + 'px';
      span.style.left = rect.left - left + 'px';
      span.style.zIndex = '2';
      span.dataset.id = tmpGroup;
      span.classList.add('highlighted');
      span.style.backgroundColor = this.defaultColor;
      span.onclick = () => {
        this.goToSelectedHighlightText(tmpGroup);
      };
      let isValid =
        rect.height > 0 &&
        rect.width > 0 &&
        rect.top - top > 0 &&
        rect.left - left > 0;
      if (textLayer && isValid) {
        textLayer.appendChild(span);
        let tmpHLA: highLightTextArea = {
          color: span.style.backgroundColor,
          locations: [
            {
              top: Number(span.style.top.replace('px', '')) / this.yScale,
              left: Number(span.style.left.replace('px', '')) / this.xScale,
              width: rect.width / this.xScale,
              height: rect.height / this.yScale,
              pageNumber:
                Number(textLayer.parentElement?.dataset?.pageNumber) ??
                this.curPage,
            },
          ],
          createdDate: new Date(),
          author: this.user.userID,
          comment: {
            author: '',
            content: '',
          },
          group: tmpGroup,
          isAdded: false,
          isChange: false,
        };
        tmpLstHLA.push(tmpHLA);
      }
    });
    if (tmpLstHLA.length > 0) {
      this.lstHighlightTextArea = this.lstHighlightTextArea.concat(tmpLstHLA);
      this.detectorRef.detectChanges();
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//

  popupPublicESign(status) {
    // if (this.oApprovalTrans.approverType == 'PE') {
    //   this.codxCommonService
    //     .codxApprove(this.transRecID, status, null, null, null, null, '3')
    //     .subscribe((res: ResponseModel) => {
    //       if (res?.msgCodeError == null && res?.rowCount > 0) {
    //         this.notificationsService.notifyCode('SYS034');
    //         this.isSigned = true;
    //         this.detectorRef.detectChanges();
    //         this.changeConfirmState(res);
    //       }
    //     });
    // } 
    // else {
      this.publicSignStatus = status;
      var dialog = this.callfc.openForm(this.publicSignInfo, '', 450, 270);
      this.detectorRef.detectChanges();
    //}
  }

  addSignature(setupShowForm, area = null) {
    let model = {
      userID: this.signerInfo?.authorID,
      email: this.signerInfo?.email ?? this.signerInfo?.approver, //email của approver là đối tác
      fullName: this.signerInfo?.fullName,
      signatureType: this.signerInfo?.signType,
      isPublic: this.isPublic,
    };
    let data = {
      data: model,
      setupShowForm: setupShowForm,
    };
    let popupSignature = this.callfc.openForm(
      PopupSignatureComponent,
      '',
      800,
      600,
      '',
      data
    );
    popupSignature.closed.subscribe((res) => {
      console.log('popupSignature evt ', res);

      if (res?.event?.length > 0) {
        let img = res.event[0];
        this.crrType = { value: img?.referType };
        switch (img?.referType) {
          case 'S1': // Ky chinh
            // this.signerInfo.signature1 =
            //   environment.urlUpload + '/' + img?.pathDisk;
            // this.changeAnnotationItem(this.crrType);
            // if(this.paSignature) this.paSignature.modifiedOn = new Date();
            // this.detectorRef.detectChanges();
            // this.lstSigners.forEach((signer) => {
            //   //chu ky chinh
            //   if (signer?.authorID == model?.userID) {
            //     signer.signature1 =
            //       environment.urlUpload + '/' + img?.pathDisk;
            //       this.detectorRef.detectChanges();
            //   }
            // });
            // area.labelValue = environment.urlUpload + '/' + img?.pathDisk
            //this.changeAnnotPro(area.labelType, area.recID, img?.pathDisk);
            this.confirmChange.emit(false);

            // this.changeAnnotPro(area.labelType, area.recID, area.labelValue);
            //this.changeSignature_StampImg_Area_Immediate(area,img);
            //this.url = this.signerInfo.signature1 ?? '';
            // area.labelValue = environment.urlUpload + '/' + res.event[0].pathDisk;
            // this.detectorRef.detectChanges();
            // this.changeAnnotPro(area.labelType, area.recID, area.labelValue);

            break;
          // case 'S2': //Ky nhay
          //   this.signerInfo.signature2 =
          //     environment.urlUpload + '/' + img?.pathDisk;
          //   this.changeAnnotationItem(this.crrType);
          //   //this.url = this.signerInfo.signature2 ?? '';
          //   break;
          // case 'S3': //Con dau
          //   this.signerInfo.stamp = environment.urlUpload + '/' + img?.pathDisk;
          //   this.changeAnnotationItem(this.crrType);
          //   //this.url = this.signerInfo.stamp ?? '';
          //   break;
        }
        this.detectorRef.detectChanges();
        this.getPASignature();
      }
    });
  }

  //pop up
  openPopUpCAProps(ca) {
    this.dialog = this.callfc.openForm(
      PopupCaPropsComponent,
      'Thuộc tính chữ ký',
      500,
      500,
      this.funcID,
      {
        title: 'Thuộc tính chữ ký',
        //invalid: 1 else and !verified: 2 - verifed: 3
        status: !ca.certificate_IsValidNow ? '1' : ca.isVerified ? '3' : '2',
        vertifications: ca.vertifications,
      }
    );
  }

  //API test
  loadProcessESign(
    recID,
    transRecID,
    isApprover,
    isSettingMode,
    dynamicApprovers
  ) {
    let model = new PDF_SignModel();
    model.recID = recID;
    model.transRecID = transRecID;
    model.isApprover = isApprover;
    model.isSettingMode = isSettingMode;
    model.dynamicApprovers = dynamicApprovers;
    return this.api.execSv<any>(
      'BP',
      'ERM.Business.BP',
      'ProcessesBusiness',
      'GetByIDAsync',
      [model]
    );
  }
}
//create new guid
class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        let r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
