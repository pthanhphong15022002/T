import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnInit,
  Optional,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxGridviewComponent,
  CodxService,
  DataRequest,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { AttachmentComponent } from '../../attachment/attachment.component';
import { CodxImportAddMappingComponent } from './codx-import-add-mapping/codx-import-add-mapping.component';
import * as XLSX from 'xlsx';
import { IETables } from '../models/import.model';

@Component({
  selector: 'codx-import-add-template',
  templateUrl: './codx-import-add-template.component.html',
  styleUrls: ['./codx-import-add-template.component.scss'],
})
export class CodxImportAddTemplateComponent implements OnInit, OnChanges {
  type = 'add';
  active = '1';
  wb: any;
  dialog: any;
  submitted = false;
  gridModel: any;
  formModel: any;
  recID: any;
  data = {};
  grd: any;
  hideThumb = false;
  fileCount = 0;
  headerText: string = 'Thêm mới';
  columnsGrid: any;
  editSettings: any;
  dataIEConnections: any = {};
  dataIETables: any = {};
  sheet: any;
  mappingTemplate: any;
  importRule: any;
  importAddTmpGroup: FormGroup;
  formModels: any;
  selectedSheet: any;
  dataSave = {
    dataIETable: [],
    dataIEMapping: [],
    dataIEFieldMapping: [],
  };
  sourceField: any;
  //////////////////////
  service = 'SYS';
  /////////////////////
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  constructor(
    private callfunc: CallFuncService,
    private cache: CacheService,
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private notifySvr: NotificationsService,
    private codxService: CodxService,
    private ref: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.formModel = dt.data?.[1];
    if (dt.data[0]) this.type = dt.data[0];
    if (dt.data?.[2]) this.recID = dt.data?.[2];
    if (dt.data?.[3]) this.dataIEConnections = dt.data?.[3];
  }

  ngOnInit(): void {
    //Tạo formGroup
    this.importAddTmpGroup = this.formBuilder.group({
      nameTmp: ['', Validators.required],
      sheetImport: '',
      password: [''],
      firstCell: 1,
    });
    this.columnsGrid = [
      {
        headerText: 'ProcessIndex',
        width: '15%',
      },
      {
        headerText: 'DestinationTable',
        width: '20%',
      },
      {
        headerText: 'ParentEntity',
        width: '15%',
      },
      {
        headerText: 'MappingTemplate',
        width: '20%',
      },
      {
        headerText: 'ImportRule',
        width: '15%',
      },
      {
        headerText: 'IsSummary',
        width: '10%',
      },
    ];
    this.getDataCbb();

    this.editSettings = {
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      newRowPosition: 'Top',
    };
    this.formModels = {
      formName: 'IEConnections',
      gridViewName: 'grvIEConnections',
    };
    if (this.type == 'edit') {
      this.headerText = 'Chỉnh sửa';
      this.getDataEdit();
    }
  }
  getDataEdit() {
    var request = new DataRequest();
    request.page = 0;
    request.pageSize = 20;
    this.api
      .execSv<any>(
        this.service,
        'AD',
        'IETablesBusiness',
        'GetItemByIEConnectionAsync',
        [request, this.recID]
      )
      .subscribe((item) => {
        if (item && item[0]) {
          this.gridView.dataService.data = item[0];
          this.importAddTmpGroup.controls['sheetImport'].setValue(
            this.gridView.dataService.data[0]?.sourceTable
          );
        }
      });
    this.importAddTmpGroup.controls['nameTmp'].setValue(
      this.dataIEConnections?.description
    );
    this.importAddTmpGroup.controls['password'].setValue(
      this.dataIEConnections?.password
    );
    /*  this.api.execSv<any>(this.service,"AD","IEMappingsBusiness","GetItemByMappingTemplateAsync",this.dataIEConnections?.mappingTemplate).subscribe(item2=>{
      if(item2) 
      {
        this.dataSave.dataIEMapping = item2
      }
    }) */
  }
  ngOnChanges(changes: SimpleChanges) {}
  get f(): { [key: string]: AbstractControl } {
    return this.importAddTmpGroup.controls;
  }
  fileAdded(event: any) {
    if (event?.data && event?.data[0])
      this.dataIEConnections.fileName = event?.data[0].fileName;
  }
  getfileCount(e: any) {
    this.fileCount = e.data.length;
  }
  getfilePrimitive(e: any) {
    var dt = e[0]?.rawFile;
    if (dt) {
      const reader: FileReader = new FileReader();
      reader.readAsBinaryString(dt);
      reader.onload = (e: any) => {
        /* create workbook */
        const binarystr: string = e.target.result;
        (this.wb as XLSX.WorkBook) = XLSX.read(binarystr, { type: 'binary' });
        this.sheet = this.wb.SheetNames;
        this.importAddTmpGroup.controls['sheetImport'].setValue(this.sheet[0]);
        this.selectedSheet = this.sheet[0];
        this.dataIETables.sourceTable = this.sheet[0];
      };
    }
  }

