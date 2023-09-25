import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  DialogRef,
  NotificationsService,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { ActivatedRoute } from '@angular/router';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { FormGroup } from '@angular/forms';
import { isObservable } from 'rxjs';
import { PopupEquitComponent } from '../employee-profile/popup-equit/popup-equit.component';

@Component({
  selector: 'lib-employee-quit',
  templateUrl: './employee-quit.component.html',
  styleUrls: ['./employee-quit.component.css'],
})
export class EmployeeQuitComponent extends UIComponent {
  console = console;
  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private notify: NotificationsService,
    private activatedRoute: ActivatedRoute,
    private codxShareService: CodxShareService,
    private codxODService: CodxOdService
  ) {
    super(inject);
  }

  views: Array<ViewModel> = [];
  grvSetup;
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
  };
  cmtStatus: string = '';
  formGroup: FormGroup;
  itemDetail;
  currentEmpObj;
  flagChangeMF: boolean = false;
  runModeCheck: boolean = false;

  actionSubmit = 'HRTPro08A03';

  //Detail
  @ViewChild('templateListDetail') templateListDetail?: TemplateRef<any>;
  @ViewChild('panelRightListDetail') panelRightListDetail?: TemplateRef<any>;

  GetGvSetup() {
    let funID = this.activatedRoute.snapshot.params['funcID'];
    this.cache.functionList(funID).subscribe((fuc) => {
      this.cache
        .gridViewSetup(fuc?.formName, fuc?.gridViewName)
        .subscribe((res) => {
          this.grvSetup = res;
        });
    });

    this.hrService.getFormModel(funID).then((formModel) => {
      if (formModel) {
        let tmp = formModel;
        this.hrService
          .getFormGroup(tmp.formName, tmp.gridViewName, tmp)
          .then((fg) => {
            if (fg) {
              this.formGroup = fg;
            }
          });
      }
    });
  }

  onInit() {
    this.GetGvSetup();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '2',
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.templateListDetail,
          panelRightRef: this.panelRightListDetail,
        },
      },
    ];

    this.detectorRef.detectChanges();
  }

  CloseStatus(dialog: DialogRef) {
    dialog.close();
  }

  ValueChangeComment(evt) {
    this.cmtStatus = evt.data;
  }

  clickMF(event, data): void {
    console.log(event);
    //this.itemDetail = data;
    switch (event.functionID) {
      case this.actionSubmit:
        //this.beforeRelease();
        break;
      //Delete
      case 'SYS02':
        this.view.dataService
          .delete([data], true, (option: RequestOption) =>
            this.beforeDelete(option, data.recID)
          )
          .subscribe();
        break;
      //Edit
      case 'SYS03':
        this.HandleEQuitInfo(event.text, 'edit', data);
        break;
      //Copy
      case 'SYS04':
        this.HandleEQuitInfo(event.text, 'copy', data);
        //this.copyValue(event.text, data, 'eContract');
        break;
      default: {
        this.codxShareService.defaultMoreFunc(
          event,
          data,
          null,
          this.view.formModel,
          this.view.dataService,
          this
        );
        break;
      }
    }
  }

  ChangeDataMF(event, data) {
    var funcList = this.codxODService.loadFunctionList(
      this.view.formModel.funcID
    );
    if (isObservable(funcList)) {
      funcList.subscribe((fc) => {
        this.changeDataMFBefore(event, data, fc);
      });
    } else this.changeDataMFBefore(event, data, funcList);
  }

  changeDataMFBefore(e: any, data: any, fc: any) {
    this.flagChangeMF = true;

    if (fc.runMode == '1') {
      this.runModeCheck = true;
      this.codxShareService.changeMFApproval(e, data?.unbounds);
    } else {
      this.hrService.handleShowHideMF(e, data, this.view.formModel);
    }
  }

  clickEvent(event) {
    this.clickMF(event?.event, event?.data);
  }

  //#region CRUD
  HandleEQuitInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfc.openSide(
      PopupEquitComponent,
      {
        formGroup: this.formGroup,
        actionType: actionType,
        dataObj: data,
        empObj: this.currentEmpObj,
        headerText: actionHeaderText,
        funcID: this.view.funcID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add') {
          this.view.dataService.add(res.event, 0).subscribe();
        } else if (actionType == 'copy') {
          this.view.dataService.add(res.event, 0).subscribe();
        } else if (actionType == 'edit') {
          this.view.dataService.update(res.event).subscribe();
        }
        this.detectorRef.detectChanges();
      }
    });
  }

  add(evt) {
    if (evt.id == 'btnAdd') {
      this.HandleEQuitInfo(evt.text, 'add', null);
    }
  }

  //Call api delete
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'EQuitBusiness';
    opt.assemblyName = 'HR';
    opt.service = 'HR';
    opt.data = data;
    return true;
  }

  //#endregion

  ChangeItemDetail(event) {
    if (event?.data?.emp) {
      this.currentEmpObj = event.data.emp;
    }
    this.itemDetail = event?.data;
  }
}
