import { Component, Input, SimpleChanges, TemplateRef, OnInit } from '@angular/core';

@Component({
  selector: 'codx-tab-cm',
  templateUrl: './codx-tab-cm.component.html',
  styleUrls: ['./codx-tab-cm.component.css']
})
export class CodxTabCmComponent {

  @Input() tabInfo: { icon: string, text: string, name: string }[] = [];
  @Input() templates: TemplateRef<any>[] = [];
  @Input() formModel: any;
  constructor(
  ){

  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.

  }

  ngOnInit(){
    console.log('tab: ', this.tabInfo);
    console.log('templates: ', this.templates);
    setTimeout(() => {
      this.tabInfo = JSON.parse(JSON.stringify(this.tabInfo));
      this.templates = this.templates;
    }, 0);
  }

  ngAfterViewInit() {
  }

}
