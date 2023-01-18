import { CodxDpService } from './../../codx-dp.service';
import { Component, Input, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CRUDService } from 'codx-core';

@Component({
  selector: 'codx-instance-detail',
  templateUrl: './instance-detail.component.html',
  styleUrls: ['./instance-detail.component.css'],
})
export class InstanceDetailComponent implements OnInit {
  @Input() formModel: any;
  @Input() dataService: CRUDService;
  @Input() recID: any;
  @ViewChild('locationCBB') locationCBB: any;

  dataSelect: any;
  id: any;

  //progressbar
  labelStyle = { color: '#FFFFFF' };
  showProgressValue = true;
  animation = { enable: true, duration: 2000, delay: 0 };
  trackThickness: Number = 24;
  progressThickness: Number = 24;
  value: Number = 30;
  cornerRadius: Number = 30;
  idCbx = "stage";
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
    name: 'test1'
  },
  {
    stepNo: 2,
    name: 'test2'
  },
  {
    stepNo: 3,
    name: 'test3'
  },
  {
    stepNo: 4,
    name: 'test4'
  }]

  currentStep = 0;
  constructor(private dpSv: CodxDpService) {
  }

  ngOnInit(): void {

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
    }

  }


  getInstanceByRecID(recID) {
    this.dpSv.GetInstanceByRecID(recID).subscribe((res) => {
      if (res) {
        this.dataSelect = res;
      }
    });
  }

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



  click(i){
    const element = document.getElementById('step-click');

  }

  continues(data){
    if(this.currentStep > this.lstTest.length - 2) return;
  }

  setHTMLCssStages(oldStage, newStage){

  }
}
