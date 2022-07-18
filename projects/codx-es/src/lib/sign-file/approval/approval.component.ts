import {
  Component,
  ElementRef,
  Injector,
  Input,
  OnInit,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  note,
  pdfContent,
  position,
  qr,
  refNumber,
  signature,
  signature2,
  signature3,
  stamp,
  time,
} from './model/mode';
import { PdfViewerComponent } from '@syncfusion/ej2-angular-pdfviewer';
import { AuthStore, CacheService, UIComponent } from 'codx-core';
import { tmpSignArea } from './model/tmpSignArea.model';
import { CodxEsService } from '../../codx-es.service';
@Component({
  selector: 'lib-approval',
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss'],
})
export class ApprovalComponent extends UIComponent {
  public service: string = 'http://localhost:8015/api/pdf';
  @Input() recID = '';
  @Input() isApprover = false;
  // service =
  //   'https://ej2services.syncfusion.com/production/web-services/api/pdfviewer';
  // document = 'PDF_Succinctly.pdf';

  user?: any;
  url: string = '';
  constructor(
    private inject: Injector,
    private authStore: AuthStore,
    private esService: CodxEsService,
    private cacheSv: CacheService
  ) {
    super(inject);
    this.user = this.authStore.get();
  }

  @ViewChild('fileUpload') fileUpload!: ElementRef;
  @ViewChild('pdfviewer') pdfviewerControl!: PdfViewerComponent;
  @ViewChild('inputAuthor') inputAuthor!: ElementRef | any;
  @ViewChild('thumbnailTab') thumbnailTab!: ElementRef;
  thumbnailEle!: Element;

  signerInfo: any = {};
  fileInfo: any = {};
  zoomValue: number = 75;
  holding: number = 0;

  tmpLstSigners: Array<Object> = [];
  lstSigners: Array<Object> = [];
  lstFiles: Array<Object> = [];
  lstRenderAnnotation: Array<object> = [];
  lstZoomValue: Array<number> = [25, 30, 50, 75, 90, 100];

  file: Object = { text: 'fileName', value: 'fileID' };
  person: Object = { text: 'authorName', value: 'authorID' };

  needSuggest: boolean = false;
  autoSignState: boolean = false;

  actionsButton = [1, 2, 3, 4, 5, 6, 7, 8];
  hideThumbnail: boolean = false;

  saveAnnoQueue: Map<string, any>;

  curSelectedAnno: any;

  after_X_Second: number = 300;

  public headerRightName = [
    { text: 'Công cụ' },
    { text: 'History' },
    { text: 'Comment' },
  ];
  ajaxSetting: any;
  public headerLeftName = [{ text: 'Xem nhanh' }, { text: 'Chữ ký số' }];

  onInit() {
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

    this.tmpLstSigners.push({
      authorSignature: signature,
      authorStamp: stamp,
      authorName: 'Buu',
      type: '1',
      authorID: 'ID1',
      authorPosition: 'Giám đốc',
      fileQRCode: qr,
    });

    this.tmpLstSigners.push({
      authorSignature: signature2,
      authorStamp: stamp,
      authorName: 'Den',
      type: '1',
      authorID: 'ID2',
      authorPosition: 'Thư ký',
      fileQRCode: qr,
    });

    this.tmpLstSigners.push({
      authorSignature: signature3,
      authorStamp: stamp,
      authorName: 'Bleu',
      authorID: 'ID3',
      type: '1',
      authorPosition: 'Tổng giám đốc',
      fileQRCode: qr,
    });
    this.lstFiles = [
      {
        fileName: 'Hóa đơn: CTY TNHH Đại Trường Phát',
        fileRefNum: '123',
        fileID: '62ce675d00271d49663eeeee',
        signers: this.tmpLstSigners,
      },
      {
        fileName: 'Không có người kí',
        fileRefNum: '123',
        fileID: '62ce61fa89547b18443a0e70',
        signers: [],
      },
    ];
  }

