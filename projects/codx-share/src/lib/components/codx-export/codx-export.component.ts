import {
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
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { AlertConfirmInputConfig, ApiHttpService, CallFuncService, DataRequest, DataService, DialogData, DialogModel, DialogRef, NotificationsService } from 'codx-core';
import { AttachmentComponent } from '../attachment/attachment.component';
import { CodxExportAddComponent } from './codx-export-add/codx-export-add.component';

@Component({
  selector: 'codx-export',
  templateUrl: './codx-export.component.html',
  styleUrls: ['./codx-export.component.scss'],
})
export class CodxExportComponent implements OnInit, OnChanges
{
  submitted = false;
  gridModel : any;
  recID :any
  data = {}
  dataEx: any;
  dataWord: any;
  dialog: any;
  formModel : any;
  exportGroup : FormGroup;
  lblExtend: string = '';
  request = new DataRequest();
  optionEx = new DataRequest();
  @ViewChild('attachment') attachment: AttachmentComponent
  constructor(
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private notifySvr: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog;
    this.gridModel = dt.data?.[0];
    this.recID = dt.data?.[1];
  }
  ngOnInit(): void {
    //Tạo formGroup
    this.exportGroup = this.formBuilder.group({
      dataExport : ['' ,  Validators.required],
      format : ['' ,  Validators.required]
    });
    //Tạo formModel
    this.formModel = 
    {
      entityName: this.gridModel?.entityName,
      entityPer: this.gridModel?.entityPermission,
      formName: this.gridModel?.formName,
      funcID: this.gridModel?.funcID,
      gridViewName: this.gridModel?.gridViewName
    }
    //Load data excel template
    this.load();
  }
  get f(): { [key: string]: AbstractControl } {
    return this.exportGroup.controls;
  }
  ngOnChanges(changes: SimpleChanges) {}
  load()
  {

    this.optionEx.page=0;
    this.optionEx.pageSize=10;
    this.optionEx.entityName = 'AD_ExcelTemplates';
    this.optionEx.funcID = "ODT3";
    this.api.execSv<any>(
      'SYS',
      'AD', 
      'ExcelTemplatesBusiness', 
      'GetByEntityAsync', 
      this.optionEx
    ).subscribe(item=>
    {
      if(item[0])
        this.dataEx = item[0]
    })
  }
  openForm(val:any,data:any,type:any)
  {
    switch(val)
    {
      case 'add' : case 'edit' :
        {
          var option = new DialogModel();
          option.FormModel = this.formModel;
          option.DataService = data;
          
          this.callfunc.openForm(CodxExportAddComponent,null,null,800,null, {action:val,type:type}, "", option)
          .closed.subscribe(item=>
          {
            if(item.event.length>0) 
            {
              if(val == "add") this.load();
              else if(val == "edit")
              {
                var index = this.dataEx.findIndex((x => x.recID == item.event[0]?.recID));
                if(index>=0) {this.dataEx[index] = item.event[0]}
              }
            }
          })
          break;
        }
      case "delete":
        {
          var config = new AlertConfirmInputConfig();
          config.type = "YesNo";
          //SYS003
          this.notifySvr.alert("Thông báo", "Bạn có chắc chắn muốn xóa ?", config).closed.subscribe(x=>{
            if(x.event.status == "Y")
            {
              this.api
                .execActionData<any>(
                  'AD_ExcelTemplates',
                  [data],
                  'DeleteAsync'
                ).subscribe(item=>{
                  if(item[0] == true)
                  {
                    this.notifySvr.notifyCode("RS002");
                    this.dataEx = this.dataEx.filter(x=>x.recID != item[1][0].recID);
                  }
                  else this.notifySvr.notify("Xóa không thành công");
                })
            }
          })
          break;
        }
    }
  }
  onSave()
  {
    this.submitted = true;
    if(this.exportGroup.invalid) return;
    var dt = this.exportGroup.value;
    switch(dt.format)
    {
      case "excel":
        {
          if(dt.dataExport == "all")
          {
            this.gridModel.page=1;
            this.gridModel.pageSize=-1;
          }
          else if(dt.dataExport == "selected")
          {
            this.gridModel.predicates = this.gridModel.predicate+"&&RecID=@1"
            this.gridModel.dataValues = [this.gridModel.dataValue,this.recID].join(";");
          }
          break;
        }
    }
    
    this.api.execSv<any>("OD",'CM', 'CMBusiness', 'ExportExcelAsync', this.gridModel).subscribe(item=>
    {
      if(item)
      {
        this.downloadFile(item);
      }
      
    }) 
      
  }
  downloadFile(data: any) {
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url= window.URL.createObjectURL(blob);
    window.open(url);
  }
  openFormUploadFile()
  {
    this.attachment.uploadFile();
  }
  onScroll(e:any)
  {
    const dcScroll = e.srcElement;
    if (dcScroll.scrollTop + dcScroll.clientHeight == dcScroll.scrollHeight) 
    {
      var data = this.optionEx
      //alert("a");
    }
     
  }
}
