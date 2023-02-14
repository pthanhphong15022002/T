import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  CodxFormComponent,
  CodxListviewComponent,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxHrService } from '../../codx-hr.service';

@Component({
  selector: 'lib-popup-emp-business-travels',
  templateUrl: './popup-emp-business-travels.component.html',
  styleUrls: ['./popup-emp-business-travels.component.css'],
})
export class PopupEmpBusinessTravelsComponent
  extends UIComponent
  implements OnInit
{
  @ViewChild('form') form: CodxFormComponent;
  successFlag = false;
  formGroup: FormGroup;
  formModel: FormModel;
  dialog: DialogRef;
  headerText: string = '';
  funcID;
  employId;
  data;

  idField = 'RecID';

  dataValues;
  predicates = 'EmployeeID=@0';

  isAfterRender = false;
  actionType: string;
  ops = ['y'];
  date = new Date('01-04-2040');
  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notitfy: NotificationsService,
    private hrService: CodxHrService,
    private codxShareService: CodxShareService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.actionType = data?.data?.actionType;
    this.funcID = data?.data?.funcID;
    this.data = data?.data?.businessTravelObj;
    console.log('data khi copy truyen vao', this.data);
    
    if(this.data){
      if(this.data.beginDate == '0001-01-01T00:00:00'){
        this.data.beginDate = null;
      }
      if(this.data.endDate == '0001-01-01T00:00:00'){
        this.data.endDate = null;
      }
    }
    
    // this.cache.functionList(this.funcID).subscribe((funcList) => {
    //   if (funcList) {
    //     console.log(funcList);
    //     this.headerText = this.headerText + ' 1 ' + funcList.description;
    //     console.log('headerText sau khi goi funcID', this.headerText);
        
    //   }
    // });

    this.formModel = dialog.formModel;
    this.employId = data?.data?.employeeId;

    this.dataValues = this.employId;
  }

  ngAfterViewInit(){
    this.dialog && this.dialog.closed.subscribe(res => {
      if(!res.event){
        if(this.successFlag == true){
          this.dialog.close(this.data);
        }
        else{
          this.dialog.close(null);
        }
      }
    })
  }

  onInit(): void {
    this.hrService
    .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    .then((fg) => {
      if (fg) {
        this.formGroup = fg;
        this.initForm();
      }
    });

    // this.hrService.getFormModel(this.funcID).then((formModel) => {
    //   if (formModel) {
    //     this.formModel = formModel;
    //     this.hrService
    //       .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    //       .then((fg) => {
    //         if (fg) {
    //           this.formGroup = fg;
    //           this.initForm();
    //         }
    //       });
    //   }
    // });
  }

  initForm() {
    if (this.actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            this.data = res?.data;
            this.data.beginDate = null;
            this.data.endDate = null;
            this.data.employeeID = this.employId;
            this.formModel.currentData = this.data;
            this.formGroup.patchValue(this.data);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      this.formModel.currentData = this.data;
      this.formGroup.patchValue(this.data);
      this.cr.detectChanges();
      this.isAfterRender = true;
    }
  }

  onSaveForm(isCloseForm: boolean) {
    // if (this.formGroup.invalid) {
    //   this.hrService.notifyInvalid(this.formGroup, this.formModel);
    //   return;
    // }

    if (this.actionType == 'add' || this.actionType == 'copy') {
      this.data.contractTypeID = '1';

      this.hrService.addEBusinessTravels(this.data).subscribe((res) => {
        if (res) {
          //code test

          this.data = res;
          this.notitfy.notifyCode('SYS006');
          this.successFlag = true;
          this.dialog && this.dialog.close(this.data);
        }
      });
    } else if (this.actionType == 'edit') {
      this.hrService.editEBusinessTravels(this.data).subscribe((res) => {
        if (res) {
          this.notitfy.notifyCode('SYS007');
          this.dialog && this.dialog.close(this.data);

        }
      });
    }

    this.cr.detectChanges();
  }

}
