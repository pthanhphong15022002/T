import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
  AbstractControl,
} from '@angular/forms';
import { FileService } from '@shared/services/file.service';
import {
  ApiHttpService,
  AuthService,
  CacheService,
  CodxService,
  DataRequest,
  DialogData,
  DialogRef,
  NotificationsService,
  TenantStore,
} from 'codx-core';
import { type } from 'os';
import { Observable, from, map, mergeMap, of } from 'rxjs';
import { AttachmentComponent } from '../../attachment/attachment.component';
import { DocumentEditorContainerComponent } from '@syncfusion/ej2-angular-documenteditor';
import { environment } from 'src/environments/environment';
import {
  ClickEventArgs,
  MenuItemModel,
} from '@syncfusion/ej2-angular-navigations';
import { lvFileClientAPI } from '@shared/services/lv.component';
import { SelectEventArgs } from '@syncfusion/ej2-angular-lists';

@Component({
  selector: 'codx-export-add',
  templateUrl: './codx-export-add.component.html',
  styleUrls: ['./codx-export-add.component.scss'],
})
export class CodxExportAddComponent implements OnInit, OnChanges {
  @ViewChild('documenteditor_default')
  public container: DocumentEditorContainerComponent;
  @ViewChild('attachment1') attachment1: AttachmentComponent;
  @ViewChild('attachment2') attachment2: AttachmentComponent;
  @Output() setDefaultValue = new EventEmitter();

  idCrrFile: any;
  type: any;
  action: any;
  data: any;
  dialog: any;
  lblExtend: string = '';
  headerText: any;
  exportAddForm: FormGroup;
  submitted = false;
  refID: any; // Thảo thêm để thêm biến lưu cho temEx
  refType: any; // Thảo thêm để thêm biến lưu cho temEx
  fileCount = 0;
  module: any;
  defaultDocument: any;
  serviceUrl: any;
  nameFile: any;
  isContentChange = false;
  formModel: any;
  gridViewSettup: any;
  listFeild = [];
  showInsert = false;
  constructor(
    private tenant: TenantStore,
    private readonly auth: AuthService,
    private formBuilder: FormBuilder,
    private api: ApiHttpService,
    private cache: CacheService,
    private notifySvr: NotificationsService,
    private file: FileService,
    private codxService: CodxService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.action = dt.data?.action;
    this.type = dt.data?.type;
    this.refID = dt.data?.refID; // Thảo thêm để thêm biến lưu cho temEx
    this.refType = dt.data?.refType; // Thảo thêm để thêm biến lưu cho temEx
    this.formModel = dt.data.formModel;
    if (this.action == 'add') {
      this.headerText = 'Thêm ' + this.type + ' Template';
    } else if (this.action == 'edit') {
      this.headerText = 'Chỉnh sửa ' + this.type + ' Template';
    }
    this.data = dialog.dataService;
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.module =
      this.type == 'excel' ? 'AD_ExcelTemplates' : 'AD_WordTemplates';
    if (this.type == 'excel') {
      this.exportAddForm = this.formBuilder.group({
        templateName: [this.data?.templateName, Validators.required],
        description: this.data?.description,
        pWControl: this.data?.pWControl,
        pWDefault: this.data?.pWDefault,
        isDefault: this.data?.isDefault != null ? this.data?.isDefault : false,
        covertPDF: this.data?.covertPDF != null ? this.data?.covertPDF : false,
        sheetIndex: [
          this.data?.sheetIndex != null ? this.data?.sheetIndex : 0,
          Validators.required,
        ],
        headerRow: [this.data?.headerRow, Validators.required],
        headerColumn: this.data?.headerColumn,
        splitPagesOn: this.data?.splitPagesOn,
        splitPagesMode: this.data?.splitPagesMode,
        rowNoIndex: this.data?.rowNoIndex,
        rowNoReset: this.data?.rowNoReset,
        groupName1: this.data?.groupName1,
        groupName2: this.data?.groupName2,
        groupName3: this.data?.groupName3,
        groupTotal1: this.data?.groupTotal1,
        groupTotal2: this.data?.groupTotal2,
        groupTotal3: this.data?.groupTotal3,
      });
    } else {
      this.api
        .execSv('SYS', 'AD', 'WordTemplatesBusiness', 'GetDefaultAsync', [
          'WordTemplates',
          'grvWordTemplates',
          this.action == 'add',
        ])
        .subscribe((res: any) => {
          if (!res) return;
          var gridview = res.gridview;
          this.cache.setGridView('grvWordTemplates', gridview);
          var gridviewSetup = res.gridviewSetup;
          this.cache.setGridViewSetup(
            'WordTemplates',
            'grvWordTemplates',
            gridviewSetup
          );
          if (this.action == 'add') {
            this.data = res.data;
            this.exportAddForm = this.formBuilder.group({
              templatetID: [this.data?.templatetID],
              templateName: [this.data?.templateName, Validators.required],
              description: this.data?.description,
              pWControl: '',
              pWDefault: '',
              owner: this.data?.owner,
              buid: this.data?.buid,
              createdOn: this.data?.createdOn,
            });
          } else {
            this.exportAddForm = this.codxService.buildFormGroup(
              'WordTemplates',
              'grvWordTemplates',
              'AD_WordTemplates',
              this.data
            );

            // this.exportAddForm.addControl('pWControl', new FormControl(''));
            // this.exportAddForm.addControl('pWDefault', new FormControl(''));
          }
        });
      this.getGridView();
      //Url service word
      let baseurl: string = environment.apiUrl + '/api/documenteditor/import';
      baseurl +=
        '?sk=' +
        btoa(
          this.auth.userValue.userID + '|' + this.auth.userValue.securityKey
        );
      this.serviceUrl = baseurl;
    }
  }
  public fields: object = { tooltip: 'category' };
  getGridView() {
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((item) => {
        var key = Object.keys(item);
        this.gridViewSettup = [];
        for (var i = 0; i < key.length; i++) {
          if (item[key[i]]?.isTemplate == '1') {
            var obj = {
              text: item[key[i]]?.headerText,
              category: 'Drag or click the field to insert.',
              htmlAttributes: { draggable: true },
            };

            var obj2 = {
              key: key[i],
              headerText: item[key[i]]?.headerText,
              referedType: item[key[i]]?.referedType,
              referedValue: item[key[i]]?.referedValue,
            };

            this.gridViewSettup.push(obj2);

            this.listFeild.push(obj);
          }
        }
      });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.exportAddForm.controls;
  }

