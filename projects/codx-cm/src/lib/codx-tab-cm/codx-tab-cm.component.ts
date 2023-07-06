import { Component, Input, TemplateRef } from '@angular/core';

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

  ngAfterViewInit() {
  }

  private getChildTemplates(): TemplateRef<any>[] {
    const childTemplates = [];
    const childTemplateRefs = Object.keys(this).map(key => this[key]);
    for (const templateRef of childTemplateRefs) {
      if (templateRef instanceof TemplateRef) {
        childTemplates.push(templateRef);
      }
    }
    return childTemplates;
  }
}
