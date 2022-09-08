import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Html } from '@syncfusion/ej2-angular-diagrams';
import { DropDownList } from '@syncfusion/ej2-angular-dropdowns';
import {
  Column,
  GridComponent,
  SelectionSettingsModel,
} from '@syncfusion/ej2-angular-grids';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxGridviewComponent,
  DataRequest,
  DataService,
  DialogData,
  DialogModel,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { Observable, finalize, map, of } from 'rxjs';
import { MouseEventArgs } from '@syncfusion/ej2-base';
import { IETables } from '../../models/import.model';
@Component({
  selector: 'codx-import-add-mapping',
  templateUrl: './codx-import-add-mapping.component.html',
  styleUrls: ['./codx-import-add-mapping.component.scss'],
})
export class CodxImportAddMappingComponent implements OnInit, OnChanges {
  @ViewChild('grid') grid: GridComponent;
  service = "SYS";
  active = '1';
  dialog: any;
  submitted = false;
  gridModel: any;
  gridViewSetup: any;
  formModel: any;
  formModels: any = {};
  recID: any;
  data = {};
  hideThumb = false;
  fileCount = 0;
  headerText: string = 'Thêm mới';
  columnsGrid: any;
  editSettings: any;
  dataService: any = { data: null };
  fieldImport = [];
  dataImport = [];
  dataImport2 = [];
  date = new Date();
  sessionID: any;
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
  public contextMenuItems: any;
  public rowIndex: number;
  public cellIndex: number;
  public isDropdown = true;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.formModel = dt.data?.[0];
    this.dataIEConnection = dt.data?.[1];
    if(dt.data?.[2]) this.dataIETable = dt.data?.[2];
    if(dt.data?.[3]) this.dataIEMapping = dt.data?.[3];
    if(dt.data?.[5]) this.sourceField = dt.data?.[5];
    this.type = dt.data?.[4];
  }

  ngOnInit(): void {
    if(this.type == "edit")
      this.headerText = "Chỉnh sửa"
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
      mappingName: ["" , Validators.required],
      processIndex: [""],
      destinationTable: [""],
      parentEntity:[""],
      importRule: [""],
      isSummary: [false]
    });
    if(this.type == 'new') 
    {
      this.createData();
      this.getGridViewSetup();
    }
    else if(this.type == "edit") this.getDataEdit();
    this.formatSourceField();
   
  }
  formatSourceField()
  {
    if(this.sourceField)
    {
      var cbb = [];
      for(var i = 0 ; i< this.sourceField.length ; i++)
      {
        var obj = 
        {
          text : this.sourceField[i],
          value : this.sourceField[i],
        }
        cbb.push(obj);
      }
      this.dataCbb["SourceField"] = cbb;
    }
  }
  getDataEdit()
  {
    this.api.execSv<any>(this.service,"AD","IEFieldMappingBusiness","GetItemByIETableAsync",this.dataIETable?.recID).subscribe(item=>{
      if(item) 
      {
        debugger;
        this.dataIEFieldMapping = item
        //this.importAddTmpGroup.controls['sheetImport'].setValue(this.gridView.dataService.data[0]?.sourceTable);
      }
      else this.getGridViewSetup();
    })
    // Pass value IETable
    this.addMappingForm.controls['mappingName'].setValue(this.dataIETable.mappingTemplate);
    this.addMappingForm.controls['processIndex'].setValue(this.dataIETable.processIndex);
    this.addMappingForm.controls['destinationTable'].setValue(this.dataIETable.destinationTable);
    this.addMappingForm.controls['parentEntity'].setValue(this.dataIETable.parentEntity);
    this.addMappingForm.controls['importRule'].setValue(this.dataIETable.importRule);
    this.addMappingForm.controls['isSummary'].setValue(this.dataIETable.isSummary);
    /////////////////////
  }
  createData() {
    if (this.type == 'new') {
      //IETable
      this.dataIETable = new IETables();
      this.dataIETable.recID = crypto.randomUUID();
      this.dataIETable.sessionID = this.dataIEConnection.recID;
      this.dataIETable.mappingTemplate = this.dataIEConnection.mappingTemplate;
      //IEMapping
      this.dataIEMapping.recID = crypto.randomUUID();
      this.dataIEMapping.mappingName = '';
      this.dataIEMapping.tableName = '';
      this.dataIEMapping.importRule = '';
    }
  }

  load(args) {
    this.grid.element.addEventListener('mouseup', (e: MouseEventArgs) => {
      if ((e.target as HTMLElement).classList.contains("e-rowcell")) {
        if (this.grid.isEdit)
            this.grid.endEdit();
        let rowInfo = this.grid.getRowInfo(e.target) as any;
        let colindex: number = parseInt((e.target as HTMLElement).getAttribute("aria-colindex"));
        var check = this.fieldImport.filter(x=>(x.type == "3" || x.type == "2" || x.type=="SourceField") && x.text == rowInfo.column.field);
        if(check!=null&& check.length>0)  this.isDropdown = true;
        this.columnField = rowInfo.column.field
        // if (rowInfo.column.field === "CreatedBy")
        //     this.isDropdown = true;
        this.grid.selectRow(rowInfo.rowIndex);
        //this.grid.selectCell({ rowIndex: rowInfo.rowIndex, cellIndex:rowInfo.cellIndex });
        this.grid.startEdit();
      }
    });
  }

  onActionComplete(args) {
    if (args.requestType =="beginEdit") {
        this.isDropdown = false;
        args.form.querySelector('#'+this.grid.element.id+this.columnField).focus();
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
  onSave()
  {
    this.grid.endEdit();
    var result = this.grid.dataSource;
    if(this.addMappingForm.value?.parentEntity[0])
      this.addMappingForm.value.parentEntity = this.addMappingForm.value?.parentEntity[0];
    this.dataIETable.mappingName = this.dataIEMapping.mappingName = this.addMappingForm.value?.mappingName;
    this.dataIETable.processIndex = this.addMappingForm.value?.processIndex;
    this.dataIETable.destinationTable = this.dataIEMapping.tableName = this.addMappingForm.value?.destinationTable;
    this.dataIETable.parentEntity = this.addMappingForm.value?.parentEntity.length == 0 ?"":this.addMappingForm.value?.parentEntity;
    this.dataIETable.importRule = this.dataIEMapping.importRule = this.addMappingForm.value?.importRule;
    this.dataIETable.isSummary = this.addMappingForm.value?.isSummary;
    for (var i = 0; i < (result as any).length; i++) {
      result[i].sessionID = this.dataIETable.recID;
      result[i].mappingTemplate = "00000000-0000-0000-0000-000000000000";
    }
    this.dialog.close([this.dataIETable, this.dataIEMapping, result]);
  }
  addItem() {
    this.gridView.addRow();
  }
  getGridViewSetup() {
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((item) => {
        if (item) {
          var key = Object.keys(item);
          for (var i = 0; i < key.length; i++) {
            if (item[key[i]]?.isImport) {
              debugger;
              var obj = {
                destinationfield: key[i],
                sourcefield:item[key[i]].headerText
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
                  if (item[key[i]]?.isVisible) 
                  {
                    this.dataImport2 = this.dataImport;
                    let val = item[key[i]].referedValue;
                    let keys = key[i];
                    for (var x = 0; x < this.dataImport2.length; x++) {
                      if (item[keys]?.controlType == 'CheckBox')
                        this.dataImport2[x][keys] = false;
                      else if (keys == 'DestinationField' || keys == "SourceField") 
                      {
                        var keyss = keys.toLowerCase();
                        this.dataImport2[x][keys] = this.dataImport2[x][keyss];
                        if(this.sourceField.includes(this.dataImport2[x][keyss]) == false && keys == "SourceField") 
                          this.dataImport2[x][keys] = "";
                        delete this.dataImport2[x][keyss];
                      } 
                      else this.dataImport2[x][keys] = '';
                    }
                    var field2 = {
                      text: key[i],
                      controlType: item[keys]?.controlType,
                      type: item[keys]?.referedType,
                      value: item[keys]?.referedValue,
                      require: item[keys]?.isRequire,
                    };
                    if(keys == "SourceField")
                    {
                      field2.controlType = "ComboBox"
                      field2.value = "SourceField";
                      field2.type = "SourceField";
                      val = "SourceField";
                    }
                    if (
                      ((item[key[i]].referedType == '3' ||
                        item[key[i]].referedType == '2') && val && !(keys in this.editParams))
                      || (keys == "SourceField" && !(keys in this.editParams))
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
                          debugger;
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
        if(!this.dataIETable.destinationTable)
        {
          this.addMappingForm
          .get('destinationTable')
          .setValue(data?.component?.itemsSelected[0]?.TableName);
        }
      }
      this.addMappingForm.get(data?.field).setValue(result);
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
    if (
      (this.gridViewSetup[field].referedType == '2' ||
        this.gridViewSetup[field].referedType == '3') &&
      data[field]
    ) {
      var datas = this.dataCbb[this.gridViewSetup[field].referedValue].filter(
        (x) => x.value == data[field]
      );
      if (datas && datas.length > 0) return datas[0].text;
      return '';
    }
    return data[field];
  };
  getHeaderText(e: any) {
    //Viết hoa chữ đầu
    try
    {
      var key = e.charAt(0).toUpperCase() + e.slice(1); 
      return this.gridViewSetup[key].headerText;
    }
    catch(ex)
    {
      return e
    }
   
  }
  getEdit(e: any, field: any) {
    if (e == '3' || e == '2' || e=="SourceField") return this.editParams[field];
    return null;
  }
  getTextAligin(type:any)
  {
    if(type=="CheckBox") return "center";
    return 'left';
  }
}
