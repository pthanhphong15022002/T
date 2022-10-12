import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  ViewChild,
  Input,
  ElementRef,
  Optional,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FileUpload,
  ItemInterval,
  Permission,
} from '@shared/models/file.model';
import { NodeTreeAdd } from '@shared/models/folder.model';
import { FileService } from '@shared/services/file.service';
import { FolderService } from '@shared/services/folder.service';
import {
  AlertConfirmInputConfig,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  NotificationsService,
  ViewsComponent,
} from 'codx-core';
import { OpenFolderComponent } from '../openFolder/openFolder.component';
import { AttachmentService } from './attachment.service';

import { ViewEncapsulation } from '@angular/core';
import {
  detach,
  isNullOrUndefined,
  createElement,
  EventHandler,
} from '@syncfusion/ej2-base';
import {
  UploaderComponent,
  FileInfo,
  SelectedEventArgs,
} from '@syncfusion/ej2-angular-inputs';
import { EditFileComponent } from 'projects/codx-dm/src/lib/editFile/editFile.component';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { from, map, mergeMap, Observable, Observer } from 'rxjs';
import { lvFileClientAPI } from '@shared/services/lv.component';
import { environment } from 'src/environments/environment';

// import { AuthStore } from '@core/services/auth/auth.store';
@Component({
  selector: 'codx-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AttachmentComponent implements OnInit, OnChanges {
  user: any;
  titlemessage = 'Thông báo';
  remote = true;
  listRemoteFolder: any;
  listNodeAdd: any;
  selectId: string;
  closeResult = '';
  onRole = false;
  folderId = '';
  path: any;
  disableSave = false;
  breadcumb: string[];
  breadcumbLink = [];
  codeMaxFileSize = 'DM057';
  codetitle = 'DM059';
  codetitle2 = 'DM058';
  titleDialog = 'Thêm tài liệu';
  title = 'Đã thêm tài liệu thành công';
  title2 = 'Vui lòng chọn tài liệu tải lên';
  titleUpload = 'Tải lên';
  titleMaxFileSiate = 'File {0} tải lên vượt quá dung lượng cho phép {1}MB';
  appName = 'hps-file-test';
  numberDes = 0;

  urlUpload = '';
  interval: ItemInterval[];
  intervalCount = 0;
  fileUploadList: FileUpload[];
  remotePermission: Permission[];
  dialog: any;
  data: any;
  isFileList = false;
  fileEditing: FileUpload;
  fileEditingTemp: FileUpload;
  maxFileSizeUpload = 0;
  maxFileSizeUploadMB = 0;
  referType: string;
  folderID: string;
  isDM: false;
  infoHDD = {
    totalHdd: 0,
    totalUsed: 0,
  };
  //ChunkSizeInKB = 1024 * 2;
  @Input() isDeleteTemp = '0';
  @Input() formModel: any;
  @Input() allowExtensions: string;
  @Input() allowMultiFile = '1';
  @Input() objectType: string;
  @Input() objectId: string;
  @Input() folderType: string;
  @Input() functionID: string;
  @Input() type: string;
  @Input() idBrowse = 'browse';
  @Input() popup = '1';
  @Input() hideBtnSave = '0';
  @Input() hideUploadBtn = '0';
  @Input() hideFolder = '0';
  @Input() hideDes = '0';
  @Input() hideDelete = '0';
  @Input() hideImageUpload = '0';
  @Input() hideImageThumb = '0';
  @Input() showMessage = '1';
  @Input() hideMoreF = '1';
  @Input() displayThumb: string;
  @Output() fileAdded = new EventEmitter();
  @ViewChild('openFile') openFile;
  @ViewChild('openFolder') openFolder;
  @ViewChild('templatefileupload') file: ElementRef;
  @Input('viewBase') viewBase: ViewsComponent;
  @Output() fileCount = new EventEmitter<any>();
  @Output() fileGet = new EventEmitter<any>();
  //tbchung thêm vào để xử lý bên import template
  @Output() filePrimitive = new EventEmitter<any>();
  @Output() viewFile = new EventEmitter<any>();
  @Output() fileDelete = new EventEmitter<any>();
  /////////////////////////////////////////////
  @ViewChild('templateupload') public uploadObj: UploaderComponent;
  // @Input('openFolder') openFolder: ViewsComponent;
  public uploadWrapper: HTMLElement = document.getElementsByClassName(
    'e-upload'
  )[0] as HTMLElement;
  public description = [];
  public parentElement: HTMLElement;
  public proxy: any;
  public progressbarContainer: HTMLElement;
  public filesDetails: FileInfo[] = [];
  public filesList: HTMLElement[] = [];
  public dropElement: HTMLElement = document.getElementsByClassName(
    'control-fluid'
  )[0] as HTMLElement;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    public modalService: NgbModal,
    private auth: AuthStore,
    private folderService: FolderService,
    public dmSV: CodxDMService,
    private fileService: FileService,
    public atSV: AttachmentService,
    public cache: CacheService,
    private callfc: CallFuncService,
    private notificationsService: NotificationsService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.user = this.auth.get();
    this.dialog = dialog;
    if (data?.data != null) {
      this.objectType = data?.data.objectType;
      this.objectId = data?.data.objectId;
      //  this.folderType = data?.data.folderType;
      this.functionID = data?.data.functionID;
      this.type = data?.data.type;
      this.popup = data?.data.popup;
      this.hideBtnSave = data?.data.hideBtnSave;
      this.folderID = data?.data.folderID;
      if (data?.data.isDM && data?.data.isDM == true)
        this.isDM = data?.data.isDM;
    }

    this.fileUploadList = [];
    this.folderType = this.dmSV.idMenuActive;
    if (this.folderType == null || this.folderType == '')
      this.folderType = 'DMT02';

    if (this.type == null || this.type == '') this.type = 'center';

    if (this.popup == null || this.popup == '') this.popup = '1';

    if (this.hideBtnSave == null || this.hideBtnSave == '')
      this.hideBtnSave = '0';

    this.dmSV.isFileUploadListAdd.subscribe((item) => {
      if (item == true) {
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  ngAfterViewInit(): void {
    // if (this.objectId != '' && this.objectId != undefined) {
    //   this.fileService.getFileNyObjectID(this.objectId).subscribe((res) => {
    //     if (res) {
    //       this.data = res;
    //       this.fileGet.emit(this.data);
    //       this.changeDetectorRef.detectChanges();
    //     }
    //   });
    // }

    if (document.getElementById(this.idBrowse) != null) {
      var list = document.getElementsByName('UploadFiles');
      if (list?.length > 0) {
        for (var i = 0; i < list.length; i++) {
          if (
            document
              .getElementsByName('UploadFiles')
              [i].getAttribute('idbutton') == null
          ) {
            document
              .getElementsByName('UploadFiles')
              [i].setAttribute('idbutton', this.idBrowse);
            break;
          }
        }
      }

      document.getElementById(this.idBrowse).onclick = () => {
        document
          .getElementsByClassName('e-file-select-wrap')[0]
          .querySelector('button')
          .click();
        return false;
      };

      this.dropElement = document.querySelector('#dropArea') as HTMLElement;
      document.getElementById(this.idBrowse).onclick = function () {
        document
          .getElementsByClassName('e-file-select-wrap')[0]
          .querySelector('button')
          .click();
        return false;
      };
    }
    // https://ej2.syncfusion.com/angular/documentation/uploader/template/#custom-template
    // https://ej2.syncfusion.com/angular/demos/#/bootstrap5/uploader/custom-file-list
    // document.getElementById('clearbtn').onclick = () => {
    //     if (!document.getElementsByClassName('upload-list-root')[0]) { return; }
    //     this.uploadObj.element.value = '';
    //     detach(document.getElementById('dropArea').querySelector('.upload-list-root'));
    //     this.filesList = [];
    //     this.filesDetails = [];
    // };
  }

  allowMultiple() {
    return this.allowMultiFile == '1' ? true : false;
  }

  // upload file tai day
  public onFileSelect(args: SelectedEventArgs): void {
    if (
      isNullOrUndefined(
        document.getElementById('dropArea').querySelector('.upload-list-root')
      )
    ) {
      this.parentElement = createElement('div', {
        className: 'upload-list-root',
      });
      this.parentElement.appendChild(
        createElement('ul', { className: 'ul-element' })
      );
      document.getElementById('dropArea').appendChild(this.parentElement);
    }
    this.handleFileInput(args.filesData);
    args.cancel = true;
  }

  public formSelectedData(selectedFiles: FileInfo, proxy: any): void {
    console.log(selectedFiles);
    let liEle: HTMLElement = createElement('li', {
      className: 'file-lists',
      attrs: { 'data-file-name': selectedFiles.name },
    });
    liEle.appendChild(
      createElement('span', {
        className: 'file-name ',
        innerHTML: selectedFiles.name,
      })
    );
    liEle.appendChild(
      createElement('span', {
        className: 'file-size ',
        innerHTML: this.uploadObj.bytesToSize(selectedFiles.size),
      })
    );
    if (selectedFiles.status === 'Ready to upload') {
      this.progressbarContainer = createElement('span', {
        className: 'progress-bar-container',
      });
      this.progressbarContainer.appendChild(
        createElement('progress', {
          className: 'progress',
          attrs: { value: '0', max: '100' },
        })
      );
      liEle.appendChild(this.progressbarContainer);
    } else {
      liEle.querySelector('.file-name').classList.add('upload-fails');
    }
    let closeIconContainer: HTMLElement = createElement('span', {
      className: 'e-icons close-icon-container',
    });
    EventHandler.add(closeIconContainer, 'click', this.removeFiles, proxy);
    liEle.appendChild(closeIconContainer);
    document.querySelector('.ul-element').appendChild(liEle);
    this.filesList.push(liEle);
  }

  public removeFiles(args: any): void {
    let status: string =
      this.filesDetails[
        this.filesList.indexOf(args.currentTarget.parentElement)
      ].status;
    if (status === 'File uploaded successfully') {
      this.uploadObj.remove(
        this.filesDetails[
          this.filesList.indexOf(args.currentTarget.parentElement)
        ]
      );
    } else {
      detach(args.currentTarget.parentElement);
    }
    this.uploadObj.element.value = '';
  }

  openPopup() {
    this.fileUploadList = [];
    // if (this.type == "center") {
    // }
    // else {
    //   //this.viewBase.currentView.openSidebarRight();
    // }
  }

  closePopup() {
    // this.notificationsService.alertCode('DM001')
    // this.cacheService.message('DM001')

    // if (this.data == undefined)
    //   this.data = [];

    // for (var i = 0; i < this.atSV.fileListAdded.length; i++) {
    //   this.data.push(Object.assign({}, this.atSV.fileListAdded[i]));
    // }

    this.fileAdded.emit({ data: this.data });

    if (this.type == 'popup') {
      this.dialog.close();
    }

    this.fileUploadList = [];
    this.changeDetectorRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.objectId != '' && this.objectId != undefined) {
      this.fileService.getFileNyObjectID(this.objectId).subscribe((res) => {
        if (res) {
          this.data = res;
          this.fileGet.emit(this.data);
          this.changeDetectorRef.detectChanges();
        }
      });
    }
  }

  ngOnInit(): void {
    //this.getFolderPath();
    this.fileService.getAllowSizeUpload().subscribe((item) => {
      if (item != null) {
        this.maxFileSizeUploadMB = item.len;
        this.maxFileSizeUpload = item.len * 1014 * 1024;
      }
    });

    this.cache.message(this.codeMaxFileSize).subscribe((item) => {
      if (item != null) {
        this.titleMaxFileSiate = item.defaultName;
      }
    });

    this.atSV.isSetDisableSave.subscribe((res) => {
      this.disableSave = res;
      this.changeDetectorRef.detectChanges();
    });

    this.cache.message(this.codetitle).subscribe((item) => {
      if (item != null) {
        this.title = item.defaultName;
      }
    });

    this.cache.message(this.codetitle2).subscribe((item) => {
      if (item != null) {
        this.title2 = item.defaultName;
      }
    });

    this.atSV.isOpenForm.subscribe((item) => {
      // alert(1);
      if (item == true) this.openPopup();
    });
    this.fileService.getTotalHdd().subscribe((item) => {
      if (item) {
        this.infoHDD.totalHdd = item?.totalHdd;
        this.infoHDD.totalUsed = item?.totalUsed;
      }
      //  totalUsed: any;
      // totalHdd: any;
      // this.getHDDInformaton(item);
    });
  }

  ngOnDestroy() {
    //   this.atSV.openForm.unsubscribe();
    // if (this.interval?.length > 0) {
    //   this.interval.forEach((element) => {
    //     clearInterval(element.instant);
    //   });
    // }
  }

  onSelectionAddChanged($data, tree) {
    var id = $data.dataItem.recID;
    this.selectId = id;
    var that = this;
    var list = tree.getBreadCumb(id);
    var pathFolder = '';
    var pathID = '';

    var breadcumb = [];
    var breadcumbLink = [];

    that.selectId = id;
    // if (that.folderId == id) {
    //   that.dmSV.setDisableSave.next(true);
    // }
    // else that.dmSV.setDisableSave.next(false);

    for (var i = list.length - 1; i >= 0; i--) {
      if (pathFolder == '') {
        pathFolder = list[i].id;
        pathID = list[i].text;
      } else {
        pathFolder = pathFolder + ';' + list[i].id;
        pathID = pathID + ';' + list[i].text;
      }
      breadcumb.push(list[i].text);
      breadcumbLink.push(list[i].id);
    }

    this.breadcumbLink = breadcumbLink;
    this.breadcumb = breadcumb;

    this.changeDetectorRef.detectChanges();
    // save to folder cache
    this.folderService
      .updateFolderCache(
        this.listNodeAdd[0].recID,
        this.functionID,
        pathFolder,
        pathID
      )
      .subscribe((item) => {});

    if ($data.dataItem.items && $data.dataItem.items.length <= 0) {
      this.folderService.getFolders(id).subscribe(async (res) => {
        tree.addChildNodes($data.dataItem, res);
        that.changeDetectorRef.detectChanges();
      });
    } else {
      this.changeDetectorRef.detectChanges();
    }
  }

  disable() {
    return this.disableSave;
  }

  getFolderPath() {
    if (this.folderId == '') {
      this.folderService
        .getFoldersByFunctionID(this.functionID)
        .subscribe(async (res) => {
          if (res != null) {
            this.listRemoteFolder = res;
            this.atSV.currentNode = '';
            this.atSV.folderId.next(res[0].folderId);
            // update breadcum
            var breadcumb = [];
            var breadcumbLink = [];
            var id = res[0].recID;
            if (res[0].history != null) {
              var listFolder = res[0].history.filter(
                (x) =>
                  x.objectType == this.functionID &&
                  x.objectID == this.user.userID
              );
              if (listFolder[0] != null && listFolder[0].folderPath != '') {
                var list = listFolder[0].folderPath.split(';');
                var listText = listFolder[0].pathDisk.split(';');
                id = list[list.length - 1];

                this.folderId = id;
                this.selectId = id;

                for (var i = 0; i < list.length; i++) {
                  breadcumb.push(listText[i]);
                  breadcumbLink.push(list[i]);
                }
              }
            } else {
              this.folderId = id;
              this.selectId = id;
              breadcumb.push(res[0].folderName);
              breadcumbLink.push(id);
            }

            this.atSV.breadcumb.next(breadcumb);
            this.atSV.breadcumbLink = breadcumbLink;
            this.atSV.folderId.next(id);

            this.changeDetectorRef.detectChanges();
            this.remotePermission = res[0].permissions;
          }
        });
    }
  }

  openFormFolder() {
    this.callfc.openForm(
      OpenFolderComponent,
      this.titleDialog,
      500,
      500,
      '',
      [this.functionID],
      ''
    );
    // this.folderService.getFoldersByFunctionID(this.functionID).subscribe(async res => {
    //   if (res != null) {
    //     this.listRemoteFolder = res;
    //     this.listNodeAdd = res;
    //     if (res[0].history != null) {
    //       var listFolder = res[0].history.filter(x => x.objectType == this.functionID && x.objectID == this.user.userID);
    //       if (listFolder[0] != null && listFolder[0].folderPath != "") {
    //         var list = listFolder[0].folderPath.split(";");
    //         this.loadChildNode(res[0], 0, list);
    //       }
    //     }
    //     this.callfc.openForm(OpenFolderComponent, this.titleDialog, 500, 500, "", null, "");
    //     this.changeDetectorRef.detectChanges();
    //     this.remotePermission = res[0].permissions;
    //   }
    // });

    // let option = new SidebarModel();
    // option.DataService = this.view?.currentView?.dataService;
    // option.FormModel = this.view?.currentView?.formModel;
    // option.Width = '800px';

    // this.dialog.closed.subscribe(e => {
    //   console.log(e);
    // })

    /* this.callfc.openForm(this.openFolder, "Chọn thư mục", 400, null, null, "").subscribe((dialog: Dialog)=>{
      let that = this;
      dialog.close = function(e) {
        return that.closeOpenForm(e);
      }
    });   */
  }

  closeOpenForm(e: any) {
    // if(e.event[0]==true){
    //   that.notifySvr.notify("Gia hạn thành công");
    //   that.listview.addHandler(e.event[1],false,"recID")
    // }
    // else if(e.event[0] == false) that.notifySvr.notify("Gia hạn thất bại");
  }

  fileUploadDropped($event) {
    this.handleFileInput1($event);
  }

  changeValueAgencyText(event: any) {
    //this.disEdit.agencyName = this.dispatch.AgencyName = event.data
    let total = this.fileUploadList.length;
    if (this.numberDes < total) {
      this.description[this.numberDes] = event.data;
      this.numberDes += 1;
    }

    /* for (var i = 0; i < total; i++) {
      this.description[i] = event.data;
    } */
  }
  //fetch () : Observable<any[]>
  saveFilesObservable(): Promise<Observable<any[]>> {
    this.atSV.fileListAdded = [];
    // return this.addFileObservable(this.fileUploadList[0]);
    return this.onMultiFileSaveObservable();
  }

  updateUrlFileUpload(): Observable<any[]> {
    let total = this.fileUploadList.length;
    //  var that = this;
    this.dmSV.getToken();
    for (var i = 0; i < total; i++) {
      // upload file uri from Mr Long
    }

    this.atSV.fileListAdded = [];
    return this.addFileObservable(this.fileUploadList[0]);
    //return this.onMultiFileSaveObservable();
  }

  async onMultiFileSaveObservable(): Promise<Observable<any[]>> {
    if (this.data == undefined) this.data = [];

    let total = this.fileUploadList.length;
    //  var that = this;
    await this.dmSV.getToken();
    let ret = new Observable<any[]>();
    for (var i = 0; i < total; i++) {
      this.fileUploadList[i].objectId = this.objectId;
      // await this.serviceAddFile(fileItem);
      if (total > 1)
        this.fileUploadList[i] = await this.addFileLargeLong(
          this.fileUploadList[i],
          false
        );
      // if (total > 1) {
      //   this.addFileObservable(this.fileUploadList[i], false, i).subscribe(item => {
      //     if (i == total -1)

      //   });
      // }
    }

    if (total > 1) {
      return this.fileService.addMultiFileObservable(this.fileUploadList).pipe(
        map((res) => {
          if (res != null) {
            var newlist = res.filter((x) => x.status == 6);
            var newlistNot = res.filter((x) => x.status == -1);
            var addList = res.filter((x) => x.status == 0 || x.status == 9);

            for (var i = 0; i < addList.length; i++) {
              this.data.push(Object.assign({}, addList[i]));
              this.atSV.fileListAdded.push(Object.assign({}, addList[i]));
            }

            if (addList.length == this.fileUploadList.length) {
              this.atSV.fileList.next(this.fileUploadList);
              this.atSV.fileListAdded = addList;
              if (this.showMessage == '1')
                this.notificationsService.notify(this.title);
              //this.closePopup();
              this.fileUploadList = [];
              return this.atSV.fileListAdded;
            } else {
              var item = newlist[0];
              var newUploadList = [];
              // copy list
              for (var i = 0; i < this.fileUploadList.length; i++) {
                var file = this.fileUploadList[i];
                var index = newlist.findIndex(
                  (x) => x.data.fileName == file.fileName
                );
                if (index > -1) {
                  newUploadList.push(Object.assign({}, file));
                }
              }
              if (newlistNot.length > 0) {
                this.notificationsService.notify(newlistNot[0].message);
                //this.closePopup();
                return this.atSV.fileListAdded; //this.data;
              } else {
                this.fileUploadList = newUploadList;
                var config = new AlertConfirmInputConfig();
                config.type = 'checkBox';
                return this.notificationsService
                  .alert(this.titlemessage, item?.message, config)
                  .closed.pipe(
                    map((x) => {
                      if (x.event.status == 'Y') {
                        // save all
                        if (x.event.data) {
                          for (var i = 0; i < this.fileUploadList.length; i++) {
                            this.fileUploadList[i].reWrite = true;
                          }
                          this.fileService
                            .addMultiFileObservable(this.fileUploadList)
                            .pipe()
                            .subscribe((result) => {
                              var mess = '';
                              for (var i = 0; i < result.length; i++) {
                                var f = result[i];
                                mess =
                                  mess +
                                  (mess != '' ? '<br/>' : '') +
                                  f.message;
                                this.atSV.fileListAdded.push(
                                  Object.assign({}, result[i])
                                );
                              }
                              if (this.showMessage == '1')
                                this.notificationsService.notify(mess);
                              this.fileUploadList = [];
                              return this.atSV.fileListAdded; //this.data;
                              //this.closePopup();
                            });
                        } else {
                          // save 1
                          var index = this.fileUploadList.findIndex(
                            (x) => x.fileName == item.data.fileName
                          );
                          this.fileUploadList[index].reWrite = true;
                          this.onMultiFileSaveObservable();
                        }
                      } else if (x.event.status == 'N') {
                        // cancel all
                        if (x.event.data) {
                          this.fileUploadList = [];
                          return this.atSV.fileListAdded; //this.data;
                          //this.closePopup();
                        } else {
                          // cancel 1
                          var index = this.fileUploadList.findIndex(
                            (x) => x.fileName == item.data.fileName
                          );
                          this.fileUploadList.splice(index, 1); //remove element from array
                          if (this.fileUploadList.length > 0)
                            this.onMultiFileSaveObservable();
                        }
                      }
                    })
                  );
              }
            }
          }
        })
      );
    } else if (total == 1) {
      //return this.addFileLargeLong(this.fileUploadList[0]);
      return this.addFileObservable(this.fileUploadList[0]);
      // this.atSV.fileList.next(this.fileUploadList);
    } else {
      this.notificationsService.notify(this.title2);
      return null;
    }
  }

  testObservable() {
    return true;
  }

  saveFiles() {
    this.onMultiFileSave();
  }

  async onMultiFileSave() {
    if (this.data == undefined) this.data = [];

    let total = this.fileUploadList.length;
    var toltalUsed = 0; //bytes
    var remainingStorage = this.infoHDD.totalHdd - this.infoHDD.totalUsed;
    var that = this;
    await this.dmSV.getToken();
    for (var i = 0; i < total; i++) {
      this.fileUploadList[i].objectId = this.objectId;

      this.fileUploadList[i].description = this.description[i];

      toltalUsed += this.fileUploadList[i].fileSize;
      if (total > 1)
        this.fileUploadList[i] = await this.addFileLargeLong(
          this.fileUploadList[i],
          false
        );
    }
    if (toltalUsed > remainingStorage)
      return this.notificationsService.notifyCode('DM053');
    this.atSV.fileListAdded = [];
    if (total > 1) {
      var done = this.fileService
        .addMultiFile(this.fileUploadList, this.isDM)
        .toPromise()
        .then((res) => {
          if (res != null) {
            var newlist = res.filter((x) => x.status == 6);
            var newlistNot = res.filter((x) => x.status == -1);
            var addList = res.filter((x) => x.status == 0 || x.status == 9);

            if (addList.length > 0) {
              addList.forEach((item) => {
                this.data.push(Object.assign({}, item));
                if (item.status == 0)
                  this.dmSV.updateHDD.next(item.messageHddUsed);
                var files = this.dmSV.listFiles;
                if (files == null) files = [];

                if (item.status == 0) {
                  if (item.data.fileName != null && item.data.fileName != '') {
                    //'../../../assets/img/loader.gif';
                    that.displayThumbnail(item.data);
                    item.data.thumbnail = `../../../assets/codx/dms/${this.dmSV.getAvatar(
                      item.data.extension
                    )}`;
                    files.push(Object.assign({}, item.data));
                  } else {
                    if (
                      item.data.folderName != null &&
                      item.data.folderName != ''
                    ) {
                      var folders = this.dmSV.listFolder;
                      var idx = folders.findIndex(
                        (x) => x.recID == item.data.recID
                      );
                      if (idx == -1) {
                        folders.push(Object.assign({}, item.data));
                        this.dmSV.listFolder = folders;
                        // that.changeDetectorRef.detectChanges();
                      }
                    }
                  }
                } else {
                  let index = files.findIndex(
                    (d) => d.recID.toString() === item.data.recID
                  );
                  if (index != -1) {
                    files[index] = item.data;
                    files[index].recID = item.data.recID;
                  }
                }
                this.dmSV.listFiles = files;
                this.dmSV.ChangeData.next(true);
              });
              this.notificationsService.notifyCode(
                'DM061',
                null,
                addList.length
              );
            }

            // for (var i = 0; i < addList.length; i++) {
            //   this.data.push(Object.assign({}, addList[i]));
            // }

            if (addList.length == this.fileUploadList.length) {
              this.atSV.fileList.next(this.fileUploadList);
              this.atSV.fileListAdded = addList;
              // this.notificationsService.notify(this.title);
              this.closePopup();
              this.fileUploadList = [];
            } else {
              var item = newlist[0];
              var newUploadList = [];
              //   this.fileUploadList = [];
              //   this.fileUploadList = addList;
              // copy list
              for (var i = 0; i < this.fileUploadList.length; i++) {
                var file = this.fileUploadList[i];
                var index = newlist.findIndex(
                  (x) => x.data.fileName == file.fileName
                );
                if (index > -1) {
                  newUploadList.push(Object.assign({}, file));
                }
              }
              if (newlistNot.length > 0) {
                this.notificationsService.notify(newlistNot[0].message);
                this.closePopup();
              } else {
                this.fileUploadList = newUploadList;
                var config = new AlertConfirmInputConfig();
                config.type = 'checkBox';

                this.notificationsService
                  .alert(this.titlemessage, item?.message, config)
                  .closed.subscribe((x) => {
                    if (x.event.status == 'Y') {
                      // save all
                      if (x.event.data) {
                        for (var i = 0; i < this.fileUploadList.length; i++) {
                          this.fileUploadList[i].reWrite = true;
                          this.fileUploadList[i].description =
                            this.description[i];
                        }
                        this.fileService
                          .addMultiFile(this.fileUploadList, this.isDM)
                          .toPromise()
                          .then((result) => {
                            var mess = '';
                            for (var i = 0; i < result.length; i++) {
                              var f = result[i];
                              mess =
                                mess + (mess != '' ? '<br/>' : '') + f.message;
                            }
                            this.notificationsService.notify(mess);
                            this.fileUploadList = [];
                            this.closePopup();
                          });
                      } else {
                        // save 1
                        var index = this.fileUploadList.findIndex(
                          (x) => x.fileName == item.data.fileName
                        );
                        this.fileUploadList[index].reWrite = true;
                        this.onMultiFileSave();
                      }
                    } else if (x.event.status == 'N') {
                      // cancel all
                      if (x.event.data) {
                        this.fileUploadList = [];
                        this.closePopup();
                      } else {
                        // cancel 1
                        var index = this.fileUploadList.findIndex(
                          (x) => x.fileName == item.data.fileName
                        );
                        this.fileUploadList.splice(index, 1); //remove element from array
                        if (this.fileUploadList.length > 0)
                          this.onMultiFileSave();
                      }
                    }
                  });
              }
            }
          }
        });
    } else if (total == 1) {
      this.fileUploadList[0].description = this.description[0];
      this.addFileLargeLong(this.fileUploadList[0]);
      //this.addFile(this.fileUploadList[0]);

      this.atSV.fileList.next(this.fileUploadList);
    } else {
      // this.cacheService.message('DM001')
      // this.notificationsService.notifyCode("");
      this.notificationsService.notify(this.title2);
    }
  }

  async serviceAddFile(fileItem: FileUpload): Promise<FileUpload> {
    try {
      fileItem.uploadId = '';
      fileItem.objectId = this.objectId;
      var appName = environment.appName; // Tam thoi de hard
      var ChunkSizeInKB = this.dmSV.ChunkSizeInKB;
      var uploadFile = fileItem.item.rawFile;
      var retUpload = await lvFileClientAPI.postAsync(
        `api/${appName}/files/register`,
        {
          Data: {
            FileName: uploadFile.name,
            ChunkSizeInKB: ChunkSizeInKB,
            FileSize: uploadFile.size,
            thumbSize: {
              width: 200, //Kích thước của file ảnh Thum bề ngang
              height: 200, //Kích thước của file ảnh Thum bề dọc
            },
            IsPublic: true,
          },
        }
      );
      fileItem.fileSize = uploadFile.size;
      fileItem.thumbnail = retUpload.Data?.RelUrlThumb; //"";
      fileItem.uploadId = retUpload.Data?.UploadId; //"";
      fileItem.urlPath = retUpload.Data?.RelUrlOfServerPath; //"";
    } catch (ex) {
      console.log(ex);
    }
    return fileItem;
  }

  addFileObservable(
    fileItem: any,
    isAddFile: boolean = true,
    index: number = -1
  ): Observable<any[]> {
    var ret = fileItem;
    var fileSize = parseInt(fileItem.fileSize);
    var that = this;
    fileItem.uploadId = '';
    fileItem.objectId = this.objectId;
    var appName = environment.appName;
    var ChunkSizeInKB = this.dmSV.ChunkSizeInKB;
    var uploadFile = fileItem.item?.rawFile; // Nguyên thêm dấu ? để không bị bắt lỗi
    var obj = from(
      lvFileClientAPI.postAsync(`api/${appName}/files/register`, {
        Data: {
          FileName: uploadFile?.name,
          ChunkSizeInKB: ChunkSizeInKB,
          FileSize: uploadFile?.size,
          thumbSize: {
            width: 200, //Kích thước của file ảnh Thum bề ngang
            height: 200, //Kích thước của file ảnh Thum bề dọc
          },
          IsPublic: true,
        },
      })
    );

    var chunSizeInfBytes = ChunkSizeInKB * 1024;
    var sizeInBytes = 0;
    return obj.pipe(
      mergeMap((retUpload, i) => {
        // update len server urs và thumbnail
        fileItem.thumbnail = retUpload.Data?.RelUrlThumb; //"";
        fileItem.uploadId = retUpload.Data?.UploadId; //"";
        fileItem.urlPath = retUpload.Data?.RelUrlOfServerPath; //"";

        //this.displayThumbnail(res.recID, res.pathDisk);
        var sizeInBytes = uploadFile.size;
        var numOfChunks = Math.floor(uploadFile.size / chunSizeInfBytes);
        if (uploadFile.size % chunSizeInfBytes > 0) {
          numOfChunks++;
        }
        //api/lv-docs/files/upload
        for (var i = 0; i < numOfChunks; i++) {
          var start = i * chunSizeInfBytes; //Vị trí bắt đầu băm file
          var end = start + chunSizeInfBytes; //Vị trí cuối
          if (end > sizeInBytes) end = sizeInBytes; //Nếu điểm cắt cuối vượt quá kích thước file chặn lại
          var blogPart = uploadFile.slice(start, end); //Lấy dữ liệu của chunck dựa vào đầu cuối
          var fileChunk = new File([blogPart], uploadFile.name, {
            type: uploadFile.type,
          }); //Gói lại thành 1 file chunk để upload
          var uploadChunk = lvFileClientAPI.formPostWithToken(
            `api/${appName}/files/upload`,
            {
              FilePart: fileChunk,
              UploadId: retUpload.Data?.UploadId,
              Index: i,
            }
          );
          console.log(uploadChunk);
        }

        if (isAddFile)
          return this.fileService.addFileObservable(fileItem, this.isDM).pipe(
            map((item) => {
              if (item.status == 0) {
                if (this.showMessage == '1')
                  this.notificationsService.notify(item.message);
                this.fileUploadList[0].recID = item.data.recID;
                this.atSV.fileListAdded.push(Object.assign({}, item));
                this.data.push(Object.assign({}, item));
                this.fileUploadList = [];
                return item;
              } else if (item.status == 6) {
                // ghi đè
                fileItem.recID = item.data.recID;
                return this.rewriteFileObservable(
                  this.titlemessage,
                  item.message,
                  fileItem
                );
              } else {
                this.notificationsService.notify(item.message);
              }
              return null;
            })
          );
        else {
          if (index != -1) this.fileUploadList[index] = fileItem;
          return null;
        }
      })
    );
  }

  rewriteFileObservable(
    title: any,
    message: any,
    item: FileUpload
  ): Observable<any> {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    return this.notificationsService.alert(title, message, config).closed.pipe(
      map((x) => {
        if (x.event.status == 'Y') {
          // return null;
          return this.fileService.updateVersionFileObservable(item).pipe(
            map((res) => {
              this.fileUploadList[0].recID = res.data.recID;
              this.atSV.fileListAdded.push(Object.assign({}, item));
              if (this.showMessage == '1')
                this.notificationsService.notify(res.message);
              this.fileUploadList = [];
              this.data.push(Object.assign({}, item));
              return item;
            })
          );
        }
        return null;
      })
    );
  }

  displayThumbnail(data) {
    this.dmSV.setThumbnailWait.next(data);
  }

  // async getToken() {
  //   lvFileClientAPI.setUrl(this.dmSV.urlUpload); //"http://192.168.18.36:8011");
  //   var retToken = await lvFileClientAPI.formPost("api/accounts/token",{
  //       username: "admin/root",
  //       password: "root"
  //   });
  //   window.localStorage.setItem('lv-file-api-token', retToken.access_token);
  // }

  async addFileLargeLong(
    fileItem: FileUpload,
    isAddFile: boolean = true
  ): Promise<FileUpload> {
    // check dung luong dia cungs
    var ret = fileItem;
    var fileSize = parseInt(fileItem.fileSize);
    var that = this;
    fileItem.uploadId = '';
    function isAllowAddFileAsync() {
      return new Promise((resole, reject) => {
        that.fileService.isAllowAddFile(fileSize).subscribe((item) => {
          if (item == 'ok') {
            resole(item);
          } else {
            reject(item);
          }
        });
      });
    }

    try {
      //  var item = await isAllowAddFileAsync();
      var uploadFile = fileItem.item.rawFile;
      var appName = environment.appName; // Tam thoi de hard
      fileItem = await this.serviceAddFile(fileItem);
      if (isAddFile) this.addFile(fileItem);

      //this.displayThumbnail(res.recID, res.pathDisk);
      var sizeInBytes = fileItem.fileSize; // uploadFile.size;
      var chunSizeInfBytes = this.dmSV.ChunkSizeInKB * 1024;
      var numOfChunks = Math.floor(fileItem.fileSize / chunSizeInfBytes);
      if (fileItem.fileSize % chunSizeInfBytes > 0) {
        numOfChunks++;
      }

      //api/lv-docs/files/upload
      for (var i = 0; i < numOfChunks; i++) {
        var start = i * chunSizeInfBytes; //Vị trí bắt đầu băm file
        var end = start + chunSizeInfBytes; //Vị trí cuối
        if (end > sizeInBytes) end = sizeInBytes; //Nếu điểm cắt cuối vượt quá kích thước file chặn lại
        var blogPart = uploadFile.slice(start, end); //Lấy dữ liệu của chunck dựa vào đầu cuối
        var fileChunk = new File([blogPart], uploadFile.name, {
          type: uploadFile.type,
        }); //Gói lại thành 1 file chunk để upload
        var uploadChunk = await lvFileClientAPI.formPostWithToken(
          `api/${appName}/files/upload`,
          {
            FilePart: fileChunk,
            UploadId: fileItem.uploadId,
            Index: i,
          }
        );
        console.log(uploadChunk);
      }
    } catch (ex) {
      fileItem.uploadId = '0';
      // this.notificationsService.notify(ex);
    }
    return fileItem;
  }

  addFileLarge(fileItem: FileUpload) {
    // let no = 0;
    // let total = this.fileUploadList.length;

    var that = this;
    var size = 1048576; // 1MB
    var totalChunk = 0;
    var dataFile = fileItem.data;
    if (this.interval == null) this.interval = [];
    // chia file
    totalChunk = fileItem.fileSize / size;
    fileItem.data = '';
    this.fileService.getChunkFile(fileItem).subscribe((res) => {
      if (res != null) {
        var item = res.result.data;
        for (var i = 0; i < item.totalChunk; i++) {
          // upload chunk file
          var start = i * item.chunkSize; //Vị trí bắt đầu băm file
          var end = start + item.chunkSize - 1; //Vị trí cuối
          if (end > item.fileSize) end = item.fileSize; //Nếu điểm cắt cuối vượt quá kích thước file chặn lại
          var data = dataFile.slice(start, end); //Lấy dữ liệu của chunck dựa vào đầu cuối
          // let start = i * item.chunkSize;//Vị trí bắt đầu băm file
          // let end = start + item.chunkSize;//Vị trí cuối
          //  if (end > item.fileSize)
          //   end = item.fileSize;//Nếu điểm cắt cuối vượt quá kích thước file chặn lại
          // let data = dataFile.slice(start, end);//Lấy dữ liệu của chunck dựa vào đầu cuối
          let file = fileItem;
          file.data = data;
          file.urlPath = item.pathChunk;
          file.fileName = item.recID + '_' + i.toString();
          //  var index = setInterval(() => {
          that.fileService.addChunkFile(file).subscribe((sub) => {
            // let indexInterval = that.interval.findIndex(d => d.id === sub.result);
            // if (indexInterval > -1) {
            //   clearInterval(that.interval[indexInterval].instant);
            //   that.interval.splice(indexInterval, 1);
            // }
          });
          //  }, 3000);

          // var interval = new ItemInterval();
          // interval.id = file.fileName;
          // interval.instant = index;
          // that.interval.push(Object.assign({}, interval));
        }
      }
    });
  }

  addFile(fileItem: any) {
    var that = this;
    var done = this.fileService.addFile(fileItem, this.isDM).toPromise();
    if (done) {
      done
        .then((item) => {
          if (item.status == 0) {
            var files = this.dmSV.listFiles;
            if (files == null) files = [];
            var res = item.data;
            var thumbnail = res.thumbnail;
            res.thumbnail = `../../../assets/codx/dms/${this.dmSV.getAvatar(
              res.extension
            )}`; //'../../../assets/img/loader.gif';
            files.push(Object.assign({}, res));
            this.dmSV.listFiles = files;
            this.dmSV.ChangeData.next(true);
            this.atSV.fileListAdded.push(Object.assign({}, item));
            this.data.push(Object.assign({}, item));
            item.data.thumbnail = thumbnail;
            this.displayThumbnail(item.data);
            this.dmSV.updateHDD.next(item.messageHddUsed);
            this.notificationsService.notify(item.message);
            this.changeDetectorRef.detectChanges();
          } else if (item.status == 6) {
            // ghi đè
            fileItem.recID = item.data.recID;
            this.rewriteFile(this.titlemessage, item.message, fileItem);
          } else this.notificationsService.notify(item.message);
        })
        .catch((error) => {
          console.log('Promise rejected with ' + JSON.stringify(error));
        });
    }
    this.closePopup();
  }

  rewriteFile(title: any, message: any, item: FileUpload) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notificationsService
      .alert(title, message, config)
      .closed.subscribe((x) => {
        if (x.event.status == 'Y') {
          item.reWrite = true;
          var done = this.fileService.updateVersionFile(item).toPromise();
          if (done) {
            done
              .then(async (res) => {
                var files = this.dmSV.listFiles;
                let index = files.findIndex(
                  (d) => d.recID.toString() === item.recID
                );
                if (index != -1) {
                  res.data.thumbnail = `../../../assets/codx/dms/${this.dmSV.getAvatar(
                    res.data.extension
                  )}`; //'../../../assets/img/loader.gif';
                  this.displayThumbnail(res.data);
                  files[index] = res.data;
                  files[index].recID = res.data.recID;
                }
                this.dmSV.listFiles = files;
                this.dmSV.ChangeData.next(true);
                //this.fileUploadList[0].recID = res.data.recID;
                this.atSV.fileListAdded.push(Object.assign({}, item));
                this.data.push(Object.assign({}, item));
                //  res.data.thumbnail = "../../../assets/img/loader.gif";
                //  this.displayThumbnail(res.data.recID, res.data.pathDisk);
                this.notificationsService.notify(res.message);
                //  this.closePopup();
                this.fileUploadList = [];
                this.changeDetectorRef.detectChanges();
              })
              .catch((error) => {
                console.log('Promise rejected with ' + JSON.stringify(error));
              });
          }
        }
      });
  }

  closeFileDialog(form): void {}

  arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  onEditUploaded(file) {
    //alert('edit');
    this.callfc.openForm(
      EditFileComponent,
      this.titleDialog,
      500,
      500,
      '',
      [this.functionID],
      ''
    );
  }

  onDeleteUploaded(file: string) {
    let index = this.fileUploadList.findIndex(
      (d) => d.fileName.toString() === file.toString()
    ); //find index in your array
    if (index > -1) {
      this.fileUploadList.splice(index, 1); //remove element from array
      //  this.fileUploadList.next(this.fileUploadList);
      this.fileCount.emit(this.fileUploadList.length);
    }
  }

  editfile(file, multi = false, index = 0) {
    // let option = new SidebarModel();
    // //option.DataService = this.dataService;
    // option.FormModel = this.formModel;
    // option.Width = '550px';
    // let data = {} as any;
    // data.title = "test";
    // this.callfc.openSide(EditFileComponent, data, option);
    //  this.callfc.openSide(EditFileComponent, this.titleDialog, [this.functionID, file], null);
    this.callfc.openForm(
      EditFileComponent,
      this.titleDialog,
      800,
      800,
      '',
      [this.functionID, file],
      ''
    );
  }

  sortBy() {
    if (this.fileUploadList != null)
      return this.fileUploadList.sort((a, b) => a.order - b.order);
    else return null;
  }

  selectFolderPath(dialog) {
    this.atSV.breadcumbLink = this.breadcumbLink;
    this.atSV.breadcumb.next(this.breadcumb);
    this.atSV.currentNode = '';
    this.atSV.folderId.next(this.selectId);
    dialog.hide();
    // var a = "";
    //dialog.hide(a);
    // this.closeOpenForm();
    // modal.dismiss();
  }

  setFullHtmlNode(folder, text) {
    var item1 = '';
    var item2 = '';

    if (folder.icon == '' || folder.icon == null || folder.icon == undefined)
      item1 =
        '<img class="max-h-18px" src="../../../assets/demos/dms/folder.svg">';
    else {
      if (folder.icon.indexOf('.') == -1)
        item1 = `<i class="${folder.icon}" role="presentation"></i>`;
      else {
        var path = `${this.path}/${folder.icon}`;
        item1 = `<img class="max-h-18px" src="${path}">`;
      }
    }

    if (!folder.read)
      item2 = `<i class="icon-per no-permission" role="presentation"></i>`;
    var fullText = `${item1}
                    ${item2}
                    <span class="mytree_node"></span>
                    ${text}`;

    return fullText;
  }

  disableFolderSelect() {
    return this.remote;
  }

  getAvatar(filename: string) {
    if (filename == '' || filename == null) return '';
    var ext =
      filename.substring(filename.lastIndexOf('.'), filename.length) ||
      filename;

    if (ext == null) {
      // alert(1);
      return 'file.svg';
    } else {
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
        default:
          return 'file.svg';
      }
    }
  }

  getNow() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var ret = dd + '/' + mm + '/' + yyyy;
    return ret;
  }

  loadChildNode(parent, index, list) {
    var that = this;
    if (index < list.length) {
      var id = list[index];
      this.selectId = id;
      //   if (this.folderId == id) {
      //     this.dmSV.setDisableSave.next(true);
      //   }
      //   else this.dmSV.setDisableSave.next(false);

      this.folderService.getFolders(id).subscribe(async (res) => {
        // that.treeAdd.addChildNodes(parent, res);
        var nodeAdd = new NodeTreeAdd();
        var list = [];
        // list.push(Object.assign({}, res));
        // list.push(new, res)
        nodeAdd.parent = parent;
        nodeAdd.data = res;
        //  that.dmSV.addNodeTree.next(nodeAdd);
        that.changeDetectorRef.detectChanges();
        //var current =
        index++;
        var currentNode = null;
        if (index < list.length) {
          for (var i = 0; i < res.length; i++) {
            if (res[i].recID == list[index]) {
              currentNode = res[i];
            }
          }
          if (currentNode != null) that.loadChildNode(currentNode, index, list);
        }
      });
    }
  }

  selectFolder() {
    this.folderService
      .getFoldersByFunctionID(this.functionID)
      .subscribe(async (res) => {
        if (res != null) {
          this.listRemoteFolder = res;
          this.listNodeAdd = res;
          if (res[0].history != null) {
            var listFolder = res[0].history.filter(
              (x) =>
                x.objectType == this.functionID &&
                x.objectID == this.user.userID
            );
            if (listFolder[0] != null && listFolder[0].folderPath != '') {
              var list = listFolder[0].folderPath.split(';');
              this.loadChildNode(res[0], 0, list);
            }
          }
          this.changeDetectorRef.detectChanges();
          this.remotePermission = res[0].permissions;
        }
      });

    // DM058: Vui lòng chọn file tải lên
    // DM059: Đã thêm file thành công
    //  this.openDialogFolder(this.openFolder, "sm", "folder");
  }

  uploadFile() {
    var ctrl = this.uploadObj.element as HTMLElement;
    //var ctrl = document.querySelector("[idbutton='" + this.idBrowse + "']") as HTMLElement;
    if (ctrl != null) ctrl.click();
  }

  async handleFileInput1(files: FileList) {
    var count = this.fileUploadList.length;
    this.getFolderPath();
    //console.log(files);
    for (var i = 0; i < files.length; i++) {
      let index = this.fileUploadList.findIndex(
        (d) => d.fileName.toString() === files[i].name.toString()
      ); //find index in your array
      if (index == -1) {
        let no = count + i;
        let data: ArrayBuffer;
        data = await files[i].arrayBuffer();
        var fileUpload = new FileUpload();
        var item = this.arrayBufferToBase64(data);
        fileUpload.order = i;
        fileUpload.fileName = files[i].name;

        fileUpload.avatar = this.getAvatar(fileUpload.fileName);
        fileUpload.extension =
          files[i].name.substring(
            files[i].name.lastIndexOf('.'),
            files[i].name.length
          ) || files[i].name;
        fileUpload.createdBy = this.user.userName;
        fileUpload.createdOn = this.getNow();
        fileUpload.type = files[i].type;
        fileUpload.objectType = this.objectType;
        fileUpload.objectId = this.objectId;
        fileUpload.fileSize = files[i].size;
        fileUpload.fileName = files[i].name;

        /* fileUpload.description = files[i].description; */

        fileUpload.funcId = this.functionID;
        fileUpload.folderType = this.folderType;
        fileUpload.reWrite = false;
        fileUpload.data = item;
        fileUpload.item = files[i];
        fileUpload.folderId = this.folderId;
        fileUpload.permissions = this.remotePermission;
        this.fileUploadList.push(Object.assign({}, fileUpload));
      }
    }
    this.fileCount.emit(files.length);
    files = null;
    if (this.file) this.file.nativeElement.value = '';
    //  this.fileUploadList.next(this.fileUploadList);
    this.fileAdded.emit({ data: this.fileUploadList });
    this.changeDetectorRef.detectChanges();

    return false;
  }

  convertBlobToBase64 = async (blob) => {
    return await this.blobToBase64(blob);
  };

  blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  public readURL(liImage: HTMLElement, file: any) {
    let imgPreview: HTMLImageElement = liImage as HTMLImageElement;
    let imageFile: File = file.rawFile;
    let reader: FileReader = new FileReader();
    if (imageFile) {
      reader.readAsDataURL(imageFile);
    }
  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  // const convertBlobToBase64 = async (blob) => {
  //   return await blobToBase64(blob);
  // }

  addPermissionForRoot(list: Permission[]) {
    // var id = this.dmSV.folderId.getValue();
    var permissions = [];
    if (list != null && list.length > 0) permissions = list;

    // if (id == "3" || id == "4") {
    //this.fileEditing.permissions = [];
    list = [];
    permissions = list;
    let perm = new Permission();
    perm.objectType = '7';
    perm.objectName = 'Administrator';
    perm.isSystem = true;
    perm.isActive = true;
    perm.read = true;
    perm.download = true;
    perm.isSharing = false;
    perm.full = true;
    perm.share = true;
    perm.update = true;
    perm.create = true;
    //perm.delete = false;
    perm.delete = true;
    perm.upload = true;
    perm.assign = true;
    permissions.push(Object.assign({}, perm));

    perm = new Permission();
    perm.objectType = '1';
    perm.objectID = this.user.userID;
    perm.objectName = 'Owner (' + this.user.userName + ')';
    perm.isSystem = true;
    perm.isActive = true;
    perm.isSharing = false;
    perm.read = true;
    perm.download = true;
    perm.full = true;
    perm.share = true;
    perm.update = true;
    perm.create = true;
    perm.delete = true;
    perm.upload = true;
    perm.assign = true;
    permissions.push(Object.assign({}, perm));
    // }
    return permissions;
  }

  GetMimeType(extension: string) {
    if (extension == null) return '';

    if (extension.startsWith('.')) extension = extension.substring(1);

    switch (extension.toLowerCase()) {
      case '323':
        return 'text/h323';
      case '3g2':
        return 'video/3gpp2';
      case '3gp':
        return 'video/3gpp';
      case '3gp2':
        return 'video/3gpp2';
      case '3gpp':
        return 'video/3gpp';
      case '7z':
        return 'application/x-7z-compressed';
      case 'aa':
        return 'audio/audible';
      case 'aac':
        return 'audio/aac';
      case 'aaf':
        return 'application/octet-stream';
      case 'aax':
        return 'audio/vnd.audible.aax';
      case 'ac3':
        return 'audio/ac3';
      case 'aca':
        return 'application/octet-stream';
      case 'accda':
        return 'application/msaccess.addin';
      case 'accdb':
        return 'application/msaccess';
      case 'accdc':
        return 'application/msaccess.cab';
      case 'accde':
        return 'application/msaccess';
      case 'accdr':
        return 'application/msaccess.runtime';
      case 'accdt':
        return 'application/msaccess';
      case 'accdw':
        return 'application/msaccess.webapplication';
      case 'accft':
        return 'application/msaccess.ftemplate';
      case 'acx':
        return 'application/internet-property-stream';
      case 'addin':
        return 'text/xml';
      case 'ade':
        return 'application/msaccess';
      case 'adobebridge':
        return 'application/x-bridge-url';
      case 'adp':
        return 'application/msaccess';
      case 'adt':
        return 'audio/vnd.dlna.adts';
      case 'adts':
        return 'audio/aac';
      case 'afm':
        return 'application/octet-stream';
      case 'ai':
        return 'application/postscript';
      case 'aif':
        return 'audio/x-aiff';
      case 'aifc':
        return 'audio/aiff';
      case 'aiff':
        return 'audio/aiff';
      case 'air':
        return 'application/vnd.adobe.air-application-installer-package+zip';
      case 'amc':
        return 'application/x-mpeg';
      case 'application':
        return 'application/x-ms-application';
      case 'art':
        return 'image/x-jg';
      case 'asa':
        return 'application/xml';
      case 'asax':
        return 'application/xml';
      case 'ascx':
        return 'application/xml';
      case 'asd':
        return 'application/octet-stream';
      case 'asf':
        return 'video/x-ms-asf';
      case 'ashx':
        return 'application/xml';
      case 'asi':
        return 'application/octet-stream';
      case 'asm':
        return 'text/plain';
      case 'asmx':
        return 'application/xml';
      case 'aspx':
        return 'application/xml';
      case 'asr':
        return 'video/x-ms-asf';
      case 'asx':
        return 'video/x-ms-asf';
      case 'atom':
        return 'application/atom+xml';
      case 'au':
        return 'audio/basic';
      case 'avi':
        return 'video/x-msvideo';
      case 'axs':
        return 'application/olescript';
      case 'bas':
        return 'text/plain';
      case 'bcpio':
        return 'application/x-bcpio';
      case 'bin':
        return 'application/octet-stream';
      case 'bmp':
        return 'image/bmp';
      case 'c':
        return 'text/plain';
      case 'cab':
        return 'application/octet-stream';
      case 'caf':
        return 'audio/x-caf';
      case 'calx':
        return 'application/vnd.ms-office.calx';
      case 'cat':
        return 'application/vnd.ms-pki.seccat';
      case 'cc':
        return 'text/plain';
      case 'cd':
        return 'text/plain';
      case 'cdda':
        return 'audio/aiff';
      case 'cdf':
        return 'application/x-cdf';
      case 'cer':
        return 'application/x-x509-ca-cert';
      case 'chm':
        return 'application/octet-stream';
      case 'class':
        return 'application/x-java-applet';
      case 'clp':
        return 'application/x-msclip';
      case 'cmx':
        return 'image/x-cmx';
      case 'cnf':
        return 'text/plain';
      case 'cod':
        return 'image/cis-cod';
      case 'config':
        return 'application/xml';
      case 'contact':
        return 'text/x-ms-contact';
      case 'coverage':
        return 'application/xml';
      case 'cpio':
        return 'application/x-cpio';
      case 'cpp':
        return 'text/plain';
      case 'crd':
        return 'application/x-mscardfile';
      case 'crl':
        return 'application/pkix-crl';
      case 'crt':
        return 'application/x-x509-ca-cert';
      case 'cs':
        return 'text/plain';
      case 'csdproj':
        return 'text/plain';
      case 'csh':
        return 'application/x-csh';
      case 'csproj':
        return 'text/plain';
      case 'css':
        return 'text/css';
      case 'csv':
        return 'text/csv';
      case 'cur':
        return 'application/octet-stream';
      case 'cxx':
        return 'text/plain';
      case 'dat':
        return 'application/octet-stream';
      case 'datasource':
        return 'application/xml';
      case 'dbproj':
        return 'text/plain';
      case 'dcr':
        return 'application/x-director';
      case 'def':
        return 'text/plain';
      case 'deploy':
        return 'application/octet-stream';
      case 'der':
        return 'application/x-x509-ca-cert';
      case 'dgml':
        return 'application/xml';
      case 'dib':
        return 'image/bmp';
      case 'dif':
        return 'video/x-dv';
      case 'dir':
        return 'application/x-director';
      case 'disco':
        return 'text/xml';
      case 'dll':
        return 'application/x-msdownload';
      case 'dll.config':
        return 'text/xml';
      case 'dlm':
        return 'text/dlm';
      case 'doc':
        return 'application/msword';
      case 'docm':
        return 'application/vnd.ms-word.document.macroenabled.12';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'dot':
        return 'application/msword';
      case 'dotm':
        return 'application/vnd.ms-word.template.macroenabled.12';
      case 'dotx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.template';
      case 'dsp':
        return 'application/octet-stream';
      case 'dsw':
        return 'text/plain';
      case 'dtd':
        return 'text/xml';
      case 'dtsconfig':
        return 'text/xml';
      case 'dv':
        return 'video/x-dv';
      case 'dvi':
        return 'application/x-dvi';
      case 'dwf':
        return 'drawing/x-dwf';
      case 'dwp':
        return 'application/octet-stream';
      case 'dxr':
        return 'application/x-director';
      case 'eml':
        return 'message/rfc822';
      case 'emz':
        return 'application/octet-stream';
      case 'eot':
        return 'application/octet-stream';
      case 'eps':
        return 'application/postscript';
      case 'etl':
        return 'application/etl';
      case 'etx':
        return 'text/x-setext';
      case 'evy':
        return 'application/envoy';
      case 'exe':
        return 'application/octet-stream';
      case 'exe.config':
        return 'text/xml';
      case 'fdf':
        return 'application/vnd.fdf';
      case 'fif':
        return 'application/fractals';
      case 'filters':
        return 'application/xml';
      case 'fla':
        return 'application/octet-stream';
      case 'flr':
        return 'x-world/x-vrml';
      case 'flv':
        return 'video/x-flv';
      case 'fsscript':
        return 'application/fsharp-script';
      case 'fsx':
        return 'application/fsharp-script';
      case 'generictest':
        return 'application/xml';
      case 'gif':
        return 'image/gif';
      case 'group':
        return 'text/x-ms-group';
      case 'gsm':
        return 'audio/x-gsm';
      case 'gtar':
        return 'application/x-gtar';
      case 'gz':
        return 'application/x-gzip';
      case 'h':
        return 'text/plain';
      case 'hdf':
        return 'application/x-hdf';
      case 'hdml':
        return 'text/x-hdml';
      case 'hhc':
        return 'application/x-oleobject';
      case 'hhk':
        return 'application/octet-stream';
      case 'hhp':
        return 'application/octet-stream';
      case 'hlp':
        return 'application/winhlp';
      case 'hpp':
        return 'text/plain';
      case 'hqx':
        return 'application/mac-binhex40';
      case 'hta':
        return 'application/hta';
      case 'htc':
        return 'text/x-component';
      case 'htm':
        return 'text/html';
      case 'html':
        return 'text/html';
      case 'htt':
        return 'text/webviewhtml';
      case 'hxa':
        return 'application/xml';
      case 'hxc':
        return 'application/xml';
      case 'hxd':
        return 'application/octet-stream';
      case 'hxe':
        return 'application/xml';
      case 'hxf':
        return 'application/xml';
      case 'hxh':
        return 'application/octet-stream';
      case 'hxi':
        return 'application/octet-stream';
      case 'hxk':
        return 'application/xml';
      case 'hxq':
        return 'application/octet-stream';
      case 'hxr':
        return 'application/octet-stream';
      case 'hxs':
        return 'application/octet-stream';
      case 'hxt':
        return 'text/html';
      case 'hxv':
        return 'application/xml';
      case 'hxw':
        return 'application/octet-stream';
      case 'hxx':
        return 'text/plain';
      case 'i':
        return 'text/plain';
      case 'ico':
        return 'image/x-icon';
      case 'ics':
        return 'application/octet-stream';
      case 'idl':
        return 'text/plain';
      case 'ief':
        return 'image/ief';
      case 'iii':
        return 'application/x-iphone';
      case 'inc':
        return 'text/plain';
      case 'inf':
        return 'application/octet-stream';
      case 'inl':
        return 'text/plain';
      case 'ins':
        return 'application/x-internet-signup';
      case 'ipa':
        return 'application/x-itunes-ipa';
      case 'ipg':
        return 'application/x-itunes-ipg';
      case 'ipproj':
        return 'text/plain';
      case 'ipsw':
        return 'application/x-itunes-ipsw';
      case 'iqy':
        return 'text/x-ms-iqy';
      case 'isp':
        return 'application/x-internet-signup';
      case 'ite':
        return 'application/x-itunes-ite';
      case 'itlp':
        return 'application/x-itunes-itlp';
      case 'itms':
        return 'application/x-itunes-itms';
      case 'itpc':
        return 'application/x-itunes-itpc';
      case 'ivf':
        return 'video/x-ivf';
      case 'jar':
        return 'application/java-archive';
      case 'java':
        return 'application/octet-stream';
      case 'jck':
        return 'application/liquidmotion';
      case 'jcz':
        return 'application/liquidmotion';
      case 'jfif':
        return 'image/pjpeg';
      case 'jnlp':
        return 'application/x-java-jnlp-file';
      case 'jpb':
        return 'application/octet-stream';
      case 'jpe':
        return 'image/jpeg';
      case 'jpeg':
        return 'image/jpeg';
      case 'jpg':
        return 'image/jpeg';
      case 'js':
        return 'application/x-javascript';
      case 'jsx':
        return 'text/jscript';
      case 'jsxbin':
        return 'text/plain';
      case 'latex':
        return 'application/x-latex';
      case 'library-ms':
        return 'application/windows-library+xml';
      case 'lit':
        return 'application/x-ms-reader';
      case 'loadtest':
        return 'application/xml';
      case 'lpk':
        return 'application/octet-stream';
      case 'lsf':
        return 'video/x-la-asf';
      case 'lst':
        return 'text/plain';
      case 'lsx':
        return 'video/x-la-asf';
      case 'lzh':
        return 'application/octet-stream';
      case 'm13':
        return 'application/x-msmediaview';
      case 'm14':
        return 'application/x-msmediaview';
      case 'm1v':
        return 'video/mpeg';
      case 'm2t':
        return 'video/vnd.dlna.mpeg-tts';
      case 'm2ts':
        return 'video/vnd.dlna.mpeg-tts';
      case 'm2v':
        return 'video/mpeg';
      case 'm3u':
        return 'audio/x-mpegurl';
      case 'm3u8':
        return 'audio/x-mpegurl';
      case 'm4a':
        return 'audio/m4a';
      case 'm4b':
        return 'audio/m4b';
      case 'm4p':
        return 'audio/m4p';
      case 'm4r':
        return 'audio/x-m4r';
      case 'm4v':
        return 'video/x-m4v';
      case 'mac':
        return 'image/x-macpaint';
      case 'mak':
        return 'text/plain';
      case 'man':
        return 'application/x-troff-man';
      case 'manifest':
        return 'application/x-ms-manifest';
      case 'map':
        return 'text/plain';
      case 'master':
        return 'application/xml';
      case 'mda':
        return 'application/msaccess';
      case 'mdb':
        return 'application/x-msaccess';
      case 'mde':
        return 'application/msaccess';
      case 'mdp':
        return 'application/octet-stream';
      case 'me':
        return 'application/x-troff-me';
      case 'mfp':
        return 'application/x-shockwave-flash';
      case 'mht':
        return 'message/rfc822';
      case 'mhtml':
        return 'message/rfc822';
      case 'mid':
        return 'audio/mid';
      case 'midi':
        return 'audio/mid';
      case 'mix':
        return 'application/octet-stream';
      case 'mk':
        return 'text/plain';
      case 'mmf':
        return 'application/x-smaf';
      case 'mno':
        return 'text/xml';
      case 'mny':
        return 'application/x-msmoney';
      case 'mod':
        return 'video/mpeg';
      case 'mov':
        return 'video/quicktime';
      case 'movie':
        return 'video/x-sgi-movie';
      case 'mp2':
        return 'video/mpeg';
      case 'mp2v':
        return 'video/mpeg';
      case 'mp3':
        return 'audio/mpeg';
      case 'mp4':
        return 'video/mp4';
      case 'mp4v':
        return 'video/mp4';
      case 'mpa':
        return 'video/mpeg';
      case 'mpe':
        return 'video/mpeg';
      case 'mpeg':
        return 'video/mpeg';
      case 'mpf':
        return 'application/vnd.ms-mediapackage';
      case 'mpg':
        return 'video/mpeg';
      case 'mpp':
        return 'application/vnd.ms-project';
      case 'mpv2':
        return 'video/mpeg';
      case 'mqv':
        return 'video/quicktime';
      case 'ms':
        return 'application/x-troff-ms';
      case 'msi':
        return 'application/octet-stream';
      case 'mso':
        return 'application/octet-stream';
      case 'mts':
        return 'video/vnd.dlna.mpeg-tts';
      case 'mtx':
        return 'application/xml';
      case 'mvb':
        return 'application/x-msmediaview';
      case 'mvc':
        return 'application/x-miva-compiled';
      case 'mxp':
        return 'application/x-mmxp';
      case 'nc':
        return 'application/x-netcdf';
      case 'nsc':
        return 'video/x-ms-asf';
      case 'nws':
        return 'message/rfc822';
      case 'ocx':
        return 'application/octet-stream';
      case 'oda':
        return 'application/oda';
      case 'odc':
        return 'text/x-ms-odc';
      case 'odh':
        return 'text/plain';
      case 'odl':
        return 'text/plain';
      case 'odp':
        return 'application/vnd.oasis.opendocument.presentation';
      case 'ods':
        return 'application/oleobject';
      case 'odt':
        return 'application/vnd.oasis.opendocument.text';
      case 'one':
        return 'application/onenote';
      case 'onea':
        return 'application/onenote';
      case 'onepkg':
        return 'application/onenote';
      case 'onetmp':
        return 'application/onenote';
      case 'onetoc':
        return 'application/onenote';
      case 'onetoc2':
        return 'application/onenote';
      case 'orderedtest':
        return 'application/xml';
      case 'osdx':
        return 'application/opensearchdescription+xml';
      case 'p10':
        return 'application/pkcs10';
      case 'p12':
        return 'application/x-pkcs12';
      case 'p7b':
        return 'application/x-pkcs7-certificates';
      case 'p7c':
        return 'application/pkcs7-mime';
      case 'p7m':
        return 'application/pkcs7-mime';
      case 'p7r':
        return 'application/x-pkcs7-certreqresp';
      case 'p7s':
        return 'application/pkcs7-signature';
      case 'pbm':
        return 'image/x-portable-bitmap';
      case 'pcast':
        return 'application/x-podcast';
      case 'pct':
        return 'image/pict';
      case 'pcx':
        return 'application/octet-stream';
      case 'pcz':
        return 'application/octet-stream';
      case 'pdf':
        return 'application/pdf';
      case 'pfb':
        return 'application/octet-stream';
      case 'pfm':
        return 'application/octet-stream';
      case 'pfx':
        return 'application/x-pkcs12';
      case 'pgm':
        return 'image/x-portable-graymap';
      case 'pic':
        return 'image/pict';
      case 'pict':
        return 'image/pict';
      case 'pkgdef':
        return 'text/plain';
      case 'pkgundef':
        return 'text/plain';
      case 'pko':
        return 'application/vnd.ms-pki.pko';
      case 'pls':
        return 'audio/scpls';
      case 'pma':
        return 'application/x-perfmon';
      case 'pmc':
        return 'application/x-perfmon';
      case 'pml':
        return 'application/x-perfmon';
      case 'pmr':
        return 'application/x-perfmon';
      case 'pmw':
        return 'application/x-perfmon';
      case 'png':
        return 'image/png';
      case 'pnm':
        return 'image/x-portable-anymap';
      case 'pnt':
        return 'image/x-macpaint';
      case 'pntg':
        return 'image/x-macpaint';
      case 'pnz':
        return 'image/png';
      case 'pot':
        return 'application/vnd.ms-powerpoint';
      case 'potm':
        return 'application/vnd.ms-powerpoint.template.macroenabled.12';
      case 'potx':
        return 'application/vnd.openxmlformats-officedocument.presentationml.template';
      case 'ppa':
        return 'application/vnd.ms-powerpoint';
      case 'ppam':
        return 'application/vnd.ms-powerpoint.addin.macroenabled.12';
      case 'ppm':
        return 'image/x-portable-pixmap';
      case 'pps':
        return 'application/vnd.ms-powerpoint';
      case 'ppsm':
        return 'application/vnd.ms-powerpoint.slideshow.macroenabled.12';
      case 'ppsx':
        return 'application/vnd.openxmlformats-officedocument.presentationml.slideshow';
      case 'ppt':
        return 'application/vnd.ms-powerpoint';
      case 'pptm':
        return 'application/vnd.ms-powerpoint.presentation.macroenabled.12';
      case 'pptx':
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case 'prf':
        return 'application/pics-rules';
      case 'prm':
        return 'application/octet-stream';
      case 'prx':
        return 'application/octet-stream';
      case 'ps':
        return 'application/postscript';
      case 'psc1':
        return 'application/powershell';
      case 'psd':
        return 'application/octet-stream';
      case 'psess':
        return 'application/xml';
      case 'psm':
        return 'application/octet-stream';
      case 'psp':
        return 'application/octet-stream';
      case 'pub':
        return 'application/x-mspublisher';
      case 'pwz':
        return 'application/vnd.ms-powerpoint';
      case 'qht':
        return 'text/x-html-insertion';
      case 'qhtm':
        return 'text/x-html-insertion';
      case 'qt':
        return 'video/quicktime';
      case 'qti':
        return 'image/x-quicktime';
      case 'qtif':
        return 'image/x-quicktime';
      case 'qtl':
        return 'application/x-quicktimeplayer';
      case 'qxd':
        return 'application/octet-stream';
      case 'ra':
        return 'audio/x-pn-realaudio';
      case 'ram':
        return 'audio/x-pn-realaudio';
      case 'rar':
        return 'application/octet-stream';
      case 'ras':
        return 'image/x-cmu-raster';
      case 'rat':
        return 'application/rat-file';
      case 'rc':
        return 'text/plain';
      case 'rc2':
        return 'text/plain';
      case 'rct':
        return 'text/plain';
      case 'rdlc':
        return 'application/xml';
      case 'resx':
        return 'application/xml';
      case 'rf':
        return 'image/vnd.rn-realflash';
      case 'rgb':
        return 'image/x-rgb';
      case 'rgs':
        return 'text/plain';
      case 'rm':
        return 'application/vnd.rn-realmedia';
      case 'rmi':
        return 'audio/mid';
      case 'rmp':
        return 'application/vnd.rn-rn_music_package';
      case 'roff':
        return 'application/x-troff';
      case 'rpm':
        return 'audio/x-pn-realaudio-plugin';
      case 'rqy':
        return 'text/x-ms-rqy';
      case 'rtf':
        return 'application/rtf';
      case 'rtx':
        return 'text/richtext';
      case 'ruleset':
        return 'application/xml';
      case 's':
        return 'text/plain';
      case 'safariextz':
        return 'application/x-safari-safariextz';
      case 'scd':
        return 'application/x-msschedule';
      case 'sct':
        return 'text/scriptlet';
      case 'sd2':
        return 'audio/x-sd2';
      case 'sdp':
        return 'application/sdp';
      case 'sea':
        return 'application/octet-stream';
      case 'searchconnector-ms':
        return 'application/windows-search-connector+xml';
      case 'setpay':
        return 'application/set-payment-initiation';
      case 'setreg':
        return 'application/set-registration-initiation';
      case 'settings':
        return 'application/xml';
      case 'sgimb':
        return 'application/x-sgimb';
      case 'sgml':
        return 'text/sgml';
      case 'sh':
        return 'application/x-sh';
      case 'shar':
        return 'application/x-shar';
      case 'shtml':
        return 'text/html';
      case 'sit':
        return 'application/x-stuffit';
      case 'sitemap':
        return 'application/xml';
      case 'skin':
        return 'application/xml';
      case 'sldm':
        return 'application/vnd.ms-powerpoint.slide.macroenabled.12';
      case 'sldx':
        return 'application/vnd.openxmlformats-officedocument.presentationml.slide';
      case 'slk':
        return 'application/vnd.ms-excel';
      case 'sln':
        return 'text/plain';
      case 'slupkg-ms':
        return 'application/x-ms-license';
      case 'smd':
        return 'audio/x-smd';
      case 'smi':
        return 'application/octet-stream';
      case 'smx':
        return 'audio/x-smd';
      case 'smz':
        return 'audio/x-smd';
      case 'snd':
        return 'audio/basic';
      case 'snippet':
        return 'application/xml';
      case 'snp':
        return 'application/octet-stream';
      case 'sol':
        return 'text/plain';
      case 'sor':
        return 'text/plain';
      case 'spc':
        return 'application/x-pkcs7-certificates';
      case 'spl':
        return 'application/futuresplash';
      case 'src':
        return 'application/x-wais-source';
      case 'srf':
        return 'text/plain';
      case 'ssisdeploymentmanifest':
        return 'text/xml';
      case 'ssm':
        return 'application/streamingmedia';
      case 'sst':
        return 'application/vnd.ms-pki.certstore';
      case 'stl':
        return 'application/vnd.ms-pki.stl';
      case 'sv4cpio':
        return 'application/x-sv4cpio';
      case 'sv4crc':
        return 'application/x-sv4crc';
      case 'svc':
        return 'application/xml';
      case 'swf':
        return 'application/x-shockwave-flash';
      case 't':
        return 'application/x-troff';
      case 'tar':
        return 'application/x-tar';
      case 'tcl':
        return 'application/x-tcl';
      case 'testrunconfig':
        return 'application/xml';
      case 'testsettings':
        return 'application/xml';
      case 'tex':
        return 'application/x-tex';
      case 'texi':
        return 'application/x-texinfo';
      case 'texinfo':
        return 'application/x-texinfo';
      case 'tgz':
        return 'application/x-compressed';
      case 'thmx':
        return 'application/vnd.ms-officetheme';
      case 'thn':
        return 'application/octet-stream';
      case 'tif':
        return 'image/tiff';
      case 'tiff':
        return 'image/tiff';
      case 'tlh':
        return 'text/plain';
      case 'tli':
        return 'text/plain';
      case 'toc':
        return 'application/octet-stream';
      case 'tr':
        return 'application/x-troff';
      case 'trm':
        return 'application/x-msterminal';
      case 'trx':
        return 'application/xml';
      case 'ts':
        return 'video/vnd.dlna.mpeg-tts';
      case 'tsv':
        return 'text/tab-separated-values';
      case 'ttf':
        return 'application/octet-stream';
      case 'tts':
        return 'video/vnd.dlna.mpeg-tts';
      case 'txt':
        return 'text/plain';
      case 'u32':
        return 'application/octet-stream';
      case 'uls':
        return 'text/iuls';
      case 'user':
        return 'text/plain';
      case 'ustar':
        return 'application/x-ustar';
      case 'vb':
        return 'text/plain';
      case 'vbdproj':
        return 'text/plain';
      case 'vbk':
        return 'video/mpeg';
      case 'vbproj':
        return 'text/plain';
      case 'vbs':
        return 'text/vbscript';
      case 'vcf':
        return 'text/x-vcard';
      case 'vcproj':
        return 'application/xml';
      case 'vcs':
        return 'text/plain';
      case 'vcxproj':
        return 'application/xml';
      case 'vddproj':
        return 'text/plain';
      case 'vdp':
        return 'text/plain';
      case 'vdproj':
        return 'text/plain';
      case 'vdx':
        return 'application/vnd.ms-visio.viewer';
      case 'vml':
        return 'text/xml';
      case 'vscontent':
        return 'application/xml';
      case 'vsct':
        return 'text/xml';
      case 'vsd':
        return 'application/vnd.visio';
      case 'vsi':
        return 'application/ms-vsi';
      case 'vsix':
        return 'application/vsix';
      case 'vsixlangpack':
        return 'text/xml';
      case 'vsixmanifest':
        return 'text/xml';
      case 'vsmdi':
        return 'application/xml';
      case 'vspscc':
        return 'text/plain';
      case 'vss':
        return 'application/vnd.visio';
      case 'vsscc':
        return 'text/plain';
      case 'vssettings':
        return 'text/xml';
      case 'vssscc':
        return 'text/plain';
      case 'vst':
        return 'application/vnd.visio';
      case 'vstemplate':
        return 'text/xml';
      case 'vsto':
        return 'application/x-ms-vsto';
      case 'vsw':
        return 'application/vnd.visio';
      case 'vsx':
        return 'application/vnd.visio';
      case 'vtx':
        return 'application/vnd.visio';
      case 'wav':
        return 'audio/wav';
      case 'wave':
        return 'audio/wav';
      case 'wax':
        return 'audio/x-ms-wax';
      case 'wbk':
        return 'application/msword';
      case 'wbmp':
        return 'image/vnd.wap.wbmp';
      case 'wcm':
        return 'application/vnd.ms-works';
      case 'wdb':
        return 'application/vnd.ms-works';
      case 'wdp':
        return 'image/vnd.ms-photo';
      case 'webarchive':
        return 'application/x-safari-webarchive';
      case 'webtest':
        return 'application/xml';
      case 'wiq':
        return 'application/xml';
      case 'wiz':
        return 'application/msword';
      case 'wks':
        return 'application/vnd.ms-works';
      case 'wlmp':
        return 'application/wlmoviemaker';
      case 'wlpginstall':
        return 'application/x-wlpg-detect';
      case 'wlpginstall3':
        return 'application/x-wlpg3-detect';
      case 'wm':
        return 'video/x-ms-wm';
      case 'wma':
        return 'audio/x-ms-wma';
      case 'wmd':
        return 'application/x-ms-wmd';
      case 'wmf':
        return 'application/x-msmetafile';
      case 'wml':
        return 'text/vnd.wap.wml';
      case 'wmlc':
        return 'application/vnd.wap.wmlc';
      case 'wmls':
        return 'text/vnd.wap.wmlscript';
      case 'wmlsc':
        return 'application/vnd.wap.wmlscriptc';
      case 'wmp':
        return 'video/x-ms-wmp';
      case 'wmv':
        return 'video/x-ms-wmv';
      case 'wmx':
        return 'video/x-ms-wmx';
      case 'wmz':
        return 'application/x-ms-wmz';
      case 'wpl':
        return 'application/vnd.ms-wpl';
      case 'wps':
        return 'application/vnd.ms-works';
      case 'wri':
        return 'application/x-mswrite';
      case 'wrl':
        return 'x-world/x-vrml';
      case 'wrz':
        return 'x-world/x-vrml';
      case 'wsc':
        return 'text/scriptlet';
      case 'wsdl':
        return 'text/xml';
      case 'wvx':
        return 'video/x-ms-wvx';
      case 'x':
        return 'application/directx';
      case 'xaf':
        return 'x-world/x-vrml';
      case 'xaml':
        return 'application/xaml+xml';
      case 'xap':
        return 'application/x-silverlight-app';
      case 'xbap':
        return 'application/x-ms-xbap';
      case 'xbm':
        return 'image/x-xbitmap';
      case 'xdr':
        return 'text/plain';
      case 'xht':
        return 'application/xhtml+xml';
      case 'xhtml':
        return 'application/xhtml+xml';
      case 'xla':
        return 'application/vnd.ms-excel';
      case 'xlam':
        return 'application/vnd.ms-excel.addin.macroenabled.12';
      case 'xlc':
        return 'application/vnd.ms-excel';
      case 'xld':
        return 'application/vnd.ms-excel';
      case 'xlk':
        return 'application/vnd.ms-excel';
      case 'xll':
        return 'application/vnd.ms-excel';
      case 'xlm':
        return 'application/vnd.ms-excel';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'xlsb':
        return 'application/vnd.ms-excel.sheet.binary.macroenabled.12';
      case 'xlsm':
        return 'application/vnd.ms-excel.sheet.macroenabled.12';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'xlt':
        return 'application/vnd.ms-excel';
      case 'xltm':
        return 'application/vnd.ms-excel.template.macroenabled.12';
      case 'xltx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.template';
      case 'xlw':
        return 'application/vnd.ms-excel';
      case 'xml':
        return 'text/xml';
      case 'xmta':
        return 'application/xml';
      case 'xof':
        return 'x-world/x-vrml';
      case 'xoml':
        return 'text/plain';
      case 'xpm':
        return 'image/x-xpixmap';
      case 'xps':
        return 'application/vnd.ms-xpsdocument';
      case 'xrm-ms':
        return 'text/xml';
      case 'xsc':
        return 'application/xml';
      case 'xsd':
        return 'text/xml';
      case 'xsf':
        return 'text/xml';
      case 'xsl':
        return 'text/xml';
      case 'xslt':
        return 'text/xml';
      case 'xsn':
        return 'application/octet-stream';
      case 'xss':
        return 'application/xml';
      case 'xtp':
        return 'application/octet-stream';
      case 'xwd':
        return 'image/x-xwindowdump';
      case 'z':
        return 'application/x-compress';
      case 'zip':
        return 'application/x-zip-compressed';
      default:
        return 'application/octet-stream';
    }
  }

  public async handleFileInput(files: any[], drag = false) {
    var count = this.fileUploadList.length;
    this.getFolderPath();
    //console.log(files);
    var addedList = [];

    for (var i = 0; i < files.length; i++) {
      if (
        files[i].size >= this.maxFileSizeUpload &&
        this.maxFileSizeUpload != 0
      ) {
        var mess = this.titleMaxFileSiate.replace('{0}', files[i].name);
        mess = this.titleMaxFileSiate.replace(
          '{1}',
          this.maxFileSizeUploadMB.toString()
        );
        this.notificationsService.notify(mess);
        break;
      }

      let index = this.fileUploadList.findIndex(
        (d) => d.fileName.toString() === files[i].name.toString()
      ); //find index in your array
      if (index == -1) {
        var data: any;
        if (drag) {
          data = await files[i].arrayBuffer();
          data = this.arrayBufferToBase64(data);
        } else {
          data = await this.convertBlobToBase64(files[i].rawFile);
        }

        var fileUpload = new FileUpload();
        fileUpload.order = count;
        fileUpload.fileName = files[i].name;

        fileUpload.description = files[i].description; //

        var type = files[i].type.toLowerCase();
        if (type == 'png' || type == 'jpg' || type == 'bmp') {
          fileUpload.avatar = data;
        } else
          fileUpload.avatar = `../../../assets/codx/dms/${this.getAvatar(
            fileUpload.fileName
          )}`;
        fileUpload.extension =
          files[i].name.substring(
            files[i].name.lastIndexOf('.'),
            files[i].name.length
          ) || files[i].name;
        fileUpload.createdBy = this.user.userName;
        fileUpload.createdOn = this.getNow();
        //fileUpload. = files[i].type;
        fileUpload.mimeType = this.GetMimeType(files[i].type);
        fileUpload.type = files[i].type;
        fileUpload.objectType = this.objectType;
        fileUpload.objectId = this.objectId;
        fileUpload.fileSize = files[i].size;
        fileUpload.fileName = files[i].name;

        fileUpload.description = files[i].description; //

        fileUpload.funcId = this.functionID;
        fileUpload.folderType = this.folderType;
        fileUpload.referType = this.referType;
        fileUpload.reWrite = false;
        fileUpload.data = '';
        fileUpload.item = files[i];
        //fileUpload.folderId = this.folderId;
        fileUpload.folderId = this.dmSV.folderId.getValue();
        //fileUpload.permissions = this.remotePermission;
        //  if (this.parentFolder != null && this.parentFolder.permissions != null)
        //    fileUpload.permissions = JSON.parse(JSON.stringify(this.parentFolder.permissions));//Object.assign({}, this.parentFolder.permissions);
        // fileUpload = this.addEveryOnePermission(fileUpload);
        fileUpload.permissions = this.addPermissionForRoot(
          fileUpload.permissions
        );
        // if (this.remote) {
        //   fileUpload.permissions = this.remotePermission;
        // }
        addedList.push(Object.assign({}, fileUpload));
        this.fileUploadList.push(Object.assign({}, fileUpload));
      }
    }
    this.fileAdded.emit({ data: this.fileUploadList });
    //  this.fileCount.emit(data: addedList);
    //tbchung thêm vào để xử lý bên import template
    this.filePrimitive.emit(files);
    //////////////////////////////////
    this.fileCount.emit({ data: addedList });
    files = null;

    for (var i = 0; i < document.getElementsByName('UploadFiles').length; i++) {
      const input = document.getElementsByName('UploadFiles')[
        i
      ] as HTMLInputElement | null;
      if (input != null) {
        input.value = '';
      }
    }

    //  this.fileUploadList.next(this.fileUploadList);
    // this.fileAdded.emit({ data: this.fileUploadList });
    this.changeDetectorRef.detectChanges();

    return false;
  }

  clearData() {
    this.data = [];
    this.fileUploadList = [];
  }
  handleDeleteCount(e: any) {
    this.fileCount.emit(e);
  }
  handleView(e: any) {
    this.viewFile.emit(e);
  }
  handleDelete(e: any) {
    this.fileDelete.emit(e);
  }
}
