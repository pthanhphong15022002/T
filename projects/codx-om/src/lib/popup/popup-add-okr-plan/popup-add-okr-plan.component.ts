import { Util } from 'codx-core';
import { OMCONST } from './../../codx-om.constant';
import {
  AfterViewInit,
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
  CodxFormComponent,
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
import { row } from '@syncfusion/ej2-angular-grids';

//import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-okr-plan',
  templateUrl: 'popup-add-okr-plan.component.html',
  styleUrls: ['popup-add-okr-plan.component.scss'],
})
export class PopupAddOKRPlanComponent extends UIComponent implements AfterViewInit {
  @ViewChild('form') form: CodxFormComponent;
  
  formModel: FormModel;
  dialogRef: DialogRef;
  isAfterRender: boolean;
  fGroupAddKR: FormGroup;
  funcID: any;
  okrPlan: any;
  headerText='';
  modelOKR: any;
  curOrg='';
  listFM: any;
  krFG: FormGroup;
  skrFG: FormGroup;
  obFG!: FormGroup;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.funcID = dialogData.data[0];
    this.okrPlan = dialogData.data[1];
    this.modelOKR = dialogData.data[2];
    this.headerText = dialogData.data[3];
    this.curOrg = dialogData.data[4];
    this.listFM = dialogData.data[5];
    this.dialogRef = dialogRef;
    this.formModel = dialogRef.formModel;
    this.getCacheData();
  }


  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  ngAfterViewInit(): void {

  }

  onInit(): void {
   
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getCacheData(){
    this.krFG=this.codxService.buildFormGroup(this.listFM?.krFM?.formName,this.listFM?.krFM?.gridViewName);
    this.obFG=this.codxService.buildFormGroup(this.listFM?.obFM?.formName,this.listFM?.obFM?.gridViewName);
    this.skrFG=this.codxService.buildFormGroup(this.listFM?.skrFM?.formName,this.listFM?.skrFM?.gridViewName);
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//


  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
  

  
}
