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
  TextLayerRenderedEvent,
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

  // @ViewChild('panelLeft') panelLeft: TemplateRef<any>;
  // @ViewChild('itemTmpl') itemTmpl: TemplateRef<any>;

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
  tr: Konva.Transformer;

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
  maxTop = -1;
  maxTopDiv;
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
      this.signPerRow = res.SignPerRow;
      this.align = res.Align;
      this.direction = res.Direction;
      this.areaControl = res.AreaControl == '1';
      this.isAwait = res.Await == '1';
      this.allowEdit = res.AllowEditAreas ? res.AllowEditAreas : true;
      console.log('format', res);

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
          this.curSignerID = this.signerInfo?.authorID;
          this.curSignerRecID = this.signerInfo?.recID;
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
    this.tr = new Konva.Transformer({
      rotateEnabled: false,
      resizeEnabled: !this.isDisable,
    });
    this.detectorRef.detectChanges();
  }

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
    this.contextMenu = document.getElementById('contextMenu');
    document
      .getElementById('delete-btn')
      ?.addEventListener('click', (e: any) => {
        this.contextMenu.style.display = 'none';
        this.esService
          .deleteAreaById([
            this.recID,
            this.fileInfo.fileID,
            this.curSelectedArea.id(),
          ])
          .subscribe((res) => {
            if (res) {
              this.curSelectedArea.destroy();
              this.tr.remove();

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
          });
      });
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
  }

  goToSelectedAnnotation(area: tmpSignArea) {
    if (this.curPage != area.location.pageNumber + 1) {
      this.curPage = area.location.pageNumber + 1;
    }
    this.curSelectedArea = this.lstLayer
      .get(area.location.pageNumber + 1)
      .children?.find((node) => {
        return node?.attrs?.id == area.recID;
      });
    this.tr.remove();
    let layerChildren = this.lstLayer.get(area.location.pageNumber + 1);

    this.tr.resizeEnabled(
      this.isDisable ? false : area.allowEditAreas ? true : area.isLock
    );
    this.tr.draggable(
      this.isDisable ? false : area.allowEditAreas ? true : area.isLock
    );
    this.tr.nodes([this.curSelectedArea]);
    layerChildren.add(this.tr);
    if (this.curSelectedAnnotID != area.recID) {
      this.formAnnot.controls['content'].setValue(area.labelValue);
      this.isBold = area.fontFormat?.includes('bold') ? true : false;
      this.isItalic = area.fontFormat?.includes('italic') ? true : false;
      this.isUnd = area.fontFormat?.includes('underline') ? true : false;
      this.curAnnotFontSize = area.fontSize;
      this.curAnnotFontStyle = area.fontStyle;

      // let tr = this.lstLayer
      //   .get(area.location.pageNumber + 1)
      //   .children.find(
      //     (trans) => trans.id() == 'transformer' + area.location.pageNumber
      //   ) as unknown as Konva.Transformer;
      // tr.visible(true);
      this.tr.draggable(!area.allowEditAreas ? false : area.isLock);
      this.tr.nodes([this.curSelectedArea]);
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
      let layer = this.lstLayer.get(this.pageMax);
      let top = this.lstAreas
        ?.filter((area) => area.location.pageNumber + 1 == this.pageMax)
        ?.reduce((prev, curr) =>
          prev.location.top < curr.location.top ? prev : curr
        );

      let left = this.lstAreas
        ?.filter((area) => area.location.pageNumber + 1 == this.pageMax)
        ?.reduce((prev, curr) =>
          prev.location.left < curr.location.left ? prev : curr
        );
      let bot = this.lstAreas
        ?.filter((area) => area.location.pageNumber + 1 == this.pageMax)
        ?.reduce((prev, curr) =>
          prev.location.top > curr.location.top ? prev : curr
        );

      let right = this.lstAreas
        ?.filter((area) => area.location.pageNumber + 1 == this.pageMax)
        ?.reduce((prev, curr) =>
          prev.location.left > curr.location.left ? prev : curr
        );

      let y = top?.location?.top * this.yScale;
      let x = left?.location?.left * this.xScale;
      let height = (+bot.location.top + 100) * this.yScale - y + 10;
      let width = (+right.location.left + 200) * this.xScale - x + 10;

      let imgUrl = layer.toDataURL({
        quality: 1,
        x: x,
        y: y,

        width: width,
        height: height,
      });
      console.log();
      this.esService
        .updateSignFileTrans(
          imgUrl.replace('data:image/png;base64,', ''),
          x / this.xScale,
          y / this.yScale,
          width,
          height,
          this.pageMax,
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
    console.log('page max', this.pageMax);
    let ngxService: NgxExtendedPdfViewerService =
      new NgxExtendedPdfViewerService();
    ngxService.addPageToRenderQueue(this.pageMax);
  }

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
            console.log('ket qua luu', this.lstAreas);
          }
        });
    }
  }

  lstLayer: Map<number, Konva.Layer> = new Map();
  //          <pageNumber, Layer>
  pageW = 0;
  pageH = 0;
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
        this.xScale = canvasBounds.width / 794;
        this.yScale = canvasBounds.height / 1123;
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
            opacity: 1,
          });

          this.lstLayer.set(e.pageNumber, layer);

          let lstAreaOnPage = this.lstAreas?.filter((area) => {
            return area.location.pageNumber + 1 == e.pageNumber;
          });
          lstAreaOnPage?.forEach((area) => {
            let isRender = false;
            if (
              (!this.isApprover && !area.isLock) ||
              (this.isApprover &&
                area.signer == this.curSignerID &&
                area.stepNo == this.stepNo)
            ) {
              isRender = true;
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
                    this.isDisable
                      ? !this.isDisable
                      : area.allowEditAreas
                      ? area.allowEditAreas
                      : !area.isLock,
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
                    this.isDisable
                      ? !this.isDisable
                      : area.allowEditAreas
                      ? area.allowEditAreas
                      : !area.isLock,
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
        stage.on('mouseenter', (mouseover: any) => {
          if (this.needAddKonva) {
            this.tr.nodes([this.needAddKonva]);
            stage.children[0].add(this.tr);
            stage.children[0].add(this.needAddKonva);
            this.needAddKonva.position(stage.getPointerPosition());
            this.needAddKonva.startDrag();
            this.needAddKonva.on('dragend', (dragEnd) => {
              if (this.needAddKonva) {
                let attrs = this.needAddKonva.attrs;
                let name: tmpAreaName = JSON.parse(attrs.name);
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
                console.log('tha ra ', this.needAddKonva.parent?.attrs?.id);
              }
              this.needAddKonva = null;
            });
          }
        });

        //left click
        stage.on('click', (click: any) => {
          let layerChildren = this.lstLayer.get(e.pageNumber);

          if (click.target == stage) {
            this.contextMenu.style.display = 'none';
            this.tr.remove();
            this.tr.nodes([]);
          } else {
            console.log('click on', click.target);
            this.curSelectedArea = click.target;
            this.tr.nodes([click.target]);
            layerChildren.add(this.tr);
          }
        });
        //right click
        stage.on('contextmenu', (e: any) => {
          e.evt.preventDefault();
          if (e.target === stage) {
            this.contextMenu.style.display = 'none';
            return;
          }
          this.curSelectedArea = e.target;
          console.log('dang chon', this.curSelectedArea);

          if (this.contextMenu) {
            this.contextMenu.style.display = 'initial';
            this.contextMenu.style.zIndex = '2';

            this.contextMenu.style.top = e.evt.pageY + 'px';
            this.contextMenu.style.left = e.evt.pageX + 'px';
          }
        });
      }
    }
  }

  getTextLayerInfo(txtLayer: TextLayerRenderedEvent) {
    if (txtLayer.pageNumber == this.pageMax) {
      txtLayer?.source.textDivs.forEach((div) => {
        if (Number(div.style.top.replace('px', '')) > this.maxTop) {
          this.maxTop = Number(div.style.top.replace('px', ''));
          this.maxTopDiv = div;
        }
      });

      console.log('max div', this.maxTopDiv);
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
    this.stepNo = stepNo;

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
          textArea.scale({
            x: this.xScale,
            y: this.yScale,
          });
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
        img.setAttribute('crossOrigin', 'anonymous');

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
            imgArea.scale({ x: this.xScale, y: this.yScale });
            this.needAddKonva = imgArea;
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
  changeAnnotPro(type, recID) {
    console.log('dang chon ', this.curSelectedArea);
    switch (type) {
      case '6': {
        this.curSelectedArea.text(this.formAnnot.value.content);
        this.curSelectedArea.attrs.fontSize = this.formAnnot.value.fontSize;
        this.curSelectedArea.attrs.fontFamily = this.formAnnot.value.fontStyle;
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
        this.curSelectedArea.draw();
        this.tr.forceUpdate();
        //save to db
        let y = this.curSelectedArea.position().y;
        let x = this.curSelectedArea.position().x;
        let w = this.xScale;
        let h = this.yScale;
        let tmpName: tmpAreaName = JSON.parse(this.curSelectedArea.attrs.name);
        let t = new Konva.Text({});
        t.draggable();
        let tmpArea: tmpSignArea = {
          signer: tmpName.Signer,
          labelType: tmpName.LabelType,
          labelValue: '',
          isLock: this.curSelectedArea.draggable(),
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
          stepNo: tmpName.StepNo,
          fontStyle: this.curSelectedArea.attrs.fontFamily,
          fontFormat:
            this.curSelectedArea.attrs.fontStyle +
            this.curSelectedArea.attrs.textDecoration,
          fontSize: this.curSelectedArea.attrs.fontSize,
          signatureType: 2,
          comment: '',
          createdBy: tmpName.Signer,
          modifiedBy: tmpName.Signer,
          recID: this.curSelectedArea.attrs.id,
        };
        this.saveToDB(tmpArea);
      }
    }
  }

  changeQRRenderState(e) {
    this.renderQRAllPage = !this.renderQRAllPage;
  }
  changeAnnotationItem(type: number) {
    let isSigned = this.lstLayer.get(this.curPage).find((child) => {
      if (child == Konva.Text || child == Konva.Image) {
        let tmpInfo: tmpAreaName = JSON.parse(child?.attrs?.name);
        return tmpInfo?.Signer == this.curSignerID && [1, 2].includes(type)
          ? true
          : false;
      }
      return false;
    });
    if (!this.isDisable && this.signerInfo && isSigned?.length == 0) {
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
      this.holding = 0;
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
    this.stepNo = this.signerInfo.stepNo;
    this.curSignerRecID = this.signerInfo.recID;
    this.detectorRef.detectChanges();
  }

  changeSuggestState(e: any) {
    this.needSuggest = e.data;
    if (this.needSuggest) {
      this.curPage = this.pageMax;
    }
  }

  changeAutoSignState(e: any, mode: number) {
    if (e.data && !this.autoSignState) {
      this.curPage = this.pageMax;
      this.autoSign();
    }
    this.autoSignState = e.data;
    this.detectorRef.detectChanges();
  }

  autoSign() {
    //da co vung ky
    let lstSigned = this.lstAreas.filter((area) => {
      return (
        area.signer &&
        ['1', '2', '8'].includes(area.labelType) &&
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
    lstUnsign.forEach((person, idx) => {
      let url = '';
      let labelType = '';
      switch (person.signType) {
        //chu ky
        case 'S1':
        case 'S2': {
          url = person.signature;
          labelType = '1';
          break;
        }

        //con dau
        case 'S3': {
          url = person.stamp;
          labelType = '2';
          break;
        }

        default: {
          break;
        }
      }

      if (url != '' && labelType != '') {
        let recID = Guid.newGuid();
        const img = document.createElement('img') as HTMLImageElement;
        img.setAttribute('crossOrigin', 'anonymous');
        img.src = url;
        img.onload = () => {
          console.log('url', url);

          let tmpName: tmpAreaName = {
            Signer: person.authorID,
            Type: 'img',
            PageNumber: this.curPage - 1,
            StepNo: person.stepNo,
            LabelType: labelType,
          };
          let imgArea = new Konva.Image({
            image: img,
            width: imgW,
            height: 100,
            x: unsignIdx[idx],
            y: this.maxTop + 10,
            id: recID,
            name: JSON.stringify(tmpName),
            draggable: true,
          });
          imgArea.scale({ x: this.xScale, y: this.yScale });

          //save to db

          let y = imgArea.position().y;
          let x = imgArea.position().x;
          let w = this.xScale;
          let h = this.yScale;

          let tmpArea: tmpSignArea = {
            signer: person.authorID,
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

          let layer = this.lstLayer.get(this.pageMax);
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
                console.log('ket qua luu', this.lstAreas);
              }
            });
        };
      }
    });
  }

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
    let layer = this.lstLayer.get(this.pageMax);
    let top = this.lstAreas
      ?.filter((area) => area.location.pageNumber + 1 == this.pageMax)
      ?.reduce((prev, curr) =>
        prev.location.top < curr.location.top ? prev : curr
      );

    let left = this.lstAreas
      ?.filter((area) => area.location.pageNumber + 1 == this.pageMax)
      ?.reduce((prev, curr) =>
        prev.location.left < curr.location.left ? prev : curr
      );
    let bot = this.lstAreas
      ?.filter((area) => area.location.pageNumber + 1 == this.pageMax)
      ?.reduce((prev, curr) =>
        prev.location.top > curr.location.top ? prev : curr
      );

    let right = this.lstAreas
      ?.filter((area) => area.location.pageNumber + 1 == this.pageMax)
      ?.reduce((prev, curr) =>
        prev.location.left > curr.location.left ? prev : curr
      );

    let y = top?.location?.top * this.yScale;
    let x = left?.location?.left * this.xScale;
    let height = (+bot.location.top + 100) * this.yScale - y + 10;
    let width = (+right.location.left + 200) * this.xScale - x + 10;

    let imgUrl = layer.toDataURL({
      quality: 1,
      x: x,
      y: y,

      width: width,
      height: height,
    });
    console.log(imgUrl);
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
