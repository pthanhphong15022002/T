import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'codx-tabs',
  templateUrl: './codx-tabs.component.html',
  styleUrls: ['./codx-tabs.component.css'],
})
export class CodxTabsComponent implements OnInit {
  @Input() active = 1;
  @Input() entityName!: string;
  @Input() objectID!: any;
  @Input() TabControl: any[];
  constructor(
    injector: Injector,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.active = this.TabControl.findIndex((x) => x.isAcive == true);
    this.changeDetectorRef.detectChanges();
  }
}