  async onSave() {
    if (this.type == 'add') {
      this.attachment.objectId = this.dataIEConnections.recID;
      for (var i = 0; i < this.gridView.dataService.data.length; i++) {
        this.gridView.dataService.data[i].sourceTable =
          this.importAddTmpGroup.value.sheetImport;
        delete this.gridView.dataService.data[i].mappingName;
      }
      this.dataIEConnections.description = this.importAddTmpGroup.value.nameTmp;
      this.dataIEConnections.password = this.importAddTmpGroup.value.password;
      (await this.attachment.saveFilesObservable()).subscribe((item: any) => {
        if (item?.status == 0) {
          //Lưu IEConnections
          this.api
            .execSv<any>(
              'SYS',
              'AD',
              'IEConnectionsBusiness',
              'AddItemAsync',
              this.dataIEConnections
            )
            .subscribe((item) => {
              if (item) {
                this.api
                  .execSv<any>(
                    'SYS',
                    'AD',
                    'IETablesBusiness',
                    'AddItemAsync',
                    JSON.stringify(this.gridView.dataService.data)
                  )
                  .subscribe((item2) => {
                    if (item2) {
                      if (
                        this.dataSave.dataIEFieldMapping &&
                        this.dataSave.dataIEFieldMapping.length > 0
                      ) {
                        var result = [];
                        for (
                          var i = 0;
                          i < this.dataSave.dataIEFieldMapping.length;
                          i++
                        ) {
                          result = result.concat(
                            this.dataSave.dataIEFieldMapping[i].data
                          );
                        }
                        result.forEach(function (v) {
                          delete v.RecID;
                          delete v.recID;
                        });
                        if (result.length > 0) {
                          this.api
                            .execSv<any>(
                              'SYS',
                              'AD',
                              'IEFieldMappingBusiness',
                              'AddItemAsync',
                              JSON.stringify(result)
                            )
                            .subscribe((item3) => {
                              if (item3) {
                                this.dialog.close();
                                this.notifySvr.notifyCode('OD008');
                              } else this.notifySvr.notifyCode('SYS021');

                              // if(item) this.notifySvr.notifyCode('OD008');
                              // else this.notifySvr.notifyCode('SYS021');
                            });
                        }
                      } else {
                        this.dialog.close();
                        this.notifySvr.notifyCode('OD008');
                      }
                    } else this.notifySvr.notifyCode('SYS021');
                    // if(item) this.notifySvr.notifyCode('OD008');
                    // else this.notifySvr.notifyCode('SYS021');
                  });
              } else this.notifySvr.notifyCode('SYS021');
              // if(item) this.notifySvr.notifyCode('OD008');
              // else this.notifySvr.notifyCode('SYS021');
            });

          // this.api.execSv<any>("SYS","AD","IEMappingsBusiness","AddItemAsync",JSON.stringify(this.dataSave.dataIEMapping)).subscribe(item=>{
          //
          //   // if(item) this.notifySvr.notifyCode('OD008');
          //   // else this.notifySvr.notifyCode('SYS021');
          // })

          //
        } else this.notifySvr.notify('Vui lòng đính kèm file');
      });
    } else {
      if (this.dataSave.dataIETable.length > 0) {
        this.api
          .execSv<any>(
            'SYS',
            'AD',
            'IETablesBusiness',
            'AddItemAsync',
            JSON.stringify(this.dataSave.dataIETable)
          )
          .subscribe((item) => {
            if (item) {
              if (this.dataSave.dataIEFieldMapping.length > 0) {
                var result = [];
                for (
                  var i = 0;
                  i < this.dataSave.dataIEFieldMapping.length;
                  i++
                ) {
                  result = result.concat(
                    this.dataSave.dataIEFieldMapping[i].data
                  );
                }
                this.api
                  .execSv<any>(
                    'SYS',
                    'AD',
                    'IEFieldMappingBusiness',
                    'AddItemAsync',
                    JSON.stringify(result)
                  )
                  .subscribe((item2) => {
                    if (item2) {
                      this.dialog.close();
                      this.notifySvr.notifyCode('OD008');
                    } else {
                      this.notifySvr.notifyCode('SYS021');
                    }
                    // if(item) this.notifySvr.notifyCode('OD008');
                    // else this.notifySvr.notifyCode('SYS021');
                  });
              } else {
                this.dialog.close();
                this.notifySvr.notifyCode('OD008');
              }
            } else this.notifySvr.notifyCode('SYS021');
            // if(item) this.notifySvr.notifyCode('OD008');
            // else this.notifySvr.notifyCode('SYS021');
          });
      } else {
        this.dialog.close();
        this.notifySvr.notifyCode('OD008');
      }
    }
  }
  changeSheetImport(e: any) {
    this.importAddTmpGroup.controls['sheetImport'].setValue(e);
  }
  getGridViewSetup() {
    this.cache.gridViewSetup('IETables', 'grvIETables').subscribe((item) => {
      if (item) {
        this.grd = item;
        if (this.type == 'add') this.defaultData();
      }
    });
  }
  defaultData() {
    this.columnsGrid = [
      {
        headerText: this.grd['ProcessIndex']?.headerText,
        width: '15%',
      },
      {
        headerText: this.grd['DestinationTable']?.headerText,
        width: '20%',
      },
      {
        headerText: this.grd['ParentEntity']?.headerText,
        width: '15%',
      },
      {
        headerText: 'MappingName',
        width: '20%',
      },
      {
        headerText: this.grd['ImportRule']?.headerText,
        width: '15%',
      },
      {
        headerText: this.grd['IsSummary']?.headerText,
        width: '10%',
      },
    ];
    var recIDIEConnections = crypto.randomUUID();
    var mappingTemplate = crypto.randomUUID();
    var objConnections = {
      recID: recIDIEConnections,
      processIndex: 1,
      destinationTable: this.mappingTemplate?.TableName,
      parentEntity: '',
      mappingTemplate: '',
      importRule: this.importRule[0]?.value,
      isSummary: false,
      formName: 'PurchaseInvoices',
      gridViewName: 'grvPurchaseInvoices',
    };
    this.dataIEConnections = { ...objConnections, ...this.dataIEConnections };
    let ieTableID = crypto.randomUUID();
    var objIETables = new IETables();
    (objIETables.recID = ieTableID),
      (objIETables.sessionID = this.dataIEConnections.recID),
      (objIETables.sourceTable = ''),
      (objIETables.destinationTable = this.mappingTemplate?.TableName),
      (objIETables.mappingTemplate = ''),
      (objIETables.firstRowHeader = true);
    (objIETables.firstCell = '1'),
      (objIETables.importRule = this.importRule[0]?.value),
      (objIETables.processIndex = 1),
      (objIETables.isSummary = false),
      (this.dataIETables = { ...objIETables, ...this.dataIETables });
    // var objIEMapping =
    // {
    //   recID : this.dataIEConnections.mappingTemplate,
    //   tableName : this.mappingTemplate?.TableName,
    //   importRule: this.importRule[0]?.value,
    //   addBatchLink: false
    // }
    // this.dataIEMapping = {...objIEMapping , ...this.dataIEMapping}

    this.gridView.dataService.data.push(this.dataIETables);
    // this.dataSave.dataIEMapping.push(this.dataIEMapping);
    //this.gridView.addHandler(sdata,true,"recID")
  }
  getDataCbb() {
    var request = new DataRequest();
    request.comboboxName = 'MappingTemplate';
    request.page = 1;
    request.pageSize = 5;
    this.api
      .execSv('SYS', 'CM', 'DataBusiness', 'LoadDataCbxAsync', request)
      .subscribe((item) => {
        if (item[0]) {
          var data = JSON.parse(item[0]);
          //Nhớ sửa lại lấy cái đầu tiên
          this.mappingTemplate = data[0];
          if (this.type == 'add')
            this.importAddTmpGroup.controls['nameTmp'].setValue(
              this.mappingTemplate?.MappingName
            );
          this.dataIEConnections.mappingName =
            this.mappingTemplate?.MappingName;
          this.dataIETables.destinationTable =
            this.mappingTemplate?.MappingName;
          //this.dataIEMapping.mappingName = this.mappingTemplate?.MappingName;
          this.getGridViewSetup();
        }
      });
    /*  request.comboboxName = "EntityImport";
    this.api
    .execSv('SYS', 'CM', 'DataBusiness', 'LoadDataCbxAsync', request).subscribe(item=>{
      if(item[0])
      {
       
      }
        
    }) */
    this.cache.valueList('SYS010').subscribe((item) => {
      if (item) {
        this.importRule = item.datas;
      }
    });
  }
  openFormUploadFile() {
    this.attachment.uploadFile();
  }
  //Thêm mới template
  openFormAddTemplate() {
    if (!this.importAddTmpGroup.value.sheetImport)
      return this.notifySvr.notify('sheet import không được trống');
    this.sourceField = XLSX.utils.sheet_to_json(this.wb.Sheets[this.sheet[0]], {
      header: this.importAddTmpGroup.value.firstCell,
    });
    this.dataIETables.sourceTable = this.importAddTmpGroup.value.sheetImport;
    this.callfunc
      .openForm(
        CodxImportAddMappingComponent,
        null,
        1000,
        800,
        '',
        [
          this.formModel,
          this.dataIEConnections,
          null,
          null,
          null,
          'new',
          this.sourceField[0],
        ],
        null
      )
      .closed.subscribe((item) => {
        if (item?.event) {
          var dataTable = item?.event[0] as IETables;
          dataTable.sourceTable = this.dataIETables.sourceTable;
          //this.dataSave.dataIEMapping.push(item?.event[1]);
          if (item?.event[2] && item?.event[2].length > 0) {
            var obj = {
              table: dataTable.recID,
              data: item?.event[2],
            };
            this.dataSave.dataIEFieldMapping.push(obj);
          }
          this.dataSave.dataIETable.push(item?.event[0]);
          this.gridView.dataService.data.unshift(item?.event[0]);
          this.gridView.dataService.data = [...this.gridView.dataService.data];
        }
      });
  }
  getTextImportRule(id: any) {
    var data = this.importRule.filter((x) => x.value == id);
    if (data && data.length > 0) return data[0].text;
    return '';
  }
  edit(data: any) {
    if (!this.importAddTmpGroup.value.sheetImport)
      return this.notifySvr.notify('sheet import không được trống');
    this.sourceField = XLSX.utils.sheet_to_json(this.wb.Sheets[this.sheet[0]], {
      header: this.importAddTmpGroup.value.firstCell,
    });
    var index = this.dataSave.dataIEFieldMapping.findIndex(
      (x) => x.table == data?.recID
    );
    var dataIEMP = this.dataSave.dataIEFieldMapping[index]?.data;

    this.callfunc
      .openForm(
        CodxImportAddMappingComponent,
        null,
        1000,
        800,
        '',
        [
          this.formModel,
          this.dataIEConnections,
          data,
          null,
          dataIEMP,
          'edit',
          this.sourceField[0],
        ],
        null
      )
      .closed.subscribe((item) => {
        if (item?.event) {
          //Change Data table
          var findIndex = this.gridView.dataService.data.findIndex(
            (x) => x.recID == item?.event[0].recID
          );
          this.gridView.dataService.data[findIndex] = item?.event[0];
          this.gridView.dataService.data = [...this.gridView.dataService.data];
          if (
            item?.event[2] &&
            item?.event[2].length > 0 &&
            this.dataSave.dataIEFieldMapping.length > 0
          ) {
            var findIndex2 = this.dataSave.dataIEFieldMapping.findIndex(
              (x) => x.table == item?.event[0].recID
            );
            this.dataSave.dataIEFieldMapping[findIndex2].data = item?.event[2];
          } else {
            var obj = {
              table: item?.event[0].recID,
              data: item?.event[2],
            };
            this.dataSave.dataIEFieldMapping.push(obj);
          }
          //this.dataSave.dataIEFieldMapping = this.dataSave.dataIEFieldMapping.concat(item?.event[])
        }
      });
  }
  getIndexIEFieldMapping(id: any) {
    for (var i = 0; i < this.dataSave.dataIEFieldMapping.length; i++) {
      for (var x = 0; x < this.dataSave.dataIEFieldMapping[i].length; x++) {
        if (this.dataSave.dataIEFieldMapping[i][x].sessionID == id) return i;
      }
    }
    return 0;
  }
  getfileGet(e: any) {
    var recID = e[0]?.recID;
    this.api
      .exec<any>('DM', 'FileBussiness', 'GetFileBase64Async', recID)
      .subscribe((item) => {
        if (item) {
          fetch(item)
            .then((res) => res.blob()) // Gets the response and returns it as a blob
            .then((blob) => {
              let metadata = {
                type: e[0]?.extension,
              };
              let file = new File([blob], e[0]?.fileName, metadata);
              const reader: FileReader = new FileReader();
              reader.readAsBinaryString(file);
              reader.onload = (e: any) => {
                const binarystr: string = e.target.result;
                (this.wb as XLSX.WorkBook) = XLSX.read(binarystr, {
                  type: 'binary',
                });
                this.sheet = this.wb.SheetNames;
                this.selectedSheet =
                  this.gridView.dataService.data[0].sourceTable;
              };
            });
        }
      });
  }
}
