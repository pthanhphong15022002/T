import { ChangeDetectorRef, Component, ElementRef, OnInit, Optional, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { DialogRef , DialogData, ApiHttpService, NotificationsService} from 'codx-core';
import { take } from 'rxjs';

@Component({
  selector: 'lib-okr-plans',
  templateUrl: './okr-plans.component.html',
  styleUrls: ['./okr-plans.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OkrPlansComponent implements OnInit {
  @ViewChildren('nameInput') nameInputs:  QueryList<ElementRef>;

  titleForm = "Thêm bộ bộ mục tiêu";
  titleAdd = "Thiết lập mục tiêu";

  dialog:any;
  formModel: any;
  okrForm: FormGroup;
  date = new Date();
  //Kỳ
  periodID = "" ;
  //Loại
  interval = "";
  //Năm
  year = null;
  //
  dataDate = null;

  valueDate = "";
  constructor(
    private api: ApiHttpService,
    private ref: ChangeDetectorRef,
    private fb: FormBuilder,
    private notifySvr: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    //FormModel
    if(dt?.data[0]) this.formModel = dt?.data[0];
    if(dt?.data[1]) this.periodID = dt?.data[1];
    if(dt?.data[2]) this.interval = dt?.data[2];
    if(dt?.data[3]) this.year = dt?.data[3];
    if(dt?.data[4]) this.date = dt?.data[4]?.toDate;
    this.dialog =  dialog;
  }

  ngOnInit(): void {
    //Công ty
    
    if(this.formModel.funcID == "OMT01")
    {
      this.titleAdd += " công ty";
    }
    this.createFormGroup();
    this.getTextDate()
  }
  get okrFormArray() : FormArray {
    return this.okrForm.get("okrFormArray") as FormArray
  }
  
  //Tạo form Group
  createFormGroup()
  {
    this.okrForm = this.fb.group({
      okrFormArray: this.fb.array([]) ,
    });
  }
  addORKForm()
  {
    this.nameInputs.changes.pipe(take(1)).subscribe({
      next: changes => changes.last.nativeElement.focus()
    });
    this.okrFormArray.push(this.newOKRs());
    
  }
  addKRForm(i:any)
  {
    var text = "okrFormArray."+i+".child";
    const repocontributors = this.okrForm.get(text);
    (repocontributors as FormArray).push(this.newKRs());
  }
  save()
  {
    this.api.execSv("OM","OM","OKRBusiness","SaveOMAsync",[this.okrForm.value.okrFormArray]).subscribe(item=>{
      if(item) 
      {
        this.notifySvr.notifyCode("SYS006");
        this.dialog.close(item);
      }
    });
  }
  newOKRs(): FormGroup {
    return this.fb.group({
      okrName: '',
      confidence:'',
      okrLevel : "1",
      okrType: "O",
      child: this.fb.array([]) ,
    })
  }
  newKRs(): FormGroup {
    return this.fb.group({
      okrName: '',
      target: 0 ,
      okrLevel : "1",
      okrType: "R",
      umid:''
    })
  }
  getTargets(form:any){
    return form.controls.child.controls;
  }

  changeCalendar(event:any)
  {
    debugger;
  }
  getTextDate()
  {
    switch(this.interval)
    {
      case "Y":
        {
          this.valueDate = this.year;
          break;
        }
      case "Q":
        {
          this.valueDate = "Q"+ this.periodID + "/" + this.year;
          break;
        }
      case "M":
        {
          this.valueDate = "T"+ this.periodID + "/" + this.year;
          break;
        }
    }
  }
}
