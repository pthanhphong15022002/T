import {
  Component,
  ElementRef,
  Injector,
  Input,
  IterableDiffers,
  ViewChild,
  ViewChildren,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import {
  AnnotationAddEventArgs,
  AnnotationDataFormat,
  PdfViewerComponent,
} from '@syncfusion/ej2-angular-pdfviewer';
import { AuthStore, UIComponent } from 'codx-core';
import { CodxEsService } from '../../codx-es.service';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { QRCodeGenerator } from '@syncfusion/ej2-barcode-generator';
import { tmpSignArea } from './model/tmpSignArea.model';
import { qr } from './model/mode';

@Component({
  selector: 'lib-pdf-view',
  templateUrl: './pdf-view.component.html',
  styleUrls: ['./pdf-view.component.scss'],
})
export class PdfViewComponent extends UIComponent implements AfterViewInit {
  public service: string = environment.pdfUrl;
  @Input() recID = '';
  @Input() isApprover;
  isActiveToSign: boolean = false;

  user?: any;
  url: string = '';

  actionCollection: any;
  actionCollectionsChange: any;
  approveStatus;

  saveToDBQueueChange: any;

  vllActions: any;

  funcID;

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
  @ViewChildren('pdfviewer')
  pdfviewerControls: QueryList<PdfViewerComponent>;
  @ViewChild('inputAuthor') inputAuthor!: ElementRef | any;
  @ViewChild('thumbnailTab') thumbnailTab!: ElementRef;
  @ViewChild('qrCode') qrCode!: ElementRef;
  pdfviewerControl: PdfViewerComponent;
  thumbnailEle!: Element;

  signerInfo: any;
  fileInfo: any = {};
  zoomValue: number = 75;
  holding: number = 0;

  tmpLstSigners: Array<Object> = [];
  lstSigners: Array<any> = [];
  lstFiles: Array<Object> = [];
  lstRenderAnnotation: Array<object> = [];
  lstZoomValue: Array<number> = [25, 30, 50, 75, 90, 100];

  file: Object = { text: 'fileName', value: 'fileID' };
  person: Object = { text: 'authorName', value: 'authorID' };

  needSuggest: boolean = false;
  autoSignState: boolean = false;

  actionsButton = [1, 2, 3, 4, 5, 6, 7, 8];
  hideThumbnail: boolean = true;
  hideActions: boolean = false;

  saveAnnoQueue: Map<string, any>;

  curSelectedAnno: any;

  after_X_Second: number = 3000;

  formatForAreas: Array<any> = [];

  cannotAct = false;

  public headerRightName = [
    { text: 'Công cụ' },
    { text: 'History' },
    { text: 'Comment' },
  ];

  public headerLeftName = [{ text: 'Xem nhanh' }, { text: 'Chữ ký số' }];

  ajaxSetting: any;

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

    // this.tmpLstSigners.push({
    //   authorSignature: signature,
    //   authorStamp: stamp,
    //   authorName: 'Buu',
    //   type: '1',
    //   authorID: 'ADMIN',
    //   authorPosition: 'Giám đốc',
    //   fileQRCode: qr,
    // });

    this.esService
      .getSFByID([this.recID, this.user?.userID, this.isApprover])
      .subscribe((res: any) => {
        console.log('sf', res);

        let sf = res?.signFile;

        if (sf) {
          this.approveStatus = sf.approveStatus;
          sf.files.forEach((file) => {
            this.lstFiles.push({
              fileName: file.fileName,
              fileRefNum: sf.refNo,
              fileID: file.fileID,
              signers: res?.approvers,
              // signers: this.tmpLstSigners,
            });
          });
          if (this.isApprover) {
            this.signerInfo = res?.approvers;
          }
        }
        this.detectorRef.detectChanges();
      });

    this.cache.valueList('ES015').subscribe((res) => {
      this.vllActions = res.datas;
    });
  }

  ngDoCheck() {}

  ngAfterViewInit() {}

  onCreated(evt: any) {
    if (this.pdfviewerControls.first) {
      this.pdfviewerControl = this.pdfviewerControls.first;
    } else {
      this.pdfviewerControls.changes.subscribe(
        (comps: QueryList<PdfViewerComponent>) => {
          this.pdfviewerControl = comps.first;

          this.detectorRef.detectChanges();
        }
      );
    }
    this.thumbnailEle = this.pdfviewerControl.thumbnailViewModule.thumbnailView;
    this.thumbnailTab.nativeElement.appendChild(this.thumbnailEle);
    this.pdfviewerControl.zoomValue = 50;
    this.pdfviewerControl.contextMenuSettings.contextMenuItems = [
      16, 128, 256, 30,
    ];
    this.detectorRef.detectChanges();
  }

  loadingAnnot(e: any) {
    this.pdfviewerControl.zoomValue = 50;
    this.esService.getSignFormat().subscribe((res) => {
      console.log('res', res);
    });
    this.esService
      .getSignAreas([
        this.recID,
        this.fileInfo?.fileID,
        this.isApprover,
        this.user?.userID,
      ])
      .subscribe((res) => {
        if (res) {
          this.lstRenderAnnotation = res;
          this.lstRenderAnnotation.forEach((item: any) => {
            let anno = {
              annotationId: item.recID,
              annotationSelectorSettings: {
                selectionBorderColor: '',
                resizerBorderColor: 'black',
                resizerFillColor: '#FF4081',
                resizerSize: 8,
                isLock: true,
                selectionBorderThickness: 1,
              },
              annotationSettings: {
                minWidth: 100,
                minHeight: 100,
                isLock: false,
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
                  anno.stampAnnotationPath = curSignerInfo?.signature;
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
              if (anno.stampAnnotationPath != '') {
                anno.shapeAnnotationType = 'stamp';
                anno.stampAnnotationType = 'image';
              } else {
                anno.shapeAnnotationType = 'FreeText';
                anno.dynamicText = curSignerInfo.fullName;
                anno.subject = 'Text Box';
              }
            }

            if (this.isApprover) {
              if (
                this.lstRenderAnnotation.indexOf(item) ==
                this.lstRenderAnnotation.length - 1
              ) {
                anno.annotationSelectorSettings.isLock = false;
              } else {
                anno.annotationSelectorSettings.isLock = true;
              }
            }

            this.pdfviewerControl.addAnnotation(anno);
          });
        }
      });
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
      mode: 'Canvas',
      displayText: { visibility: false },
      value: text,
    });
    barcode.appendTo('#qrCode');
    let barCodeUrl = '';
    await barcode.exportAsBase64Image('PNG').then((value) => {
      barCodeUrl = value;
      this.qrCode.nativeElement.firstChild.remove();
    });
    return barCodeUrl;
  }

  changeSignFile(e: any) {
    this.lstSigners = e.itemData.signers;
    this.fileInfo = e.itemData;
    this.pdfviewerControl.load(e.itemData.fileID, '');
    this.cannotAct = false;
    console.log(e.itemData);

    this.detectorRef.detectChanges();
  }

  changeSigner(e: any) {
    this.signerInfo = e.itemData;
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
                this.runAutoSign(
                  this.pdfviewerControl.pageCount - 1,
                  mode,
                  res.Y + 31
                );
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
      tmpCollections.forEach((curAnnot) => {
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

  changeAnnotationItem(type: number) {
    if (this.signerInfo && (this.isActiveToSign || !this.isApprover)) {
      this.holding = type;

      switch (type) {
        case 1:
          this.url = this.signerInfo?.signature;
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
      annotationSettings: {
        minWidth: 100,
        maxWidth: 500,
        minHeight: 100,
        maxHeight: 200,
        isLock: false,
      },
      customStampName: '1',
      comments: [],
      note: mode.toString(),
      isPrint: true,
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
      let locations = this.autoSign(
        this.lstSigners.length,
        100,
        100,
        top,
        left
      );
      for (let i = 0; i < locations.length; i++) {
        let signer = unsign[i] as any;
        anno.annotationId = Guid.newGuid();
        anno.author = signer['authorID'];
        anno.stampAnnotationPath = signer['signature'];
        anno.customStampName = '1';
        anno.customData = signer['authorID'] + ':' + anno.customStampName;
        anno.bounds = locations[i];
        anno.pageNumber = pageNumber;
        this.pdfviewerControl.addAnnotation(anno);
        this.saveAnnoQueue.set(
          anno.annotationId,
          setTimeout(
            this.saveAnnoToDB.bind(this),
            this.after_X_Second + 500 * i,
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
  autoSign(
    numberOfSignatures: number,
    width: number,
    height: number,
    top: number,
    left: number
  ) {
    let pageWidth = this.pdfviewerControl.viewerBase.pageSize[0].width;
    let pageHeight = this.pdfviewerControl.viewerBase.pageSize[0].height;
    let areas: any = [];

    // while (numberOfSignatures > 0 && top - width > 10) {
    //   let res = this.suggestAreas(
    //     numberOfSignatures,
    //     top,
    //     left,
    //     width,
    //     height,
    //     pageWidth
    //   );
    //   areas = areas.concat(res[0]);
    //   top = res[1];
    //   numberOfSignatures -= res[0].length;
    // }

    let signPerRow = 3;
    let direct = 1;
    let align = 3;
    while (numberOfSignatures > 0 && pageHeight - top >= width + 10) {
      let res = this.suggestAreasVer2(
        numberOfSignatures,
        signPerRow,
        direct,
        top,
        width,
        height,
        pageWidth,
        align
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

    if (this.url != '')
      signed = this.pdfviewerControl.annotationCollection.find((annotation) => {
        return (
          annotation.customData === this.signerInfo?.authorID + ':' + type &&
          annotation.pageNumber === this.pdfviewerControl.currentPageNumber - 1
        );
      });

    if (!signed) {
      if ([1, 2, 8].includes(type) && this.url != '') {
        let stamp = {
          customStampName: type.toString(),
          customStampImageSource: this.url,
        };
        this.pdfviewerControl.customStamp = [stamp];
      } else {
        switch (type) {
          case 1:
          case 2:
          case 8:
            this.pdfviewerControl.freeTextSettings.defaultText =
              this.vllActions[type - 1]?.text;
            break;
          case 3:
            this.pdfviewerControl.freeTextSettings.defaultText =
              this.vllActions[type - 1]?.text +
              ': ' +
              this.signerInfo?.fullName;
            break;
          case 4:
            this.pdfviewerControl.freeTextSettings.defaultText =
              this.vllActions[type - 1]?.text +
              ': ' +
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
              this.vllActions[type - 1]?.text + ': ' + this.fileInfo.fileRefNum;
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

        this.pdfviewerControl.freeTextSettings.fontSize = 30;
        this.pdfviewerControl.annotationModule.setAnnotationMode('FreeText');
      }
    } else {
      this.holding = 0;
      this.url = '';
    }
  }

  addAnnoEvent(e: AnnotationAddEventArgs) {
    console.log('add event', e);

    this.holding = 0;
    let curID = e.annotationId;
    let justAddAnno = this.pdfviewerControl.annotationCollection.find(
      (anno) => {
        return anno.annotationId === curID;
      }
    );
    if (!(justAddAnno.shapeAnnotationType === 'FreeText')) {
      justAddAnno.customData =
        this.signerInfo?.authorID + ':' + e.customStampName;
    }
    justAddAnno.author = this.signerInfo?.authorID;
    justAddAnno.review.author = this.signerInfo?.authorID;
    this.curSelectedAnno = justAddAnno;

    if (this.curSelectedAnno) {
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

  saveAnnoToDB(service, anno, fileInfo, user) {
    console.log('save event');
    let area: tmpSignArea = {
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
      CreatedBy: user.userID,
      ModifiedBy: user.userID,
    };
    console.log('save area', area);

    if (!['1', '2', '8'].includes(area.LabelType)) {
      area.LabelType = anno.customData.split(':')[1];
      area.LabelValue = anno.dynamicText;
      area.FontStyle = anno.fontFamily;
      area.FontFormat = anno.fontFormat;
      area.FontSize = anno.fontSize;
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
            let tmpCollections = [
              ...this.pdfviewerControl.annotationCollection,
            ];
            this.pdfviewerControl.deleteAnnotations();
            tmpCollections.forEach((curAnnotation) => {
              this.pdfviewerControl.addAnnotation(curAnnotation);
            });
          }
        }
      });
  }

  removeAnnot(e: any) {
    console.log('remove event', e);

    this.esService
      .deleteAreaById([this.recID, this.fileInfo.fileID, e.annotationId])
      .subscribe((res) => {});

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

  pageChange(e: any) {
    // let curImg = this.thumbnailEle.childNodes[
    //   e.currentPageNumber - 1
    // ] as Element;
    // curImg.scrollIntoView({
    //   behavior: 'auto',
    //   block: 'center',
    //   inline: 'center',
    // });
  }

  testFunc(e: any) {
    this.esService
      .toPDF(['62ea2856d263513fc83fcfc1', '.xls'])
      .subscribe((res) => {
        console.log(res);
      });
  }

  selectedAnnotation(e: any) {
    console.log(e);

    this.curSelectedAnno = this.pdfviewerControl.annotationCollection.find(
      (anno) => {
        return anno.annotationId === e.annotationId;
      }
    );
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

  clickDownload() {
    this.pdfviewerControl.downloadFileName = this.fileInfo.fileName;
    this.pdfviewerControl.download();
  }

  clickPrint(args) {}

  renderQRFile() {
    let annotationDataFormat: AnnotationDataFormat;

    let qrAnnot = this.pdfviewerControl?.annotationCollection?.find((annot) => {
      return annot.customData.split(':')[1] == '8';
    });

    this.genFileQR(this.fileInfo.fileName, this.fileInfo.fileRefNum, '').then(
      (value: string) => {
        qrAnnot.stampAnnotationPath = value;
        if (qrAnnot) {
          this.pdfviewerControl.annotationModule.deleteAnnotationById(
            qrAnnot.annotationId
          );
          this.saveAnnoQueue.set(
            qrAnnot.annotationId,
            setTimeout(
              this.saveAnnoToDB.bind(this),
              10,
              this.esService,
              { ...qrAnnot },
              this.fileInfo,
              this.user
            )
          );
          for (let i = 0; i < this.pdfviewerControl.pageCount - 1; i++) {
            let cloneQR = { ...qrAnnot };
            cloneQR.annotationId = Guid.newGuid();
            cloneQR.pageNumber = i;
            this.pdfviewerControl.addAnnotation(cloneQR);
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

  show(e: any) {
    console.log('collection', this.pdfviewerControl.annotationCollection);
  }
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
