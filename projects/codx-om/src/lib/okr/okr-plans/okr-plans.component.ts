import { ChangeDetectorRef, Component, ElementRef, OnInit, Optional, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
  ops = ['m','q','y'];
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
    if(dt?.data[0]) this.formModel = dt?.data[0]
    this.dialog =  dialog;
  }

  ngOnInit(): void {
    //Công ty
    
    if(this.formModel.funcID == "OMT01")
    {
      this.titleAdd += " công ty";
    }
    this.createFormGroup();
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
}