  ngOnChanges(changes: SimpleChanges) {}

  openFormUploadFile() {
    this.type == 'word'
      ? this.attachment1.uploadFile()
      : this.attachment2.uploadFile();
  }

  onSave() {
    this.submitted = true;
    if (this.exportAddForm.invalid) return;
    if (this.type == 'excel') {
      this.exportAddForm.value.owner = 'a';
      this.exportAddForm.value.buid = 'a';
      //Thêm mới
      if (this.action == 'add') {
        this.exportAddForm.value.refID = this.refID; // Thảo thêm để thêm biến lưu cho temEx
        this.exportAddForm.value.refType = this.refType; // Thảo thêm để thêm biến lưu cho temEx
        if (this.fileCount > 0) {
          this.api
            .execSv(
              'SYS',
              'AD',
              'ExcelTemplatesBusiness',
              'SaveTemplateAsync',
              this.exportAddForm.value
            )
            .subscribe((item) => {
              if (item && item[0]) {
                this.notifySvr.notifyCode('RS002');
                this.attachment2.objectId = item[1].recID;
                this.attachment2.fileUploadList.forEach(elm=>{
                  elm.objectType ='AD_ExcelTemplates';
                });
                //this.attachment2.saveFiles();
                //Upload file
                this.attachment2.saveFilesObservable().then((saveFile) => {
                  if (saveFile) {
                    saveFile.subscribe((saved: any) => {
                      if (saved) {
                        //Trả về thông tin khi upload file thành công
                        let fileName = saved.data?.fileName; // report cần trả về fileName để set reportName
                        this.dialog.close([item[1], this.type, fileName]);
                      } else {
                        this.notifySvr.notify('SYS023');
                      }
                    });
                  }
                });
              } else this.notifySvr.notifyCode('SYS023');
            });
        } else this.notifySvr.notifyCode('OD022');
      }
      //Chỉnh sửa
      else if (this.action == 'edit') {
        this.exportAddForm.value.recID = this.data.recID;
        this.exportAddForm.value.refID = this.data.refID; // Thảo thêm để thêm biến lưu cho temEx
        this.exportAddForm.value.refType = this.data.refType; // Thảo thêm để thêm biến lưu cho temEx
        this.api
          .execActionData<any>(
            'AD_ExcelTemplates',
            [this.exportAddForm.value],
            'UpdateAsync'
          )
          .subscribe((item) => {
            if (item[0] == true) {
              this.notifySvr.notifyCode('RS002');
              this.attachment2.objectId = item[1][0].recID;
              this.attachment2.fileUploadList.forEach(elm=>{
                elm.objectType ='AD_ExcelTemplates';
              });
              if (this.fileCount > 0) {
                /* this.file.deleteFileByObjectIDType(this.idCrrFile,"AD_ExcelTemplates",true).subscribe(item=>{
                  console.log(item);
                }); */
                this.file
                  .deleteFileToTrash(this.idCrrFile, '', true)
                  .subscribe();
                this.attachment2.objectId = item[1][0].recID;
                //this.attachment2.saveFiles();
                //Upload file mới
                this.attachment2.saveFilesObservable().then((saveFile) => {
                  if (saveFile) {
                    saveFile.subscribe((saved) => {
                      if (saved) {
                        //Trả về thông tin khi upload thành công + kèm biến phân biệt có upload lại file
                        this.dialog.close([
                          item[1][0],
                          this.type,
                          true /*true:Up lại file khi edit*/,
                        ]);
                      } else {
                        this.notifySvr.notify('SYS021');
                      }
                    });
                  }
                });
              }
            } else this.notifySvr.notify('SYS021');
          });
      }
    } else {
      if (this.action == 'add') {
        this.api
          .execActionData(
            'AD_WordTemplates',
            [this.exportAddForm.value],
            'SaveAsync'
          )
          .subscribe((item) => {
            if (item && item.length > 1) {
              this.notifySvr.notifyCode('RS002');
              this.attachment1.objectId = item[1][0].recID;
              this.attachment1.objectType = 'AD_WordTemplates';
              this.attachment1.fileUploadList.forEach(elm=>{
                elm.objectType ='AD_WordTemplates';
              });
              this.onSaveWord().subscribe(saveW =>{
                if(saveW) this.dialog.close([item[1][0], this.type,this.nameFile]);
              });
              
            } else this.notifySvr.notifyCode('SYS023');
          });
      } else {
        this.exportAddForm.value.docFile = null;
        this.exportAddForm.value.xmlFile = null;
        this.exportAddForm.value.xmlSchemaFile = null;
        this.exportAddForm.value.xsltStylessheet = null;
        if (!this.exportAddForm.value.isDefault)
          this.exportAddForm.value.isDefault = false;
        if (!this.exportAddForm.value.isLocal)
          this.exportAddForm.value.isLocal = false;
        if (!this.exportAddForm.value.isSystem)
          this.exportAddForm.value.isSystem = false;
        this.api
          .execActionData<any>(
            'AD_WordTemplates',
            [this.exportAddForm.value],
            'UpdateAsync'
          )
          .subscribe((item) => {
            if (!item) return;
            if (item[0] == true) {
              if (this.isContentChange) 
              {
                this.file
                  .deleteFileToTrash(this.idCrrFile, '', true)
                  .subscribe((res) => {
                    if (res) {
                      this.attachment1.objectId = this.data.recID;
                      this.attachment1.objectType = 'AD_WordTemplates';
                      this.attachment1.fileUploadList.forEach(elm=>{
                        elm.objectType ='AD_WordTemplates';
                      });
                      this.onSaveWord().subscribe(saveW =>{
                        if(saveW) this.dialog.close([item[1][0], this.type]);
                      });
                    }
                  });
              }
              else this.dialog.close([item[1][0], this.type]);
              this.notifySvr.notifyCode('RS002');
            } 
            else 
            {
              this.notifySvr.notify('SYS021');
            }
          });
      }
    }
  }

