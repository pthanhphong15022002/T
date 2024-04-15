import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  UIComponent,
  DialogData,
  DialogRef,
  FormModel,
  LayoutAddComponent,
  NotificationsService,
  RequestOption,
  ApiHttpService,
} from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/public-api';


@Component({
  selector: 'lib-popup-add-new-hr',
  templateUrl: './popup-add-new-hr.component.html',
  styleUrls: ['./popup-add-new-hr.component.scss'],
})
export class PopupAddNewHRComponent implements OnInit, AfterViewInit{
  
  tabInfo: any[] = [
    {
      icon: 'icon-assignment_ind',
      text: 'Thông tin nhân viên',
      name: 'lblEmmployeeInfo',
    },
    {
      icon: 'icon-person',
      text: 'Thông tin cá nhân',
      name: 'lblPersonalInfo',
    },
    {
      icon: 'icon-folder_special',
      text: 'Pháp lý',
      name: 'lblLegalInfo',
    },
  ];
  dialogRef: DialogRef;
  funcID:string = "";
  action: string;
  title:string = '';
  data:any = null;
  @ViewChild('form', { static: true }) form: LayoutAddComponent;

  constructor(
    private hrService: CodxHrService,
    private api:ApiHttpService,
    private notiSV:NotificationsService,
    private dt: ChangeDetectorRef,
    private notify: NotificationsService,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {
    this.dialogRef = dialogRef;
    this.funcID = dialogRef?.formModel?.funcID;
    this.action = dialogData?.data?.action;
    this.title = dialogData?.data?.text;
    this.data = dialogData?.data?.itemSelected;
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
  }

  //value change
  valueChange(event) {
    if (event)
    {
      this.data[event.field] = event.data;
    }
  }

  //set header text
  setTitle(e) {
    this.title += " " + e;
  }


  //submit
  onSaveForm() {
    if(this.action != "edit")
      this.save(this.data,this.funcID);
    else this.update(this.data);
    this.dt.detectChanges();
  }
  // save data
  save(data:any,funcID:string)
  {
    debugger
    if(data){
      this.api.execSv("HR","ERM.Business.HR","EmployeesBusiness_Old","SaveAsync",[data,funcID])
      .subscribe((res:any) => {
        let mssg = res ? "SYS006" : "SYS023";
        this.notify.notifyCode(mssg);
        this.dialogRef.close(res);
      });
    }
  }
  //update data
  update(data:any){
    debugger
    if(data){
      this.api.execSv("HR","ERM.Business.HR","EmployeesBusiness_Old","SaveAsync",[data])
      .subscribe((res:any) => {
        let mssg = res ? "SYS006" : "SYS023";
        this.notify.notifyCode(mssg);
        this.dialogRef.close(res);
      });
    }
  }
}
