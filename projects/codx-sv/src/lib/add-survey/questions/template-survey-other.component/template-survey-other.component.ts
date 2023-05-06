import {
  Component,
  OnInit,
  Injector,
  Optional,
  ViewEncapsulation,
  ViewChild,
} from '@angular/core';
import {
  CodxListviewComponent,
  DialogData,
  DialogRef,
  UIComponent,
} from 'codx-core';

@Component({
  selector: 'app-template-ssurvey-other',
  templateUrl: './template-survey-other.component.html',
  styleUrls: ['./template-survey-other.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TemplateSurveyOtherComponent
  extends UIComponent
  implements OnInit
{
  dialog: DialogRef;
  data: any;
  formModel: any;
  header = 'Chọn biểu mẫu';
  dataSelected: any;
  disableSave = true;
  @ViewChild('lstView') lstView: CodxListviewComponent;
  constructor(
    private injector: Injector,
    @Optional() dialogRef: DialogRef,
    @Optional() dt: DialogData
  ) {
    super(injector);
    this.dialog = dialogRef;
    this.formModel = dialogRef.formModel;
  }

  onInit(): void {}

  onSave() {
    delete this.dataSelected.active;
    this.dialog.close(this.dataSelected);
  }

  ngAfterViewInit() {}

  choose(data) {
    if (data) {
      this.disableSave = false;
      if (this.lstView.dataService.data)
        this.lstView.dataService.data.forEach((x) => {
          x['active'] = false;
        });
      data['active'] = !data['active'];
      this.dataSelected = data;
    }
  }
}