  getfileCount(e: any) {
    this.fileCount = e.data.length;
  }

  fileSave(e: any) {
    this.nameFile = e?.fileName;
    this.loadContentWord(e?.urlPath, e?.uploadId);
  }

  loadContentWord(url: any, uploadId: any = null) {
    let http: XMLHttpRequest = new XMLHttpRequest();
    let content = { fileUrl: environment.urlUpload + '/' + url };
    http.withCredentials = true;
    http.open('Post', this.serviceUrl, true);
    http.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    http.onreadystatechange = () => {
      if (http.readyState === 4) {
        if (http.status === 200 || http.status === 304) {
          //open the SFDT text in Document Editor
          this.container.documentEditor.open(http.responseText);
          if (uploadId) this.deleteFile(uploadId);
          this.changeDetectorRef.detectChanges();
        } else {
          //this.notificationsService.notifyCode("DM065");
        }
      }
    };
    //this.container.documentEditor.documentName = this.data?.fileName;
    http.send(JSON.stringify(content));
  }

  getFile(e: any) {
    if (!e || (e && e.length == 0)) return;
    this.idCrrFile = e[0].recID;

    if (this.type == 'word' && this.action == 'edit') {
      this.nameFile = e[0].fileName;
      this.loadContentWord(e[0].pathDisk);
    }
  }
  onSaveWord() : Observable<any[]| any>{
    var saveAsBlob = this.container.documentEditor.saveAsBlob('Docx');
    var fSaveAsBlob = from(saveAsBlob);
    return fSaveAsBlob.pipe(mergeMap((blob: Blob)=>{
      var file = new File([blob], this.nameFile);
      this.attachment1.isSaveSelected = '1';
      this.attachment1.fileUploadList = [];
      return this.attachment1.handleFileInputObservable([
        { name: this.nameFile, rawFile: file, type: 'docx', size: file.size },
      ]);
    }));
    //return of(null);
  }

