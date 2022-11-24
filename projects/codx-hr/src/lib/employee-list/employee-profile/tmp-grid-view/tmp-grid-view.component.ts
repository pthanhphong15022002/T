import {
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  Input,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  CallFuncService,
  DialogData,
  DialogRef,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from '../../../codx-hr.service';

@Component({
  selector: 'lib-tmp-grid-view',
  templateUrl: './tmp-grid-view.component.html',
  styleUrls: ['./tmp-grid-view.component.scss'],
})
export class TmpGridViewComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    private callfunc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialo?: DialogRef
  ) {
    super(inject);
  }

  @Input() columnsGrid: Array<any>;
  @Input() service = 'HR';
  @Input() assemblyName = 'HR';
  @Input() entity = 'HR_EAppointions';
  @Input() className = 'EAppointionsBusiness';
  @Input() method = 'GetLstAppointionByEIDAsync';
  @Input() idField = 'employeeID';
  @Input() predicate = '@EmployeeID=@0';
  @Input() dataValue;
  @Input() rowTemplate: TemplateRef<any>;

  onInit(): void {
    console.log('datavalues', this.dataValue);
    this.df.detectChanges();
  }
}
