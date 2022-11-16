import { ChangeDetectorRef, Component, ElementRef, OnInit, Optional, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DialogRef , DialogData, ApiHttpService} from 'codx-core';
import { take } from 'rxjs';

@Component({
  selector: 'lib-okr-add',
  templateUrl: './okr-add.component.html',
  styleUrls: ['./okr-add.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OkrAddComponent implements OnInit {
  @ViewChildren('nameInput') nameInputs:  QueryList<ElementRef>;

  titleForm = "Thêm bộ bộ mục tiêu";
  titleAdd = "Thiết lập mục tiêu";

  dialog:any;
  formModel: any;
  okrForm: FormGroup
  constructor(
    private api: ApiHttpService,
    private ref: ChangeDetectorRef,
    private fb: FormBuilder,
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
    var text = "okrFormArray."+i+".targets";
    const repocontributors = this.okrForm.get(text);
    (repocontributors as FormArray).push(this.newKRs());
  }
  save()
  {
    this.api.execSv("OM","OM","OKRBusiness","SaveOMAsync",this.okrForm.value.okrFormArray).subscribe();
    var a = this.okrForm.value

  }
  newOKRs(): FormGroup {
    return this.fb.group({
      okrName: '',
      confidence:'',
      targets: this.fb.array([]) ,
    })
  }
  newKRs(): FormGroup {
    return this.fb.group({
      comment: '',
      target: null ,
    })
  }
  getTargets(form:any){
    return form.controls.targets.controls;
  }
}
