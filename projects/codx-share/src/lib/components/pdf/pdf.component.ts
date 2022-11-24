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
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import {
  AuthStore,
  ImageViewerComponent,
  NotificationsService,
  ScrollComponent,
  UIComponent,
} from 'codx-core';
import Konva from 'konva';
import { qr } from './model/mode';
import { tmpAreaName, tmpSignArea } from './model/tmpSignArea.model';
import {
  NgxExtendedPdfViewerComponent,
  NgxExtendedPdfViewerService,
  pdfDefaultOptions,
  TextLayerRenderedEvent,
} from 'ngx-extended-pdf-viewer';
import {
  CodxEsService,
  UrlUpload,
} from 'projects/codx-es/src/lib/codx-es.service';
import { PopupCaPropsComponent } from 'projects/codx-es/src/lib/sign-file/popup-ca-props/popup-ca-props.component';
import { PopupSelectLabelComponent } from 'projects/codx-es/src/lib/sign-file/popup-select-label/popup-select-label.component';
import { PopupSignatureComponent } from 'projects/codx-es/src/lib/setting/signature/popup-signature/popup-signature.component';
import {
  ES_SignFile,
  SetupShowSignature,
} from 'projects/codx-es/src/lib/codx-es.model';
import { text } from 'stream/consumers';
@Component({
  selector: 'lib-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss'],
  providers: [NgxExtendedPdfViewerService],
})
export class PdfComponent
  extends UIComponent
  implements AfterViewInit, OnChanges
{
  constructor(
    private inject: Injector,
    private authStore: AuthStore,
    private esService: CodxEsService,
    private actionCollectionsChanges: IterableDiffers,
    private datePipe: DatePipe,
    private notificationsService: NotificationsService
  ) {
    pdfDefaultOptions.renderInteractiveForms = false;
    pdfDefaultOptions.annotationEditorEnabled = true;
    super(inject);
    this.user = this.authStore.get();

    this.funcID = this.router.snapshot.params['funcID'];
  }

  //Input
  @Input() recID = '';
  @Input() isEditable = true;
  @Input() isConfirm = false;
  @Input() hasPermission = false;
  @Input() isApprover;
  @Input() stepNo = -1;
  @Input() inputUrl = null;
  @Input() transRecID = null;
  @Input() oSignFile = {};

  @Input() isPublic: boolean = false; // ký ngoài hệ thống
  @Input() approver: string = ''; // ký ngoài hệ thống
  @Output() confirmChange = new EventEmitter<boolean>();

  @Input() hideActions = false;
  @Output() changeSignerInfo = new EventEmitter();
  //View Child
  @ViewChildren('actions') actions: QueryList<ElementRef>;
  @ViewChild('thumbnailTab') thumbnailTab: ElementRef;
  @ViewChild('ngxPdfView') ngxPdfView: NgxExtendedPdfViewerComponent;

  //core
  dialog: import('codx-core').DialogRef;
  funcID;
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
  contextMenu: any;
  needAddKonva = null;
  tr: Konva.Transformer;

  //vll
  vllActions;

  //page
  pageMax;
  getSignAreas;
  pageStep;
  curPage = 1;

  //zoom
  zoomValue: any = 100;
  zoomFields = { text: 'show', value: 'realValue' };
  lstZoomValue = [
    { realValue: '10', show: 10 },
    { realValue: '25', show: 25 },
    { realValue: '30', show: 30 },
    { realValue: '50', show: 50 },
    { realValue: '90', show: 90 },
    { realValue: '100', show: 100 },
    // { realValue: 'Auto', show: 'Auto' },
    // { realValue: 'Fit to Width', show: 'Fit to Width' },
    // { realValue: 'Fit to page', show: 'Fit to page' },
  ];

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

  //auto sign
  needSuggest: boolean = true;
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
  ];
  public headerLeftName = [{ text: 'Xem nhanh' }, { text: 'Chữ ký số' }];

  //thumbnail
  hideThumbnail: boolean = false;

  vllSupplier: any;
  onInit() {
    this.cache.valueList('ES029').subscribe((res) => {
      if (res) {
        this.vllSupplier = res.datas;
      }
    });

    if (this.isPublic) {
      this.user.userID = this.approver;
    }
    // if (this.isPublic) {
    //   this.headerRightName = [
    //     { text: 'Thông tin người kí' },
    //     { text: 'Trao đổi' },
    //     { text: 'Hướng dẫn ký số' },
    //   ];
    // }
    if (this.inputUrl == null) {
      this.esService.getSignFormat().subscribe((res: any) => {
        this.signPerRow = res.SignPerRow;
        this.align = res.Align;
        this.direction = res.Direction;
        this.areaControl = res.AreaControl == '1';
        this.isAwait = res.Await == '1';
        this.labels = res.Label.filter((label) => {
          return label.Language == this.user.language;
        });
        this.detectorRef.detectChanges();
      });

      this.esService
        .getSFByID([
          this.recID,
          this.user?.userID,
          this.isApprover,
          this.isEditable,
        ])
        .subscribe((res: any) => {
          console.table('sf', res);
          let sf = res?.signFile;
          if (sf) {
            sf.files.forEach((file: any, index) => {
              this.lstFiles.push({
                fileName: file.fileName,
                fileRefNum: sf.refNo,
                fileID: file.fileID,
                fileUrl: res.urls[index],
                signers: res?.approvers,
                areas: file.areas,
              });
            });
            this.lstSigners = res.approvers;
            if (this.isApprover) {
              this.signerInfo = res?.approvers.find(
                (approver) => approver.authorID == this.user.userID
              );

              this.changeSignerInfo.emit(this.signerInfo);
            } else {
              this.signerInfo = res.approvers[0];
            }
            this.curFileID = sf?.files[0]?.fileID;
            this.curFileUrl = res.urls[0];
            this.curSignerID = this.signerInfo?.authorID;
            this.curSignerRecID = this.signerInfo?.recID;
          }
          //this.detectorRef.detectChanges();
        });

      this.cache.valueList('ES015').subscribe((res) => {
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

      //this.detectorRef.detectChanges();
    } else {
      this.curFileUrl = this.inputUrl;
      this.detectorRef.detectChanges();
    }
    this.tr = new Konva.Transformer({
      rotateEnabled: false,
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
      this.detectorRef.detectChanges();
    }
  }

  //remove area
  removeArea() {
    this.esService
      .deleteAreaById([
        this.recID,
        this.fileInfo.fileID,
        this.curSelectedArea.id(),
      ])
      .subscribe((res) => {
        if (res) {
          this.esService
            .getSignAreas(
              this.recID,
              this.fileInfo.fileID,
              this.isApprover,
              this.user.userID
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
    this.tr?.rotateEnabled(false);
    this.tr?.nodes([this.curSelectedCA]);
    layer?.add(this.tr);
    layer?.draw();
  }

  goToPage(e) {
    this.curPage = e.data;

    if (this.curPage < 1) {
      this.curPage = 1;
    } else if (this.curPage > this.pageMax) {
      this.curPage = this.pageMax;
    }
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

      if (this.curSelectedArea != null && !isCA) {
        this.tr?.remove();
        let layerChildren = this.lstLayer.get(area.location.pageNumber + 1);

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
            ? this.checkIsUrl(area.labelValue)
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
        this.tr?.forceUpdate();
        this.tr?.nodes([this.curSelectedArea]);
        layerChildren.add(this.tr);
        if (this.curSelectedAnnotID != area.recID) {
          this.formAnnot.controls['content'].setValue(area.labelValue);
          this.isBold = area.fontFormat?.includes('bold') ? true : false;
          this.isItalic = area.fontFormat?.includes('italic') ? true : false;
          this.isUnd = area.fontFormat?.includes('underline') ? true : false;
          this.curAnnotFontSize = area.fontSize;
          this.curAnnotFontStyle = area.fontStyle;
          this.curAnnotDateFormat = area.dateFormat;
          this.useSignDate = area.signDate;
          this.curSignDateType = area.signDate
            ? this.lstSignDateType[1]
            : this.lstSignDateType[0];
          this.curSelectedAnnotID = area.recID;
        }
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

  //get
  getAreaOwnerName(authorID) {
    return this.lstSigners.find((signer) => {
      return signer.authorID == authorID;
    })?.fullName;
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

  //sign pdf
  signPDF(mode, comment): any {
    if (this.isEditable && this.transRecID) {
      let hasCA = this.lstCA ? (this.lstCA.length != 0 ? true : false) : false;
      return new Promise<any>((resolve, rejects) => {
        this.esService
          .SignAsync(
            this.stepNo,
            this.isAwait,
            this.user.userID,
            this.recID,
            this.signerInfo.signType,
            this.signerInfo.supplier,
            hasCA,
            mode,
            comment
          )
          .subscribe((status) => {
            resolve(status);
          });
      });
    }
  }

  //loaded pdf
  loadedPdf(e: any) {
    this.pageMax = e.pagesCount;
    this.curPage = this.pageMax;
    let ngxService: NgxExtendedPdfViewerService =
      new NgxExtendedPdfViewerService();
    ngxService.addPageToRenderQueue(this.pageMax);
  }

  saveToDB(tmpArea: tmpSignArea) {
    this.esService
      .addOrEditSignArea(this.recID, this.curFileID, tmpArea, tmpArea.recID)
      .subscribe((res) => {
        if (res) {
          this.esService
            .getSignAreas(
              this.recID,
              this.fileInfo.fileID,
              this.isApprover,
              this.user.userID
            )
            .subscribe((res) => {
              if (res) {
                console.log('save event', res);
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
    let w = this.xScale;
    let h = this.yScale;

    let tmpArea: tmpSignArea = {
      signer: authorID,
      labelType: labelType,
      labelValue: url,
      isLock: false,
      allowEditAreas: this.signerInfo.allowEditAreas,
      signDate: this.curSignDateType == this.lstSignDateType[0] ? false : true,
      dateFormat: this.curAnnotDateFormat,
      location: {
        top: y / this.yScale,
        left: x / this.xScale,
        width: w / this.xScale,
        height: h / this.yScale,
        pageNumber: Number(konva?.parent?.id().replace('layer', '')) - 1,
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
    };
    if (this.needAddKonva) {
      this.esService
        .addOrEditSignArea(this.recID, this.curFileID, tmpArea, recID)
        .subscribe((res) => {
          if (res) {
            konva?.id(res);
            konva?.off('dragend');
            konva?.on('dragend transformend', (e: any) => {
              this.addDragResizeEevent(
                tmpArea,
                e.type,
                konva?.getPosition(),
                konva?.scale()
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
                this.user.userID
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
  pageRendered(e: any) {
    // if (this.inputUrl == null) {
    let rendedPage = Array.from(document.getElementsByClassName('page'))?.find(
      (ele) => {
        return ele.getAttribute('data-page-number') == e.pageNumber;
      }
    );
    if (rendedPage?.firstChild) {
      let warpper = rendedPage?.firstChild;
      let virtual = document.createElement('div');
      let id = 'layer' + e.pageNumber.toString();
      virtual.id = id;
      virtual.style.zIndex = '2';
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
            let curSignerInfo = this.lstSigners.find(
              (signer) => signer.authorID == area.signer
            );
            let url = '';
            let isChangeUrl = false;
            switch (area.labelType) {
              case 'S1': {
                url = curSignerInfo?.signature1 ?? area.labelValue;
                if (area.labelValue != url) {
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
                  area
                );
                break;
              }
              case 'S2': {
                url = curSignerInfo?.signature2 ?? area.labelValue;
                if (area.labelValue != url) {
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
                  area
                );
                break;
              }
              case 'S3': {
                let url = curSignerInfo?.stamp ?? area.labelValue;
                let isUrl = this.checkIsUrl(url);
                this.addArea(
                  url,
                  isUrl ? 'img' : 'text',
                  area.labelType,
                  transformable,
                  false,
                  area.signer,
                  area.stepNo,
                  area
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
            if (isChangeUrl) {
              area.labelValue = url;
              this.esService
                .addOrEditSignArea(this.recID, this.curFileID, area, area.recID)
                .subscribe((res) => {});
            } else {
            }
          }
        });

        if (this.inputUrl && !this.gotLstCA) {
          this.esService.getListCAByBytes(this.curFileUrl).subscribe((res) => {
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
                ((ca?.signedPosRight - ca.signedPosLeft) / 0.75) * this.xScale;
              let caH =
                ((ca?.signedPosBottom - ca?.signedPosTop) / 0.75) * this.yScale;
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

            let transformable =
              this.isEditable == false
                ? false
                : this.signerInfo.allowEdit == false
                ? false
                : true;
            this.tr?.rotateEnabled(false);
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
                  let curLayer = stage?.children[0]?.children;
                  let signed = curLayer.filter((child) => {
                    if (child != this.tr) {
                      let childName: tmpAreaName = JSON.parse(
                        child?.attrs?.name
                      );

                      let sameLable = childName.LabelType == name.LabelType;
                      let isUnique = this.imgConfig.includes(
                        childName.LabelType.toString()
                      );
                      let sameSigner = childName.Signer == name.Signer;
                      let sameStepNo = childName.StepNo == name.StepNo;
                      return sameLable && sameSigner && isUnique && sameStepNo;
                    }
                    return undefined;
                  });
                  this.holding = 0;
                  if (
                    !this.imgConfig.includes(name.LabelType.toString()) ||
                    signed?.length == 1
                  ) {
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
                  } else {
                    this.needAddKonva.destroy();
                    this.tr?.remove();
                  }
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

              //   this.isEditable == false
              //     ? false
              //     : this.curSelectedArea.draggable()
              // );
              // this.tr?.draggable(
              //   this.isEditable == false
              //     ? false
              //     : this.curSelectedArea.draggable()
              // );

              // let attrs = this.curSelectedArea?.attrs;
              // let name: tmpAreaName = JSON.parse(attrs.name);
              // this.tr?.enabledAnchors(
              //   this.isEditable == false
              //     ? []
              //     : name.Type == 'img'
              //     ? this.checkIsUrl(name.LabelValue)
              //       ? this.fullAnchor
              //       : this.textAnchor
              //     : this.textAnchor
              // );
              // this.tr?.forceUpdate();
              // this.tr?.nodes([this.curSelectedArea]);
              // layerChildren.add(this.tr);
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
    // }
  }

  getTextLayerInfo(txtLayer: TextLayerRenderedEvent) {
    if (txtLayer.pageNumber == this.pageMax) {
      txtLayer?.source.textDivs.forEach((div) => {
        if (Number(div.style.top.replace('px', '')) > this.maxTop) {
          this.maxTop = Number(div.style.top.replace('px', ''));
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

  addDragResizeEevent(
    tmpArea: tmpSignArea,
    event,
    newPos?: { x: number; y: number },
    newScale?: { x: number; y: number }
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
        tmpArea.location.width = newScale.x / this.xScale;
        tmpArea.location.height = newScale.y / this.yScale;

        break;
      }
    }
    this.resetTime(tmpArea);
  }

  addArea(
    url,
    type: string,
    labelType,
    draggable: boolean,
    isSaveToDB: boolean,
    authorID: string,
    stepNo: number,
    area?: tmpSignArea
  ) {
    let tmpName: tmpAreaName = {
      Signer: authorID,
      Type: type,
      PageNumber: this.curPage - 1,
      StepNo: stepNo,
      LabelType: labelType,
      LabelValue: url,
    };
    let recID = Guid.newGuid();
    this.stepNo = stepNo;

    switch (type) {
      case 'text':
        var textArea = new Konva.Text({
          text: url,
          fontSize: 14,
          fontFamily: 'Arial',
          draggable: draggable,
          name: JSON.stringify(tmpName),
          id: recID,
          align: 'left',
        });
        if (isSaveToDB) {
          textArea.scale({
            x: this.xScale,
            y: this.yScale,
          });
          this.needAddKonva = textArea;
        } else {
          textArea.id(area.recID ? area.recID : textArea.id());
          textArea.draggable(!area.allowEditAreas ? false : !area.isLock);
          textArea.scale({
            x: area.location.width * this.xScale,
            y: area.location.height * this.yScale,
          });
          textArea.fontSize(area.fontSize);
          textArea.fontStyle(
            area.fontFormat.replace('line-through', '').replace('underline', '')
          );
          let decorate =
            (area.fontFormat.includes('underline') ? 'underline ' : '') +
            (area.fontFormat.includes('line-through') ? 'line-through' : '');

          textArea.textDecoration(decorate);
          textArea.fontFamily(area.fontStyle);
          let txtX = Number(area.location.left) * this.xScale;
          let txtY = Number(area.location.top) * this.yScale;
          textArea.x(txtX);
          textArea.y(txtY);
          this.lstLayer.get(area.location.pageNumber + 1).add(textArea);
          textArea.on('dragend transformend', (e: any) => {
            this.addDragResizeEevent(
              area,
              e.type,
              textArea.getPosition(),
              textArea.scale()
            );
          });

          this.detectorRef.detectChanges();
        }
        break;

      case 'img': {
        let img = document.createElement('img') as HTMLImageElement;
        img.setAttribute('crossOrigin', 'anonymous');
        img.referrerPolicy = 'noreferrer';
        img.src = url;
        img.onload = () => {
          let imgW = 200;
          let imgH = 100;
          let imgArea = new Konva.Image({
            image: img,
            width: 200,
            height: tmpName.LabelType == '8' ? 200 : 100,
            id: recID,
            name: JSON.stringify(tmpName),
            draggable: true,
          });

          if (isSaveToDB) {
            imgArea.scale({ x: this.xScale, y: this.yScale });
            this.needAddKonva = imgArea;
          } else {
            imgArea.id(area.recID);
            imgArea.draggable(!area.allowEditAreas ? false : !area.isLock);
            imgArea.scale({
              x: this.xScale * area.location.width,
              y: this.yScale * area.location.height,
            });
            let imgX = Number(area.location.left) * this.xScale;
            let imgY = Number(area.location.top) * this.yScale;
            imgArea.x(imgX);
            imgArea.y(imgY);
            imgArea.on('dragend transformend', (e: any) => {
              this.addDragResizeEevent(
                area,
                e.type,
                imgArea.getPosition(),
                imgArea.scale()
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

  //change
  useSignDate: boolean = true;
  changeUseSignDate() {
    this.curSignDateType = this.lstSignDateType[1];
  }

  changeUseCreatedDate() {
    this.curSignDateType = this.lstSignDateType[0];
  }

  changeConfirmState(e: any) {
    this.checkedConfirm = e.data;
    this.confirmChange.emit(e.data);
  }

  changeSignature_StampImg(area: tmpSignArea) {
    let setupShowForm = new SetupShowSignature();
    let model = {
      userID: area.signer,
      signatureType: area.signatureType,
    };
    let data = {
      data: model,
      setupShowForm: setupShowForm,
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
      if (res?.event[0]) {
        area.labelValue = UrlUpload + '/' + res.event[0].pathDisk;
        this.detectorRef.detectChanges();
        this.changeAnnotPro(area.labelType, area.recID, area.labelValue);
      }
    });
  }

  changeSignature_StampImg_Area_Immediate(curArea: tmpSignArea, file) {
    let curLayer = this.lstLayer.get(curArea.location.pageNumber + 1);

    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      const img = document.createElement('img') as HTMLImageElement;
      img.setAttribute('crossOrigin', 'anonymous');
      img.referrerPolicy = 'noreferrer';
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
        this.addSignature(setupShowForm);
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

  changeAnnotPro(type, recID, newUrl = null) {
    // switch (type.toString()) {
    let tmpName: tmpAreaName = JSON.parse(this.curSelectedArea?.attrs?.name);
    let textContent = '';

    if (this.imgConfig.includes(type)) {
      if (!newUrl) return;
      else {
        let curArea = this.lstAreas.find((area) => area.recID == recID);
        curArea.labelValue = newUrl;
        let curLayer = this.lstLayer.get(curArea?.location.pageNumber + 1);
        let curImgEle = document.getElementById(recID) as HTMLImageElement;
        let min = 0;
        let scale = 1;
        curImgEle.onload = () => {
          let isText = this.curSelectedArea.attrs?.text ? true : false;
          if (isText) {
            let textW = this.curSelectedArea.width();
            let textH = this.curSelectedArea.height();
            min = Math.min(textW, textH);
            scale = Math.min(curImgEle.width, curImgEle.height) / min;
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
          });
          imgArea?.scale(this.curSelectedArea.scale());
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
      if (type != '5') {
        textContent = this.formAnnot.value.content;
      } else {
        textContent = this.curSignDateType;
      }
      let transformable = this.curSelectedArea.draggable();
      let style = 'normal';
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

      this.curSelectedArea.attrs.fontStyle = style;
      this.curSelectedArea.attrs.textDecoration = this.isUnd
        ? 'line-through'
        : '';
      let position = this.curSelectedArea.getPosition();
      var textArea = new Konva.Text({
        text: textContent,
        fontSize: this.curAnnotFontSize,
        fontFamily: this.curAnnotFontStyle,
        x: position.x,
        y: position.y,
        draggable: transformable,
        name: JSON.stringify(tmpName),
        id: recID,
        align: 'left',
      });
      textArea.scale(this.curSelectedArea.scale());
      this.curSelectedArea.destroy();
      this.curSelectedArea = textArea;
      let curLayer = this.lstLayer.get(tmpName.PageNumber + 1);

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
    let w = this.curSelectedArea.scale().x / this.xScale;
    let h = this.curSelectedArea.scale().y / this.yScale;

    let tmpArea: tmpSignArea = {
      signer: tmpName.Signer,
      labelType: tmpName.LabelType,
      labelValue: this.imgConfig.includes(type) ? newUrl : textContent,
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
        pageNumber: this.curPage - 1,
      },
      stepNo: tmpName.StepNo,
      fontStyle: this.imgConfig.includes(type) ? '' : this.curAnnotFontStyle,
      fontFormat: this.imgConfig.includes(type)
        ? ''
        : this.curAnnotFontStyle + this.curSelectedArea.attrs?.textDecoration ??
          '',
      fontSize: this.imgConfig.includes(type) ? '' : this.curAnnotFontSize,
      signatureType: 2,
      comment: '',
      createdBy: tmpName.Signer,
      modifiedBy: tmpName.Signer,
      recID: this.curSelectedArea.attrs.id,
    };

    this.esService
      .addOrEditSignArea(this.recID, this.curFileID, tmpArea, tmpArea.recID)
      .subscribe((res) => {
        this.esService
          .getSignAreas(
            this.recID,
            this.fileInfo.fileID,
            this.isApprover,
            this.user.userID
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

  addSignature(setupShowForm) {
    let model = {
      userID: this.signerInfo?.authorID,
      signatureType: this.signerInfo?.signType,
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
      if (res?.event[0]) {
        let img = res.event[0];
        switch (img?.referType) {
          case 'S1': // Ky chinh
            this.signerInfo.signature1 = UrlUpload + '/' + img?.pathDisk;
            this.changeAnnotationItem(this.crrType);
            //this.url = this.signerInfo.signature1 ?? '';
            break;
          case 'S2': //Ky nhay
            this.signerInfo.signature2 = UrlUpload + '/' + img?.pathDisk;
            this.changeAnnotationItem(this.crrType);
            //this.url = this.signerInfo.signature2 ?? '';
            break;
          case 'S3': //Con dau
            this.signerInfo.stamp = UrlUpload + '/' + img?.pathDisk;
            this.changeAnnotationItem(this.crrType);
            //this.url = this.signerInfo.stamp ?? '';
            break;
        }
      }
    });
  }

  crrType: any;

  changeAnnotationItem(type: any) {
    let curStepType = this.signerInfo.stepType;
    let hasCA = false;
    if (curStepType != 'S') {
      let hasCAStep = this.lstSigners.find(
        (signer) => signer.stepNo < this.stepNo && signer.stepType == 'S'
      );
      if (hasCAStep) {
        hasCA = true;
      }
    }

    if (hasCA) {
      this.notificationsService.notifyCode('ES022');
      return;
    }
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
    }
    this.detectorRef.detectChanges();
  }
  changeSignFile(e: any) {
    this.lstSigners = e.itemData.signers;
    this.fileInfo = e.itemData;
    this.curFileID = this.fileInfo.fileID;
    this.curFileUrl = this.fileInfo.fileUrl;
    this.autoSignState = false;
    this.getListCA();
    this.esService
      .getSignAreas(
        this.recID,
        this.fileInfo.fileID,
        this.isApprover,
        this.user.userID
      )
      .subscribe((res) => {
        if (res) {
          this.lstAreas = res;
          this.detectorRef.detectChanges();
        }
      });
    this.detectorRef.detectChanges();
  }

  changeZoom(type: string, e?: any) {
    if (
      !isNaN(Number(e?.value)) &&
      Number(e?.value) <= 100 &&
      Number(e?.value) >= 10
    ) {
      this.zoomValue = e.value;
    } else if (!isNaN(Number(e)) && Number(e) <= 100 && Number(e) >= 10) {
      this.ngxPdfView.zoom = e;
    } else {
      // this.zoomValue = 10;
    }
    this.detectorRef.detectChanges();
    if (this.curSelectedArea) {
      this.tr?.forceUpdate();
      this.tr?.draw();
    }
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
    this.detectorRef.detectChanges();
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
        this.autoSign();
      }
      this.autoSignState = e.data;
      this.detectorRef.detectChanges();
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
          };

          layer?.add(textArea);
          this.esService
            .addOrEditSignArea(this.recID, this.curFileID, tmpArea, recID)
            .subscribe((res) => {
              if (res) {
                textArea?.id(res);
                textArea?.off('dragend');
                textArea?.on('dragend transformend', (e: any) => {
                  this.addDragResizeEevent(
                    tmpArea,
                    e.type,
                    textArea?.getPosition(),
                    textArea?.scale()
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
                      this.user.userID
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
          img.setAttribute('crossOrigin', 'anonymous');
          img.referrerPolicy = 'noreferrer';

          img.src = url;
          img.onload = () => {
            let imgArea = new Konva.Image({
              image: img,
              width: imgW,
              height: 100,
              x: unsignIdx[idx],
              y: this.maxTop + row * 100 + 10,
              id: recID,
              name: JSON.stringify(tmpName),
              draggable: transformable,
            });
            imgArea.scale({ x: this.xScale, y: this.yScale });

            //save to db
            let y = imgArea.position().y;
            let x = imgArea.position().x;
            let w = this.xScale;
            let h = this.yScale;

            let tmpArea: tmpSignArea = {
              signer: person.authorID,
              labelType: 'S1',
              labelValue: url,
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
            };

            layer?.add(imgArea);
            this.esService
              .addOrEditSignArea(this.recID, this.curFileID, tmpArea, recID)
              .subscribe((res) => {
                if (res) {
                  imgArea?.id(res);
                  imgArea?.off('dragend');
                  imgArea?.on('dragend transformend', (e: any) => {
                    this.addDragResizeEevent(
                      tmpArea,
                      e.type,
                      imgArea?.getPosition(),
                      imgArea?.scale()
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
                        this.user.userID
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

  show(area) {
    let doc = document.getElementById(area.recID);
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

  //#region Public Signing
  currentTab: number;
  checkedConfirm: boolean = false;
  @ViewChild('imgSignature1', { static: false })
  imgSignature1: ImageViewerComponent;
  @ViewChild('imgSignature2', { static: false })
  imgSignature2: ImageViewerComponent;
  @ViewChild('imgStamp', { static: false }) imgStamp: ImageViewerComponent;

  changeTab(currTab) {
    this.currentTab = currTab;
  }
  //#endregion
}
//create new guid
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
