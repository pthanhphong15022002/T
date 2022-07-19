import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit, ChangeDetectorRef, Optional, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ViewModel } from 'codx-core';
@Component({
  selector: 'app-od-search',
  templateUrl: './searching.component.html',
  styleUrls: ['./searching.component.scss']
})

export class ODSearchComponent implements OnInit , OnChanges {
    views: Array<ViewModel> | any = [];
    @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  constructor(  
    private changeDetectRef: ChangeDetectorRef
  ) 
  { 

  }
  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
  }
  ngAfterViewInit(): void {
    this.views = [{
        id: '1',
        type: 'content',
        active: true,
        model: {
          panelLeftRef: this.panelLeftRef,
          widthAsideRight: '500px'
        }
      }];
      this.changeDetectRef.detectChanges();
  }
}
