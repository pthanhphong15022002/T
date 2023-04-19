import { Storages } from './../../../model/Storages.model';
import {
  ImageViewerComponent,
  AuthStore,
  CodxService,
  ApiHttpService,
  DialogRef,
  DialogData,
  NotificationsService,
  DataService,
  CRUDService,
  CacheService,
  RequestOption,
  FormModel,
} from 'codx-core';
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  Optional,
} from '@angular/core';

@Component({
  selector: 'app-add-update-storage',
  templateUrl: './add-update-storage.component.html',
  styleUrls: ['./add-update-storage.component.scss'],
})
export class AddUpdateStorageComponent implements OnInit {
  readOnly = false;
  formType = '';
  funcID = 'MWP0095';

  empty = '';
  gridViewSetup = {
    title: '',
    memo: '',
  };
  formModel: FormModel = null;
  dialogData: any;
  dialogRef:DialogRef;
  function:any = null;
  storage: Storages = new Storages();
  data:any = null;
  action: "add" | "edit" = "add";
  headerText:string = "";
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;

  constructor(
    private authStore: AuthStore,
    private changedt: ChangeDetectorRef,
    private notifySV : NotificationsService,
    private api: ApiHttpService,
    private cache: CacheService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {
    this.dialogRef = dialogRef;
    this.dialogData = dialogData.data;
    this.formModel = new FormModel();
    
  }

  ngOnInit(): void {
    this.cache.functionList(this.funcID)
      .subscribe((func:any) => {
        if(func){
          this.function = func;
          this.headerText = `${this.dialogData.text} ${func.defaultName}`;
          this.cache.gridViewSetup(func.formName, func.gridViewName)
          .subscribe((grv) => {
            if(grv){
              this.formModel.funcID = func.functionID;
              this.formModel.formName = func.formName;
              this.formModel.gridViewName = func.gridViewName;
              this.gridViewSetup = grv;
            }
          });
        }
      }); 
    if(this.dialogData){
      this.action = this.dialogData.action;
      this.storage = JSON.parse(JSON.stringify(this.dialogData.data));
      this.data = JSON.parse(JSON.stringify(this.dialogData.data));


    }
  }

  valueChange(e) {
    let value = e.data;
    let field = e.field;
    this.data[field] = value;
  }

  //btn save click
  submit(){
    this.action == 'add' ? this.addStorage() : this.editStorage(); 
  }

  //insert storage
  addStorage() {
    if(this.data){
      this.imageUpload
      .updateFileDirectReload(this.data.recID)
      .subscribe((res) => {
        if(res){
          this.api.execSv("WP","ERM.Business.WP","StoragesBusiness","InsertAsync",[this.data])
          .subscribe((res:boolean) => {
            this.notifySV.notifyCode(res ? "SYS006" : "SYS023");
            this.dialogRef.close(res ? this.data : null);
          });
        }
        else
        {
          this.dialogRef.close(null);
        }
      });
    }
    
  }
  //edit storage
  editStorage() {
    debugger
    if(this.data){
      this.imageUpload
      .updateFileDirectReload(this.data.recID)
      .subscribe((res) => {
        if(res){
          this.api.execSv(
          "WP","ERM.Business.WP","StoragesBusiness","UpdateAsync",[this.data])
          .subscribe((res:boolean) => {
            this.notifySV.notifyCode(res ? "SYS007" : "SYS021");
            this.dialogRef.close(res ? this.data : null);
          });
        }
        else
        {
          this.dialogRef.close(null);
        }
      });
    }
  }

  beforeSave(op: RequestOption) {
    op.service = 'WP';
    op.assemblyName = 'ERM.Business.WP';
    op.className = 'StoragesBusiness';
    op.methodName = this.action == 'add' ? 'InsertAsync' : 'UpdateStorageAsync';
    op.data = this.data
    return true;
  }
}
