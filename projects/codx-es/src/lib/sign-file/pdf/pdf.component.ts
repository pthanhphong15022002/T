import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  Input,
  IterableDiffers,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthStore, LangPipe, ScrollComponent, UIComponent } from 'codx-core';
import Konva from 'konva';
import { CodxEsService } from '../../codx-es.service';
import { PopupCaPropsComponent } from '../popup-ca-props/popup-ca-props.component';
import { qr } from './model/mode';
import { tmpAreaName, tmpSignArea } from './model/tmpSignArea.model';
import {
  NgxExtendedPdfViewerComponent,
  NgxExtendedPdfViewerService,
  pdfDefaultOptions,
  PdfThumbnailDrawnEvent,
} from 'ngx-extended-pdf-viewer';
import { Stage } from 'konva/lib/Stage';
@Component({
  selector: 'lib-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss'],
  providers: [NgxExtendedPdfViewerService],
})
export class PdfComponent extends UIComponent implements AfterViewInit {
  constructor(
    private inject: Injector,
    private authStore: AuthStore,
    private esService: CodxEsService,
    private actionCollectionsChanges: IterableDiffers,
    private datePipe: DatePipe
  ) {
    pdfDefaultOptions.renderInteractiveForms = false;
    pdfDefaultOptions.annotationEditorEnabled = true;
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.router.snapshot.params['funcID'];
    // var pipe = new LangPipe(this.cache);
    // pipe
    //   .transform('Ngày phát hành 1', 'lblReleaseDay', 'Sys')
    //   .subscribe((res) => {
    //     debugger;
    //   });
  }

  //Input
  @Input() recID = '12f65ad5-325b-11ed-a524-d89ef34bb550';
  @Input() isDisable = false;
  @Input() isApprover;
  @Input() stepNo = -1;
  //View Child
  @ViewChildren('actions') actions: QueryList<ElementRef>;
  @ViewChild('thumbnailTab') thumbnailTab: ElementRef;
  @ViewChild('ngxPdfView') ngxPdfView: NgxExtendedPdfViewerComponent;
  @ViewChild('qrCode') qrCode!: ElementRef;
  @ViewChild('panelLeft') panelLeft: TemplateRef<any>;
  @ViewChild('itemTmpl') itemTmpl: TemplateRef<any>;

  //core
  dialog: import('codx-core').DialogRef;
  funcID;
  user;

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
  //vll
  vllActions;

  //page
  pageMax;
  pageStep;
  pageViewMode = 'infinite-scroll';
  curPage = 1;

  //zoom
  zoomValue: any = 50;
  zoomFields = { text: 'show', value: 'realValue' };
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

  //sign area
  holding: number = 0;
  curSelectedArea: any;
  lstAreas: Array<tmpSignArea> = [];
  lstCA;
  lstCACollapseState: Array<any> = [];
  curSelectedAnnotID;
  curSelectedPageGroup;
  formAnnot: FormGroup;
  actionsButton = [1, 2, 3, 4, 5, 6, 7, 8];
  renderQRAllPage = false;

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
  lstAnnotFontSize = [10, 11, 12, 13, 15, 17, 19, 23, 31, 33, 43];
  curAnnotFontSize = 31;

  //date
  lstAnnotDateFormat = [
    'M/d/yy, h:mm a',
    'M/d/yy',
    'EEEE, MMMM d, y, h:mm:ss a zzzz',
  ];
  curAnnotDateFormat = 'M/d/yy, h:mm a';

  //style
  isBold = false;
  isItalic = false;
  isUnd = false;

  //auto sign
  needSuggest: boolean = false;
  autoSignState: boolean = false;
  signPerRow;
  direction;
  align;
  isAwait;
  areaControl;
  allowEdit;

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
  hideActions: boolean = false;