  ngAfterViewInit() {
    this.pdfviewerControl.zoomValue = 50;
  }
  onCreated(evt: any) {
    this.thumbnailEle = this.pdfviewerControl.thumbnailViewModule.thumbnailView;

    this.thumbnailTab.nativeElement.appendChild(this.thumbnailEle);
  }

  changeSignFile(e: any) {
    this.lstSigners = e.itemData.signers;
    this.fileInfo = e.itemData;
    this.pdfviewerControl.load(e.itemData.fileID, '');
    if (!this.isApprover) {
      this.esService.getSignAreas(e.itemData.fileID).subscribe((res) => {
        console.log(e.itemData.fileID);

        this.lstRenderAnnotation = res;

        this.lstRenderAnnotation.forEach((item: any) => {
          if (['1', '2', '8'].includes(item.labelType)) {
          } else {
            let anno = {
              annotationId: item.recID,
              annotationSelectorSettings: {
                selectionBorderColor: '',
                resizerBorderColor: 'black',
                resizerFillColor: '#FF4081',
                resizerSize: 8,
                selectionBorderThickness: 1,
              },
              annotationSettings: {
                minWidth: 100,
                minHeight: 100,
                isLock: false,
              },
              author: item.signer,
              bounds: {
                height: item.location.height,
                left: item.location.left,
                width: item.location.width,
                top: item.location.top,
              },
              comments: [],
              dynamicText: item.labelValue,
              fillColor: '#ffffff00',
              font: {
                isBold: false,
                isItalic: false,
                isStrikeout: false,
                isUnderline: false,
                version: undefined,
              },
              fontColor: '#000',
              fontFamily: item.fontStyle,
              fontSize: item.fontSize,
              isPrint: true,
              isReadonly: false,
              modifiedDate: item.modifiedOn,
              opacity: 1,
              pageNumber: item.location.pageNumber,
              review: {
                state: 'Unmarked',
                stateModel: 'None',
                modifiedDate: Date(),
              },
              customData: item.signer + ':' + item.labelType,
              rotateAngle: 0,
              shapeAnnotationType: 'FreeText',
              strokeColor: '#ffffff00',
              subject: 'Text Box',
              textAlign: 'Left',
              thickness: 1,
            } as any;

            this.pdfviewerControl.add(anno);
          }
          console.log('add xong', this.pdfviewerControl.annotationCollection);
        });
      });
    }
  }

  changeSigner(e: any) {
    this.signerInfo = e.itemData;
    console.log(this.signerInfo);
  }

  changeSuggestState() {
    this.needSuggest = !this.needSuggest;
    if (this.needSuggest) {
      this.pdfviewerControl.navigation.goToLastPage();
      let lastPage = this.pdfviewerControl.pageCount - 1;
    }
  }

  changeAutoSignState(mode: number) {
    this.autoSignState = !this.autoSignState;
    if (this.autoSignState) {
      switch (mode) {
        case 0: {
          break;
        }

        case 1: {
          let signed = this.pdfviewerControl.annotationCollection.find(
            (anno) => {
              let signType: string = anno.customData.split(':')[1];
              return (
                signType === '1' &&
                this.pdfviewerControl.pageCount - 1 == anno.pageNumber
              );
            }
          );
          if (!signed) {
            this.pdfviewerControl.navigationModule.goToLastPage();

            this.test(this.pdfviewerControl.pageCount - 1);
          } else {
            this.test(this.pdfviewerControl.currentPageNumber - 1);
          }
          break;
        }

        default:
          break;
      }
    }
  }
  changeShowThumbnailState() {
    this.hideThumbnail = !this.hideThumbnail;
  }
  changeZoomValue(e: any) {
    this.zoomValue = e.zoomValue;
  }
  changeAnnotationItem(type: number) {
    if (this.inputAuthor.angularValue) {
      this.holding = type;

      switch (type) {
        case 1:
          this.url = this.signerInfo.authorSignature;
          break;

        case 2:
          this.url = this.signerInfo.authorStamp;
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
          this.url = this.signerInfo.fileQRCode;
          break;

        default:
          this.url = '';
          break;
      }
      this.addStamp(type);
    } else {
      console.log('vui long chon nguoi ki');
    }
  }

