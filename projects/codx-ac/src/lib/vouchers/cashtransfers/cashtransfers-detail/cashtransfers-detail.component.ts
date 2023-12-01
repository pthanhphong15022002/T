import {
  AfterViewChecked,
  Component,
  ElementRef,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  CRUDService,
  DataRequest,
  FormModel,
  UIComponent
} from 'codx-core';
import { TabModel } from 'projects/codx-ep/src/lib/models/tabControl.model';
import { CodxAcService } from '../../../codx-ac.service';
import { groupBy } from '../../../utils';

@Component({
  selector: 'lib-cashtransfers-detail',
  templateUrl: './cashtransfers-detail.component.html',
  styleUrls: ['./cashtransfers-detail.component.scss'],
})
export class CashtransfersDetailComponent
  extends UIComponent
  implements AfterViewChecked, OnChanges
{
  //#region Constructor
  @ViewChild('memo', { read: ElementRef }) memo: ElementRef<HTMLElement>;

  @Input() data: any;
  @Input() recID: string;
  @Input() formModel: FormModel; // required
  @Input() dataService: CRUDService; // optional

  viewData: any;
  overflowed: boolean = false;
  expanding: boolean = false;
  loading: boolean = false;

  lines: any[][] = [[]];

  functionName: string;
  tabControl: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];

  constructor(
    private injector: Injector,
    private acService: CodxAcService,
  ) {
    super(injector);
  }
  //#endregion

  //#region Init
  override onInit(): void {
    this.cache.functionList(this.formModel.funcID).subscribe((res) => {
      this.functionName = res.defaultName;
    });
  }

  ngAfterViewChecked(): void {
    const element: HTMLElement = this.memo?.nativeElement;
    this.overflowed = element?.scrollWidth > element?.offsetWidth;
  }

  ngOnChanges(changes: SimpleChanges): void {
    
  }
  //#endregion

  //#region Event
 
  //#endregion

  //#region Method
  
  //#endregion

  //#region Function
  //#endregion
}
