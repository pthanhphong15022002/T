import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, AuthStore, ImageViewerComponent } from 'codx-core';
import { CodxMwpService } from '../../codx-mwp.service';
import { EmployeeInfomationComponent } from '../employee-infomation.component';

@Component({
  selector: 'lib-info-left',
  templateUrl: './info-left.component.html',
  styleUrls: ['./info-left.component.css']
})
export class InfoLeftComponent implements OnInit {
  @Input() formModel: any;
  user: any = null;
  @ViewChild('imageAvatar') imageAvatar: ImageViewerComponent;
  dataEmployee: any = {
    dataRoot: {},
    employeeInfo: {},
  };
  hideEdit = false;
  employeeID: any = '';
  funcID: any = '';
  editMode: boolean = false;
  employeeMyTeam: any = null;
  constructor(
    private routeActive: ActivatedRoute,
    public userService: AuthService,
    private codxMwpService: CodxMwpService,
    private dt: ChangeDetectorRef,
    private auth: AuthStore
  ) {
    this.user = this.auth.get();
    this.codxMwpService.infoLeftComponent = this;
    this.routeActive.queryParams.subscribe((params) => {
      if (params.employeeID || this.user.userID) {
        this.codxMwpService
          .LoadData(params.employeeID, this.user.userID, '0')
          .subscribe((response: any) => {
            if (response) {
              this.dataEmployee.dataRoot = response.Employee;
              this.dataEmployee.employeeInfo = response.InfoPersonal;
              this.codxMwpService.appendID(params.employeeID);
              this.codxMwpService.empInfo.next(response);
              this.dt.detectChanges();
              setTimeout(() => {
                this.imageAvatar.getFormServer();
              }, 100);
            }
          });
      }

      
    });

    this.routeActive.params.subscribe((params) => {
      if (params.funcID == 'MWP002') this.hideEdit = true;
      else this.hideEdit = false;
    });
  }

  ngOnInit(): void {
    console.log(this.formModel)
    this.codxMwpService.refreshActive.subscribe((o) => {
      if (!o) return;
      this.codxMwpService.currentSection = o;
      console.log(o);
      this.dt.detectChanges();
    });
    this.codxMwpService.loadID.subscribe((res: string) => {
      if (res) {
        this.employeeMyTeam = null;
        this.codxMwpService
          .LoadData(res, '3')
          .subscribe((response: any) => {
            if (response) {
              this.employeeMyTeam = [];
              if (response.MyTeam)
                // Team
                this.employeeMyTeam = response.MyTeam;
            }
          });
      }
    });
  }
  getNow() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var ret = dd + '/' + mm + '/' + yyyy;
    return ret;
  }

  getAvatar(filename: string) {
    var ext =
      filename.substring(filename.lastIndexOf('.'), filename.length) ||
      filename;

    if (ext == null) {
      // alert(1);
      return 'file.svg';
    } else {
      switch (ext) {
        case '.txt':
          return 'txt.svg';
        case '.doc':
        case '.docx':
          return 'doc.svg';
        case '.7z':
        case '.rar':
        case '.zip':
          return 'zip.svg';
        case '.jpg':
          return 'jpg.svg';
        case '.mp4':
          return 'mp4.svg';
        case '.xls':
        case '.xlsx':
          return 'xls.svg';
        case '.pdf':
          return 'pdf.svg';
        case '.png':
          return 'png.svg';
        case '.js':
          return 'javascript.svg';
        default:
          return 'file.svg';
      }
    }
  }

  arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  scrollTo(section) {
    this.codxMwpService.currentSection = section;
  }

  editInfoMode() {
    this.editMode = true;
    this.codxMwpService.modeEdit.next(true);
  }
  viewInfoMode() {
    this.editMode = false;
    this.codxMwpService.modeEdit.next(false);
  }
}
