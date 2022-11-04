import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AuthStore,
  CodxListviewComponent,
  CRUDService,
  DialogData,
  DialogRef,
  UIComponent,
} from 'codx-core';

@Component({
  selector: 'app-popup-upload',
  templateUrl: './popup-upload.component.html',
  styleUrls: ['./popup-upload.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupUploadComponent extends UIComponent implements OnInit {
  dialog: DialogRef;
  functionList: any;
  user: any;
  predicate = `ObjectType=@0 && IsDelete=@1 && CreatedBy=@2 && ReferType=@3`;
  dataValue: any;
  dtService: any;
  data: any;
  @ViewChild('listView') listView: CodxListviewComponent;
  @ViewChild('ATM_Image') ATM_Image: CodxListviewComponent;
  constructor(
    private injector: Injector,
    private dialogRef: DialogRef,
    private dt: DialogData,
    private auth: AuthStore,
    private change: ChangeDetectorRef,
  ) {
    super(injector);
    this.dialog = dialogRef;
    this.user = auth.get();
    this.data = dt.data;
    this.dataValue = `WP_Comments;false;${this.user?.userID};image`;
    var dataSv = new CRUDService(injector);
    dataSv.request.gridViewName = 'grvFileInfo';
    dataSv.request.entityName = 'DM_FileInfo';
    dataSv.request.formName = 'FileInfo';
    this.dtService = dataSv;
  }

  onInit(): void {}

  onSave() {}

  chooseImage(item) {
    var dataTemp = this.listView.dataService.data;
    var indexIC = dataTemp.findIndex((x) => x?.isChoose == true);
    if (indexIC >= 0) dataTemp[indexIC]['isChoose'] = false;
    if (dataTemp) {
      var index = dataTemp.findIndex((x) => x.recID == item.recID);
      dataTemp[index]['isChoose'] = !dataTemp[index]['isChoose'];
    }
    this.listView.dataService.data = dataTemp;
    this.change.detectChanges();
  }
}
