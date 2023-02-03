import { DP_Steps, DP_Instances_Steps, DP_Instances } from './../../models/models';
import { CodxDpService } from './../../codx-dp.service';
import { Component, Input, OnInit, SimpleChanges, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
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

  dataSelect: any;
  id: any;
  totalInSteps: any;
  listSteps: DP_Instances_Steps[] = [];
  tmpTeps: DP_Instances_Steps;
  //progressbar
  labelStyle = { color: '#FFFFFF' };
  showProgressValue = true;
  animation = { enable: true, duration: 2000, delay: 0 };
  trackThickness: Number = 24;
  progressThickness: Number = 24;
  value: Number = 30;
  cornerRadius: Number = 30;
  idCbx = "stage";
  stepName: string;
  progress = '0';
  fields: Object = { text: 'name', value: 'id' };
  listRoom = [{
    name: 'Xem theo biểu đồ Gantt',
    id: 'gantt'
  },
  {
    name: 'Xem theo giai đoạn',
    id: 'stage'
  },
  {
    name: 'Xem theo trường nhập liệu',
    id: 'field'
  }];
  lstTest = [{
    stepNo: 1,
    stepName: 'test1'
  },
  {
    stepNo: 2,
    stepName: 'test2'
  },
  {
    stepNo: 3,
    stepName: 'test3'
  },
  {
    stepNo: 4,
    stepName: 'test4'
  }]

  currentStep = 1;
  constructor(private dpSv: CodxDpService, private api: ApiHttpService, private changeDetec: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    console.log(this.listSteps);
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
    if (changes['recID']) {
      if (changes['recID'].currentValue == this.id) return;
      this.id = changes['recID'].currentValue;
      this.getInstanceByRecID(this.id);
      this.getStepsByProcessID(this.id);
    }

  }


  getInstanceByRecID(recID) {
    this.dpSv.GetInstanceByRecID(recID).subscribe((res) => {
      if (res) {
        this.dataSelect = res;
        this.currentStep = this.dataSelect.currentStep;

      }
    });
  }

  getStepsByProcessID(insID){
    this.dpSv.GetStepsByInstanceIDAsync(insID).subscribe((res) => {
      if (res) {
        this.listSteps = res;
        var total = 0;
        this.listSteps.forEach(el =>{
          if(this.currentStep == el.indexNo)
            this.stepName = el.stepName;
          total += el.progress;
        })
        if(this.listSteps != null && this.listSteps.length > 0){
          this.progress = (total / this.listSteps.length).toFixed(1).toString();
        }else{
          this.progress = '0';
        }
        this.listSteps.forEach(element =>{
          if(element.indexNo == this.currentStep){
            this.dpSv.GetStepInstance(element.recID).subscribe(data=>{
              if(data){
                this.tmpTeps = data;
              }
            })
          }
        })
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

  cbxChange(e){
    this.idCbx = e;
  }

  clickMF(e, data){
    console.log(e);
    switch (e.functionID) {
      case 'DP09':
        this.continues(data);
        break;
    }
  }

  changeDataMF(e, data){
    if(e){
      e.forEach(element => {
        if(element.functionID == "SYS002" || element.functionID == "SYS001" || element.functionID == "SYS004" || element.functionID == "SYS003" || element.functionID == "SYS005"
        || element.functionID == "DP04" || element.functionID == "DP11" || element.functionID == "DP08" || element.functionID == "DP07" || element.functionID == "DP06" || element.functionID == "DP05"
        || element.functionID == "DP01" || element.functionID == "DP03" || element.functionID == "SYS102" || element.functionID == "SYS02" || element.functionID == "SYS104" || element.functionID == "SYS04"
        || element.functionID == "SYS103" || element.functionID == "SYS03" || element.functionID == "SYS101" || element.functionID == "SYS01")
        element.disabled = true;
      });
    }
  }



  click(indexNo, recID){
    if(this.currentStep < indexNo) return;
    this.dpSv.GetStepInstance(recID).subscribe(res=>{
      if(res){
        this.tmpTeps = res;
      }
    })
  }

  continues(data){
    if(this.currentStep > this.listSteps.length) return;
    this.currentStep++;
    this.changeDetec.detectChanges();
  }

  setHTMLCssStages(oldStage, newStage){

  }
}