  test(pageNumber: number) {
    let anno = {
      allowedInteractions: [],
      annotationSettings: {
        minWidth: 100,
        maxWidth: 500,
        minHeight: 100,
        maxHeight: 200,
        isLock: false,
      },
      customStampName: 'main',
      comments: [],
      isPrint: true,
      modifiedDate: Date(),
      opacity: 1,
      pageNumber: 0,
      shapeAnnotationType: 'stamp',
      stampAnnotationType: 'image',
    } as any;

    let signed = this.pdfviewerControl.annotationCollection.filter(
      (annotation) => {
        let signType: string = annotation.customData.split(':')[1];
        return (
          signType === '1' &&
          this.pdfviewerControl.currentPageNumber - 1 == annotation.pageNumber
        );
      }
    );
    let unsign = this.lstSigners.filter((signer: any) => {
      return !signed.find((signedPerson) => {
        return signedPerson.author == signer.authorID;
      });
    });

    if (unsign.length > 0) {
      let locations = this.autoSign(this.lstSigners.length, 100, 100);
      for (let i = 0; i < locations.length; i++) {
        let signer = unsign[i] as any;

        anno.annotationId = Guid.newGuid();
        anno.author = signer['authorID'];
        anno.stampAnnotationPath = signer['authorSignature'];
        anno.customStampName = signer['type'];
        anno.customData = signer['authorName'] + ':' + anno.customStampName;
        anno.bounds = locations[i];
        anno.pageNumber = pageNumber;
        this.pdfviewerControl.addAnnotation(anno);
      }
    }
  }

