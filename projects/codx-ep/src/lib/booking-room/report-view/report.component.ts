import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent implements OnInit, AfterViewInit {
  @ViewChild('paramEle') paramEle: ElementRef<any>;
  @ViewChild('param1') param1: ElementRef<any>;
  @ViewChild('param2') param2: ElementRef<any>;
  @ViewChild('param3') param3: ElementRef<any>;
  @ViewChild('reportEle') reportEle: ElementRef<any>;
  isCollapsed = true;
  isCollapsed2 = true;
  isCollapsed3 = true;
  parameters: any = [
    {
      type: 'DateTime',
      field: 'DueDate',
    },
  ];
  isInprocess: boolean = false;
  isAssigned: boolean = false;
  isDone: boolean = false;
  textValue: any = '';
  constructor() {}

  ngAfterViewInit(): void {
    if (this.reportEle) {
      let height = this.reportEle.nativeElement.offsetHeight;
      if (this.paramEle) {
        this.paramEle.nativeElement.style.height = height + 'px';
      }
    }
  }
  ngOnInit(): void {}

  changeValueText(evt: any) {
    console.log(evt);
  }
  changeValueDate(evt: any) {
    console.log(evt);
  }
  changeValueCbb(evt: any) {
    console.log(evt);
  }
  dateChange(evt: any) {
    console.log(evt);
  }
  valueChange(evt: any) {
    if (evt.field == 'Done') {
      this.isDone = evt.value;
    }
    if (evt.field == 'Assigned') {
      this.isAssigned = evt.value;
    }
    if (evt.field == 'Inprocess') {
      this.isInprocess = evt.value;
    }
  }
  collapseChange(evt: any, eleID?: string) {
    console.log(evt);

    switch (eleID) {
      case 'param1':
        this.isCollapsed = !this.isCollapsed;
        if (!this.isCollapsed) {
          this.param1.nativeElement.classList.add('border-bottom-primary');
        } else {
          if (
            this.param1.nativeElement.classList.contains(
              'border-bottom-primary'
            )
          ) {
            this.param1.nativeElement.classList.remove('border-bottom-primary');
          }
        }
        break;
      case 'param2':
        this.isCollapsed2 = !this.isCollapsed2;
        if (!this.isCollapsed2) {
          this.param2.nativeElement.classList.add('border-bottom-primary');
        } else {
          if (
            this.param2.nativeElement.classList.contains(
              'border-bottom-primary'
            )
          ) {
            this.param2.nativeElement.classList.remove('border-bottom-primary');
          }
        }
        break;
        case 'param3':
        this.isCollapsed3 = !this.isCollapsed3;
        if (!this.isCollapsed2) {
          this.param3.nativeElement.classList.add('border-bottom-primary');
        } else {
          if (
            this.param3.nativeElement.classList.contains(
              'border-bottom-primary'
            )
          ) {
            this.param3.nativeElement.classList.remove('border-bottom-primary');
          }
        }
        break;
    }
  }
}
