import {
  Component,
  Injector,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { UIComponent, ViewModel } from 'codx-core';

@Component({
  selector: 'lib-views-tabs-details',
  templateUrl: './views-tabs-details.component.html',
  styleUrls: ['./views-tabs-details.component.css'],
})
export class ViewsTabsDetailsComponent extends UIComponent {
  @ViewChild('viewKanban') viewKanban: TemplateRef<any>;
  @Input() funcID: any;
  @Input() viewMode = 6;

  dataObj: any;
  service = 'DP';
  assemblyName = 'ERM.Business.DP';
  entityName = 'DP_Processes';
  className = 'ProcessesBusiness';
  method = '';
  idField = 'recID';
  views: Array<ViewModel> = [];

  constructor(private inject: Injector) {
    super(inject);
  }

  onInit(): void {
    throw new Error('Method not implemented.');
  }
}
