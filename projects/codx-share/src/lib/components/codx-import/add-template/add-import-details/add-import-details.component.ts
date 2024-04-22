import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional, SimpleChanges, ViewChild } from '@angular/core';
import { Column, EditService, FreezeService, GridComponent, SelectionService, SelectionSettingsModel, ToolbarService } from '@syncfusion/ej2-angular-grids';
import { ApiHttpService, CacheService, CallFuncService, CodxGridviewComponent, CodxGridviewV2Component, DataRequest, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';
import { FormBuilder, Validators } from '@angular/forms';
import { DropDownList } from '@syncfusion/ej2-angular-dropdowns';
@Component({
  selector: 'lib-add-import-details',
  templateUrl: './add-import-details.component.html',
  styleUrls: ['./add-import-details.component.scss'],
  providers: [FreezeService, SelectionService, EditService, ToolbarService]
})
export class AddImportDetailsComponent implements OnInit, AfterViewInit{
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
  editNew = false;
  columnsGrid: any;
  dataService: any = { data: null };
  fieldImport = [];
  dataImport = [];
  currdataImport: any;
  dataImport2 = [];
  mappingTemplate: any;
  dataIETable:any;
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
  customerIDRules: object;
  sourceField: any;
  hasTemp = false;
  hasOld = false;
  ieMappingRec:any;
  public contextMenuItems: any;
  public rowIndex: number;
  public cellIndex: number;
  public isDropdown = true;
  rendered:boolean=false;
  @ViewChild('gridView2') gridView2: CodxGridviewV2Component;
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
    if (dt.data?.[1]) this.dataIETable = dt.data?.[1];
    if (dt.data?.[2]) this.sourceField = dt.data?.[2];
    if (dt.data?.[3]) this.ieMappingRec = dt.data?.[3];
    if (dt.data?.[4]) this.type = dt.data?.[4];

  }
  ngAfterViewInit(): void {
    this.rendered = true
  }

  ngOnInit(): void {
    this.formModels = {
      formName: 'ImportFieldMapping',
      gridViewName: 'grvFieldMapping',
    };

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

    if (this.type == 'new') {
      this.getGridViewSetup();
    } 
    else if (this.type == 'edit') {
      this.getDataEdit();
    }
    this.formatSourceField();
  }
  formatSourceField() {
    debugger
    var cbb = [];
    if (this.sourceField && Array.isArray(this.sourceField)) {
      var cbb = [];
      for (var i = 0; i < this.sourceField.length; i++) 
      {
        var textStr = this.sourceField[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        //Xóa dấu
        textStr = this.deleteMark(textStr);
        //In hoa
        textStr = textStr.toUpperCase();
        //Thay ký tự rỗng thành _
        textStr = textStr.replaceAll(" ","_");
        var obj = {
          text: textStr,
          value: textStr,
        };
        cbb.push(obj);
      }

    }
    else if(this.sourceField && typeof this.sourceField == 'object')
    {
      var key = Object.keys(this.sourceField);
      for (var i = 0; i < key.length; i++) {

        var textStr2 = key[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "") as any;
        //Xóa dấu
        textStr2 = this.deleteMark(textStr2);
        //In hoa
        textStr2 = textStr2.toUpperCase();
        //Thay ký tự rỗng thành _
        textStr2 = textStr2.replaceAll(" ","_");

        var objs = {
          text: textStr2,
          value: textStr2,
        };
        cbb.push(objs);
      }
    }
    this.dataCbb['SourceField'] = cbb;
  }

  
  deleteMark(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
  }

  getDataEdit() {
    this.getDataIEMapping();
    this.getDataFieldMapping();
  }

  getDataIEMapping()
  {
    this.api
    .execSv<any>(
      this.service,
      'AD',
      'IEMappingsBusiness',
      'GetAsync',
      this.ieMappingRec
    )
    .subscribe((item) => {
      if (item) {
        this.dataIEMapping = item;
      }
    });
  }
  getDataFieldMapping() {
    this.api
      .execSv<any>(
        this.service,
        'AD',
        'IEFieldMappingBusiness',
        'GeByMappingIDAsync',
        this.ieMappingRec
      )
      .subscribe((item) => {
        if (item && item.length > 0) {
          this.dataImport2 = item;
          this.cache
          .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
          .subscribe((grdViews) => {
            if (grdViews) {
              var key = Object.keys(grdViews);
              for (var i = 0; i < key.length; i++) {
                let keys = key[i].slice(0,1).toLowerCase() + key[i].slice(1);
                var check = this.dataImport2.findIndex(x=>x.destinationField == keys || x.destinationField == key[i]);
                if (grdViews[key[i]]?.isImport && check<0) {
                  var obj = {
                    destinationField: key[i],
                    dataType: grdViews[key[i]].dataType
                  };
                  this.dataImport2.push(obj);
                }
              }
            }});
          }
      });
  }
  createData() {
    // if (this.type == 'new') {
    //   this.dataIETable = new IETables();
    //   this.dataIETable.recID = Util.uid();
    //   this.dataIETable.sessionID = this.dataIEConnection.recID;
    // }
  }


  ngOnChanges(changes: SimpleChanges) {}

  fileAdded(event: any) {
    if (event?.data) this.hideThumb = true;
  }
  getfileCount(e: any) {
    this.fileCount = e.data.length;
  }

  checkRequired()
  {
    if(!this.dataIEMapping.mappingName)  {
      this.notifySvr.notifyCode('SYS009', 0, 'Tên mapping');
      return false;
    }
    return true;
  }
  onSave() {

    if(!this.checkRequired()) return

    if(this.type == "new")
    {
      this.dataIEMapping.recID = Util.uid();
      //Tạo mới IEMapping
      this.saveIEMapping();
      //Tạo mới IEFeildMapping
      this.saveIEFieldMapping();
    }
    else if(this.type == "edit")
    {
      this.updateIEMapping();
      this.updateIEFieldMapping();
    }
  }

  //Tạo mới IEMapping
  saveIEMapping()
  {
    this.dataIEMapping.tableName = this.dataIETable?.destinationTable;
    this.api
    .execSv(
      'SYS',
      'AD',
      'IEMappingsBusiness',
      'AddItemAsync',
      this.dataIEMapping
    )
    .subscribe((item2) => {
      if (item2) {
        this.dialog.close();
      }
    });
  }

  //Tạo mới IEFeildMapping
  saveIEFieldMapping()
  {
    this.dataImport2.forEach(elm => {
      elm.recID = Util.uid();
      elm.mappingTemplate = this.dataIEMapping.recID;
      elm.sessionID =  this.dataIETable?.sessionID;
      delete elm._oldData;
      delete elm._rowIndex;
      delete elm._rowNo;
    });

    this.api
    .execSv(
      'SYS',
      'AD',
      'IEFieldMappingBusiness',
      'AddItemAsync',
      JSON.stringify(this.dataImport2)
    )
    .subscribe((item2) => {
      if (item2) {

      } else this.notifySvr.notifyCode('SYS021');
    });
  }

  //Update IEMapping
  updateIEMapping()
  {
    this.api
    .execSv(
      'SYS',
      'AD',
      'IEMappingsBusiness',
      'UpdateItemAsync',
      this.dataIEMapping
    )
    .subscribe((item2) => {
      if (item2) {
        this.dialog.close();
      }
    });
  }

  //Update IEFeildMapping
  updateIEFieldMapping()
  {
    this.api
    .execSv(
      'SYS',
      'AD',
      'IEFieldMappingBusiness',
      'UpdateItemAsync',
      JSON.stringify(this.dataImport2)
    )
    .subscribe((item2) => {
      if (item2) {

      } else this.notifySvr.notifyCode('SYS021');
    });
  }

  getGridViewSetup() {
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((item) => {
        if (item) {
          var key = Object.keys(item);
          for (var i = 0; i < key.length; i++) {
            if (item[key[i]]?.isImport) {
              var textStr = item[key[i]].headerText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              //Xóa dấu
              textStr = this.deleteMark(textStr);
              //In hoa
              textStr = textStr.toUpperCase();
              //Thay ký tự rỗng thành _
              textStr = textStr.replaceAll(" ","_");
              var obj = {
                destinationfield: key[i],
                sourcefield: textStr,
                columnOrder: item[key[i]].columnOrder,
                datatype: item[key[i]].dataType
              };
              this.dataImport.push(obj);
            }
          }

          this.dataImport = this.dataImport.sort((a:any,b:any)=> a?.columnOrder - b?.columnOrder)
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
                    var fs = key[i].slice(0,1).toLowerCase();
                    var s = key[i].slice(1);
                    let keys = fs + s;
                    for (var x = 0; x < this.dataImport2.length; x++) {
                      if (item[keys]?.controlType == 'CheckBox')
                        this.dataImport2[x][keys] = false;
                      else if (keys == 'destinationField') {
                        var keyss = keys.toLowerCase();
                        this.dataImport2[x][keys] = this.dataImport2[x][keyss];
                        delete this.dataImport2[x][keyss];
                      }
                      else if(keys == "dataType")
                      {
                        var keyss = keys.toLowerCase();
                        this.dataImport2[x][keys] = this.dataImport2[x][keyss];
                        delete this.dataImport2[x][keyss];
                      }
                      else if(keys == "nullable")
                      {
                        this.dataImport2[x][keys] = false;
                      }
                      else this.dataImport2[x][keys] = '';
                      delete this.dataImport2[x].columnOrder;
                    }
                  }
                }
              }
            });
        }
      });
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
  changeValue(e:any)
  {
    this.dataIEMapping.mappingName = e?.data;
  }

  arraymove(arr: any, fromIndex: any, toIndex: any) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  }

  changeField(e:any)
  {
    if(e?.field == "sourceField")
    {
      e.component.vllModelObj.dataSource = this.dataCbb['SourceField']
    }
  }

  updateData(e:any)
  {
    // var a = this.dataImport2
    // debugger
  }

  mapField()
  {
    this.dataCbb['SourceField'].forEach(elm => {
      var index = this.dataImport2.findIndex(x=> x.sourcefield == elm.value || x.destinationField.toUpperCase() == elm.value.toUpperCase());
      if(index >= 0) {
        this.dataImport2[index].sourceField = elm.value;
        this.dataImport2[index].sourceType = "0";
      }
    });
    this.gridView2.refresh();
  }

  refeshField()
  {
    this.dataImport2.forEach(elm=>{
      elm.sourceField = "";
      elm.sourceType = "";
    })
    this.gridView2.refresh();
  }
}
