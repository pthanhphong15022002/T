import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { UIComponent, CodxFormComponent, DialogRef, FormModel, CacheService, ApiHttpService, CallFuncService, NotificationsService, DialogData } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';

@Component({
  selector: 'lib-pop-add-dimension-setup',
  templateUrl: './pop-add-dimension-setup.component.html',
  styleUrls: ['./pop-add-dimension-setup.component.css']
})
export class PopAddDimensionSetupComponent extends UIComponent implements OnInit {
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  headerText:string;
  formModel: FormModel;
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    api: ApiHttpService,
    private dt: ChangeDetectorRef, 
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData 
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
   }

   onInit(): void {
  }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    console.log(this.form.formGroup.value);
  }

}
