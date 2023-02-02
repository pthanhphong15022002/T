import {
  DP_Steps,
  DP_Instances_Steps,
  DP_Instances,
} from './../../models/models';
import { CodxDpService } from './../../codx-dp.service';
import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { CRUDService, ApiHttpService } from 'codx-core';

@Component({
  selector: 'codx-instance-detail',
  templateUrl: './instance-detail.component.html',
  styleUrls: ['./instance-detail.component.scss'],
})
export class InstanceDetailComponent implements OnInit {
  @Input() formModel: any;
  @Input() dataService: CRUDService;
  @Input() recID: any;
  @ViewChild('locationCBB') locationCBB: any;
  @Output() progressEvent = new EventEmitter<object>();
  @Input() stepName: string;
  @Input() progress = '0';
  @Input() dataSelect: any;
  id: any;
  totalInSteps: any;
  @Input() listSteps: DP_Instances_Steps[] = [];
  tmpTeps: DP_Instances_Steps;
  //progressbar
  labelStyle = { color: '#FFFFFF' };
  showProgressValue = true;
  animation = { enable: true, duration: 2000, delay: 0 };
  trackThickness: Number = 24;
  progressThickness: Number = 24;
  value: Number = 30;
  cornerRadius: Number = 30;
  idCbx = 'stage';

  fields: Object = { text: 'name', value: 'id' };
  listRoom = [
    {
      name: 'Xem theo biểu đồ Gantt',
      id: 'gantt',
    },
    {
      name: 'Xem theo giai đoạn',
      id: 'stage',
    },
    {
      name: 'Xem theo trường nhập liệu',
      id: 'field',
    },
  ];

  @Input() currentStep: number;
  constructor(
    private dpSv: CodxDpService,
    private api: ApiHttpService,
    private changeDetec: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // var instance = new DP_Instances();
    // instance.title = "TEST DO PHÚC THỰC HIỆN";
    // this.api.callSv('DP','ERM.Business.DP','InstancesBusiness','AddInstanceAsync',[instance, this.listSteps]).subscribe();
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    // if (changes['recID']) {
    //   if (changes['recID'].currentValue == this.id) return;
    //   this.id = changes['recID'].currentValue;
    //   this.getInstanceByRecID(this.id);
    //   this.getStepsByInstanceID(this.id);
    // }
    if (changes['dataSelect']) {
      if (changes['dataSelect'].currentValue.recID == this.id) return;
      this.id = changes['dataSelect'].currentValue.recID;
      this.dataSelect = changes['dataSelect'].currentValue;
      this.currentStep = this.dataSelect.currentStep;
      if (
        changes['listSteps'].currentValue != null &&
        changes['listSteps'].currentValue.length > 0
      ) {
        this.getStepsByInstanceID(this.listSteps);
      }else{
        this.tmpTeps = null;
      }
    }
    console.log(this.formModel);
  }

  // getInstanceByRecID(recID) {
  //   this.dpSv.GetInstanceByRecID(recID).subscribe((res) => {
  //     if (res) {
  //       this.dataSelect = res;
  //       this.currentStep = this.dataSelect.currentStep;

  //     }
  //   });
  // }

  getStepsByInstanceID(list) {
    list.forEach((element) => {
      if (element.indexNo == this.currentStep) {
          this.tmpTeps = element;

      }
    });
  }

  // getStepsByProcessID(recID){
  //   this.dpSv.getStepsByProcessID(recID).subscribe((res) => {
  //     if (res != null || res.length > 0) {
  //       this.listSteps = res;
  //     }
  //   });
  // }

  cbxChange(e) {
    this.idCbx = e;
  }

  clickMF(e, data) {
    console.log(e);
    switch (e.functionID) {
      case 'DP09':
        this.continues(data);
        break;
    }
  }

  changeDataMF(e, data) {
    console.log(e)
    if (e) {
      e.forEach((element) => {
        if (
          element.functionID == 'SYS002' ||
          element.functionID == 'SYS001' ||
          element.functionID == 'SYS004' ||
          element.functionID == 'SYS003' ||
          element.functionID == 'SYS005' ||
          element.functionID == 'DP04' ||
          element.functionID == 'DP11' ||
          element.functionID == 'DP08' ||
          element.functionID == 'DP07' ||
          element.functionID == 'DP06' ||
          element.functionID == 'DP05' ||
          element.functionID == 'DP01' ||
          element.functionID == 'DP03' ||
          element.functionID == 'SYS102' ||
          element.functionID == 'SYS02' ||
          element.functionID == 'SYS104' ||
          element.functionID == 'SYS04' ||
          element.functionID == 'SYS103' ||
          element.functionID == 'SYS03' ||
          element.functionID == 'SYS101' ||
          element.functionID == 'SYS01'
        )
          element.disabled = true;
      });
    }
  }

  click(indexNo, data) {
    if (this.currentStep < indexNo) return;

    this.tmpTeps = data;
  }

  continues(data) {
    if (this.currentStep > this.listSteps.length) return;
    this.currentStep++;
    this.changeDetec.detectChanges();
  }

  setHTMLCssStages(oldStage, newStage) {}
}
