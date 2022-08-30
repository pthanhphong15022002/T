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
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Html } from '@syncfusion/ej2-angular-diagrams';
import { DropDownList } from '@syncfusion/ej2-angular-dropdowns';
import { Column, GridComponent, SelectionSettingsModel } from '@syncfusion/ej2-angular-grids';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { AlertConfirmInputConfig, ApiHttpService, CacheService, CallFuncService, CodxGridviewComponent, DataRequest, DataService, DialogData, DialogModel, DialogRef, NotificationsService } from 'codx-core';
import { Observable, finalize, map, of } from 'rxjs';
import { MouseEventArgs } from '@syncfusion/ej2-base';
import { IETables } from '../../models/import.model';
@Component({
  selector: 'codx-import-add-mapping',
  templateUrl: './codx-import-add-mapping.component.html',
  styleUrls: ['./codx-import-add-mapping.component.scss'],
})
export class CodxImportAddMappingComponent implements OnInit, OnChanges {
  @ViewChild('grid') grid : GridComponent;
  active = "1";
  dialog: any;
  submitted = false;
  gridModel: any;
  gridViewSetup:any;
  formModel: any;
  formModels:any = {};
  recID: any
  data = {}
  hideThumb = false;
  fileCount = 0;
  headerText: string = "Thêm mới template"
  columnsGrid: any;
  editSettings: any;
  dataService:any={data:null};
  fieldImport = [];
  dataImport  = [];
  dataImport2  = [];
  date=new Date();
  sessionID: any;
  mappingTemplate: any;
  dataIEConnection:any = {};
  dataIETable:IETables = new IETables();
  dataIEMapping:any = {};
  addMappingForm :any;
  dataCbb= {}
  editParams:any={};
  element:any={};
  dropObj:any={};
  paramsCbb = {};
  type = 'new';
  public isDropdown = true;
  selectionOptions: SelectionSettingsModel;
  customerIDRules:object;
  public contextMenuItems: any;
  public rowIndex: number;
  public cellIndex: number;
  @ViewChild('gridView') gridView: CodxGridviewComponent
  constructor(
    private callfunc: CallFuncService,
    private cache: CacheService,
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private notifySvr: NotificationsService,
    private ref: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
  
    this.dialog = dialog;
    this.formModel = dt.data?.[0];
    this.dataIEConnection = dt.data?.[1];
    if(dt.data?.[2]) this.dataIETable = dt.data?.[2];
    if(dt.data?.[3]) this.dataIEMapping = dt.data?.[3];
    this.type = dt.data?.[4];
  }
  
