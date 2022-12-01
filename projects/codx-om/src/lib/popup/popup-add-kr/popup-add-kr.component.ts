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
import { CodxOmService } from '../../codx-om.service';
import { Targets } from '../../model/okr.model';

//import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-kr',
  templateUrl: 'popup-add-kr.component.html',
  styleUrls: ['popup-add-kr.component.scss'],
})
export class PopupAddKRComponent extends UIComponent {
  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() kr: any;
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  @Output() loadData = new EventEmitter();

  headerText = '';
  subHeaderText = '';
  month='Tháng';
  quarter='Quý';

  months=['1','2','3','4','5','6','7','8','9','10','11','12'];
  quarters =['1','2','3','4'];

  planMonth=[];
  planQuarter=[];

  formModel: FormModel;
  dialogRef: DialogRef;
  isAfterRender: boolean;
  fGroupAddKR: FormGroup;
  o:any;
  oParentID:any;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.kr = dialogData.data[0];      
    this.o = dialogData.data[1]; 
    this.formModel = dialogData.data[2];  
    this.isAdd = dialogData?.data[3];
    this.headerText= dialogData?.data[4];
    this.dialogRef = dialogRef;
    //
  }

  ngAfterViewInit(): void {}

  onInit(): void {
    // this.codxOmService.getFormModel('OMT03').then(res=>{
    //   this.formModel=res;
    //   this.initForm();
    // })
    this.cache.valueList('OM006').subscribe(res=>{
      if(res){
        var x= res;
      }
    })
    this.initForm();
  }
  initForm() {
    this.codxOmService
      .getFormGroup(this.formModel?.formName, this.formModel?.gridViewName)
      .then((item) => {
        this.fGroupAddKR = item;  
        if(this.isAdd){
          this.kr=this.fGroupAddKR.value;  
          this.kr.parentID=this.o?.recID;
        }    
        this.isAfterRender = true;
      });    
  }
  

  

  beforeSave(option: RequestOption) {
    let itemData = this.fGroupAddKR.value;
    option.methodName = '';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm(){
    this.fGroupAddKR.patchValue(this.kr);
  }


  openPopupTarget(template: any) {    
    if(this.kr?.plan=='M'){
      let dialogPlan = this.callfc.openForm(template, '', 550, 800, null,);
    }
    else if(this.kr?.plan=='Q'){
      let dialogPlan = this.callfc.openForm(template, '', 550, 400 , null,);
    }
    this.detectorRef.detectChanges();
  }

  calculatorTarget(){
    if(this.kr.target && this.kr.plan){
      if(this.kr.plan='M'){
        for (let i = 1; i < 12; i++) {
          this.planMonth.push()
        }
      }
      else if(this.kr.plan='Q'){

      }
    }
  }

  onSaveTarget(){
    this.kr.targets=[];
    let krTarget=[];
    if(this.kr.plan=='M'){
      this.planMonth.forEach(item=>{
        krTarget.push(item);
      });
    }
    else if(this.kr.plan=='Q'){
      this.planQuarter.forEach(item=>{
        krTarget.push(item);
      });
    }    
    krTarget.forEach(item=>{
      let tempTarget= new Targets();
      tempTarget.period=this.kr.periodID;
      tempTarget.oKRID=this.kr.recID;
      tempTarget.planDate=new Date();//OM_WAITING: sửa lại thành thời gian tương ứng
      tempTarget.target=item;
      tempTarget.createdOn=new Date();
      this.kr.targets.push(tempTarget);
    });
  }

  valueChange(evt:any){
    if(evt && evt.field)
    {
      if(this.kr.plan='M'){
        this.planMonth[evt.field]=evt.data;
      }
      if(this.kr.plan='Q'){
        this.planQuarter[evt.field]=evt.data;
      }
    }
    this.detectorRef.detectChanges();
  }
}