  deleteFile(uploadID: any) {
    lvFileClientAPI.setUrl(environment.urlUpload); //"http://192.168.18.36:8011");
    lvFileClientAPI.postAsync(`api/${this.tenant.getName()}/files/delete`, {
      UploadId: uploadID,
    });
  }

  onDocumentChange() {
    this.isContentChange = true;
    this.container.documentEditor.resize();
  }

  onCreate() {
    this.container.toolbarItems = this.container.toolbarItems.filter(
      (x) => x != 'New' && x != 'Open'
    );
    this.container.toolbarItems.unshift({
      prefixIcon: 'bi bi-file-spreadsheet-fill',
      tooltipText: 'Insert Field',
      text: this.onWrapText('Insert Field'),
      id: 'InsertField',
    });
    // document.getElementById("listview").addEventListener("dragstart", function (event) {
    //   event.dataTransfer.setData("Text", (event.target as any).innerText);
    //   (event.target as any).classList.add('de-drag-target');
    // });
    this.container.documentEditor.element.addEventListener(
      'dragover',
      function (event) {
        event.preventDefault();
      }
    );

    // Drop Event for document editor element
    this.container.documentEditor.element.addEventListener('drop', (e) => {
      var text = e.dataTransfer.getData('Text'); //.replace(/\n/g, '').replace(/\r/g, '').replace(/\r\n/g, '');
      this.container.documentEditor.selection.select({
        x: e.offsetX,
        y: e.offsetY,
        extend: false,
      });
      //this.container.documentEditor.editor.insertText(text);
      this.insertField(text);
    });

    document.addEventListener('dragend', (event) => {
      if ((event.target as any).classList.contains('de-drag-target')) {
        (event.target as any).classList.remove('de-drag-target');
      }
    });
  }

  dragStart(event: any) {
    event.dataTransfer.setData('Text', (event.target as any).innerText);
    //(event.target as any).classList.add('de-drag-target');
  }

  insertField(fieldName: any): void {
    var fieldInfo = this.container.documentEditor.selection.getFieldInfo();
    if (fieldInfo && fieldInfo.code.includes('MERGEFIELD')) return;

    let fileName: any = fieldName
      .replace(/\n/g, '')
      .replace(/\r/g, '')
      .replace(/\r\n/g, '');
    let fieldCode: any = 'MERGEFIELD  ' + fileName + '  \\* MERGEFORMAT ';
    var text = fieldName;

    var check = this.gridViewSettup.filter((x) => x.headerText == text);
    if (Array.isArray(check))
      text += '|' + check[0].referedType + '|' + check[0].referedValue;
    this.container.documentEditor.editor.insertField(
      fieldCode,
      '[' + text + ']'
    );
    this.container.documentEditor.focusIn();
  }

  onSelect(text: any): void {
    this.insertField(text);
  }

  onWrapText(text: string): string {
    let content: string = '';
    let index: number = text.lastIndexOf(' ');
    content = text.slice(0, index);
    text.slice(index);
    content += '<div class="e-de-text-wrap">' + text.slice(index) + '</div>';
    return content;
  }

  toolbarClick = (args: ClickEventArgs): void => {
    switch (args.item.id) {
      case 'InsertField':
        this.showInsertFielddialog();
        break;
    }
  };

  showInsertFielddialog() {
    this.showInsert = !this.showInsert;
    this.container.documentEditor.focusIn();
  }
}