  onInit() {
    this.esService.getSignFormat().subscribe((res: any) => {
      this.signPerRow = res.signPerRow;
      this.align = res.align;
      this.direction = res.direction;
      this.areaControl = res.areaControl == '1';
      this.isAwait = res.await == '1';
      this.allowEdit = res.allowEditAreas;
      this.detectorRef.detectChanges();
    });

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
          } else {
            this.signerInfo = res.approvers[0];
          }
          this.curFileID = sf?.files[0]?.fileID;
          this.curFileUrl = res.urls[0];
          this.curSignerID = res.approvers[0]?.authorID;
          this.curSignerRecID = res.approvers[0]?.recID;
        }
        this.detectorRef.detectChanges();
      });

    this.cache.valueList('ES015').subscribe((res) => {
      this.vllActions = res.datas;
      console.log('actions', this.vllActions);
    });

    this.cache.valueList('ES024').subscribe((res) => {
      res?.datas?.forEach((font) => {
        this.lstAnnotFontStyle.push(font.text);
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

    this.detectorRef.detectChanges();
  }

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
    this.detectorRef.detectChanges();
  }

  //go to
  goToSelectedCA(ca, idx) {
    console.log('ca', ca);

    this.lstCACollapseState[idx].open = !this.lstCACollapseState[idx].open;
    this.curPage = this.lstCA[idx].signedPosPage;
    if (!ca.isVerified) {
      this.lstCACollapseState[idx].verifiedFailed =
        !this.lstCACollapseState[idx].verifiedFailed;
    }
    this.curPage = ca.signedPosPage;
  }

  goToPage(e) {
    console.log('change page', e);
    this.curPage = e.data;
    if (this.curPage < 1) {
      this.curPage = 1;
    } else if (this.curPage > this.pageMax) {
      this.curPage = this.pageMax;
    }
    //   if (!this.isDisable)
    //     this.pdfviewerControl?.navigation?.goToPage(this.curPage);
  }

  goToSelectedAnnotation(area: tmpSignArea) {
    console.log('go to selected annot phai sua');

    if (this.curPage != area.location.pageNumber + 1) {
      this.curPage = area.location.pageNumber + 1;
    }
    this.curSelectedArea = this.lstLayer
      .get(area.location.pageNumber + 1)
      .getChildren()
      .find((node) => {
        return node.attrs.id == area.recID;
      });

    if (this.curSelectedAnnotID != area.recID) {
      this.formAnnot.controls['content'].setValue(area.labelValue);
      this.isBold = area.fontFormat?.includes('bold') ? true : false;
      this.isItalic = area.fontFormat?.includes('italic') ? true : false;
      this.isUnd = area.fontFormat?.includes('underline') ? true : false;
      this.curAnnotFontSize = area.fontSize;
      this.curAnnotFontStyle = area.fontStyle;

      let tr = this.lstLayer
        .get(area.location.pageNumber + 1)
        .children.find(
          (trans) => trans.id() == 'transformer' + area.location.pageNumber
        ) as unknown as Konva.Transformer;
      tr.draggable(!area.allowEditAreas ? false : area.isLock);
      tr.nodes([this.curSelectedArea]);
      this.curSelectedAnnotID = area.recID;
      this.detectorRef.detectChanges();
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
        this.lstCA?.forEach((ca) => {
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
    return new Promise<any>((resolve, rejects) => {
      this.esService
        .updateSignFileTrans(
          this.vcWidth,
          this.vcHeight,
          this.stepNo,
          this.isAwait,
          this.user.userID,
          this.recID,
          mode,
          comment
        )
        .subscribe((status) => {
          resolve(status);
        });
    });
  }
  //before load pdf
  loadingPdf(e: any) {}
  //loaded pdf
  loadedPdf(e: any) {
    this.pageMax = e.pagesCount;
  }
  //render
  // lastRender() {
  //   let ngxCanvas = document.getElementsByTagName('canvas').item(0);
  //   let ngxCanvasParentEle = ngxCanvas.parentElement;
  //   let virtualCanvasEle = document.createElement('div');
  //   virtualCanvasEle.id = 'virtualLayer';
  //   virtualCanvasEle.style.display = 'display: flex';
  //   virtualCanvasEle.style.position = 'absolute';
  //   virtualCanvasEle.style.top = '0';
  //   virtualCanvasEle.style.left = '0';
  //   virtualCanvasEle.style.zIndex = '2';
  //   virtualCanvasEle.style.width = this.vcWidth + 'px';
  //   virtualCanvasEle.style.width = this.vcWidth + 'px';
  //   virtualCanvasEle.style.border = '1px solid blue';
  //   ngxCanvasParentEle.appendChild(virtualCanvasEle);

  //   this.xScale = this.vcWidth / this.xAt100;
  //   this.yScale = this.vcHeight / this.yAt100;

  //   this.stage = new Konva.Stage({
  //     container: 'virtualLayer',
  //     width: this.vcWidth,
  //     height: this.vcHeight,
  //   });
  //   this.layer = new Konva.Layer();

  //   this.tr = new Konva.Transformer({
  //     rotateEnabled: false,
  //   });
  //   this.layer.add(this.tr);

  //   //right click on stage
  //   this.stage.on('contextmenu', (e: any) => {
  //     e.evt.preventDefault();
  //     if (e.target === this.stage) {
  //       this.contextMenu.style.display = 'none';
  //       return;
  //     }
  //     this.curSelectedArea = e.target;
  //     console.log('dang chon', this.curSelectedArea);

  //     if (this.contextMenu) {
  //       this.contextMenu.style.display = 'initial';
  //       this.contextMenu.style.zIndex = '2';

  //       this.contextMenu.style.top = e.evt.pageY + 'px';
  //       this.contextMenu.style.left = e.evt.pageX + 'px';
  //     }
  //   });

  //   //left click
  //   this.stage.on('click', (e: any) => {
  //     if (e.target == this.stage) {
  //       this.tr.nodes([]);
  //       this.contextMenu.style.display = 'none';
  //     } else {
  //       console.log('click on', e.target);
  //       this.curSelectedArea = e.target;
  //       this.tr.nodes([e.target]);
  //     }
  //   });

  //   this.stage.add(this.layer);
  //   this.esService
  //     .getSignAreas(
  //       this.recID,
  //       this.fileInfo.fileID,
  //       this.isApprover,
  //       this.user.userID
  //     )
  //     .subscribe((res) => {
  //       this.lstAreas = res;
  //       this.detectorRef.detectChanges();

  //       this.lstAreas
  //         ?.filter((loca) => {
  //           return loca.location.pageNumber + 1 == this.curPage;
  //         })
  //         ?.forEach((area) => {
  //           console.log('area', area);

  //           let isRender = true;
  //           if (
  //             (this.isApprover || this.isDisable) &&
  //             (area.signer != this.curSignerID ||
  //               area.stepNo != this.stepNo ||
  //               area.isLock)
  //           ) {
  //             isRender = false;
  //           }
  //           if (isRender) {
  //             switch (area.labelType) {
  //               case '1': {
  //                 this.addArea(
  //                   this.lstSigners.find(
  //                     (signer) => signer.authorID == area.signer
  //                   ).signature,
  //                   'img',
  //                   area.labelType,
  //                   area.allowEditAreas,
  //                   false,
  //                   area.signer,
  //                   area.stepNo,
  //                   area
  //                 );
  //                 break;
  //               }
  //               case '2': {
  //                 this.addArea(
  //                   this.lstSigners.find(
  //                     (signer) => signer.authorID == area.signer
  //                   ).stamp,
  //                   'img',
  //                   area.labelType,
  //                   area.allowEditAreas,
  //                   false,
  //                   area.signer,
  //                   area.stepNo,
  //                   area
  //                 );
  //                 break;
  //               }
  //               case '8': {
  //                 this.addArea(
  //                   this.fileInfo.qr,
  //                   'img',
  //                   area.labelType,
  //                   area.allowEditAreas,
  //                   false,
  //                   area.signer,
  //                   area.stepNo,
  //                   area
  //                 );
  //                 break;
  //               }
  //               case '3':
  //               case '4':
  //               case '5':
  //               case '6':
  //               case '7':
  //               case '9': {
  //                 this.addArea(
  //                   area.labelValue,
  //                   'text',
  //                   area.labelType,
  //                   area.allowEditAreas,
  //                   false,
  //                   area.signer,
  //                   area.stepNo,
  //                   area
  //                 );
  //                 break;
  //               }
  //             }
  //           }
  //         });
  //       this.detectorRef.detectChanges();
  //     });

  //   this.detectorRef.detectChanges();
  // }

  // timeOutId;
  // pageRendered(e: any) {
  //   //context menu
  //   this.contextMenu = document.getElementById('contextMenu');
  //   document.getElementById('delete-btn')?.addEventListener('click', () => {
  //     this.contextMenu.style.display = 'none';
  //     this.tr.nodes([]);
  //     this.esService
  //       .deleteAreaById([
  //         this.recID,
  //         this.fileInfo.fileID,
  //         this.curSelectedArea.id(),
  //       ])
  //       .subscribe((res) => {
  //         if (res) {
  //           this.curSelectedArea.destroy();
  //           this.esService
  //             .getSignAreas(
  //               this.recID,
  //               this.fileInfo.fileID,
  //               this.isApprover,
  //               this.user.userID
  //             )
  //             .subscribe((res) => {
  //               this.lstAreas = res;
  //               this.detectorRef.detectChanges();
  //             });
  //         }
  //       });
  //   });

  //   //get canvas bounds in pdf
  //   let ngxCanvas = document.getElementsByTagName('canvas').item(0);

  //   let bounds = ngxCanvas?.getBoundingClientRect();
  //   if (bounds) {
  //     this.vcTop = bounds.top;
  //     this.vcLeft = bounds.left;
  //     this.vcWidth = bounds.width;
  //     this.vcHeight = bounds.height;
  //     if (this.stage) {
  //       this.stage.destroyChildren();
  //     }
  //     if (this.layer) {
  //       this.layer.destroyChildren();
  //     }
  //     if (this.tr) {
  //       this.tr.destroy();
  //     }

  //     clearTimeout(this.timeOutId);
  //     this.timeOutId = setTimeout(
  //       this.lastRender.bind(this),
  //       this.after_X_Second
  //     );

  //     this.detectorRef.detectChanges();
  //   }
  // }
  saveToDB(tmpArea: tmpSignArea) {
    this.esService
      .addOrEditSignArea(this.recID, this.curFileID, tmpArea, tmpArea.recID)
      .subscribe((res) => {
        console.log('da update area', tmpArea);
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
      allowEditAreas: this.allowEdit,
      signDate: false,
      dateFormat: '1',
      location: {
        top: y / this.yScale,
        left: x / this.xScale,
        width: w / this.xScale,
        height: h / this.yScale,
        pageNumber: this.curPage - 1,
      },
      stepNo: stepNo,
      fontStyle: type == 'text' ? konva.fontFamily() : '',
      fontFormat:
        type == 'text' ? konva.fontStyle() + ' ' + konva.textDecoration() : '',
      fontSize: type == 'text' ? konva.fontSize() : '',
      signatureType: 2,
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
            konva.off('dragend');
            konva.on('dragend transformend', (e: any) => {
              this.addDragResizeEevent(
                tmpArea,
                e.type,
                konva.getPosition(),
                konva.scale()
              );
            });
            this.curSelectedArea = this.needAddKonva;
            this.needAddKonva = null;
            console.log('ket qua luu', res);

            this.lstAreas.push(tmpArea);
            this.detectorRef.detectChanges();
          }
        });
    }
  }

  lstLayer: Map<number, Konva.Layer> = new Map();
  //          <pageNumber, Layer>
  pageRendered(e: any) {
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
      virtual.style.display = 'flex';
      virtual.style.position = 'absolute';
      virtual.style.top = '0';

      let canvasBounds: any;

      if (warpper) {
        warpper.appendChild(virtual);
        canvasBounds = (warpper.firstChild as Element).getBoundingClientRect();

        let stage = new Konva.Stage({
          container: id,
          id: id,
          width: canvasBounds.width,
          height: canvasBounds.height,
        });

        //get layer da luu

        if (this.lstLayer.get(e.pageNumber)) {
          let lstKonvaOnPage = this.lstLayer.get(e.pageNumber).children;
          lstKonvaOnPage?.forEach((konva) => {
            konva.scale({ x: this.xScale, y: this.yScale });
            konva.draw();
          });
          stage.add(this.lstLayer.get(e.pageNumber));
        } else {
          let layer = new Konva.Layer({
            id: id,
          });
          let tr = new Konva.Transformer({
            rotateEnabled: false,
            id: 'transformer' + e.pageNumber,
          });
          layer.add(tr);
          this.lstLayer.set(e.pageNumber, layer);

          let lstAreaOnPage = this.lstAreas?.filter((area) => {
            return area.location.pageNumber + 1 == e.pageNumber;
          });
          lstAreaOnPage?.forEach((area) => {
            let isRender = true;
            if (
              (this.isApprover || this.isDisable) &&
              (area.signer != this.curSignerID ||
                area.stepNo != this.stepNo ||
                area.isLock)
            ) {
              isRender = false;
            }
            if (isRender) {
              switch (area.labelType) {
                case '1': {
                  this.addArea(
                    this.lstSigners.find(
                      (signer) => signer.authorID == area.signer
                    ).signature,
                    'img',
                    area.labelType,
                    area.allowEditAreas,
                    false,
                    area.signer,
                    area.stepNo,
                    area
                  );
                  break;
                }
                case '2': {
                  this.addArea(
                    this.lstSigners.find(
                      (signer) => signer.authorID == area.signer
                    ).stamp,
                    'img',
                    area.labelType,
                    area.allowEditAreas,
                    false,
                    area.signer,
                    area.stepNo,
                    area
                  );
                  break;
                }
                case '8': {
                  this.addArea(
                    this.fileInfo.qr,
                    'img',
                    area.labelType,
                    area.allowEditAreas,
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
                case '7':
                case '9': {
                  this.addArea(
                    area.labelValue,
                    'text',
                    area.labelType,
                    area.allowEditAreas,
                    false,
                    area.signer,
                    area.stepNo,
                    area
                  );
                  break;
                }
              }
            }
            this.detectorRef.detectChanges();
          });
          stage.add(layer);
        }
        //stage event
        stage.on('mouseover', (mouseover: any) => {
          if (this.needAddKonva) {
            console.log('dang keo ', mouseover, 'o ', e.pageNumber);
            let tr = this.lstLayer
              .get(e.pageNumber + 1)
              .children.find(
                (trans) => trans.id() == 'transformer' + e.pageNumber
              ) as unknown as Konva.Transformer;
            tr.nodes([this.needAddKonva]);
            stage.children[0].add(this.needAddKonva);
            this.needAddKonva.position(stage.getPointerPosition());
            this.needAddKonva.startDrag();
            this.needAddKonva.on('dragend', (dragEnd) => {
              let attrs = this.needAddKonva.attrs;
              let name: tmpAreaName = JSON.parse(attrs.name);
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
                    '',
                    name.Type,
                    name.LabelType,
                    name.Signer,
                    this.stepNo,
                    this.needAddKonva
                  );
                  break;
                }
              }
            });
          }
        });
        stage.on('mouseleave', (mouseleave: any) => {
          if (this.needAddKonva) {
            this.needAddKonva.remove();
            let tr = this.lstLayer
              .get(e.pageNumber + 1)
              .children.find(
                (trans) => trans.id() == 'transformer' + e.pageNumber
              ) as unknown as Konva.Transformer;
            tr.nodes([]);
            console.log('roi khoi ', e.pageNumber, stage.children[0].children);
          }
        });

        stage.on('click', (e: any) => {
          let tr = this.lstLayer
            .get(e.pageNumber + 1)
            .children.find(
              (trans) => trans.id() == 'transformer' + e.pageNumber
            ) as unknown as Konva.Transformer;

          if (e.target == stage) {
            tr.nodes([]);
            this.contextMenu.style.display = 'none';
          } else {
            console.log('click on', e.target);
            this.curSelectedArea = e.target;
            tr.nodes([e.target]);
          }
        });
        //
      }
    }
  }
  //create area
  /*
    type = 'text' || 'img' || 'group'
    labelType = 1;Chữ ký;2;Con dấu;3;Tên đầy đủ;4;Chức danh;5;Ngày giờ;6;Ghi chú;7;Số văn bản;8;QR Code;9;Nhãn

  */
  saveQueue = new Map();
  saveAfterX = 3000;

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
    console.log(event, ' event');
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
    };
    let recID = Guid.newGuid();
    switch (type) {
      case 'text':
        var textArea = new Konva.Text({
          text: url,
          fontSize: 23,
          fontFamily: 'Arial',
          draggable: draggable,
          padding: 10,
          name: JSON.stringify(tmpName),
          id: recID,
        });
        if (isSaveToDB) {
          this.needAddKonva = textArea;
        } else {
          textArea.id(area.recID ? area.recID : textArea.id());
          textArea.draggable(!area.allowEditAreas ? false : area.isLock);
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
        img.src = url;
        img.onload = () => {
          let imgW = 200;
          let imgH = 100;
          let imgArea = new Konva.Image({
            image: img,
            width: 200,
            height: 100,
            id: recID,
            name: JSON.stringify(tmpName),
            draggable: true,
          });
          if (isSaveToDB) {
            this.needAddKonva = textArea;
          } else {
            imgArea.id(area.recID);
            imgArea.draggable(!area.allowEditAreas ? false : area.isLock);
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
  chooseSignDate = true;
  changeAnnotPro(type, recID, createdOn) {}
  changeQRRenderState(e) {
    this.renderQRAllPage = !this.renderQRAllPage;
  }
  changeAnnotationItem(type: number) {
    if (!this.isDisable && this.signerInfo && !this.isApprover) {
      this.holding = type;
      switch (type) {
        case 1:
          this.url = this.signerInfo?.signature
            ? this.signerInfo?.signature
            : '';
          break;
        case 2:
          this.url = this.signerInfo?.stamp ? this.signerInfo?.stamp : '';
          break;
        case 3:
          this.url = this.signerInfo?.fullName
            ? this.signerInfo?.fullName
            : this.vllActions[type - 1].text;
          break;
        case 4:
          this.url = this.signerInfo?.position
            ? this.signerInfo?.position
            : this.vllActions[type - 1].text;
          break;
        case 5:
          let selected = document.getElementsByClassName('date-Type');

          this.url = this.datePipe.transform(new Date(), 'M/d/yy, h:mm a');
          break;
        case 6:
          this.url = this.vllActions[5].text;
          break;
        case 7:
          this.url = this.fileInfo?.fileRefNum;
          break;
        case 8:
          this.url = qr;
          break;
        default:
          this.url = '';
          break;
      }
      if ([1, 2, 8].includes(type)) {
        if (this.url != '') {
          this.addArea(
            this.url,
            'img',
            type,
            true,
            true,
            this.curSignerID,
            this.signerInfo.stepNo
          );
        } else {
          this.addArea(
            this.signerInfo.fullName,
            'text',
            type,
            true,
            true,
            this.curSignerID,
            this.signerInfo.stepNo
          );
        }
      } else {
        this.addArea(
          this.url,
          'text',
          type,
          true,
          true,
          this.curSignerID,
          this.signerInfo.stepNo
        );
      }
    } else {
      console.log('vui long chon nguoi ki');
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
    console.log('signers', this.lstSigners);

    this.fileInfo = e.itemData;
    this.curFileID = this.fileInfo.fileID;
    this.curFileUrl = this.fileInfo.fileUrl;
    this.autoSignState = false;

    console.log('change signfile event');

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
    if (!isNaN(Number(e?.value))) {
      this.zoomValue = e.value;
    } else {
      switch (e.value) {
        case 'Auto':
          this.zoomValue = 'auto';
          return;
        case 'Fit to Width':
          this.zoomValue = 'page-width';
          return;
        case 'Fit to page':
          this.zoomValue = 'page-fit';
          return;
      }
    }
  }
  changeSigner(e: any) {
    this.signerInfo = e.itemData;
    console.log('change signer', this.signerInfo);
    this.curSignerID = this.signerInfo.authorID;
    this.curSignerRecID = this.signerInfo.recID;
    this.detectorRef.detectChanges();
  }

  changeSuggestState(e: any) {
    this.needSuggest = e.data;
    if (this.needSuggest) {
      if (this.isDisable) {
        this.curPage = this.pageMax;
      }
      // else {
      //   this.pdfviewerControl.navigation.goToLastPage();
      //   this.pdfviewerControl.scrollSettings.delayPageRequestTimeOnScroll = 300;
      // }
    }
  }
  changeAutoSignState(e: any, mode: number) {
    console.log('change changeAutoSignState chua lam');
    this.autoSignState = e.data;
  }
  //button

  //pop up
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

  //test func
  show(e: any) {
    this.getListCA();
    console.log('pdf', this.ngxPdfView);

    console.log('acction', this.actions);
  }
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
