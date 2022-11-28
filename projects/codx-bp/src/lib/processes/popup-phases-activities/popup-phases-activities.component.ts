import {
  ApiHttpService,
  DialogModel,
  CallFuncService,
  FormModel,
  DialogRef,
} from 'codx-core';
import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'lib-popup-phases-activities',
  templateUrl: './popup-phases-activities.component.html',
  styleUrls: ['./popup-phases-activities.component.css'],
})
export class PopupPhasesActivitiesComponent implements OnInit {
  @Input() processID: string = '';
  @Input() type: string = '';
  @Input() parentID: string = '';
  @Input() formModel: FormModel = null;
  // dialog!: DialogRef;

  services: string = 'BP';
  assamplyName: string = 'ERM.Business.BP';
  className: string = 'ProcessesBusiness';
  countData: number = 0;

  lstSteps: any;
  @ViewChild('templateSteps') templateSteps: TemplateRef<any>;

  constructor(private api: ApiHttpService, private callFc: CallFuncService) {}

  ngOnInit(): void {
    this.loadDataPhasesOrActivies(this.processID, this.type);
  }

  loadDataPhasesOrActivies(processID, type) {
    this.api
      .execSv<any>(
        this.services,
        this.assamplyName,
        this.className,
        'GetPhasesOrActivesAsync',
        [processID, type]
      )
      .subscribe((res) => {
        if (res.processSteps && res.processSteps.length > 0) {
          this.lstSteps = res.processSteps;
          this.countData = res.processSteps.length;
        }
      });
  }

  openPopup() {
    if (this.templateSteps) {
      let option = new DialogModel();
      let popup  = this.callFc.openForm(
        this.templateSteps,
        "", 400, 500, "", null, "", option
      )
      popup.closed.subscribe((res: any) => {
        if (res) {
          this.loadDataPhasesOrActivies(this.processID, this.type);

        }
      });
    }
  }
}
