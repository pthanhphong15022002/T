import { AD_User } from './../../models/AD_User.models';
import { Component, OnInit, Optional, ChangeDetectorRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { DialogData, DialogRef, CallFuncService, AuthStore, ImageViewerComponent, CodxService, ViewsComponent, SidebarModel } from 'codx-core';
import { PopRolesComponent } from '../pop-roles/pop-roles.component';
import { throws } from 'assert';
import { tmpformChooseRole } from '../../models/tmpformChooseRole.models';

@Component({
  selector: 'lib-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  @ViewChild("imageUpload", { static: false }) imageUpload?: ImageViewerComponent;
  @Output() loadData = new EventEmitter();
  @ViewChild('view') codxView!: any;
  @ViewChild('view') view!: ViewsComponent;

  title = 'Thêm người dùng';
  dialog!: DialogRef;
  dialogRole: DialogRef
  data: any;
  readOnly = false;
  isAddMode = true;
  user: any;
  data1: any;
  adUser = new AD_User();
  countListViewChooseRoleApp: Number = 0;
  countListViewChooseRoleService: Number = 0;
  viewChooseRole: tmpformChooseRole[] = [];
  constructor(
    private callfc: CallFuncService,
    private changDetec: ChangeDetectorRef,
    private auth: AuthStore,
    public codxService: CodxService,

    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.data = dialog.dataService!.dataSelected;
    this.adUser = this.data;
    this.dialog = dialog;
    this.data1 = dt?.data;
    this.user = auth.get();
  }

  ngOnInit(): void {
    if (this.data1 == 'edit')
      this.title = 'Cập nhật người dùng';
    this.isAddMode = false;
  }

  // openPopup(item: any) {
  //   this.dialogRole = this.callfc.openForm(PopRolesComponent, '', 1200, 700, '', item);
  //   this.dialogRole.closed.subscribe(e => {
  //     if (e?.event) {
  //       this.viewChooseRole = e?.event;
  //       this.countListViewChooseRoleApp = this.viewChooseRole.filter(obj => obj.isPortal == false).length;
  //       this.countListViewChooseRoleService = this.viewChooseRole.filter(obj => obj.isPortal == true).length;
  //       this.changDetec.detectChanges()

  //     }
  //   })
  // }

  openPopup(item: any) {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      this.dialogRole = this.callfc.openForm(PopRolesComponent, '', 1200, 700, '', item);
      this.dialogRole.closed.subscribe((x) => {
        if (x.event == null && this.view.dataService.hasSaved) {
          this.view.dataService
            .delete([this.view.dataService.dataSelected])
            .subscribe(x => {
              this.changDetec.detectChanges();
            });
        }
        if (x.event) {
          this.viewChooseRole = x?.event;
          this.countListViewChooseRoleApp = this.viewChooseRole.filter(obj => obj.isPortal == false).length;
          this.countListViewChooseRoleService = this.viewChooseRole.filter(obj => obj.isPortal == true).length;
          this.changDetec.detectChanges()
        }
      });
    });
  }
  // add() {
  //   this.view.dataService.addNew().subscribe((res: any) => {
  //     let option = new SidebarModel();
  //     option.DataService = this.view.dataService;
  //     option.FormModel = this.view.formModel;
  //     option.Width = '550px';
  //     this.dialog = this.callfunc.openSide(AddEditComponent, null, option);
  //     this.dialog.closed.subscribe((x) => {
  //       if (x.event == null && this.view.dataService.hasSaved)
  //         this.view.dataService
  //           .delete([this.view.dataService.dataSelected])
  //           .subscribe(x => {
  //             this.dt.detectChanges();
  //           });
  //     });
  //   });
  // }
  beforeSave(op: any) {
    var data = [];
    if (this.data1 == 'add') {
      this.isAddMode = true;
      op.method = 'AddUserAsync';
      data = [
        this.adUser,
        this.isAddMode,
      ];
    };
    if (this.data1 == 'edit') {
      this.isAddMode = false;
      op.method = 'UpdateUserAsync';
      data = [
        this.adUser,
        this.isAddMode,
      ];
    }
    op.data = data;
    return true;
  }

  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res.save) {
          this.imageUpload
            .updateFileDirectReload(res.save.userID)
            .subscribe((result) => {
              if (result) {
                this.loadData.emit();
              }
            });
          this.dialog.dataService.setDataSelected(res.save);
          this.dialog.dataService.afterSave.next(res);
          // this.dialog.closed.subscribe(e => {
          //   if (e?.event) {
          //     this.viewChooseRole = e?.event
          //   }
          // })
          this.changDetec.detectChanges();
        }
      });
    this.closePanel();
    this.dialog.close();
    console.log(this.viewChooseRole);
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave)
      .subscribe((res) => {
        if (res.update) {
          this.imageUpload
            .updateFileDirectReload(res.update.userID)
            .subscribe((result) => {
              if (result) {
                this.loadData.emit();
              }
            });
          this.dialog.dataService.setDataSelected(res.update);
          this.changDetec.detectChanges();
        }
      })
    this.closePanel();
  }

  onSave() {
    if (this.isAddMode)
      return this.onAdd();
    return this.onUpdate();
  }

  reloadAvatar(data: any): void {
    this.imageUpload?.reloadImageWhenUpload();
  }

  closePanel() {
    this.dialog.close()
    //this.viewBase.currentView.closeSidebarRight();
  }

  valueChange(data) {
    if (data.data) {
      this.adUser[data.field] = data.data;
    }
  }

  valueEmp(data) {
    if (data.data) {
      this.adUser.employeeID = data.data[0];
    }
  }

  valueUG(data) {
    if (data.data) {
      this.adUser.userGroup = data.data[0];
    }
  }
  valueBU(data) {
    if (data.data) {
      this.adUser[data.field] = data.data[0];
    }
  }


  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-playlist_add_check', text: 'Phân quyền', name: 'Roles' },
  ];

  setTitle(e: any) {
    this.title = 'Thêm ' + e;
    this.changDetec.detectChanges();
    console.log(e);
  }

  buttonClick(e: any) {
    console.log(e);
  }
}
