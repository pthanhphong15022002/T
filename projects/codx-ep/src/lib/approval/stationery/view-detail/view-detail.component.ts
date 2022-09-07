import {
  Component,
  Injector,
  Input,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TabModel } from '@syncfusion/ej2-angular-navigations';
import { UIComponent, ViewsComponent } from 'codx-core';

@Component({
  selector: 'view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss'],
})
export class ViewDetailComponent extends UIComponent {
  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  @ViewChild('attachment') attachment;
  @Input() itemDetail: any;
  @Input() funcID;
  @Input() formModel;
  @Input() override view: ViewsComponent;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  firstLoad = true;
  id: string;
  itemDetailDataStt: any;
  itemDetailStt: any;

  constructor(private injector: Injector) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.itemDetailStt = 1;
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (
  //     changes['taskID'] &&
  //     changes['taskID'].currentValue &&
  //     !this.firstLoad
  //   ) {
  //     if (changes['taskID'].currentValue === this.id) return;
  //     this.id = changes['taskID'].currentValue;
  //     this.getTaskDetail();
  //   }
  //   this.firstLoad = false;
  // }

  openFormFuncID(event) {}

  changeDataMF(event, data: any) {}

  clickChangeItemDetailDataStatus(stt) {
    this.itemDetailDataStt = stt;
  }

  setStyles(color): any {
    let styles = {
      backgroundColor: color,
      color: 'white',
    };
    return styles;
  }

  clickChangeItemViewStatus(stt, recID) {
    this.itemDetailStt = stt;
  }
}
