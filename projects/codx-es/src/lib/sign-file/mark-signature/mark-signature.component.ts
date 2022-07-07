import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { time } from 'console';
import { CodxEsService } from '../../codx-es.service';
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
} from './model/mode';
import {
  DynamicStampItem,
  PdfViewerComponent,
} from '@syncfusion/ej2-angular-pdfviewer';
@Component({
  selector: 'app-mark-signature',
  templateUrl: './mark-signature.component.html',
  styleUrls: ['./mark-signature.component.scss'],
})
export class MarkSignatureComponent implements OnInit {
  public service: string =
    'https://ej2services.syncfusion.com/production/web-services/api/pdfviewer';

  public filePdf: string = '';

  url: string = '';
  constructor() {}

  @ViewChild('fileUpload') fileUpload!: ElementRef;
  @ViewChild('pdfviewer') pdfviewerControl!: PdfViewerComponent;
  @ViewChild('inputAuthor') inputAuthor!: ElementRef | any;
  @ViewChild('thumbnailTab') thumbnailTab!: ElementRef;
  thumbnailEle!: Element;

  signerInfo: any = {};
  zoomValue: number = 75;
  holding: string = '';

  tmpLstSigners: Array<Object> = [];
  lstSigners: Array<Object> = [];
  lstFiles: Array<Object> = [];
  lstTextOnPdf: any;

  public file: Object = { text: 'fileName', value: 'fileID' };
  public person: Object = { text: 'authorName', value: 'authorID' };

  public headerRightName = [
    { text: 'Công cụ' },
    { text: 'History' },
    { text: 'Comment' },
  ];

  public headerLeftName = [{ text: 'Xem nhanh' }, { text: 'Chữ ký số' }];

  ngOnInit() {
    this.tmpLstSigners.push({
      authorSignature: signature,
      authorStamp: stamp,
      authorName: 'Buu',
      authorID: 'ID1',
      authorPosition: position,
      dateTime: time,
      note: note,
      fileRefNumber: refNumber,
      fileQRCode: qr,
    });

    this.tmpLstSigners.push({
      authorSignature: signature2,
      authorStamp: stamp,
      authorName: 'Den',
      authorID: 'ID2',
      authorPosition: position,
      dateTime: time,
      note: note,
      fileRefNumber: refNumber,
      fileQRCode: qr,
    });

    this.tmpLstSigners.push({
      authorSignature: signature3,
      authorStamp: stamp,
      authorName: 'Bleu',
      authorID: 'ID3',
      authorPosition: position,
      dateTime: time,
      note: note,
      fileRefNumber: refNumber,
      fileQRCode: qr,
    });

    this.lstFiles = [
      {
        fileName: 'Hóa đơn:',
        fileID: '1234',
        signers: null,
      },
      {
        fileName: 'Hóa đơn: CTY TNHH Đại Trường Phát',
        fileID: '123',
        signers: this.tmpLstSigners,
      },
    ];
    this.filePdf = pdfContent;
  }

  ngAfterViewInit() {
    this.pdfviewerControl.zoomValue = 75;
  }
  onCreated(evt: any) {
    this.pdfviewerControl.load(pdfContent, '');

    this.thumbnailEle = this.pdfviewerControl.thumbnailViewModule.thumbnailView;
    this.thumbnailTab.nativeElement.appendChild(this.thumbnailEle);
  }

  changeSignFile(e: any) {
    this.lstSigners = e.itemData.signers;
  }
  changeSigner(e: any) {
    this.signerInfo = e.itemData;
  }
  changeAnnotationItem(type: string) {
    if (this.inputAuthor.angularValue) {
      this.holding = type;

      switch (type) {
        case 'signature':
          this.url = this.signerInfo.authorSignature;
          break;

        case 'stamp':
          this.url = this.signerInfo.authorStamp;
          break;

        case 'name':
          break;

        case 'position':
          this.url = this.signerInfo.authorPosition;
          break;

        case 'time':
          break;

        case 'note':
          break;

        case 'refNumber':
          this.url = this.signerInfo.fileRefNumber;
          break;

        case 'qr':
          this.url = this.signerInfo.fileQRCode;
          break;

        default:
          break;
      }
      this.addStamp(type);
    } else {
      console.log('vui long chon nguoi ki');
    }
  }

  selectAllTextOnPage(e: any) {
    console.log('done');
    console.log(e);
  }
  test() {
    `
    Bottom: 1029.76
    Height: 10.583679
    IsEmpty: false
    Left: 739.0178
    Location:
    IsEmpty: false
    X: 739.0178
    Y: 1019.17633
    [[Prototype]]: Object
    Right: 742.9039
    Size: "3.8860676, 10.583679"
    Top: 1019.17633
    Width: 3.8860676
    X: 739.0178
    Y: 1019.17633
    `;
    let anno = {
      allowedInteractions: [],
      annotationSettings: {
        minWidth: 100,
        maxWidth: 500,
        minHeight: 100,
        maxHeight: 200,
        isLock: false,
      },
      annotationId: Guid.newGuid(),
      author: 'Den',
      comments: [],
      isPrint: true,
      modifiedDate: Date(),
      customData: 'sub',
      opacity: 1,
      pageNumber: 0,
      shapeAnnotationType: 'stamp',
      stampAnnotationType: 'image',
    } as any;

    this.pdfviewerControl.viewerBase.textLayer;
    this.pdfviewerControl.addAnnotation(anno);
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
          //cung trang
          (anno.pageNumber == this.pdfviewerControl.currentPageNumber - 1 &&
            //de tren
            anno.bounds.top >= suggestLocation.top &&
            anno.bounds.top <= suggestLocation.top + suggestLocation.height) ||
          //de duoi
          (anno.bounds.top <= suggestLocation.top &&
            anno.bounds.top + +anno.bounds.height <= suggestLocation.top &&
            //de ben trai
            anno.bounds.left <= suggestLocation.left + suggestLocation.width &&
            anno.bounds.left >= suggestLocation.left) ||
          //de ben phai
          (anno.bounds.left <= suggestLocation.left &&
            anno.bounds.left + anno.bounds.width >= suggestLocation.left)
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

  addStamp(type: string) {
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
      if (
        ['note', 'name', 'time'].findIndex((typeName) => typeName === type) ===
        -1
      ) {
        let stamp = {
          customStampName: type,
          customStampImageSource: this.url,
        };
        this.pdfviewerControl.customStamp = [stamp];
      } else {
        this.pdfviewerControl.freeTextSettings.defaultText = type;
        this.pdfviewerControl.annotation.setAnnotationMode('FreeText');
      }
    } else {
      this.holding = '';
      this.url = '';
    }
  }

  setStampInfo(e: any) {
    this.holding = '';
    let justAddAnno = this.pdfviewerControl.annotationCollection.find(
      (anno) => {
        return anno.annotationId === e.annotationId;
      }
    );
    if (justAddAnno.shapeAnnotationType === 'FreeText') {
    } else {
      justAddAnno.customData =
        this.signerInfo.authorName + ':' + e.customStampName;
    }
    justAddAnno.author = this.signerInfo.authorName;
    console.log(justAddAnno);
  }

  show(e: any) {
    console.log(this.pdfviewerControl.textSearchModule.getPDFDocumentTexts());
  }

  clickZoom(type: string) {
    switch (type) {
      case 'in':
        this.pdfviewerControl.magnificationModule.zoomIn();
        break;

      case 'out':
        this.pdfviewerControl.magnificationModule.zoomOut();
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
