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

  formModel: FormModel;
  dialogRef: DialogRef;
  isAfterRender: boolean;
  fGroupAddKR: FormGroup;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    //this.data = dialogData?.data[0];
    this.isAdd = true//dialogData?.data[1];
    this.headerText= "Thêm kết quả chính"//dialogData?.data[2];
    this.dialogRef = dialogRef;
    this.formModel = dialogData.data[0]?.formModel;    
    
  }

  ngAfterViewInit(): void {}

  onInit(): void {
    // this.codxOmService.getFormModel('OMT03').then(res=>{
    //   this.formModel=res;
    //   this.initForm();
    // })
    this.initForm();
  }
  initForm() {
    this.codxOmService
      .getFormGroup(this.formModel?.formName, this.formModel?.gridViewName)
      .then((item) => {
        this.fGroupAddKR = item;        
        this.isAfterRender = true;
      });    
  }
  

  openPopupDevice(template: any) {
    var dialog = this.callfc.openForm(template, '', 550, 800);
    this.detectorRef.detectChanges();
  }

  
  
  beforeSave(option: RequestOption) {
    let itemData = this.fGroupAddKR.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm(){}

}
