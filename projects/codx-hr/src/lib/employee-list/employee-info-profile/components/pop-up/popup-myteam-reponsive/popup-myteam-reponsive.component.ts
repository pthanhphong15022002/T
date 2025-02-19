import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import moment from 'moment';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { CodxHrService } from 'projects/codx-hr/src/public-api';


@Component({
  selector: 'lib-popup-myteam-reponsive',
  templateUrl: './popup-myteam-reponsive.component.html',
  styleUrls: ['./popup-myteam-reponsive.component.css']
})
export class PopupMyteamReponsiveComponent extends UIComponent
implements OnInit  {
  formModel: FormModel;
  dialog: DialogRef;
  EBasicSalaryObj: any;
  idField = 'RecID';
  actionType: string;
  disabledInput = false;
  isMultiCopy: boolean = false;
  employeeId: string | null;
  headerText: 'Đăng ký nghĩ phép';
  autoNumField: string;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;

  //check where to open the form
  employeeObj: any | null;
  actionArray = ['add', 'edit', 'copy'];
  fromListView: boolean = false; //check where to open the form
  showEmpInfo: boolean = true;
  loaded: boolean = false;
  moment = moment;
  employeeSign;
  loadedAutoNum = false;
  originEmpID = '';
  originEmpBeforeSelectMulti: any;
  dateNow = moment().format('YYYY-MM-DD');
  // genderGrvSetup: any;
  //end
  constructor(
    injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.actionType = data?.data?.actionType;
    this.headerText = data?.data?.headerText;
    this.dialog = dialog;
    console.log('dialog nè', this.dialog)

    
  }

  override onInit(): void {
    
  }

  closeMyTeamPopUp(){
    this.dialog.close();
  }

  
}

