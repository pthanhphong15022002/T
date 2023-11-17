import { NotificationsService } from 'codx-core';
import { CodxBpService } from './../codx-bp.service';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  DialogRef,
  FormModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { BP_ProcessPermissions } from '../models/BP_Processes.model';
import { PopupApprovalComponent } from './popup-approval/popup-approval.component';

@Component({
  selector: 'lib-aprpermission',
  templateUrl: './aprpermission.component.html',
  styleUrls: ['./aprpermission.component.css'],
})
export class AprpermissionComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  views: Array<ViewModel> = [];
  button?: ButtonModel[];
  moreFuncs: Array<ButtonModel> = [];
  dialog!: DialogRef;
  columnsGrid = [];
  lstPermissions = [];
  popoverList: any;
  formModelMF: FormModel;
  user: any;
  userID: any;
  gridViewSetup: any;
  vllStatus: any;
  popupOld: any;
  tmpPerm = new BP_ProcessPermissions();
  popoverDetail: any;
  @ViewChild('view') codxview!: any;
  @Input() dataObj?: any;
  @Input() showButtonAdd = true;
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('itemProcessName', { static: true })
  itemProcessName: TemplateRef<any>;
  @ViewChild('itemOwner', { static: true })
  itemOwner: TemplateRef<any>;
  @ViewChild('itemCreatedOn', { static: true })
  itemCreatedOn: TemplateRef<any>;
  @ViewChild('itemPermissions', { static: true })
  itemPermissions: TemplateRef<any>;
  @ViewChild('itemDescription', { static: true })
  itemDescription: TemplateRef<any>;
  @ViewChild('itemStatus', { static: true })
  itemStatus: TemplateRef<any>;
  constructor(
    inject: Injector,
    private bpSv: CodxBpService,
    private auth: AuthStore,
    private noti: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private activedRouter: ActivatedRoute
  ) {
    super(inject);
    this.user = this.auth.get();
    this.userID = this.user.userID;

  }

  onInit(): void {
    this.columnsGrid = [
      { headerTemplate: this.itemProcessName, width: 300 },
      { headerTemplate: this.itemOwner, width: 200 },
      { headerTemplate: this.itemCreatedOn, width: 150 },
      { headerTemplate: this.itemPermissions, width: 100 },
      { headerTemplate: this.itemDescription, width: 200 },
      { headerTemplate: this.itemStatus, width: 150 },
      { field: '', headerText: '', width: 100 },
      { field: '', headerText: '', width: 50 },
    ];
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          resources: this.columnsGrid,
          template: this.itemViewList,
        },
      },
    ];
    this.changeDetectorRef.detectChanges();
  }

  //#region html & xem them
  convertHtmlAgency(position: any) {
    var desc = '<div class="d-flex">';
    if (position)
      desc +=
        '<div class="d-flex align-items-center me-2"><span class=" text-dark-75 font-weight-bold icon-apartment1"></span><span class="">' +
        position +
        '</span></div>';

    return desc + '</div>';
  }

  toggleContent(p, data) {
    this.lstPermissions = [];
    var read = '';
    if (data != null) {
      this.popoverList?.close();
      if (data.read == true) {
        read = 'Xem';
        this.lstPermissions.push(read);
      }
      if (data.download) {
        read = 'Download';
        this.lstPermissions.push(read);
      }
      if (data.edit) {
        read = 'Chỉnh sửa';
        this.lstPermissions.push(read);
      }
      if (data.publish) {
        read = 'Phát hành';
        this.lstPermissions.push(read);
      }

      if (data.share) {
        read = 'Chia sẻ';
        this.lstPermissions.push(read);
      }
      if (data.assign) {
        read = 'Chia sẻ quyền';
        this.lstPermissions.push(read);
      }

      if (this.lstPermissions.length > 0) {
        p.open();
      }
    } else {
      p.close();
    }
  }
  //#endregion
  click(evt: ButtonModel) {
    // this.titleAction = evt.text;
    // switch (evt.id) {
    //   case 'btnAdd':
    //     this.add();
    //     break;
    // }
  }



  clickMF(e: any, data?: any) {
    var status = '';
    this.tmpPerm = data;
    switch(e.functionID){
      case 'BPT5101':
        status = '5';
        // this.tmpPerm.approvedBy = this.userID;
        // this.setApproveStatus(data.recIDProcess, this.tmpPerm, e.functionID, e.data.entityName);
        this.permission(data, status);
        break;
      case 'BPT5102':
        status = '4';
        // this.tmpPerm.approvedBy = this.userID;
        // this.setApproveStatus(data.recIDProcess, this.tmpPerm, e.functionID, e.data.entityName);
        this.permission(data, status);
        break;
    }
  }

  changeDataMF(e, data) {
    e.forEach((res) => {
      switch (res.functionID) {
        case 'SYS005':
        case 'SYS004':
        case 'SYS001':
        case 'SYS002':
        case 'SYS003':
        case 'SYS04':
          res.disabled = true;
          break;
      }
    });
  }

  permission(data, status) {
    let obj = {
      data: data,
      status: status,
      formModel: this.view.formModel,
    };
    this.dialog = this.callfc.openForm(
      PopupApprovalComponent,
      '',
      500,
      400,
      '',
      obj
    );
    this.dialog.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        this.view.dataService.clear();
        // this.view.dataService.update(e?.event).subscribe();
        e?.event.forEach(res => {
          if(res){
            this.view.dataService.update(res).subscribe();
            // this.tmpPerm = res;
          }
        });
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  setApproveStatus(recID: string, permission: BP_ProcessPermissions, funcID: string, entity: string){
    this.bpSv.setApproveStatus(recID, permission, funcID, entity).subscribe((res)=>{
      if(res){
        if(this.tmpPerm.approveStatus == '5')
          this.noti.notifyCode('WP005');
        else if(this.tmpPerm.approveStatus == '4')
          this.noti.notifyCode('WP007');
      }
    });
  }

  PopoverDetail(p: any, emp) {
    if(this.popupOld?.popoverClass !== p?.popoverClass ) {
      this.popupOld?.close();
    }

    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp;
      if (emp.memo != null || emp.processName != null) {
        p.open();
      }
    } else p.close();
    this.popupOld = p;
  }
  closePopover() {
    this.popupOld?.close();
  }
  setTextPopover(text){
    var divE = document.createElement('div');
    // divE.classList.add("text-gray-800")
    divE.innerHTML = text;

    return (divE.innerText);
  }
}
