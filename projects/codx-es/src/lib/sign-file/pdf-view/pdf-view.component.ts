import {
  Component,
  ElementRef,
  Injector,
  Input,
  IterableDiffers,
  ViewChild,
  AfterViewInit,
  Output,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import {
  AnnotationAddEventArgs,
  AnnotationDataFormat,
  PdfViewerComponent,
  LinkAnnotationService,
  MagnificationService,
  ThumbnailViewService,
  ToolbarService,
  NavigationService,
  TextSearchService,
  TextSelectionService,
  PrintService,
  AnnotationService,
} from '@syncfusion/ej2-angular-pdfviewer';
import {
  AuthStore,
  CodxListviewComponent,
  FormModel,
  ScrollComponent,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxEsService } from '../../codx-es.service';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { QRCodeGenerator } from '@syncfusion/ej2-barcode-generator';
import { tmpSignArea } from './model/tmpSignArea.model';
import { qr } from './model/mode';
import { FormControl, FormGroup } from '@angular/forms';
import {
  NgxExtendedPdfViewerComponent,
  NgxExtendedPdfViewerService,
  PdfThumbnailDrawnEvent,
} from 'ngx-extended-pdf-viewer';
import { PopupCaPropsComponent } from '../popup-ca-props/popup-ca-props.component';

@Component({
  selector: 'lib-pdf-view',
  templateUrl: './pdf-view.component.html',
  styleUrls: ['./pdf-view.component.scss'],
  providers: [
    LinkAnnotationService,
    MagnificationService,
    ToolbarService,
    ThumbnailViewService,
    NavigationService,
    TextSearchService,
    TextSelectionService,
    PrintService,
    AnnotationService,
    NgxExtendedPdfViewerService,
  ],
})
export class PdfViewComponent extends UIComponent implements AfterViewInit {
  public service: string = environment.pdfUrl;
  @Input() recID = '';
  @Input() isApprover;
  @Input() isDisable = false;
  @Output() isActiveToSign = new EventEmitter();
  @Output() isAreaControl = new EventEmitter();

  user?: any;
  url: string = '';

  actionCollection: any;
  actionCollectionsChange: any;
  approveStatus;

  saveToDBQueueChange: any;

  vllActions: any;

  funcID;
  dialog: import('codx-core').DialogRef;

  constructor(
    private inject: Injector,
    private authStore: AuthStore,
    private esService: CodxEsService,
    private actionCollectionsChanges: IterableDiffers,
    private datePipe: DatePipe
  ) {
    super(inject);
    this.user = this.authStore.get();
    //get the actionCollections change len
    this.actionCollectionsChange = actionCollectionsChanges
      .find([])
      .create(null);
    this.saveToDBQueueChange = actionCollectionsChanges.find([]).create(null);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  @ViewChild('fileUpload') fileUpload!: ElementRef;
  @ViewChild('pdfviewer') pdfviewerControl: PdfViewerComponent;
  @ViewChild('inputAuthor') inputAuthor!: ElementRef;
  @ViewChild('thumbnailTab') thumbnailTab: ElementRef;
  @ViewChild('ngxPdfView') ngxPdfView: NgxExtendedPdfViewerComponent;
  @ViewChild('qrCode') qrCode!: ElementRef;
  @ViewChild('listview') listview!: CodxListviewComponent;

  thumbnailEle!: Element;

  //for page number input
  pageMax;
  pageStep;
  curPage = 1;

  zoomValue: number | string = 100;
  zoomFields = { text: 'show', value: 'realValue' };
  holding: number = 0;
  after_X_Second: number = 3000;

  lstSigners: Array<any> = [];
  signerInfo: any;

  lstFiles: Array<Object> = [];
  fileInfo: any;

  lstRenderAnnotation: Array<object> = [];
  lstZoomValue = [
    { realValue: '25', show: 25 },
    { realValue: '30', show: 30 },
    { realValue: '50', show: 50 },
    { realValue: '90', show: 90 },
    { realValue: '100', show: 100 },
    { realValue: 'Auto', show: 'Auto' },
    { realValue: 'Fit to Width', show: 'Fit to Width' },
    { realValue: 'Fit to page', show: 'Fit to page' },
  ];
  actionsButton = [1, 2, 3, 4, 5, 6, 7, 8];

  lstAnnotFontStyle;
  curAnnotFontStyle;
  lstAnnotFontSize = [10, 11, 12, 13, 15, 17, 19, 23, 31, 33, 43];
  curAnnotFontSize = 31;
  lstAnnotDateFormat = [
    'M/d/yy, h:mm a',
    'M/d/yy',
    'EEEE, MMMM d, y, h:mm:ss a zzzz',
  ];
  curAnnotDateFormat = 'M/d/yy, h:mm a';
  curDynamicText;

  isBold = false;
  isItalic = false;
  isUnd = false;

  file: Object = { text: 'fileName', value: 'fileID' };
  person: Object = { text: 'authorName', value: 'authorID' };

  needSuggest: boolean = false;
  autoSignState: boolean = false;

  hideThumbnail: boolean = false;
  hideActions: boolean = false;

  saveAnnoQueue: Map<string, any>;

  curSelectedAnno: any;

  formatForAreas: Array<any> = [];

  cannotAct = false;
  curFileID;
  curSignerID;

  signPerRow;
  direction;
  align;
  await;
  areaControl;

  //vung ky
  views: Array<ViewModel> | any = []; // @ViewChild('uploadFile') uploadFile: TemplateRef<any>;
  codxServiceString = 'ES';
  assemblyName = 'ES';
  entity = 'ES_SignFiles';
  className = 'SignFilesBusiness';
  method = 'GetAllAreasAsync';
  idField = 'recID';
  predicate = 'recID=@0';
  dataValue: string;
  renderQRAllPage = false;
  formModel: FormModel;
  formAnnot: FormGroup;

  // public fields: Object = { text: 'Name', groupBy: 'location.pageNumber' };
  public cssClass: string = 'e-list-template';
  public lstAreas = [];
  lstCA;
  lstCACollapseState: Array<any> = [];
  curSelectedAnnotID;
  curSelectedPageGroup;

  @ViewChild('panelLeft') panelLeft: TemplateRef<any>;
  @ViewChild('itemTmpl') itemTmpl: TemplateRef<any>;

  public headerRightName = [
    { text: 'Công cụ' },
    { text: 'Vùng ký' },
    { text: 'History' },
    { text: 'Comment' },
  ];
  public headerLeftName = [{ text: 'Xem nhanh' }, { text: 'Chữ ký số' }];
  ajaxSetting: any;

  onInit() {
    //
    // this.user.userID = 'NGUYENPM';
    this.saveAnnoQueue = new Map();
    this.ajaxSetting = {
      ajaxHeaders: [
        {
          headerName: 'userID',
          headerValue: this.user.userID,
        },
        {
          headerName: 'tenant',
          headerValue: this.user.tenant,
        },
        {
          headerName: 'token',
          headerValue: this.user.token,
        },
        {
          headerName: 'buid',
          headerValue: this.user.buid,
        },
        {
          headerName: 'connectionName',
          headerValue: this.user.connectionName,
        },
      ],
    };

    this.esService
      .getSFByID([
        this.recID,
        this.user?.userID,
        this.isApprover,
        this.isDisable,
      ])
      .subscribe((res: any) => {
        console.table('sf', res);

        let sf = res?.signFile;

        if (sf) {
          this.approveStatus = sf.approveStatus;
          sf.files.forEach((file) => {
            this.lstFiles.push({
              fileName: file.fileName,
              fileRefNum: sf.refNo,
              fileID: file.fileID,
              signers: res?.approvers,
              areas: file.areas,
              // signers: this.tmpLstSigners,
            });
          });
          if (this.isApprover) {
            this.signerInfo = res?.approvers;
          }
          this.curFileID = sf?.files[0]?.fileID;
          this.curSignerID = res.approvers[0]?.authorID;
        }
        this.detectorRef.detectChanges();
      });

    this.cache.valueList('ES015').subscribe((res) => {
      this.vllActions = res.datas;
    });

    this.cache.valueList('ES024').subscribe((res) => {
      this.lstAnnotFontStyle = res?.datas?.filter((font) => {
        return font?.text;
      });
      this.curAnnotFontStyle = this.lstAnnotFontStyle[0];
      this.detectorRef.detectChanges();
    });

    this.formAnnot = new FormGroup({
      content: new FormControl(),
      fontStyle: new FormControl(this.curAnnotFontStyle),
      fontSize: new FormControl(this.curAnnotFontSize),
      dateFormat: new FormControl(this.curAnnotDateFormat),
    });
  }

  ngDoCheck() {}

  ngAfterViewInit() {
    ScrollComponent.reinitialization();

    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTmpl!,
          // panelLeftRef: this.panelLeft!,
          contextMenu: '',
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  onCreated(evt: any) {
    this.thumbnailEle = this.pdfviewerControl.thumbnailViewModule.thumbnailView;
    console.log('da them o oncreated');

    if (this.thumbnailEle) {
      this.thumbnailTab?.nativeElement.appendChild(this.thumbnailEle);
    }
    this.pdfviewerControl.freeTextSettings.enableAutoFit = true;
    this.pdfviewerControl.zoomValue = 100;
    this.pdfviewerControl.contextMenuSettings.contextMenuItems = [
      16, 128, 256, 30,
    ];

    this.pageStep = 1;
    this.detectorRef.detectChanges();
  }

  leftToolbarCreated(e) {
    // this.pageInput = new NumericTextBox({
    //   value: 1,
    //   width: 150,
    //   min: 1,
    //   max: this.pdfviewerControl?.pageCount,
    //   step: 1,
    // });
    // this.pageInput.appendTo('#numeric');
  }

  reload() {
    this.pdfviewerControl.load(this.fileInfo.fileID, '');
    this.cannotAct = false;
  }

  loadingAnnot(e: any) {
    this.pageMax = this.pdfviewerControl?.pageCount;
    this.esService.getSignFormat().subscribe((res: any) => {
      this.signPerRow = res.signPerRow;
      this.align = res.align;
      this.direction = res.direction;
      this.areaControl = res.areaControl;
      this.isAreaControl.emit(this.areaControl);
      this.detectorRef.detectChanges();
      console.log('auto sign format', res);
    });
    this.getListCA();
    this.esService
      .getSignAreas(
        this.recID,
        this.fileInfo.fileID,
        this.isApprover,
        this.user.userID
      )
      .subscribe((res) => {
        this.lstAreas = res;
        if (this.isDisable) {
        } else {
          this.pdfviewerControl.refresh();
          res?.forEach((item: any) => {
            let anno = {
              annotationId: item.recID,
              annotationSelectorSettings: {
                selectionBorderColor: '',
                resizerBorderColor: 'black',
                resizerFillColor: '#FF4081',
                selectionBorderThickness: 1,
              },
              annotationSettings: {
                isLock: item.fixedWidth,
              },
              bounds: {
                top: Number(item.location.top),
                left: Number(item.location.left),
                width: Number(item.location.width),
                height: Number(item.location.height),
              },
              author: item.signer,
              comments: [],
              fillColor: '#ffffff00',
              font: {
                isBold: item.fontFormat?.includes('B') ? true : false,
                isItalic: item.fontFormat?.includes('I') ? true : false,
                isStrikeout: false,
                isUnderline: item.fontFormat?.includes('U') ? true : false,
                version: undefined,
              },
              fontColor: '#000',
              fontFamily: item.fontStyle,
              fontSize: item.fontSize,
              isPrint: true,
              isReadonly: false,
              modifiedDate: this.datePipe.transform(
                new Date(),
                'M/d/yy, h:mm a'
              ),
              opacity: 1,
              note: '',
              pageNumber: item.location.pageNumber,
              review: {
                state: 'Unmarked',
                stateModel: 'None',
                version: undefined,
              },
              customData: item.signer + ':' + item.labelType,
              rotateAngle: 0,
              strokeColor: '#ffffff00',
              textAlign: 'Left',
              thickness: 1,
            } as any;

            if (!['1', '2', '8'].includes(item.labelType)) {
              anno.shapeAnnotationType = 'FreeText';
              anno.dynamicText = item.labelValue;

              anno.subject = 'Text Box';
            } else {
              let curSignerInfo = this.lstSigners.find(
                (signer) => signer.authorID == anno.author
              );
              switch (item.labelType) {
                case '1': {
                  anno.stampAnnotationPath =
                    'data:image/jpeg;base64,' + curSignerInfo?.signature;
                  break;
                }
                case '2': {
                  anno.stampAnnotationPath =
                    'data:image/jpeg;base64,' + curSignerInfo?.stamp;
                  break;
                }
                case '8': {
                  switch (this.approveStatus) {
                    case '1':
                      anno.stampAnnotationPath = qr;
                      break;
                    case '3':
                    case '5':
                      anno.stampAnnotationPath = '';
                      break;
                  }
                  break;
                }
              }
              if (
                anno.stampAnnotationPath.replace(
                  'data:image/jpeg;base64,',
                  ''
                ) != ''
              ) {
                anno.shapeAnnotationType = 'stamp';
                anno.stampAnnotationType = 'image';
              } else {
                anno.shapeAnnotationType = 'FreeText';
                anno.dynamicText =
                  // this.vllActions[item.labelType - 1]?.text +
                  // ': ' +
                  curSignerInfo.fullName;
                anno.subject = 'Text Box';
              }
            }
            // if (this.isApprover) {
            //   if (item.signer == 'LTTTRUC') {
            //     anno.annotationSelectorSettings.isLock = false;
            //   } else {
            //     anno.annotationSelectorSettings.isLock = true;
            //   }
            // }
            this.pdfviewerControl.freeTextSettings.enableAutoFit = true;
            this.pdfviewerControl.addAnnotation({ ...anno });
          });
        }

        this.detectorRef.detectChanges();
      });

    // this.pdfviewerControl?.formFieldsModule?.clearFormFields();
  }

  getAreaOwnerName(authorID) {
    return this.lstSigners.find((signer) => {
      return signer.authorID == authorID;
    })?.fullName;
  }

  async genFileQR(fileName, fileRefNo, companyID) {
    let text = `
      File Name: ${fileName}\n
      Ref No: ${fileRefNo}\n
      Company: ${companyID}\n
      CreatedOn: ${this.datePipe.transform(new Date(), 'd/M/yy, h:mm a')}\n
      Pages: ${this.pdfviewerControl.pageCount}
    `;
    let barcode = new QRCodeGenerator({
      width: '250px',
      height: '250px',
      mode: 'SVG',
      displayText: { visibility: false },
      value: text,
    });

    barcode.appendTo('#qrCode');

    let barCodeUrl = '';
    await barcode.exportAsBase64Image('PNG').then((value) => {
      barCodeUrl = value;
      this.qrCode.nativeElement.firstChild.remove();
    });
    console.log('barcode', barCodeUrl);

    return barCodeUrl;
  }

  changeSignFile(e: any) {
    this.lstSigners = e.itemData.signers;
    this.fileInfo = e.itemData;
    this.curFileID = this.fileInfo.fileID;
    if (!this.isDisable) {
      this.pdfviewerControl.load(e.itemData.fileID, '');
    }
    this.cannotAct = false;

    let active = this.fileInfo ? true : false;
    this.isActiveToSign.emit(active);
    //add sign areas into sign area tab
    this.autoSignState = false;

    // this.dataValue =
    //   this.recID + ';' + this.fileInfo.fileID + ';' + this.isApprover;
    // console.log('check dataValue', this.dataValue);

    // this.listview.dataService.dataObj = this.dataValue;
    this.detectorRef.detectChanges();
  }

  changeSigner(e: any) {
    this.signerInfo = e.itemData;
    this.curSignerID = this.signerInfo.authorID;
    this.detectorRef.detectChanges();
  }

  changeSuggestState(e: any) {
    this.needSuggest = e.data;
    if (this.needSuggest) {
      this.pdfviewerControl.navigation.goToLastPage();
      this.pdfviewerControl.scrollSettings.delayPageRequestTimeOnScroll = 300;
    }
  }

  changeCanActState(state) {
    this.cannotAct = state;
  }

  changeAutoSignState(e: any, mode: number) {
    this.autoSignState = e.data;
    if (this.autoSignState) {
      let signed = this.pdfviewerControl.annotationCollection.find((anno) => {
        let signType: string = anno.customData.split(':')[1];
        return (
          signType === '1' &&
          this.pdfviewerControl.pageCount - 1 == anno.pageNumber
        );
      });

      if (!signed) {
        this.pdfviewerControl.navigationModule.goToLastPage();
        switch (mode) {
          case 0: {
            this.esService
              .getLastTextLine(this.pdfviewerControl.pageCount)
              .subscribe((res: any) => {
                if (res) {
                  this.runAutoSign(
                    this.pdfviewerControl.pageCount - 1,
                    mode,
                    res.Y + 31
                  );
                }
              });
            break;
          }
          case 1: {
            this.runAutoSign(this.pdfviewerControl.pageCount - 1, mode);
            break;
          }
          default:
            break;
        }
      } else {
        switch (mode) {
          case 0: {
            this.esService
              .getLastTextLine(this.pdfviewerControl.currentPageNumber)
              .subscribe((res: any) => {
                this.runAutoSign(
                  this.pdfviewerControl.currentPageNumber - 1,
                  mode,
                  res.Y + 31
                );
              });
            break;
          }
          case 1: {
            this.runAutoSign(this.pdfviewerControl.currentPageNumber - 1, mode);
            break;
          }
          default:
            break;
        }
      }
    } else {
      let justAddByAutoSign = this.pdfviewerControl.annotationCollection.filter(
        (annot) => {
          return (
            annot.note == mode.toString() &&
            annot.pageNumber == this.pdfviewerControl.currentPageNumber - 1
          );
        }
      );

      justAddByAutoSign.forEach((annot) => {
        this.esService
          .deleteAreaById([
            this.recID,
            this.fileInfo.fileID,
            annot.annotationId,
          ])
          .subscribe((res) => {});
        clearTimeout(this.saveAnnoQueue.get(annot.annotationId));
        this.saveAnnoQueue.delete(annot.annotationId);
      });

      let tmpCollections = this.pdfviewerControl.annotationCollection.filter(
        (curAnnot) => {
          return !justAddByAutoSign.includes(curAnnot);
        }
      );
      this.pdfviewerControl.deleteAnnotations();
      tmpCollections?.forEach((curAnnot) => {
        this.pdfviewerControl.addAnnotation(curAnnot);
      });
    }
  }

  changeShowThumbnailState() {
    this.hideThumbnail = !this.hideThumbnail;
  }

  changeShowActionsState() {
    this.hideActions = !this.hideActions;
  }

  changeZoomValue(e: any) {
    this.zoomValue = e.zoomValue;
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
    }
  }
  changeQRRenderState(e) {
    this.renderQRAllPage = !this.renderQRAllPage;
  }

  changeAnnotPro(type, recID, createdOn) {
    console.log(type, recID);
    switch (type) {
      case '5':
        this.curSelectedAnno.dynamicText = this.datePipe.transform(
          new Date(createdOn),
          this.formAnnot.value.dateFormat
        );
        break;
      case '6':
        this.curSelectedAnno.dynamicText = this.formAnnot.value.content;
        break;

      case '8':
        if (this.renderQRAllPage) {
        }
        return;
    }
    this.curSelectedAnno.fontSize = this.formAnnot.value.fontSize;
    this.curSelectedAnno.fontFamily = this.formAnnot.value.fontStyle;
    this.curSelectedAnno.font = {
      isBold: this.isBold,
      isItalic: this.isItalic,
      isStrikeout: false,
      isUnderline: this.isUnd,
      version: undefined,
    };
    this.curSelectedAnno.modifiedDate = this.datePipe.transform(
      new Date(),
      'M/d/yy, h:mm a'
    );
    let tmpAnnot = { ...this.curSelectedAnno };
    this.pdfviewerControl.annotationModule.deleteAnnotationById(
      this.curSelectedAnno
    );
    this.pdfviewerControl.annotationModule.selectAnnotation(tmpAnnot);
    this.pdfviewerControl.addAnnotation(tmpAnnot);

    let area: tmpSignArea = {
      Signer: tmpAnnot.author,
      LabelType: tmpAnnot.customStampName,
      LabelValue: null,
      FixedWidth: false,
      SignDate: false,
      DateFormat: new Date(),
      Location: {
        left: tmpAnnot.bounds.left,
        top: tmpAnnot.bounds.top,
        width: tmpAnnot.bounds.width,
        height: tmpAnnot.bounds.height,
        pageNumber: tmpAnnot.pageNumber,
      },
      FontStyle: null,
      FontFormat: null,
      FontSize: null,
      SignatureType: 1,
      Comment: '',
      CreatedBy: this.user.userID,
      ModifiedBy: this.user.userID,
    };
    console.log('save area o change pros');

    if (!['1', '2', '8'].includes(area.LabelType)) {
      area.LabelType = tmpAnnot.customData.split(':')[1];
      area.LabelValue = tmpAnnot.dynamicText;
      area.FontStyle = tmpAnnot.fontFamily;
      area.FontSize = tmpAnnot.fontSize;
      area.FontFormat = '';

      if (tmpAnnot.font?.isBold) {
        area.FontFormat += 'B';
      }
      if (tmpAnnot.font?.isItalic) {
        area.FontFormat += 'I';
      }
      if (tmpAnnot.font?.isUnderline) {
        area.FontFormat += 'U';
      }
    }
    this.esService
      .addOrEditSignArea([
        this.recID,
        this.fileInfo.fileID,
        area,
        tmpAnnot.annotationId,
      ])
      .subscribe((res) => {
        if (res) {
          this.renderAnnotPanel();
          this.detectorRef.detectChanges();
        }
      });
  }

  changeAnnotationItem(type: number) {
    if (this.signerInfo && (this.isActiveToSign || !this.isApprover)) {
      this.holding = type;

      switch (type) {
        case 1:
          this.url = 'data:image/jpeg;base64,' + this.signerInfo?.signature;
          break;

        case 2:
          this.url = 'data:image/jpeg;base64,' + this.signerInfo?.stamp;
          break;

        case 3:
          this.url = '';
          break;

        case 4:
          this.url = '';
          break;

        case 5:
          this.url = '';
          break;

        case 6:
          this.url = '';
          break;

        case 7:
          this.url = '';
          break;

        case 8:
          this.url = qr;
          break;

        default:
          this.url = '';
          break;
      }
      this.addAnnotIntoPDF(type);
    } else {
      console.log('vui long chon nguoi ki');
    }
  }

  runAutoSign(pageNumber: number, mode: number, top?: number, left?: number) {
    top = top ? top : this.pdfviewerControl.viewerBase.pageSize[0].height - 150;
    left = left
      ? left
      : this.pdfviewerControl.viewerBase.pageSize[0].width - 150;
    let anno = {
      annotationSelectorSettings: {
        selectionBorderColor: '',
        resizerBorderColor: 'black',
        resizerFillColor: '#FF4081',
        resizerSize: 8,
        isLock: true,
        selectionBorderThickness: 1,
      },
      annotationSettings: {
        isLock: false,
      },
      comments: [],
      fillColor: '#ffffff00',
      font: {
        isBold: false,
        isItalic: false,
        isStrikeout: false,
        isUnderline: false,
        version: undefined,
      },
      fontColor: '#000',
      fontFamily: 'Helvetica',
      fontSize: 17,
      isPrint: true,
      isReadonly: false,
      modifiedDate: this.datePipe.transform(new Date(), 'M/d/yy, h:mm a'),
      opacity: 1,
      note: '',
      review: {
        state: 'Unmarked',
        stateModel: 'None',
        version: undefined,
      },
      rotateAngle: 0,
      strokeColor: '#ffffff00',
      textAlign: 'Left',
      thickness: 1,
    } as any;
    anno.modifiedDate = this.datePipe.transform(new Date(), 'M/d/yy, h:mm a');

    //nguoi da ky
    let signed = this.pdfviewerControl.annotationCollection.filter(
      (annotation) => {
        let signType: string = annotation.customData.split(':')[1];
        return (
          signType === '1' &&
          this.pdfviewerControl.currentPageNumber - 1 == annotation.pageNumber
        );
      }
    );

    //nguoi chua ky
    let unsign = this.lstSigners.filter((signer: any) => {
      return !signed.find((signedPerson) => {
        return signedPerson.author == signer.authorID;
      });
    });

    if (unsign.length > 0) {
      let locations = this.autoSignAreas(this.lstSigners.length, top, 100, 100);

      for (let i = 0; i < locations.length; i++) {
        let signer = unsign[i] as any;
        anno.annotationId = Guid.newGuid();
        anno.author = signer['authorID'];
        if (signer['signature'] != '') {
          anno.shapeAnnotationType = 'stamp';
          anno.stampAnnotationType = 'image';
          anno.stampAnnotationPath =
            'data:image/jpeg;base64,' + signer['signature'];
        } else {
          anno.shapeAnnotationType = 'FreeText';
          // anno.dynamicText = signer.fullName;
          anno.dynamicText =
            // this.vllActions[1 - 1]?.text + ': ' +
            signer.fullName;
          anno.subject = 'Text Box';
        }

        anno.customStampName = '1';
        anno.customData = signer['authorID'] + ':' + anno.customStampName;
        anno.bounds = locations[i];
        anno.pageNumber = pageNumber;
        this.pdfviewerControl.addAnnotation(anno);
        this.saveAnnoQueue.set(
          anno.annotationId,
          setTimeout(
            this.saveAnnoToDB.bind(this),
            500 * i,
            this.esService,
            { ...anno },
            this.fileInfo,
            this.user
          )
        );
      }
    }
  }

  //create locations for all signatures
  autoSignAreas(
    numberOfSignatures: number,
    top: number,
    width?: number,
    height?: number
  ) {
    let pageWidth = this.pdfviewerControl.viewerBase.pageSize[0].width;
    let pageHeight = this.pdfviewerControl.viewerBase.pageSize[0].height;
    width = width ? width : pageWidth / this.signPerRow - 20;
    height = height ? height : 100;
    let areas: any = [];

    while (numberOfSignatures > 0 && pageHeight - top >= width + 10) {
      let res = this.suggestAreasVer2(
        numberOfSignatures,
        this.signPerRow,
        this.direction,
        top,
        width,
        height,
        pageWidth,
        this.align
      );
      areas = areas.concat(res[0]);
      top = res[1];
      numberOfSignatures -= res[0].length;
    }

    return areas;
  }

  checkValidArea(suggestLocation: any): boolean {
    let conflictArea = this.pdfviewerControl.annotationCollection.find(
      (anno) => {
        return (
          anno.pageNumber === this.pdfviewerControl.currentPageNumber - 1 &&
          //conflict ben trai
          ((suggestLocation.left >= anno.bounds.left &&
            suggestLocation.left <= anno.bounds.left + anno.bounds.height &&
            //tren
            ((anno.bounds.top <= suggestLocation.top &&
              anno.bounds.top + anno.bounds.height >= suggestLocation.top) ||
              //duoi
              (anno.bounds.top >= suggestLocation.top &&
                anno.bounds.top <=
                  suggestLocation.top + suggestLocation.height))) ||
            //conflit ben phai
            (anno.bounds.left >= suggestLocation.left &&
              anno.bounds.left <=
                suggestLocation.left + suggestLocation.width &&
              //tren
              ((suggestLocation.top >= anno.bounds.top &&
                suggestLocation.top <= anno.bounds.top + anno.bounds.height) ||
                (anno.bounds.top >= suggestLocation.top &&
                  anno.bounds.top <=
                    suggestLocation.top + suggestLocation.height))))
        );
      }
    );

    return conflictArea ? false : true;
  }

  //dont use this version
  suggestAreas(
    numberOfSignatures: number,
    top: number,
    left: number,
    width: number,
    height: number,
    pageWidth: number
  ) {
    let areas: any = [];

    if (numberOfSignatures == 0) {
      return [];
    }

    if (numberOfSignatures >= 1) {
      if (
        this.checkValidArea({
          top: top,
          left: left,
          width: width,
          height: height,
        })
      ) {
        areas.push({
          top: top,
          left: left,
          width: width,
          height: height,
        });
      }
    }

    if (numberOfSignatures >= 2) {
      if (
        this.checkValidArea({
          top: top,
          left: 50,
          width: width,
          height: height,
        })
      ) {
        areas.push({
          top: top,
          left: 50,
          width: width,
          height: height,
        });
      }
    }

    if (numberOfSignatures == 3) {
      if (
        this.checkValidArea({
          top: top,
          left: (pageWidth - width) / 2,
          width: width,
          height: height,
        })
      ) {
        areas.push({
          top: top,
          left: (pageWidth - width) / 2,
          width: width,
          height: height,
        });
      }
    } else if (numberOfSignatures >= 4) {
      top = top - 10 - height;
      if (
        this.checkValidArea({
          top: top,
          left: left,
          width: width,
          height: height,
        })
      ) {
        areas.push({
          top: top,
          left: left,
          width: width,
          height: height,
        });
      }

      if (
        this.checkValidArea({
          top: top,
          left: 50,
          width: width,
          height: height,
        })
      ) {
        areas.push({
          top: top,
          left: 50,
          width: width,
          height: height,
        });
      }
    }

    if (numberOfSignatures >= 5) {
      if (
        this.checkValidArea({
          top: top + 10 + height,
          left: (pageWidth - width) / 2,
          width: width,
          height: height,
        })
      ) {
        areas.push({
          top: top + 10 + height,
          left: (pageWidth - width) / 2,
          width: width,
          height: height,
        });
      }
    }

    if (numberOfSignatures >= 6) {
      if (
        this.checkValidArea({
          top: top,
          left: (pageWidth - width) / 2,
          width: width,
          height: height,
        })
      ) {
        areas.push({
          top: top,
          left: (pageWidth - width) / 2,
          width: width,
          height: height,
        });
      }
    }

    return [areas, top - 10 - height];
  }

  suggestAreasVer2(
    numberOfSignatures: number,
    signPerRow: number,
    direct: number,
    top: number,
    width: number,
    height: number,
    pW: number,
    align: number
  ) {
    let areas: any = [];

    if (numberOfSignatures == 0) return [];

    //current sign per row
    let spr =
      numberOfSignatures - signPerRow >= 0 ? signPerRow : numberOfSignatures;

    let xCoor = pW / (2 * spr);
    let yCoor = 0;
    for (let i = 0; i < spr; i++) {
      yCoor = xCoor * (2 * i + 1) - width / 2;
      let location = {
        top: top,
        left: yCoor,
        width: width,
        height: height,
      };
      if (this.checkValidArea(location)) {
        areas.push(location);
      }
    }

    if (align == 2) {
      areas.forEach((area) => {
        area.left = area.left - xCoor + width / 2 + 10;
      });
    } else if (align == 3) {
      areas.forEach((area) => {
        area.left = xCoor + area.left - width - 10;
      });
    }
    if (direct == 2) {
      areas = areas.reverse();
    }
    return [areas, top + 10 + height];
  }

  addAnnotIntoPDF(type: number) {
    let signed;

    // if (this.url.replace('data:image/jpeg;base64,', '') != '') {
    signed = this.pdfviewerControl.annotationCollection.find((annotation) => {
      return (
        annotation.customData === this.signerInfo?.authorID + ':' + type &&
        annotation.pageNumber === this.pdfviewerControl.currentPageNumber - 1
      );
    });
    if (!signed) {
      if (
        [1, 2, 8].includes(type) &&
        this.url.replace('data:image/jpeg;base64,', '') != ''
      ) {
        let stamp = {
          customStampName: type.toString(),
          customStampImageSource: this.url,
        };
        // this.pdfviewerControl.customStampSettings.customStamps = [stamp];
        // this.pdfviewerControl.annotationModule.setAnnotationMode('Stamp');
        this.pdfviewerControl.customStamp = [stamp];
      } else {
        switch (type) {
          case 1:
          case 2:
          case 8:
            this.pdfviewerControl.freeTextSettings.defaultText =
              // this.vllActions[type - 1]?.text + ': ' +
              this.signerInfo.fullName;

            break;
          case 3:
            this.pdfviewerControl.freeTextSettings.defaultText =
              // this.vllActions[type - 1]?.text +
              // ': ' +
              this.signerInfo?.fullName;
            break;
          case 4:
            this.pdfviewerControl.freeTextSettings.defaultText =
              // this.vllActions[type - 1]?.text +
              // ': ' +
              this.signerInfo?.position;
            break;
          case 5:
            this.pdfviewerControl.freeTextSettings.defaultText =
              new Date().toLocaleDateString();
            break;
          case 6:
            this.pdfviewerControl.freeTextSettings.defaultText =
              this.vllActions[type - 1]?.text;
            break;
          case 7:
            this.pdfviewerControl.freeTextSettings.defaultText =
              // this.vllActions[type - 1]?.text +
              'Số';
            ': ' + this.fileInfo.fileRefNum;
            break;
          default:
            this.pdfviewerControl.freeTextSettings.defaultText =
              this.vllActions[5]?.text;
            break;
        }
        this.pdfviewerControl.freeTextSettings.author =
          this.signerInfo?.authorID;

        (this.pdfviewerControl.freeTextSettings.customData as String) =
          this.signerInfo?.authorID + ':' + type;

        this.pdfviewerControl.freeTextSettings.fontSize = 17;
        this.pdfviewerControl.freeTextSettings.enableAutoFit = true;
        this.pdfviewerControl.annotationModule.setAnnotationMode('FreeText');
      }
    } else {
      this.pdfviewerControl.annotationModule.setAnnotationMode('None');
      this.holding = 0;
      this.url = '';
    }
  }

  addAnnoEvent(e: AnnotationAddEventArgs) {
    console.log('add event', e);

    let curID = e.annotationId;
    let justAddAnno = this.pdfviewerControl.annotationCollection.find(
      (anno) => {
        return anno.annotationId === curID;
      }
    );
    // if (!(justAddAnno.shapeAnnotationType === 'FreeText')) {}
    justAddAnno.customData = this.signerInfo?.authorID + ':' + this.holding;
    this.holding = 0;

    justAddAnno.author = this.signerInfo?.authorID;
    justAddAnno.review.author = this.signerInfo?.authorID;
    this.curSelectedAnno = justAddAnno;

    if (this.curSelectedAnno) {
      this.saveAnnoQueue.set(
        curID,
        setTimeout(
          this.saveAnnoToDB.bind(this),
          10,
          this.esService,
          justAddAnno,
          this.fileInfo,
          this.user
        )
      );
    }
  }

  saveAnnoToDB(service, anno, fileInfo, user) {
    console.log('save event');
    let area: tmpSignArea = {
      Signer: anno.author,
      LabelType: anno.customStampName,
      LabelValue: null,
      FixedWidth: false,
      SignDate: false,
      DateFormat: new Date(),
      Location: {
        left: anno.bounds.left,
        top: anno.bounds.top,
        width: anno.bounds.width,
        height: anno.bounds.height,
        pageNumber: anno.pageNumber,
      },
      FontStyle: anno.fontFamily,
      FontFormat: null,
      FontSize: anno.fontSize,
      SignatureType: 1,
      Comment: '',
      CreatedBy: user.userID,
      ModifiedBy: user.userID,
    };
    console.log('save area', area);

    if (!['1', '2', '8'].includes(area.LabelType)) {
      area.LabelType = anno.customData.split(':')[1];
      area.LabelValue = anno.dynamicText;

      area.FontFormat = '';

      if (anno.font?.isBold) {
        area.FontFormat += 'B';
      }
      if (anno.font?.isItalic) {
        area.FontFormat += 'I';
      }
      if (anno.font?.isUnderline) {
        area.FontFormat += 'U';
      }
    }
    service
      .addOrEditSignArea([
        this.recID,
        this.fileInfo.fileID,
        area,
        anno.annotationId,
      ])
      .subscribe((res) => {
        if (res) {
          clearTimeout(this.saveAnnoQueue.get(anno.annotationId));
          this.saveAnnoQueue.delete(anno.annotationId);

          let index = this.pdfviewerControl.annotationCollection.findIndex(
            (annot) => annot.annotationId == anno.annotationId
          );
          if (index != -1) {
            this.pdfviewerControl.annotationCollection[index].annotationId =
              res;
          }

          if (this.saveAnnoQueue.size == 0) {
            let tmpCollections = this.pdfviewerControl.annotationCollection;

            this.pdfviewerControl.deleteAnnotations();
            tmpCollections?.forEach((curAnnotation) => {
              this.pdfviewerControl.addAnnotation({ ...curAnnotation });
            });

            console.log(
              'new collection',
              this.pdfviewerControl.annotationCollection
            );

            //reload annot panel
            this.renderAnnotPanel();
          }
        }
      });
  }

  removeAnnot(e: any) {
    console.log('remove event', e);

    this.esService
      .deleteAreaById([this.recID, this.fileInfo.fileID, e.annotationId])
      .subscribe((res) => {
        this.renderAnnotPanel();
        this.detectorRef.detectChanges();
      });

    this.pdfviewerControl.annotationCollection =
      this.pdfviewerControl.annotationCollection.filter((annot) => {
        return annot.annotationId != e.annotationId;
      });
    clearTimeout(this.saveAnnoQueue.get(e.annotationId));
    this.saveAnnoQueue.delete(e.annotationId);
  }

  resetTime(e: any) {
    let curID = e.annotationId;
    clearTimeout(this.saveAnnoQueue.get(curID));
    this.saveAnnoQueue.delete(curID);

    console.log('queue', this.saveAnnoQueue);

    let curIndex = this.pdfviewerControl.annotationCollection.findIndex(
      (anno) => {
        return anno.annotationId == curID;
      }
    );
    switch (e.name) {
      case 'annotationResize':
        this.curSelectedAnno.bounds = e.annotationBound;
        break;

      case 'annotationMove':
        this.curSelectedAnno.bounds = e.currentPosition;
        break;

      case 'annotationPropertiesChange':
        if (e.currentText) {
          this.curSelectedAnno.dynamicText = e.currentText;
          this.curSelectedAnno.bounds =
            this.pdfviewerControl.annotationCollection[curIndex].bounds;
        }
        break;
      default:
        break;
    }

    if (this.curSelectedAnno) {
      this.pdfviewerControl.annotationCollection[curIndex] =
        this.curSelectedAnno;
      this.saveAnnoQueue.set(
        curID,
        setTimeout(
          this.saveAnnoToDB.bind(this),
          this.after_X_Second,
          this.esService,
          this.curSelectedAnno,
          this.fileInfo,
          this.user
        )
      );
    }
  }

  ngxPageRendered(e: any) {
    console.log('page render ngx');

    this.pageMax = e?.pagesCount;
  }

  pageChange(e: any) {
    // let curImg = this.thumbnailEle.childNodes[
    //   e.currentPageNumber - 1
    // ] as Element;
    // curImg.scrollIntoView({
    //   behavior: 'auto',
    //   block: 'center',
    //   inline: 'center',
    // });
    this.curPage = this.pdfviewerControl.currentPageNumber;
  }

  goToPage(e) {
    console.log('change page', e);

    this.curPage = e.data;
    if (this.curPage < 1) {
      this.curPage = 1;
    } else if (this.curPage > this.pdfviewerControl?.pageCount) {
      this.curPage = this.pdfviewerControl
        ? this.pdfviewerControl?.pageCount
        : this.pageMax;
    }
    if (!this.isDisable)
      this.pdfviewerControl?.navigation?.goToPage(this.curPage);
  }

  testFunc(e: any) {}

  selectedAnnotation(e: any) {
    this.curSelectedAnno = this.pdfviewerControl.annotationCollection.find(
      (anno) => {
        return anno.annotationId === e.annotationId;
      }
    );
    console.log('select annot event', this.curSelectedAnno);
  }

  clickZoom(type: string, e?: any) {
    switch (type) {
      case 'in':
        this.pdfviewerControl?.magnificationModule.zoomIn();
        break;

      case 'out':
        this.pdfviewerControl?.magnificationModule.zoomOut();
        break;
      case 'to':
        if (!isNaN(Number(e.value))) {
          if (this.isDisable) this.zoomValue = e.value;
          else this.pdfviewerControl?.magnificationModule.zoomTo(e.value);
        } else {
          switch (e.value) {
            case 'Auto':
              if (this.isDisable) this.zoomValue = 'auto';
              else this.pdfviewerControl?.magnificationModule.fitToAuto();
              return;
            case 'Fit to Width':
              if (this.isDisable) this.zoomValue = 'page-width';
              else this.pdfviewerControl?.magnificationModule.fitToWidth();
              return;
            case 'Fit to page':
              if (this.isDisable) this.zoomValue = 'page-fit';
              else this.pdfviewerControl?.magnificationModule.fitToPage();
              return;
          }
        }
        break;
      default:
        break;
    }
    this.zoomValue = this.pdfviewerControl
      ? this.pdfviewerControl.zoomValue
      : this.zoomValue;
  }

  clickDownload() {
    this.pdfviewerControl.downloadFileName = this.fileInfo.fileName;
    this.pdfviewerControl.download();
    // this.beforeDownLoad()
    //   .then((annots) => {
    //     this.pdfviewerControl.download();
    //     return annots;
    //   })
    //   .then((annotations) => {
    //     annotations.forEach((item) => {
    //       this.pdfviewerControl.addAnnotation(item);
    //     });
    //   });
  }

  async beforeDownLoad() {
    let tmpCollections = this.pdfviewerControl.annotationCollection;

    this.pdfviewerControl.deleteAnnotations();
    tmpCollections?.forEach((annot) => {
      if (annot.customData.split(':')[1] != '1') {
        this.pdfviewerControl.addAnnotation({ ...annot });
      }
    });
    return tmpCollections;
  }

  signPDF(mode, comment): Promise<any> {
    return new Promise<any>((resolve, rejects) => {
      let annotationDataFormat: AnnotationDataFormat;
      let tmpCollections = this.pdfviewerControl.annotationCollection;
      this.pdfviewerControl.deleteAnnotations();
      tmpCollections?.forEach((annot) => {
        if (
          annot.customData.split(':')[1] != '1' &&
          annot.customData.split(':')[1] != '2'
        ) {
          annot.annotationSettings.isLock = true;
          this.pdfviewerControl.addAnnotation(annot);
        }
      });
      this.pdfviewerControl
        .exportAnnotationsAsBase64String(annotationDataFormat)
        .then((base64) => {
          this.esService
            .updateSignFileTrans(
              base64.replace('data:application/pdf;base64,', ''),
              this.user.userID,
              this.recID,
              mode,
              comment
            )
            .subscribe((status) => {
              resolve(status);
            });
        });
    });
  }

  clickPrint(args) {}

  renderAnnotPanel() {
    this.esService
      .getSignAreas(
        this.recID,
        this.fileInfo.fileID,
        this.isApprover,
        this.user.userID
      )
      .subscribe((res) => {
        this.lstAreas = res;

        this.detectorRef.detectChanges();
      });
  }

  renderQRFile() {
    let annotationDataFormat: AnnotationDataFormat;

    let qrAnnot = this.pdfviewerControl?.annotationCollection?.find((annot) => {
      return annot.customData.split(':')[1] == '8';
    });

    this.genFileQR(this.fileInfo.fileName, this.fileInfo.fileRefNum, '').then(
      (value: string) => {
        if (qrAnnot) {
          let cloneQR = { ...qrAnnot };
          cloneQR.stampAnnotationPath = value;
          this.saveAnnoQueue.set(
            cloneQR.annotationId,
            setTimeout(
              this.saveAnnoToDB.bind(this),
              0,
              this.esService,
              cloneQR,
              this.fileInfo,
              this.user
            )
          );
          if (this.pdfviewerControl.pageCount != 1) {
            for (let i = 0; i < this.pdfviewerControl.pageCount - 1; i++) {
              cloneQR.annotationId = Guid.newGuid();
              cloneQR.pageNumber = i;
              this.pdfviewerControl.addAnnotation(cloneQR);
            }
          }
          this.pdfviewerControl
            .exportAnnotationsAsBase64String(annotationDataFormat)
            .then((res) => {
              console.log('base64 new pdf', res);
            });
        }
      }
    );
  }

  cancelPrint(e: any) {}
  goToSelectedCA(ca, idx) {
    console.log('ca', ca);
    this.lstCACollapseState[idx].open = !this.lstCACollapseState[idx].open;
    if (!ca.isVerified) {
      this.lstCACollapseState[idx].verifiedFailed =
        !this.lstCACollapseState[idx].verifiedFailed;
    }
  }
  goToSelectedAnnotation(area) {
    if (this.curSelectedAnnotID != area.recID) {
      this.pdfviewerControl.annotationModule.selectAnnotation(area.recID);
      this.formAnnot.controls['content'].setValue(area.labelValue);
      this.isBold = area.fontFormat?.includes('B') ? true : false;
      this.isItalic = area.fontFormat?.includes('I') ? true : false;
      this.isUnd = area.fontFormat?.includes('U') ? true : false;
      this.curAnnotFontSize = area.fontSize;
      this.curAnnotFontStyle = area.fontStyle;
      this.curSelectedAnnotID = area.recID;
      this.curDynamicText = area.labelValue;
      this.detectorRef.detectChanges();
      console.log(this.curDynamicText);
    }
  }

  show(e: any) {
    this.esService.getListCA(this.fileInfo.fileID).subscribe((res) => {
      this.lstCA = res;
      this.detectorRef.detectChanges();
      console.log('ca ', res);
    });
  }

  openPopUpCAProps(ca) {
    console.log('ca properties', ca);
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
  getListCA() {
    this.esService.getListCA(this.fileInfo.fileID).subscribe((res) => {
      this.lstCA = res;
      this.lstCA.forEach((ca) => {
        this.lstCACollapseState.push({
          open: false,
          verifiedFailed: false,
          detail: false,
        });
      });

      this.detectorRef.detectChanges();
    });
  }

  closeAddForm(event) {
    //this.dialog && this.dialog.close();
  }
  // onThumbnailDrawn(thumbnailEvent: PdfThumbnailDrawnEvent) {
  //   console.log('da them o onThumbnailDrawn');

  //   const thumbnail = thumbnailEvent.thumbnail;
  //   this.thumbnailTab.nativeElement.appendChild(thumbnail);
  // }
}

class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