  //create locations for all signatures
  autoSign(numberOfSignatures: number, width: number, height: number) {
    let top = this.pdfviewerControl.viewerBase.pageSize[0].height - 150;
    let left = this.pdfviewerControl.viewerBase.pageSize[0].width - 150;

    let pageWidth = this.pdfviewerControl.viewerBase.pageSize[0].width;

    let areas: any = [];

    while (numberOfSignatures > 0 && top - width > 10) {
      let res = this.suggestAreas(
        numberOfSignatures,
        top,
        left,
        width,
        height,
        pageWidth
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

  async addStamp(type: number) {
    let signed = this.pdfviewerControl.annotationCollection.find(
      (annotation) => {
        return (
          annotation.customData === this.signerInfo.authorName + ':' + type &&
          annotation.pageNumber === this.pdfviewerControl.currentPageNumber - 1
        );
      }
    );

    if (!signed) {
      // this.pdfviewerControl.navigation.goToLastPage();

      if ([1, 2, 8].includes(type)) {
        let stamp = {
          customStampName: type.toString(),
          customStampImageSource: this.url,
        };
        this.pdfviewerControl.customStamp = [stamp];
      } else {
        switch (type) {
          case 3:
            this.pdfviewerControl.freeTextSettings.defaultText =
              'Tên đầy đủ: ' + this.signerInfo.authorName;
            break;
          case 4:
            this.pdfviewerControl.freeTextSettings.defaultText =
              'Chức danh: ' + this.signerInfo.authorPosition;
            break;
          case 5:
            this.pdfviewerControl.freeTextSettings.defaultText = Date();
            break;
          case 6:
            this.pdfviewerControl.freeTextSettings.defaultText = 'Ghi chú';
            break;
          case 7:
            this.pdfviewerControl.freeTextSettings.defaultText =
              'Số văn bản: ' + this.fileInfo.fileRefNum;
            break;

          default:
            this.pdfviewerControl.freeTextSettings.defaultText = 'Ghi chú';
            break;
        }

        (this.pdfviewerControl.freeTextSettings.customData as String) =
          this.signerInfo.authorID + ':' + type;
        this.pdfviewerControl.freeTextSettings.fontSize = 30;
        this.pdfviewerControl.annotation.setAnnotationMode('FreeText');
      }
    } else {
      this.holding = 0;
      this.url = '';
    }
  }

  setStampInfo(e: any) {
    console.log(e);

    this.holding = 0;
    let curID = e.annotationId;
    let justAddAnno = this.pdfviewerControl.annotationCollection.find(
      (anno) => {
        return anno.annotationId === curID;
      }
    );
    if (!(justAddAnno.shapeAnnotationType === 'FreeText')) {
      justAddAnno.customData =
        this.signerInfo.authorName + ':' + e.customStampName;
      // justAddAnno.annotationId = this.signerInfo.authorID;
    }
    justAddAnno.author = this.signerInfo.authorID;
    justAddAnno.review.author = this.signerInfo.authorID;
    this.curSelectedAnno = justAddAnno;

    this.saveAnnoQueue.set(
      curID,
      setTimeout(
        this.saveAnnoToDB,
        this.after_X_Second,
        this.esService,
        justAddAnno,
        this.fileInfo,
        this.user
      )
    );
  }

  saveAnnoToDB(service, anno, fileInfo, user) {
    console.log('curent select', anno);

    let area: tmpSignArea = {
      RecID: anno.annotationId,
      TransID: '',
      FileID: fileInfo.fileID,
      Signer: anno.author,
      LabelType: anno.customStampName,
      LabelValue: null,
      FixedWidth: true,
      SignDate: false,
      DateFormat: new Date(),
      Location: {
        left: anno.bounds.left,
        top: anno.bounds.top,
        width: anno.bounds.width,
        height: anno.bounds.height,
        pageNumber: anno.pageNumber,
      },
      FontStyle: null,
      FontFormat: null,
      FontSize: null,
      SignatureType: 1,
      Comment: '',
      CreatedOn: new Date(),
      CreatedBy: user.userID,
      ModifiedOn: new Date(),
      ModifiedBy: user.userID,
    };

    if (!['1', '2', '8'].includes(area.LabelType)) {
      area.LabelType = anno.customData.split(':')[1];
      area.LabelValue = anno.dynamicText;
      area.FontStyle = anno.fontFamily;
      area.FontFormat = anno.fontFormat;
      area.FontSize = anno.fontSize;
    }

    service.addOrEditSignArea(area).subscribe((res) => {
      console.log('ket qua', res);
    });
  }

  resetTime(e: any) {
    console.log('su kien thay doi', e);

    let curID = e.annotationId;
    clearTimeout(this.saveAnnoQueue.get(curID));

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
        }
        break;
      default:
        break;
    }

    this.pdfviewerControl.annotationCollection[curIndex] = this.curSelectedAnno;
    this.saveAnnoQueue.set(
      curID,
      setTimeout(
        this.saveAnnoToDB,
        this.after_X_Second,
        this.esService,
        this.curSelectedAnno,
        this.fileInfo,
        this.user
      )
    );
  }

  pageChange(e: any) {
    let curImg = this.thumbnailEle.childNodes[
      e.currentPageNumber - 1
    ] as Element;
    curImg.scrollIntoView({
      behavior: 'auto',
      block: 'center',
      inline: 'center',
    });
  }

  show(e: any) {
    console.log(this.pdfviewerControl);
  }

  selectedAnnotation(e: any) {
    this.curSelectedAnno = this.pdfviewerControl.annotationCollection.find(
      (anno) => {
        return anno.annotationId === e.annotationId;
      }
    );
    console.log('current selected', this.curSelectedAnno);
  }

  clickZoom(type: string, e?: any) {
    switch (type) {
      case 'in':
        this.pdfviewerControl.magnificationModule.zoomIn();
        break;

      case 'out':
        this.pdfviewerControl.magnificationModule.zoomOut();
        break;
      case 'to':
        this.pdfviewerControl.magnificationModule.zoomTo(e.itemData.value);
        break;
      default:
        break;
    }
    this.zoomValue = this.pdfviewerControl.zoomValue;
  }

  clickPrint() {}
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
