import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, Optional, ViewEncapsulation } from "@angular/core";
import { CallFuncService, ApiHttpService, CacheService, DialogRef, DialogData } from "codx-core";
import { CodxBpService } from "../../../../../../codx-bp/src/lib/codx-bp.service";

@Component({
  selector: 'codx-form-edit-connector',
  templateUrl: './form-edit-connector.component.html',
  styleUrls: ['./form-edit-connector.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FormEditConnectorComponent implements OnInit, AfterViewInit {
  title:string=' ';
  dialog:any;
  decoratorshape = [
    { shape: 'None', text: 'None' },
    { shape: 'Square', text: 'Square' },
    { shape: 'Circle', text: 'Circle' },
    { shape: 'Diamond', text: 'Diamond' },
    { shape: 'Arrow', text: 'Arrow' },
    { shape: 'OpenArrow', text: 'Open Arrow' },
    { shape: 'Fletch', text: 'Fletch' },
    { shape: 'OpenFetch', text: 'Open Fetch' },
    { shape: 'IndentedArrow', text: 'Indented Arrow' },
    { shape: 'OutdentedArrow', text: 'Outdented Arrow' },
    { shape: 'DoubleArrow', text: 'Double Arrow' }
];

constructor(
  private detectorRef: ChangeDetectorRef,
  private callfc: CallFuncService,
  private api: ApiHttpService,
  private cache: CacheService,
  private elementRef: ElementRef,
  @Optional() dialog: DialogRef,
  @Optional() dt: DialogData
) {
  this.dialog = dialog;
}
  ngAfterViewInit(): void {
    this.elementRef.nativeElement.querySelector('#appearance').onclick = this.documentClick.bind(this);
  }
  ngOnInit(): void {

  }

  documentClick(args: MouseEvent): void {
    debugger
    let target: HTMLElement = args.target as HTMLElement;
    // custom code start
    let selectedElement: HTMLCollection = document.getElementsByClassName('e-selected-style');
    if (selectedElement.length) {
        selectedElement[0].classList.remove('e-selected-style');
    }
    // custom code end
    if (target.className === 'image-pattern-style') {
      console.log(target.id);
        // custom code start
        target.classList.add('e-selected-style');
        // custom code end
    }
}

}
