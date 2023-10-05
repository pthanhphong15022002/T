import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiHttpService, CacheService, CallFuncService, CodxGridviewComponent, DataRequest, DialogData, DialogRef, Util } from 'codx-core';
import * as XLSX from 'xlsx';
import { IETables } from '../models/import.model';
import { AddImportDetailsComponent } from './add-import-details/add-import-details.component';
import { AddIetablesComponent } from './add-ietables/add-ietables.component';
@Component({
  selector: 'lib-add-template',
  templateUrl: './add-template.component.html',
  styleUrls: ['./add-template.component.scss']
})
export class AddTemplateComponent implements OnInit{
  // @ViewChild('gridView') gridView: CodxGridviewComponent;
  
  dialog:any;
  formModel:any;
  formModels:any;
  importAddTmpGroup: FormGroup;
  submitted = false;
  selectedSheet: any;
  wb: any;
  sheet: any;
  grd: any;
  step = 0;

  columnsGrid:any;
  importRule: any;
  mappingTemplate:any;
  dataIEConnections:any = {};
  dataIETables: any = {};
  listIETables = [];
  constructor(
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.dialog = dialog;
    this.formModel = dt.data[1];
  }
  ngOnInit(): void {
    this.formModels = {
      formName: 'IEConnections',
      gridViewName: 'grvIEConnections',
    };

    this.importAddTmpGroup = this.formBuilder.group({
      mappingName:['', Validators.required],
      description: '',
      sheetImport: '',
      password: [''],
      firstCell: 1,
    });

    this.getData();
    this.getCache();
  }

  getData() {
    // var request = new DataRequest();
    // request.comboboxName = 'MappingTemplate';
    // request.page = 1;
    // request.pageSize = 5;
    // this.api
    //   .execSv('SYS', 'Core', 'DataBusiness', 'LoadDataCbxAsync', request)
    //   .subscribe((item) => {
    //     if (item[0]) {
    //       var data = JSON.parse(item[0]);
    //       //Nhớ sửa lại lấy cái đầu tiên
    //       this.mappingTemplate = data[0];
    //       this.importAddTmpGroup.controls['mappingName'].setValue(
    //         this.mappingTemplate?.MappingName
    //       );
    //       this.dataIEConnections.mappingName =
    //         this.mappingTemplate?.MappingName;
    //       this.dataIETables.destinationTable =
    //         this.mappingTemplate?.TableName;
    //       this.getGridViewSetup();
    //     }
    //   });
   
    this.cache.entity(this.formModel?.entityName).subscribe(item=>{
      if(item) this.dataIETables.destinationTable = item?.physicalName;
      this.getGridViewSetup();
    })
    this.cache.valueList('SYS010').subscribe((item) => {
      if (item) {
        this.importRule = item.datas;
      }
    });
  }
  getCache()
  {
    this.cache.valueList('SYS010').subscribe((item) => {
      if (item) {
        this.importRule = item.datas;
      }
    });
  }

  getGridViewSetup() {
    this.cache.gridViewSetup('IETables', 'grvIETables').subscribe((item) => {
      if (item) {
        this.grd = item;
        this.defaultData();
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
        headerText: this.grd['MappingTemplate']?.headerText,
        referedValue: this.grd['MappingTemplate']?.referedValue,
        controlType: this.grd['MappingTemplate']?.controlType,
        multiSelect: this.grd['MappingTemplate']?.multiSelect,
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

    //Tạo mới IEConnections
    var recIDIEConnections = Util.uid();
    var mappingTemplate = Util.uid();
    //Tạo mới IEConnetions
    var newIEConnections = {
      recID: Util.uid(),
      processIndex: 0,
      destinationTable: this.mappingTemplate?.TableName,
      parentEntity: '',
      mappingTemplate: '',
      importRule: this.importRule[0]?.value,
      isSummary: false,
      formName: 'PurchaseInvoices',
      gridViewName: 'grvPurchaseInvoices',
    };
    this.dataIEConnections = { ...newIEConnections, ...this.dataIEConnections };
    //Tạo mới IETables
    var newIETable = new IETables();
    newIETable.recID = Util.uid(),
    newIETable.sessionID = this.dataIEConnections.recID,
    newIETable.sourceTable = '',
    newIETable.destinationTable = this.mappingTemplate?.TableName,
    newIETable.mappingTemplate = '',
    newIETable.firstRowHeader = true;
    newIETable.firstCell = '1',
    newIETable.importRule = this.importRule[0]?.value,
    newIETable.processIndex = 1,
    newIETable.isSummary = false,
    this.dataIETables = { ...newIETable, ...this.dataIETables };
    this.listIETables.push(this.dataIETables);
  }
  get f(): { [key: string]: AbstractControl } {
    return this.importAddTmpGroup.controls;
  }
  
  //Chọn lại sheet import
  changeSheetImport(e: any) {
    this.importAddTmpGroup.controls['sheetImport'].setValue(e);
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
                // this.selectedSheet =
                //   this.gridView.dataService.data[0].sourceTable;
              };
            });
        }
      });
  }

  getTextImportRule(id: any) {
    var data = this.importRule.filter((x) => x.value == id);
    if (data && data.length > 0) return data[0].text;
    return '';
  }

  openFormAddImportDetail()
  {
    let sourceField = XLSX.utils.sheet_to_json(this.wb.Sheets[this.sheet[0]], {
      header: this.importAddTmpGroup.value.firstCell,
    });
    this.dataIETables.sourceTable = this.importAddTmpGroup.value.sheetImport;
    this.callfunc.openForm(
      AddImportDetailsComponent,
      null,
      1000,
      800,
      '',
      [
        this.formModel,
        this.dataIETables,
        sourceField[0],
      ],
      null
    );
  }

  openFormIETables()
  {
    this.callfunc.openForm(
      AddIetablesComponent,
      null,
      600,
      700,
      '',
      null
    );
  }
  next()
  {
    this.step += 1;
  }

  per()
  {
    if(this.step <= 0) return;
    this.step -= 1;
  }

  close()
  {
    this.dialog.close();
  }
}
