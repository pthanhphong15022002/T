import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertConfirmInputConfig, ApiHttpService, AuthStore, CacheService, CallFuncService, CodxGridviewComponent, DataRequest, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';
import * as XLSX from 'xlsx';
import { IETables } from '../models/import.model';
import { AddImportDetailsComponent } from './add-import-details/add-import-details.component';
import { AddIetablesComponent } from './add-ietables/add-ietables.component';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'lib-add-template',
  templateUrl: './add-template.component.html',
  styleUrls: ['./add-template.component.scss']
})
export class AddTemplateComponent implements OnInit{
  @ViewChild('attachment') attachment: AttachmentComponent;
  user:any;
  type:any;
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
  indexEdit:any;
  columnsGrid:any;
  importRule: any;
  mappingTemplate:any;
  grdIEConnection:any;
  dataIEConnection: any = {};
  dataIETables: any = {};
  listIETables = [];
  headerText = "Thêm mới template"
  constructor(
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private cache: CacheService,
    private notifySvr: NotificationsService,
    private auth: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.user = this.auth.get();
    this.dialog = dialog;
    this.type = dt.data[0];
    this.formModel = dt.data[1];
    if(dt?.data[2]) this.dataIEConnection = dt.data[2];
    if(this.type == "edit") this.headerText = "Chỉnh sửa template";
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
  }

  getData() {
    this.cache.entity(this.formModel?.entityName).subscribe(item=>{
      if(item) this.dataIETables.destinationTable = item?.physicalName;
     
    })
    this.cache.valueList('SYS010').subscribe((item) => {
      if (item) {
        this.importRule = item.datas;
      }
      this.getGridViewSetup();
    });
  }
 

