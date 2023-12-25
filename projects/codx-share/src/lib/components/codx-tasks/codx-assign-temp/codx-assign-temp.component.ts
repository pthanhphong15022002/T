import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogModel,
  FormModel,
} from 'codx-core';

@Component({
  selector: 'codx-assign-temp',
  templateUrl: './codx-assign-temp.component.html',
  styleUrls: ['./codx-assign-temp.component.css'],
})
export class CodxAssignTempComponent implements OnInit {
  @Input() formModel: FormModel;
  @Input() objectID = '';
  @Input() openViewPopup = true;
  @ViewChild('tmpListResource') tmpListResource: TemplateRef<any>;
  @Input() zIndex: number = 0;
  @Input() assignTo = ''; //assignTo của task
  @Input() isUsedAssignTo = false; // nếu có sử dụng thì không cần gọi api để count
  countResource = 0;
  listTaskResousce = [];
  listTaskResousceSearch = [];
  listRoles = [];
  vllRole = 'TM002';
  vllStatusAssign = 'TM007';
  vllStatus = 'TM004';
  searchField = '';

  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private callFC: CallFuncService
  ) {
    this.cache.valueList(this.vllRole).subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
  }

  ngOnInit(): void {
    if (this.isUsedAssignTo) {
      this.countResource = this.assignTo ? this.assignTo.split(';')?.length : 0;
    } else this.getDatas();
  }
  getDatas() {
    this.listTaskResousceSearch = [];
    this.countResource = 0;
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskResourcesBusiness',
        'GetListTaskResourcesByTaskIDAsync',
        this.objectID
      )
      .subscribe((res) => {
        if (res) {
          this.listTaskResousce = res;
          this.listTaskResousceSearch = res;
          this.countResource = res.length;
        }
      });
  }

  openPopup() {
    if (this.isUsedAssignTo) {
      this.listTaskResousceSearch = [];
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskResourcesBusiness',
          'GetListTaskResourcesByTaskIDAsync',
          this.objectID
        )
        .subscribe((res) => {
          if (res) {
            this.listTaskResousce = res;
            this.listTaskResousceSearch = res;
            let option = new DialogModel();
            if (this.zIndex > 0) option.zIndex = this.zIndex;
            this.callFC.openForm(
              this.tmpListResource,
              '',
              400,
              500,
              '',
              null,
              '',
              option
            );
          }
        });
    } else {
      //cux
      let option = new DialogModel();
      if (this.zIndex > 0) option.zIndex = this.zIndex;
      this.callFC.openForm(
        this.tmpListResource,
        '',
        400,
        500,
        '',
        null,
        '',
        option
      );
    }
  }

  searchName(e) {
    var listTaskResousceSearch = [];
    this.searchField = e;
    if (this.searchField.trim() == '') {
      this.listTaskResousceSearch = this.listTaskResousce;
      return;
    }
    this.listTaskResousce.forEach((res) => {
      var name = res.resourceName;
      if (name.toLowerCase().includes(this.searchField.toLowerCase())) {
        listTaskResousceSearch.push(res);
      }
    });
    this.listTaskResousceSearch = listTaskResousceSearch;
  }
}
