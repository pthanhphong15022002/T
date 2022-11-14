import {
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  Input,
  OnInit,
  Optional,
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
  @Input() rowTemplate;

  @ViewChild('views', { static: true })
  views: Array<ViewModel> | any = [];

  onInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: null,
          resources: this.columnsGrid,
        },
      },
    ];
    this.df.detectChanges();
  }
}
