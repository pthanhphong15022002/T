import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  NotificationsService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxBpService } from '../codx-bp.service';

@Component({
  selector: 'lib-my-instances',
  templateUrl: './my-instances.component.html',
  styleUrls: ['./my-instances.component.css'],
})
export class MyInstancesComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplateList') headerTemplateList?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  predicates = 'CreatedBy=@0';
  dataValues = '';
  dataSelected: any;
  user: any;
  constructor(
    inject: Injector,
    private bpService: CodxBpService,
    private notiSv: NotificationsService,
    private codxShareService: CodxShareService,
    private authstore: AuthStore
  ) {
    super(inject);
    this.user = this.authstore.get();
    this.dataValues = this.user?.userID;
  }

  onInit(): void {}

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.list,
        sameData: true,
        active: true,
        model: {
          template: this.templateList,
          headerTemplate: this.headerTemplateList,
        },
      },
    ];
  }

  selectedChange(data: any) {
    this.dataSelected = data?.data ? data?.data : data;
    this.detectorRef.detectChanges();
  }

  changeDataMF(e, data) {
    if (e != null && data != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'BPT0501':
          case 'SYS003':
          case 'SYS004':
          case 'SYS001':
          case 'SYS002':
            res.disabled = false;
            break;
          default:
            res.disabled = true;
            break;
        }
      });
    }
  }

  clickMF(e, data) {}
}
