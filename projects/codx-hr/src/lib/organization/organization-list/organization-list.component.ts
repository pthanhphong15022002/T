import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CallFuncService,
  CodxFormDynamicComponent,
  CodxListviewComponent,
  CRUDService,
  FormModel,
  RequestOption,
  SidebarModel,
  ViewsComponent,
} from 'codx-core';
import { PopupAddOrganizationComponent } from '../popup-add-organization/popup-add-organization.component';

@Component({
  selector: 'lib-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.css'],
})
export class OrganizationListComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() orgUnitID: string = '';
  @Input() formModel: FormModel = null;
  @Input() view: ViewsComponent = null;
  @Input() dataService: CRUDService = null;
  isloaded = false;
  constructor(
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callFC: CallFuncService
  ) {}

  ngOnInit(): void {
    this.dataService.currentComponent =
      this.view?.dataService?.currentComponent;
  }
  ngAfterViewInit(): void {}
  // change orgUnitID
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.orgUnitID.currentValue != changes.orgUnitID.previousValue) {
      this.orgUnitID = changes.orgUnitID.currentValue;
      if (this.dataService) {
        this.dataService.setPredicates([], [this.orgUnitID]).subscribe();
      }
      this.dt.detectChanges();
    }
  }
  //loadEmployList
  loadEmployList(h, orgUnitID: string, abc) {}
  // click moreFC
  clickMF(event: any, data: any) {
    if (event) {
      switch (event.functionID) {
        case 'SYS02': //delete
          this.deleteData(data);
          break;
        case 'SYS03': // edit
          this.editData(data, event);
          break;
        case 'SYS04': // copy
          this.copyData(data, event);
          break;
        default:
          break;
      }
    }
  }

  // delete data
  deleteData(data: any) {
    if (data) {
      (this.dataService as CRUDService).delete([data], true).subscribe();
    }
  }
  // before delete
  beforeDelete(opt: RequestOption) {
    opt.service = 'HR';
    opt.assemblyName = 'ERM.Business.HR';
    opt.className = 'OrganizationUnitsBusiness';
    opt.methodName = 'DeleteOrgUnitAsync';
    opt.data = [this.dataService.dataSelected.orgUnitID];
    return true;
  }
  // edit data
  editData(data: any, event: any) {
    if (this.dataService) {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.dataService;
      option.FormModel = this.formModel;
      let object = {
        data: data,
        action: event,
        funcID: this.formModel.funcID,
        isModeAdd: false,
      };
      let popup = this.callFC.openSide(
        PopupAddOrganizationComponent,
        object,
        option,
        this.formModel.funcID
      );
      popup.closed.subscribe((res: any) => {
        if (res.event) {
          let org = res.event[0];
          let tmpOrg = res.event[1];
          this.dataService.update(tmpOrg).subscribe();
          this.view.dataService.add(org).subscribe();
        }
      });
    }
  }
  // copy data
  copyData(data: any, text: string) {
    if (data && text) {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.dataService;
      option.FormModel = this.formModel;
      this.dataService.dataSelected = JSON.parse(JSON.stringify(data));
      (this.dataService as CRUDService).copy(data).subscribe((result: any) => {
        if (result) {
          let data = {
            dataService: this.dataService,
            formModel: this.formModel,
            data: result,
            function: this.formModel.funcID,
            isAddMode: true,
            titleMore: text,
          };
          let popup = this.callFC.openSide(
            CodxFormDynamicComponent,
            data,
            option,
            this.formModel.funcID
          );
        }
      });
    }
  }
}