  ngOnInit(): void {
    debugger;
    this.formModels = {
      formName: 'ImportFieldMapping',
      gridViewName : 'grvFieldMapping'
    }
    this.editSettings = {allowEditing: true, allowAdding: true,allowDeleting: true, mode: "Normal"};
    this.selectionOptions = { type: 'Multiple'};
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
      { text: 'Paste', target: '.e-content', id: 'customPaste' }
    ];
    this.createData();
    this.addMappingForm = this.formBuilder.group({
      mappingName: [this.dataIETable?.mappingName],
      processIndex: [this.dataIETable?.processIndex],
      destinationTable: [this.dataIETable?.destinationTable],
      parentEntity:[this.dataIETable?.parentEntity],
      importRule: [this.dataIETable?.importRule],
      isSummary: [this.dataIETable?.isSummary]
    });
    this.getGridViewSetup();
  }

  createData()
  {
    if(this.type == "new")
    {
      //IETable
      this.dataIETable = new IETables();
      this.dataIETable.recID = crypto.randomUUID();
      this.dataIETable.sessionID = this.dataIEConnection.recID;
      this.dataIETable.mappingTemplate = this.dataIEConnection.mappingTemplate
      //IEMapping
      this.dataIEMapping.recID= crypto.randomUUID();
      this.dataIEMapping.mappingName= "";
      this.dataIEMapping.tableName = "";
      this.dataIEMapping.importRule = "";
    }
  }

  load(args){
    this.grid.element.addEventListener('mouseup', (e: MouseEventArgs) => {
      if ((e.target as HTMLElement).classList.contains("e-rowcell")) {
        if (this.grid.isEdit)
            this.grid.endEdit();
        let rowInfo = this.grid.getRowInfo(e.target) as any;
        var check = this.fieldImport.filter(x=>(x.type == "3" || x.type == "2") && x.text == rowInfo.column.field);
        if(check!=null&& check.length>0)  this.isDropdown = true;
        // if (rowInfo.column.field === "CreatedBy")
        //     this.isDropdown = true;
        this.grid.selectRow(rowInfo.rowIndex);
        this.grid.startEdit();
      }
  });
  }

  onActionComplete(args) {
    if (args.requestType =="beginEdit" && this.isDropdown) {
        this.isDropdown = false;
        let dropdownObj = args.form.querySelector('.e-dropdownlist').ej2_instances[0];
        dropdownObj.element.focus();
        dropdownObj.showPopup();
    }
  }
  ngOnChanges(changes: SimpleChanges) { }
 
  fileAdded(event: any) {
    if (event?.data) this.hideThumb = true;
  }
  getfileCount(e: any) {
    this.fileCount = e.data.length;
  }
  onSave()
  {
    debugger;
    this.grid.endEdit();
    var result = this.grid.dataSource;
    this.addMappingForm.value.parentEntity = this.addMappingForm.value?.parentEntity[0];
    this.dataIETable.mappingName = this.dataIEMapping.mappingName = this.addMappingForm.value?.mappingName;
    this.dataIETable.processIndex = this.addMappingForm.value?.processIndex;
    this.dataIETable.destinationTable = this.dataIEMapping.tableName = this.addMappingForm.value?.destinationTable;
    this.dataIETable.parentEntity = this.addMappingForm.value?.parentEntity;
    this.dataIETable.importRule = this.dataIEMapping.importRule = this.addMappingForm.value?.importRule;
    this.dataIETable.isSummary = this.addMappingForm.value?.isSummary;
    for(var i =0 ; i<(result as any).length ; i++)
    {
      result[i].recID = this.dataIETable.recID;
      result[i].sessionID = this.dataIEMapping.recID;
      result[i].mappingTemplate = this.dataIETable.mappingTemplate;
    }
    this.dialog.close([this.dataIETable , this.dataIEMapping , result]);
  }
  addItem()
  {
    this.gridView.addRow();
  }
  getGridViewSetup()
  {
    this.cache.gridViewSetup(this.formModel?.formName,this.formModel?.gridViewName).subscribe(item=>{
      if(item)
      {
       var key = Object.keys(item);
       for(var i  = 0 ; i < key.length ; i++)
       {
          if(item[key[i]]?.isImport) 
          {
            var obj = {
              "destinationField": key[i],
            }
            this.dataImport.push(obj);
          }
       }
       this.cache.gridViewSetup(this.formModels.formName,this.formModels.gridViewName).subscribe(item=>{
        if(item)
        {
          this.gridViewSetup = item;
          var key = Object.keys(item);
          for(var i  = 0 ; i < key.length ; i++)
          {
             if(item[key[i]]?.isVisible)
             {
              this.dataImport2 = this.dataImport;
              let val = item[key[i]].referedValue;
              let keys = key[i];
              for(var x = 0 ; x< this.dataImport2.length; x++)
              {
                if(item[keys]?.controlType == "CheckBox") this.dataImport2[x][keys] = false;
                else if(keys=="DestinationField")
                {
                  this.dataImport2[x][keys] = this.dataImport2[x]['destinationField'];
                 delete this.dataImport2[x]['destinationField']
                } 
                else this.dataImport2[x][key[i]] = "";
              }
              var field2 = 
              {
                text: key[i],
                controlType : item[keys]?.controlType,
                type: item[keys]?.referedType,
                value: item[keys]?.referedValue,
                require: item[keys]?.isRequire
              }
              if((item[key[i]].referedType == "3" || item[key[i]].referedType == "2") && val && !(keys in this.editParams)) 
              {
                if(item[key[i]].referedType == "3")
                {
                  this.getDataCBB(val);
                  this.getParamsCbb(val);
                }
                else if(item[key[i]].referedType == "2")
                {
                  this.getDataVll(val);
                }
                this.element[keys]  = null as HTMLElement ; 
                this.dropObj[keys] = null as DropDownList;
                
                this.editParams[keys] = { 
                  create: () => { 
                    this.element[keys] = document.createElement('input'); 
                      return this.element[keys]; 
                  }, 
                  read: () => { 
                      return  this.dropObj[keys].value; 
                  }, 
                  destroy: () => { 
                    this.dropObj[keys].destroy(); 
                  }, 
                  write: (args: { rowData: object, column: Column }) => { 
                    var fields = {text: 'text', value: 'value'};
                    if(item[keys].referedType=="3") fields = this.paramsCbb[val];
                    this.dropObj[keys] = new DropDownList({ 
                          dataSource: this.dataCbb[val], 
                          value: args.rowData[args.column.field] ,
                          fields: fields,
                          floatLabelType: 'Never',
                      }); 
                      this.dropObj[keys].appendTo(this.element[keys]); 
                  }
                } 
              }
              if(keys=="DestinationField") this.fieldImport.unshift(field2);
              else this.fieldImport.push(field2);
              this.grid.refresh();
             } 
          }
        }
      })
      }
    })
  }
  changeValueText(item:any,field:any,data:any)
  {
    item[field] = data?.data;
    if(data?.component)
    {
      var value = data?.component?.dataSource.filter(x=>x.value == data?.data);
      item[field] = value[0].text
    }
  }
  changeValueCBB(data:any, check=false)
  {
    if(this.addMappingForm)
    {
      var result = data?.data;
      if(data?.component?.itemsSelected && check)
      {
        result = data?.component?.itemsSelected[0]?.MappingName;
        this.addMappingForm.get("destinationTable").setValue(data?.component?.itemsSelected[0]?.TableName);
      }
      this.addMappingForm.get(data?.field).setValue(result);
    }
    
  }
  clicktest()
  {
    debugger;
   
    var a = this.dataImport;
  }
  html()
  {
    const child = document.createElement('td');
    let html = `<codx-input type="text"></codx-input>`;
    child.innerHTML = html;
  
  }
  aaa(a:any)
  {
    debugger;
  }
  getDataCBB(cbb:any)
  {
    var request = new DataRequest();
    request.comboboxName = cbb;
    request.page=1;
    request.pageSize = 20;
    this.api
    .execSv('SYS', 'CM', 'DataBusiness', 'LoadDataCbxAsync', request).subscribe(item=>{
      if(item[0])
      {
        var data = JSON.parse(item[0]);
        this.dataCbb[cbb]=data;
      }
    })
  }
  getParamsCbb(cbb:any)
  {
    this.cache.combobox(cbb).subscribe(item=>{
      if(item)
        this.paramsCbb[cbb]={ text: item?.viewMember, value: item?.valueMember }
    })
  }
  getDataVll(vll:any)
  {
    this.cache.valueList(vll).subscribe(item=>{
      if(item)
      {
        this.dataCbb[vll] = item?.datas
      }
    })
  }
  getEditType(type:any)
  {
    if(type=="ComBobox") return "dropdownedit";
    else if(type == "CheckBox") return "booleanedit"
    return null
  }
  getType(type:any)
  {
    if(type=="CheckBox") return "boolean";
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
    if((this.gridViewSetup[field].referedType == "2" || this.gridViewSetup[field].referedType == "3") && data[field])
    {
      var datas = this.dataCbb[this.gridViewSetup[field].referedValue].filter(x=>x.value == data[field]);
      if(datas && datas.length>0) return datas[0].text
      return "" 
    }
    return data[field]
  }
  getHeaderText(e:any)
  {
    return this.gridViewSetup[e].headerText;
  }
  getEdit(e:any , field:any)
  {
    if(e =='3' || e == '2') return this.editParams[field] 
    return null;
  }
}