  getGridViewSetup() {
    this.cache.gridViewSetup('IETables', 'grvIETables').subscribe((item) => {
      if (item) {
        this.grd = item;
        this.defaultData();
      }
    });
    this.cache.gridViewSetup(this.formModels.formName, this.formModels.gridViewName).subscribe((item) => {
      if (item) {
        this.grdIEConnection = item;
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

    //Thêm mới
    if(this.type == "add")
    {
      this.dataIEConnection.recID = Util.uid();
      //Tạo mới IETables
      var newIETable = new IETables();
      newIETable.recID = Util.uid(),
      newIETable.sessionID = this.dataIEConnection.recID,
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
    //Edit
    else if(this.type == "edit")
    {
      this.setValueIEConnection();
      this.getDataIETables();
    }
  }
  
  get f(): { [key: string]: AbstractControl } {
    return this.importAddTmpGroup.controls;
  }
  
  setValueIEConnection()
  {
    this.importAddTmpGroup.controls['mappingName'].setValue(this.dataIEConnection?.mappingName);
    this.importAddTmpGroup.controls['description'].setValue(this.dataIEConnection?.description);
    this.importAddTmpGroup.controls['firstCell'].setValue(this.dataIEConnection?.firstCell);
  }
  getDataIETables()
  {
    this.api
    .execSv<any>("SYS",'AD', 'IETablesBusiness', 'GetListAsync', this.dataIEConnection.recID)
    .subscribe((item) => {
      if(item && item.length > 0)
      {
        this.listIETables = item;
      }
    })
  }

  //Chọn lại sheet import
  changeSheetImport(e: any) {
    let sheet = e.value.split(":")[1];
    sheet = sheet.trim();
    this.importAddTmpGroup.controls['sheetImport'].setValue(sheet);
    this.selectedSheet = sheet;
  }

  getfilePrimitive(e: any) {
    var dt = e[0]?.rawFile;
    this.dataIEConnection.fileName = dt?.name;
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
        this.attachment.data = [];
      };
    }
  }

  getfileGet(e: any) {
    var recID = e[0]?.recID;
    this.api
      .exec<any>('DM', 'FileBussiness', 'GetFileBase64Async', recID)
      .subscribe((item) => {
        if (item) {
          fetch(environment.urlUpload + "/" +item)
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
                this.importAddTmpGroup.controls['sheetImport'].setValue(this.sheet[0]);
                this.selectedSheet = this.sheet[0];

                if(this.listIETables && this.listIETables.length>0)
                {
                  this.selectedSheet = this.listIETables[0].sourceTable
                }
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

  openFormAddImportDetail(data:any , type = 'new')
  {
    if(type == 'edit' && !data?.mappingTemplate) return;

    let formModel =
    {
      formName: this.formModel?.formName,
      gridViewName: this.formModel?.gridViewName
    }

    let entityName = data?.destinationTable;
    if(entityName)
    {
      let formName = entityName.split("_")[1];
      let gridViewName = 'grv' + formName;
  
      if(formName) formModel.formName = formName;
      if(gridViewName) formModel.gridViewName = gridViewName;
    }

    let index = this.sheet.findIndex(x=>x == this.selectedSheet);
    let sourceField = XLSX.utils.sheet_to_json(this.wb.Sheets[this.sheet[index]], {
      header: this.importAddTmpGroup.value.firstCell,
    });
    this.dataIETables.sourceTable = this.importAddTmpGroup.value.sheetImport;
    this.callfunc.openForm(
      AddImportDetailsComponent,
      null,
      1200,
      800,
      '',
      [
        formModel,
        this.dataIETables,
        sourceField[0],
        data?.mappingTemplate,
        type
      ],
      null
    );
  }

  openFormIETables()
  {
    let sourceField = XLSX.utils.sheet_to_json(this.wb.Sheets[this.sheet[0]], {
      header: this.importAddTmpGroup.value.firstCell,
    });
    let popup = this.callfunc.openForm(
      AddIetablesComponent,
      null,
      600,
      500,
      '',
      {
        type: "add",
        sourceField:sourceField,
        selectedSheet:this.selectedSheet,
        formModel:this.formModel
      }
    );

    popup.closed.subscribe((res) => {
      if(res?.event) this.listIETables.push(res?.event);
    });
  }
  next()
  {
    if(!this.checkRequierd()) return;
    this.step += 1;
  }

  checkRequierd()
  {
    var arr = [];
    if(!this.dataIEConnection?.fileName) arr.push("File");
    if(!this.importAddTmpGroup.value.mappingName) arr.push(this.grdIEConnection['MappingName']?.headerText);
    if(arr.length > 0) 
    {
      this.notifySvr.notifyCode('SYS009', 0, arr.join(' , '));
      return false;
    }
    return true;
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

  editIETables(data:any,index:any)
  {
    this.indexEdit = index;
    let sourceField = XLSX.utils.sheet_to_json(this.wb.Sheets[this.sheet[0]], {
      header: this.importAddTmpGroup.value.firstCell,
    });
    let popup = this.callfunc.openForm(
      AddIetablesComponent,
      null,
      600,
      500,
      '',
      {
        type: "edit",
        sourceField: sourceField,
        selectedSheet:this.selectedSheet,
        formModel:this.formModel,
        data: data
      }
    );
    popup.closed.subscribe(res=>{
      if(res?.event)this.listIETables[this.indexEdit] = res?.event
    })
  }

  deleteIETables(data:any,index:any)
  {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notifySvr
      .alertCode("SYS003", config)
      .subscribe((x) => {
        if (x.event.status == 'Y') {
          if(data?.recID)
          {
            this.api
            .execSv<any>("SYS",'AD', 'IETablesBusiness', 'DeleteItemAsync', data?.recID)
            .subscribe((item) => {
              if(item && item.length > 0)
                this.listIETables = item;
            })
          }
          this.listIETables = this.listIETables.splice(index, 1);
        }
    });
  }

  onSave()
  {
    if(this.attachment.fileUploadList.length > 0)
    {
      this.attachment.objectId = this.dataIEConnection.recID;
      this.attachment.fileUploadList.forEach(elm=>{
        elm.objectType ='AD_ExcelTemplates';
        elm.funcID = "AD003";
        elm.referType = this.formModel.entityName;
      });
      this.attachment.saveFilesObservable().then((saveFile) => {
        if (saveFile) {
          saveFile.subscribe((saved: any) => {
            if (saved) {
            
            } else {
              this.notifySvr.notify('SYS023');
            }
          });
        }
      });
    }
   
    if(this.type == "add")
    {
      this.saveIEConnection();
      this.saveIETables();
    }
    else if(this.type == "edit")
    {
      this.updateIEConnection();
      this.updateIETables();
    }
  }

  saveIEConnection()
  {
    this.dataIEConnection.mappingName = this.importAddTmpGroup.value.mappingName;
    this.dataIEConnection.description = this.importAddTmpGroup.value.description;
    //this.dataIEConnection.sheetImport = this.importAddTmpGroup.value.sheetImport;
    this.dataIEConnection.firstCell = this.importAddTmpGroup.value.firstCell;
    this.dataIEConnection.formName = this.formModel.formName;
    this.dataIEConnection.gridViewName = this.formModel.gridViewName;
    this.dataIEConnection.createdBy = this.user.userID;
    this.api
    .execSv<any>(
      'SYS',
      'AD',
      'IEConnectionsBusiness',
      'AddItemAsync',
      this.dataIEConnection
    )
    .subscribe(item=>{
      if(item) {
        this.notifySvr.notifyCode("SYS006");
        this.dialog.close(this.dataIEConnection);
      }
    })
  }

  saveIETables()
  {
    this.listIETables.forEach(elm=>{
      elm.sessionID = this.dataIEConnection.recID;
    });
    this.api
    .execSv<any>(
      'SYS',
      'AD',
      'IETablesBusiness',
      'AddItemAsync',
      JSON.stringify(this.listIETables)
    ).subscribe()
    {

    }
  }

  //Update IEConnetion
  updateIEConnection()
  {
    this.dataIEConnection.mappingName = this.importAddTmpGroup.value.mappingName;
    this.dataIEConnection.description = this.importAddTmpGroup.value.description;
    //this.dataIEConnection.sheetImport = this.importAddTmpGroup.value.sheetImport;
    this.dataIEConnection.firstCell = this.importAddTmpGroup.value.firstCell;
    this.api
    .execSv<any>(
      'SYS',
      'AD',
      'IEConnectionsBusiness',
      'UpdateItemAsync',
      this.dataIEConnection
    )
    .subscribe(item=>{
      if(item) {
        this.notifySvr.notifyCode("SYS006");
        this.dialog.close(this.dataIEConnection);
      }
    })
  }

  //Update IETables
  updateIETables()
  {
    this.listIETables.forEach(elm=>{
      elm.sessionID = this.dataIEConnection.recID;
    });
    this.api
    .execSv<any>(
      'SYS',
      'AD',
      'IETablesBusiness',
      'UpdateItemsAsync',
      JSON.stringify(this.listIETables)
    ).subscribe()
  }

  valueChangeMappingTemplate(e:any , data:any)
  {
    var index = this.listIETables.findIndex(x=>x.recID == data.recID);
    if(index >= 0) this.listIETables[index].mappingTemplate = e?.data;
  }
}
