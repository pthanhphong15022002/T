import {
  Component,
  EventEmitter,
  Injector,
  Input,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import {
  AuthService,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxOmService } from '../../codx-om.service';

//import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-kr',
  templateUrl: 'popup-add-kr.component.html',
  styleUrls: ['popup-add-kr.component.scss'],
})
export class PopupAddKRComponent extends UIComponent {
  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() data!: any;
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  @Output() loadData = new EventEmitter();

  headerText = '';
  subHeaderText = '';

  fGroupAddCar: FormGroup;
  formModel: FormModel;
  dialogRef: DialogRef;
  lstEquipment = [];
  CbxName: any;
  isAfterRender = false;
  gviewCar: any;
  returnData: any;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = dialogData?.data[0];
    this.isAdd = true//dialogData?.data[1];
    this.headerText= "Thêm kết quả chính"//dialogData?.data[2];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef?.formModel;    
    
  }

  ngAfterViewInit(): void {}

  onInit(): void {
    this.codxOmService.getFormModel('OMT03').then(res=>{
      this.formModel=res;
      this.initForm();
    })
  }
  initForm() {
    this.codxOmService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.fGroupAddCar = item;        
        this.isAfterRender = true;
      });    
  }
  

  openPopupDevice(template: any) {
    var dialog = this.callfc.openForm(template, '', 550, 350);
    this.detectorRef.detectChanges();
  }

  valueChange(event: any) {
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.fGroupAddCar.patchValue({ [event['field']]: event.data.value });
      } else {
        this.fGroupAddCar.patchValue({ [event['field']]: event.data });
      }
    }
  }

  valueCbxChange(event: any) {
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.fGroupAddCar.patchValue({ [event['field']]: event.data.value });
      } else {
        this.fGroupAddCar.patchValue({ [event['field']]: event.data });
      }
    }
  }
  
  beforeSave(option: RequestOption) {
    let itemData = this.fGroupAddCar.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    this.fGroupAddCar.patchValue(this.data);
    if (this.fGroupAddCar.invalid == true) {
      // this.codxEpService.notifyInvalid(this.fGroupAddCar, this.formModel);
      // return;
    }

    if (this.fGroupAddCar.value.category != 1) {
      this.fGroupAddCar.patchValue({companyID:null});
    }    
    this.fGroupAddCar.patchValue({
      equipments: this.lstEquipment,
    });
    let index:any
    if(this.isAdd){
      index=0;
    }
    else{
      index=null;
    }
    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt),index)
      .subscribe(async (res) => {
        if (res.save || res.update) {          
          if (!res.save) {
            this.returnData = res.update;
          } else {
            this.returnData = res.save;
          }
          if(this.returnData?.recID)
          {
            
              this.dialogRef && this.dialogRef.close(this.returnData);
            
          } 
        }
        else{ 
          //Trả lỗi từ backend.         
          return;
        }
      });
  }

}
