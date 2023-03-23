import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  UIComponent,
} from 'codx-core';
import { IJournal } from '../interfaces/IJournal.interface';

@Component({
  selector: 'lib-popup-add-journal',
  templateUrl: './popup-add-journal.component.html',
  styleUrls: ['./popup-add-journal.component.css'],
})
export class PopupAddJournalComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;

  journal: IJournal = {} as IJournal;
  formTitle: string;
  gvs: any;
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Common information' },
    {
      icon: 'icon-settings',
      text: 'Thiết lập',
      name: 'Settings',
    },
    {
      icon: 'icon-people',
      text: 'Phân quyền',
      name: 'Roles',
    },
  ];
  test: any = [
    {
      id: '2212010001',
      objectName: 'Người dùng',
      objectType: 'U',
      text: 'Nguyễn Thị Thanh Dung',
    },
  ];

  constructor(
    private injector: Injector,
    @Optional() public dialogRef: DialogRef,
    @Optional() private dialogData: DialogData
  ) {
    super(injector);
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache
      .gridViewSetup(
        this.dialogRef.formModel.formName,
        this.dialogRef.formModel.gridViewName
      )
      .subscribe((res) => {
        console.log(res);
        this.gvs = res;
      });
  }

  ngAfterViewInit(): void {
    this.formTitle = this.dialogData.data?.formTitle;
  }
  //#endregion

  //#region Event
  handleInputChange(e): void {
    console.log(e);

    const irFields = ['creater'];
    if (irFields.includes(e.field)) {
      this.journal[e.field] = e.data.map((d) => {
        const { dataSelected, ...rest } = d;
        return rest;
      });
    } else {
      this.journal[e.field] = e.data;
    }
  }

  handleClickSave(): void {
    console.log(this.journal);
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  getDescription(pascalCase: string): string {
    return this.gvs[pascalCase].description;
  }
  //#endregion
}
