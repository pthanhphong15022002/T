import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnInit,
  Optional,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DropDownList } from '@syncfusion/ej2-angular-dropdowns';
import {
  Column,
  GridComponent,
  SelectionSettingsModel,
} from '@syncfusion/ej2-angular-grids';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxGridviewComponent,
  DataRequest,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { MouseEventArgs } from '@syncfusion/ej2-base';
import { IETables } from '../../models/import.model';
import { CodxImportAddMappingTemplateComponent } from './codx-import-add-mapping-template/codx-import-add-mapping-template.component';
import { BehaviorSubject, finalize, map, Observable, of } from 'rxjs';
@Component({
  selector: 'codx-import-add-mapping',
  templateUrl: './codx-import-add-mapping.component.html',
  styleUrls: ['./codx-import-add-mapping.component.scss'],
})
export class CodxImportAddMappingComponent implements OnInit, OnChanges {
  @ViewChild('grid') grid: GridComponent;
  service = 'SYS';
  dialog: any;
  gridViewSetup: any;
  formModel: any;
  formModels: any = {};
  recID: any;
  data = {};
  hideThumb = false;
  fileCount = 0;
  headerText: string = 'Thêm mới';
  editNew = false;
  columnsGrid: any;
  editSettings: any;
  dataService: any = { data: null };
  fieldImport = [];
  dataImport = [];
  currdataImport: any;
  dataImport2 = [];
  mappingTemplate: any;
  dataIEConnection: any = {};
  dataIETable: IETables = new IETables();
  dataIEMapping: any = {};
  dataIEFieldMapping: any;
  addMappingForm: any;
  dataCbb = {};
  editParams: any = {};
  element: any = {};
  dropObj: any = {};
  paramsCbb = {};
  type = 'new';
  columnField = '';
  selectionOptions: SelectionSettingsModel;
  customerIDRules: object;
  sourceField: any;
  hasTemp = false;
  hasOld = false;
  public contextMenuItems: any;
  public rowIndex: number;
  public cellIndex: number;
  public isDropdown = true;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private notifySvr: NotificationsService,
    private callfunc: CallFuncService,
    private ref: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.formModel = dt.data?.[0];
    this.dataIEConnection = dt.data?.[1];
    if (dt.data?.[2]) this.dataIETable = dt.data?.[2];
    if (dt.data?.[3]) this.dataIEMapping = dt.data?.[3];
    if (dt.data?.[4]) this.dataImport = dt.data?.[4];
    if (dt.data?.[6]) this.sourceField = dt.data?.[6];
    this.type = dt.data?.[5];
  }

  ngOnInit(): void {
    this.formModels = {
      formName: 'ImportFieldMapping',
      gridViewName: 'grvFieldMapping',
    };
    this.editSettings = {
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      mode: 'Normal',
    };
    this.selectionOptions = { type: 'Multiple' };
    this.customerIDRules = { required: true };
    this.contextMenuItems = [
      'AutoFit',
      'AutoFitAll',
      'SortAscending',
      'SortDescending',
      'Edit',
      'Delete',
      'Save',
      'Cancel',
      'FirstPage',
      'PrevPage',
      'LastPage',
      'NextPage',
      { text: 'Copy', target: '.e-content', id: 'customCopy' },
      { text: 'Paste', target: '.e-content', id: 'customPaste' },
    ];
    this.addMappingForm = this.formBuilder.group({
      mappingName: ['', Validators.required],
      processIndex: [''],
      destinationTable: [''],
      parentEntity: [''],
      importRule: [''],
      isSummary: [false],
    });
    if (this.type == 'new') {
      this.createData();
      this.getGridViewSetup();
    } else if (this.type == 'edit') {
      this.headerText = 'Chỉnh sửa';
      this.getDataEdit();
    }
    this.formatSourceField();
  }
  formatSourceField() {
    if (this.sourceField) {
      var cbb = [];
      for (var i = 0; i < this.sourceField.length; i++) {
        var obj = {
          text: this.sourceField[i],
          value: this.sourceField[i],
        };
        cbb.push(obj);
      }
      this.dataCbb['SourceField'] = cbb;
    }
  }
  getDataEdit() {
    this.mappingTemplate = this.dataIETable.mappingTemplate;

    // if(this.dataIETable.mappingTemplate && this.dataIETable.mappingTemplate != "00000000-0000-0000-0000-000000000000")
    // {
    //   this.getDataFieldMapping(this.dataIETable.mappingTemplate,true);
    // }
    // else
    // {
    //   if(this.dataImport && this.dataImport.length>0)
    //   {
    //     this.loadDataEdit();
    //   }
    //   else if(this.dataIETable?.recID)
    //   {
    //     this.api.execSv<any>(this.service,"AD","IEFieldMappingBusiness","GetItemByIETableAsync",[this.dataIETable?.recID,"table"]).subscribe(item=>{
    //       if(item && item.length >0)
    //       {
    //         this.mappingTemplate = this.dataIETable?.mappingTemplate;
    //         this.dataImport = item.sort((a,b)=>a.destinationField.localeCompare(b.destinationField));
    //         this.loadDataEdit();
    //         //this.getGridViewSetup();
    //         //this.importAddTmpGroup.controls['sheetImport'].setValue(this.gridView.dataService.data[0]?.sourceTable);
    //       }
    //       else if(this.dataImport && this.dataImport.length>0)
    //       {
    //         this.loadDataEdit();
    //       }
    //       else
    //       {
    //         this.editNew = true;
    //         this.getGridViewSetup();
    //       }
    //     })
    //   }
    // }
    if (this.dataImport && this.dataImport.length > 0) {
      this.loadDataEdit();
    } else if (this.dataIETable?.recID) {
      this.api
        .execSv<any>(
          this.service,
          'AD',
          'IEFieldMappingBusiness',
          'GetItemByIETableAsync',
          [this.dataIETable?.recID, 'table']
        )
        .subscribe((item) => {
          if (item && item.length > 0) {
            this.hasOld = true;
            this.mappingTemplate = this.dataIETable?.mappingTemplate;
            this.dataImport = item.sort((a, b) =>
              a.destinationField.localeCompare(b.destinationField)
            );
            this.loadDataEdit();
            //this.getGridViewSetup();
            //this.importAddTmpGroup.controls['sheetImport'].setValue(this.gridView.dataService.data[0]?.sourceTable);
          } else if (this.dataImport && this.dataImport.length > 0) {
            this.loadDataEdit();
          } else {
            this.editNew = true;
            this.getGridViewSetup();
          }
        });
    }
    if (
      this.dataIETable.mappingTemplate &&
      this.dataIETable.mappingTemplate != '00000000-0000-0000-0000-000000000000'
    ) {
      this.api
        .execSv<any>(
          this.service,
          'AD',
          'IEFieldMappingBusiness',
          'GetItemByIETableAsync',
          [this.dataIETable.mappingTemplate, 'mapping']
        )
        .subscribe((item) => {
          if (item && item.length > 0) {
            this.hasTemp = true;
            this.dataIEFieldMapping = item;
          }
        });
    }
    // Pass value IETable
    this.addMappingForm.controls['mappingName'].setValue(
      this.dataIETable.mappingTemplate
    );
    this.addMappingForm.controls['processIndex'].setValue(
      this.dataIETable.processIndex
    );
    this.addMappingForm.controls['destinationTable'].setValue(
      this.dataIETable.destinationTable
    );
    this.addMappingForm.controls['parentEntity'].setValue(
      this.dataIETable.parentEntity
    );
    this.addMappingForm.controls['importRule'].setValue(
      this.dataIETable.importRule
    );
    this.addMappingForm.controls['isSummary'].setValue(
      this.dataIETable.isSummary
    );
    /////////////////////
  }
  getDataFieldMapping(id: any, isLoad = false) {
    this.api
      .execSv<any>(
        this.service,
        'AD',
        'IEFieldMappingBusiness',
        'GetItemByIETableAsync',
        [id, 'mapping']
      )
      .subscribe((item) => {
        if (item && item.length > 0) {
          this.hasTemp = true;
          if (this.type == 'new' || this.editNew == true) {
            for (var i = 0; i < item.length; i++) {
              var key = Object.keys(item[i]);
              for (var x = 0; x < key.length; x++) {
                var text = key[x].charAt(0).toUpperCase() + key[x].slice(1);
                item[i][text] = item[i][key[x]];
                delete item[i][key[x]];
              }
            }
          }

          if (isLoad) {
            if (this.type == 'new')
              this.dataImport = item.sort((a, b) =>
                a.DestinationField.localeCompare(b.DestinationField)
              );
            else
              this.dataImport = item.sort((a, b) =>
                a.destinationField.localeCompare(b.destinationField)
              );
            this.dataIEFieldMapping = this.dataImport2;
            this.loadDataEdit();
          } else {
            if (this.type == 'new' || this.editNew == true)
              this.dataImport2 = item.sort((a, b) =>
                a.DestinationField.localeCompare(b.DestinationField)
              );
            else
              this.dataImport2 = item.sort((a, b) =>
                a.destinationField.localeCompare(b.destinationField)
              );
            this.dataIEFieldMapping = this.dataImport2;
            this.grid.refresh();
          }

          //this.getGridViewSetup();
          //this.importAddTmpGroup.controls['sheetImport'].setValue(this.gridView.dataService.data[0]?.sourceTable);
        }
      });
  }
  createData() {
    if (this.type == 'new') {
      this.dataIETable = new IETables();
      this.dataIETable.recID = crypto.randomUUID();
      this.dataIETable.sessionID = this.dataIEConnection.recID;
    }
  }
  loadDataEdit() {
    this.cache
      .gridViewSetup(this.formModels.formName, this.formModels.gridViewName)
      .subscribe((item2) => {
        this.gridViewSetup = item2;
        for (var i = 0; i < this.dataImport.length; i++) {
          var keyChild = Object.keys(this.dataImport[i]);
          for (var x = 0; x < keyChild.length; x++) {
            var text =
              keyChild[x].charAt(0).toUpperCase() + keyChild[x].slice(1);
            if (i == 0 && this.gridViewSetup[text]?.isVisible == true) {
              let field2 = {
                text: keyChild[x],
                controlType: this.gridViewSetup[text]?.controlType,
                type: this.gridViewSetup[text]?.referedType,
                value: this.gridViewSetup[text]?.referedValue,
                require: this.gridViewSetup[text]?.isRequire,
              };

              if (keyChild[x].toLowerCase() === 'sourceField'.toLowerCase()) {
                field2.text = text;
                field2.controlType = 'ComboBox';
                field2.value = text;
                field2.type = text;
              }
              this.fieldImport.push(field2);
              if (
                ((field2.type == '3' || field2.type == '2') &&
                  !(field2.text in this.editParams)) ||
                (field2.text == 'SourceField' &&
                  !(field2.text in this.editParams))
              ) {
                if (field2.type == '3') {
                  this.getDataCBB(field2.value);
                  this.getParamsCbb(field2.value);
                } else if (field2.type == '2') {
                  this.getDataVll(field2.value);
                }
                this.element[field2.text] = null as HTMLElement;
                this.dropObj[field2.text] = null as DropDownList;
                this.editParams[field2.text] = {
                  create: () => {
                    this.element[field2.text] = document.createElement('input');
                    return this.element[field2.text];
                  },
                  read: () => {
                    return this.dropObj[field2.text].value;
                  },
                  destroy: () => {
                    this.dropObj[field2.text].destroy();
                  },
                  write: (args: { rowData: object; column: Column }) => {
                    var fields = { text: 'text', value: 'value' };
                    if (field2.type == '3')
                      fields = this.paramsCbb[field2.value];
                    this.dropObj[field2.text] = new DropDownList({
                      dataSource: this.dataCbb[field2.value],
                      value: args.rowData[args.column.field],
                      fields: fields,
                      floatLabelType: 'Never',
                    });
                    this.dropObj[field2.text].appendTo(
                      this.element[field2.text]
                    );
                  },
                };
              }
            }
            if (keyChild[x] == 'sourceField') {
              this.dataImport[i]['SourceField'] =
                this.dataImport[i][keyChild[x]];
              delete this.dataImport[i][keyChild[x]];
            }
          }
        }
        var findIndex = this.fieldImport.findIndex(
          (x) => x.text.toLowerCase() === 'DestinationField'.toLowerCase()
        );
        this.arraymove(this.fieldImport, findIndex, 0);
        this.dataImport2 = this.dataImport;
        //this.ref.detectChanges();
        this.grid.refresh();
      });
  }
  load(args) {
    this.grid.element.addEventListener('mouseup', (e: MouseEventArgs) => {
      if ((e.target as HTMLElement).classList.contains('e-rowcell')) {
        if (this.grid.isEdit) this.grid.endEdit();
        let rowInfo = this.grid.getRowInfo(e.target) as any;
        let colindex: number = parseInt(
          (e.target as HTMLElement).getAttribute('aria-colindex')
        );
        var check = this.fieldImport.filter(
          (x) =>
            (x.type == '3' || x.type == '2' || x.type == 'SourceField') &&
            x.text == rowInfo.column.field
        );
        if (check != null && check.length > 0) this.isDropdown = true;
        this.columnField = rowInfo.column.field;
        // if (rowInfo.column.field === "CreatedBy")
        //     this.isDropdown = true;
        this.grid.selectRow(rowInfo.rowIndex);
        //this.grid.selectCell({ rowIndex: rowInfo.rowIndex, cellIndex:rowInfo.cellIndex });
        this.grid.startEdit();
      }
    });
  }

  onActionComplete(args) {
    if (args.requestType == 'beginEdit') {
      this.isDropdown = false;
      args.form
        .querySelector('#' + this.grid.element.id + this.columnField)
        .focus();
      // let dropdownObj = args.form.querySelector('.e-dropdownlist').ej2_instances[0];
      // dropdownObj.element.focus();
      // dropdownObj.showPopup();
    }
  }
  ngOnChanges(changes: SimpleChanges) {}

  fileAdded(event: any) {
    if (event?.data) this.hideThumb = true;
  }
  getfileCount(e: any) {
    this.fileCount = e.data.length;
  }
  onSave() {
    this.grid.endEdit();
    var result: any = this.grid.dataSource;
    if (this.addMappingForm.value?.parentEntity[0])
      this.addMappingForm.value.parentEntity =
        this.addMappingForm.value?.parentEntity[0];
    this.dataIETable.mappingTemplate = this.mappingTemplate
      ? this.mappingTemplate
      : '00000000-0000-0000-0000-000000000000';
    this.dataIETable.processIndex = this.addMappingForm.value?.processIndex;
    this.dataIETable.destinationTable =
      this.addMappingForm.value?.destinationTable;
    this.dataIETable.parentEntity =
      this.addMappingForm.value?.parentEntity.length == 0
        ? ''
        : this.addMappingForm.value?.parentEntity;
    this.dataIETable.importRule = this.addMappingForm.value?.importRule;
    this.dataIETable.isSummary = this.addMappingForm.value?.isSummary;
    //Thêm mới
    if (this.type == 'new') {
      // for (var i = 0; i < (result as any).length; i++)
      // {
      //   result[i].sessionID = this.dataIETable.recID
      //   if(this.mappingTemplate && this.hasTemp)
      //   {
      //     result[i].mappingTemplate = this.mappingTemplate
      //     delete  result[i].sessionID
      //   }
      //   else result[i].mappingTemplate = '00000000-0000-0000-0000-000000000000';
      // }
      //Có template
      if (this.hasTemp) {
        var arrResult = [];
        if (this.currdataImport && this.currdataImport.length > 0) {
          for (var i = 0; i < this.currdataImport.length; i++) {
            var dt2 = JSON.stringify(result[i]);
            var dt = JSON.parse(dt2);
            delete dt.RecID;
            delete dt.recID;
            dt.sessionID = this.dataIETable.recID;
            result[i].mappingTemplate = '00000000-0000-0000-0000-000000000000';
            if (this.editNew) {
              result[i].sessionID = this.dataIETable.recID;
            }
            if (this.mappingTemplate) {
              dt.mappingTemplate = this.mappingTemplate;
            }
            arrResult.push(dt);
          }
        }
        var method = this.editNew == true ? 'AddItemAsync' : 'UpdateItemAsync';
        this.api
          .execSv(
            'SYS',
            'AD',
            'IEFieldMappingBusiness',
            method,
            JSON.stringify(result)
          )
          .subscribe((item2) => {
            if (item2) {
              this.notifySvr.notifyCode('SYS007');
              if (this.editNew) this.dialog.close();
              else
                this.dialog.close([
                  this.dataIETable,
                  this.dataIEMapping,
                  arrResult,
                ]);
            } else this.notifySvr.notifyCode('SYS021');
          });
      }
      //Không có template
      else {
        for (var i = 0; i < (result as any).length; i++) {
          result[i].sessionID = this.dataIETable.recID;
          result[i].mappingTemplate = '00000000-0000-0000-0000-000000000000';
        }
        if (this.editNew) {
          this.api
            .execSv(
              'SYS',
              'AD',
              'IEFieldMappingBusiness',
              'AddItemAsync',
              JSON.stringify(result)
            )
            .subscribe((item2) => {
              if (item2) {
                this.notifySvr.notifyCode('SYS007');
                this.dialog.close();
              } else this.notifySvr.notifyCode('SYS021');
            });
        } else {
          this.dialog.close([this.dataIETable, this.dataIEMapping, result]);
        }
      }
    }
    //Chỉnh sửa
    else if (this.type == 'edit') {
      if (this.editNew) {
        this.type = 'new';
        this.onSave();
      }
      //Cũ
      else if (this.hasOld) {
        this.api
          .execSv(
            'SYS',
            'AD',
            'IETablesBusiness',
            'UpdateItemAsync',
            this.dataIETable
          )
          .subscribe((item2) => {
            if (item2) {
              
              if (this.hasTemp) {
                var arrResult = [];
                if (this.currdataImport && this.currdataImport.length > 0) {
                  for (var i = 0; i < result.length; i++) {
                    var dt2 = JSON.stringify(result[i]);
                    var dt = JSON.parse(dt2);
                    dt.recID = this.currdataImport[i].recID;
                    dt.sessionID = this.currdataImport[i].sessionID;
                    dt.mappingTemplate = this.currdataImport[i].mappingTemplate;
                    arrResult.push(dt);
                  }
                  result = result.concat(arrResult);
                } else if (
                  this.dataIEFieldMapping &&
                  this.dataIEFieldMapping.length > 0
                ) {
                  for (var i = 0; i < result.length; i++) {
                    var dt2 = JSON.stringify(result[i]);
                    var dt = JSON.parse(dt2);
                    dt.recID = this.dataIEFieldMapping[i].recID;
                    dt.sessionID = this.dataIEFieldMapping[i].sessionID;
                    dt.mappingTemplate =
                      this.dataIEFieldMapping[i].mappingTemplate;
                    arrResult.push(dt);
                  }
                  result = result.concat(arrResult);
                }
              }

              this.api
                .execSv(
                  'SYS',
                  'AD',
                  'IEFieldMappingBusiness',
                  'UpdateItemAsync',
                  JSON.stringify(result)
                )
                .subscribe((item2) => {
                  if (item2) {
                    this.notifySvr.notifyCode('SYS007');
                    this.dialog.close();
                  } else this.notifySvr.notifyCode('SYS021');
                });
            } else this.notifySvr.notifyCode('SYS021');
          });
      }
      //Mới
      else {
        if (this.hasTemp) {
          var arrResult = [];
          if (this.currdataImport && this.currdataImport.length > 0) {
            for (var i = 0; i < this.currdataImport.length; i++) {
              var dt2 = JSON.stringify(result[i]);
              var dt = JSON.parse(dt2);
              delete dt.recID;
              delete dt.RecID;
              dt.sessionID = this.dataIETable.recID;
              dt.mappingTemplate = this.mappingTemplate;
              arrResult.push(dt);
            }
          }
          this.api
            .execSv(
              'SYS',
              'AD',
              'IEFieldMappingBusiness',
              'UpdateItemAsync',
              JSON.stringify(result)
            )
            .subscribe((item2) => {
              if (item2) {
                this.notifySvr.notifyCode('SYS007');
                this.dialog.close([
                  this.dataIETable,
                  this.dataIEMapping,
                  arrResult,
                ]);
              } else this.notifySvr.notifyCode('SYS021');
            });
        } else {
          for (var i = 0; i < (result as any).length; i++) {
            delete result.recID;
            result[i].sessionID = this.dataIETable.recID;
            result[i].mappingTemplate = '00000000-0000-0000-0000-000000000000';
          }
          this.dialog.close([this.dataIETable, this.dataIEMapping, result]);
        }
      }
    }
  }
  onSaveTemplate() {
    this.callfunc
      .openForm(
        CodxImportAddMappingTemplateComponent,
        null,
        600,
        400,
        '',
        [this.formModel],
        null
      )
      .closed.subscribe((item) => {
        if (item?.event) {
          var obj = [
            {
              mappingName: item?.event,
              tableName: this.dataIETable?.destinationTable,
              importRule: this.addMappingForm.value?.importRule,
              addBatchLink: false,
            },
          ];
          this.api
            .execSv('SYS', 'AD', 'IEMappingsBusiness', 'AddItemAsync', obj)
            .subscribe((item2: any) => {
              if (item2) {
                //this.mappingTemplate = item2?.recID;
                this.grid.endEdit();
                var result = this.grid.dataSource;
                for (var i = 0; i < (result as any).length; i++) {
                  delete result[i].recID;
                  result[i].sessionID = this.mappingTemplate;
                  result[i].mappingTemplate =
                    '00000000-0000-0000-0000-000000000000';
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
                    if (item2) this.notifySvr.notifyCode('SYS007');
                    else this.notifySvr.notifyCode('SYS021');
                  });
              } else this.notifySvr.notifyCode('SYS021');
            });
        }
      });
  }
  addItem() {
    this.gridView.addRow();
  }
  compare(oldD: any, newD: any) {
    const isSameUser = (a, b) => a.value === b.value && a.display === b.display;
    // Get items that only occur in the left array,
    // using the compareFunction to determine equality.
    const onlyInLeft = (left, right, compareFunction) =>
      left.filter(
        (leftValue) =>
          !right.some((rightValue) => compareFunction(leftValue, rightValue))
      );

    const onlyInA = onlyInLeft(oldD, newD, isSameUser);
    const onlyInB = onlyInLeft(oldD, newD, isSameUser);

    const result = [...onlyInB];
  }
  getGridViewSetup() {
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((item) => {
        if (item) {
          var key = Object.keys(item);
          for (var i = 0; i < key.length; i++) {
            if (item[key[i]]?.isImport) {
              var obj = {
                destinationfield: key[i],
                sourcefield: item[key[i]].headerText,
              };
              this.dataImport.push(obj);
            }
          }
          this.cache
            .gridViewSetup(
              this.formModels.formName,
              this.formModels.gridViewName
            )
            .subscribe((item) => {
              if (item) {
                this.gridViewSetup = item;
                var key = Object.keys(item);
                for (var i = 0; i < key.length; i++) {
                  if (item[key[i]]?.isVisible) {
                    this.dataImport2 = this.dataImport;
                    let val = item[key[i]].referedValue;
                    let keys = key[i];
                    for (var x = 0; x < this.dataImport2.length; x++) {
                      if (item[keys]?.controlType == 'CheckBox')
                        this.dataImport2[x][keys] = false;
                      else if (
                        keys == 'DestinationField' ||
                        keys == 'SourceField'
                      ) {
                        var keyss = keys.toLowerCase();
                        this.dataImport2[x][keys] = this.dataImport2[x][keyss];
                        if (
                          this.sourceField.includes(
                            this.dataImport2[x][keyss]
                          ) == false &&
                          keys == 'SourceField'
                        )
                          this.dataImport2[x][keys] = '';
                        delete this.dataImport2[x][keyss];
                      } else this.dataImport2[x][keys] = '';
                    }
                    var field2 = {
                      text: key[i],
                      controlType: item[keys]?.controlType,
                      type: item[keys]?.referedType,
                      value: item[keys]?.referedValue,
                      require: item[keys]?.isRequire,
                    };
                    if (keys == 'SourceField') {
                      field2.controlType = 'ComboBox';
                      field2.value = 'SourceField';
                      field2.type = 'SourceField';
                      val = 'SourceField';
                    }
                    if (
                      ((item[key[i]].referedType == '3' ||
                        item[key[i]].referedType == '2') &&
                        val &&
                        !(keys in this.editParams)) ||
                      (keys == 'SourceField' && !(keys in this.editParams))
                    ) {
                      if (item[key[i]].referedType == '3') {
                        this.getDataCBB(val);
                        this.getParamsCbb(val);
                      } else if (item[key[i]].referedType == '2') {
                        this.getDataVll(val);
                      }
                      this.element[keys] = null as HTMLElement;
                      this.dropObj[keys] = null as DropDownList;
                      this.editParams[keys] = {
                        create: () => {
                          this.element[keys] = document.createElement('input');
                          return this.element[keys];
                        },
                        read: () => {
                          return this.dropObj[keys].value;
                        },
                        destroy: () => {
                          this.dropObj[keys].destroy();
                        },
                        write: (args: { rowData: object; column: Column }) => {
                          var fields = { text: 'text', value: 'value' };
                          if (item[keys].referedType == '3')
                            fields = this.paramsCbb[val];
                          this.dropObj[keys] = new DropDownList({
                            dataSource: this.dataCbb[val],
                            value: args.rowData[args.column.field],
                            fields: fields,
                            floatLabelType: 'Never',
                          });
                          this.dropObj[keys].appendTo(this.element[keys]);
                        },
                      };
                    }
                    if (keys == 'DestinationField')
                      this.fieldImport.unshift(field2);
                    else this.fieldImport.push(field2);
                    this.grid.refresh();
                  }
                }
              }
            });
        }
      });
  }
  changeValueText(item: any, field: any, data: any) {
    item[field] = data?.data;
    if (data?.component) {
      var value = data?.component?.dataSource.filter(
        (x) => x.value == data?.data
      );
      item[field] = value[0].text;
    }
  }
  changeValueCBB(data: any, check = false) {
    if (this.addMappingForm) {
      var result = data?.data;
      if (data?.component?.itemsSelected && check) {
        result = data?.component?.itemsSelected[0]?.MappingName;
        if (!this.dataIETable.destinationTable) {
          this.addMappingForm
            .get('destinationTable')
            .setValue(data?.component?.itemsSelected[0]?.TableName);
        }
      }
      this.addMappingForm.get(data?.field).setValue(result);
      if (data?.data) {
        this.currdataImport = this.dataImport2;
        this.mappingTemplate = data?.data;
        this.getDataFieldMapping(data?.data);
      }
    }
  }

  clicktest() {
    var a = this.dataImport;
  }
  html() {
    const child = document.createElement('td');
    let html = `<codx-input type="text"></codx-input>`;
    child.innerHTML = html;
  }
  getDataCBB(cbb: any) {
    var request = new DataRequest();
    request.comboboxName = cbb;
    request.page = 1;
    request.pageSize = 20;
    this.api
      .execSv('SYS', 'CM', 'DataBusiness', 'LoadDataCbxAsync', request)
      .subscribe((item) => {
        if (item[0]) {
          var data = JSON.parse(item[0]);
          this.dataCbb[cbb] = data;
        }
      });
  }
  getParamsCbb(cbb: any) {
    this.cache.combobox(cbb).subscribe((item) => {
      if (item)
        this.paramsCbb[cbb] = {
          text: item?.viewMember,
          value: item?.valueMember,
        };
    });
  }
  getDataVll(vll: any) {
    this.cache.valueList(vll).subscribe((item) => {
      if (item) {
        this.dataCbb[vll] = item?.datas;
      }
    });
  }
  getEditType(type: any) {
    if (type == 'ComBobox') return 'dropdownedit';
    else if (type == 'CheckBox') return 'booleanedit';
    return null;
  }
  getType(type: any) {
    if (type == 'CheckBox') return 'boolean';
    return null;
  }
  contextMenuOpen(args): void {
    this.rowIndex = args.rowInfo.rowIndex;
    this.cellIndex = args.rowInfo.cellIndex;
  }
  contextMenuClick(args): void {
    if (args.item.id === 'customCopy') {
      this.grid.copy();
    } else if (args.item.id === 'customPaste') {
      var rowIndex = this.rowIndex;
      var cellIndex = this.cellIndex;
      //var copyContent = this.grid.pase . .copyContent;
      //this.grid.clipboardModule.paste(copyContent, rowIndex, cellIndex);
    }
  }
  valueAccess = (field: string, data: object, column: object) => {
    var text = field.charAt(0).toUpperCase() + field.slice(1);
    if (
      (this.gridViewSetup[text].referedType == '2' ||
        this.gridViewSetup[text].referedType == '3') &&
      data[field]
    ) {
      try {
        var datas = this.dataCbb[this.gridViewSetup[text].referedValue].filter(
          (x) => x.value == data[text]
        );
        if (datas && datas.length > 0) return datas[0].text;
        return '';
      } catch (ex) {
        return data[field];
      }
    }
    return data[field];
  };
  getHeaderText(e: any) {
    //Viết hoa chữ đầu
    try {
      var key = e.charAt(0).toUpperCase() + e.slice(1);
      return this.gridViewSetup[key].headerText;
    } catch (ex) {
      return e;
    }
  }
  getEdit(e: any, field: any) {
    if (e == '3' || e == '2' || e == 'SourceField')
      return this.editParams[field];
    return null;
  }
  getTextAligin(type: any) {
    if (type == 'CheckBox') return 'center';
    return 'left';
  }
  // private fetch(ass:any,cls:any,mt:any,request:any): Observable<any[]> {
  //   return this.api
  //     .execSv<Array<any>>(
  //       this.service,
  //       ass,
  //       cls,
  //       mt,
  //       request
  //     )
  //     .pipe(
  //       finalize(() => {
  //         /*  this.onScrolling = this.loading = false;
  //         this.loaded = true; */
  //       }),
  //       map((response: any) => {

  //           return response;
  //       })
  //     );
  // }
  arraymove(arr: any, fromIndex: any, toIndex: any) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  }
}
