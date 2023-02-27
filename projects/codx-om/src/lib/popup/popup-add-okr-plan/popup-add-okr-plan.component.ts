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
  okrFG: FormGroup;
  listFG: any;
  dataOKR:any;
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
    this.okrFG = dialogData.data[6];
    this.dialogRef = dialogRef;
    this.formModel = dialogRef.formModel;
  }


  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  ngAfterViewInit(): void {

  }

  onInit(): void {
    
    this.getCacheData();
    
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getCacheData(){

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
