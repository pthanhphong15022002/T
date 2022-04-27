import { ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import { Observable } from "rxjs";
import { ApiHttpService, AuthService, UserModel } from 'codx-core';
import { ProfileOverviewService } from "@modules/wp/personal/profile-overview/profile-overview.service";
import { ActivatedRoute, Router } from "@angular/router";
// import { ImageViewerComponent } from "@shared/components/image-viewer/image-viewer.component";

// import { FileUpload } from "@modules/AD/Users/users-edit/tmp/file.model";

declare var $: any;
@Component({
  selector: "app-profile-card",
  templateUrl: "./profile-card.component.html",
  styleUrls: ["./profile-card.component.scss"],
})
export class ProfileCardComponent {
  user$: Observable<UserModel>;
 // @ViewChild("imageAvatar") imageAvatar: ImageViewerComponent;
  dataEmployee: any = {
    dataRoot: {},
    employeeInfo: {},
  };
  hideEdit = false;
  employeeID: any = "";
  editMode: boolean = false;
  employeeMyTeam: any = null;
  constructor(
    private router: Router,
    private routeActive: ActivatedRoute,
    public userService: AuthService,
    private profileOverviewService: ProfileOverviewService,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef
  ) {
    //this.profileOverviewService.profileCardComponent = this;
    this.routeActive.queryParams.subscribe((params) => {
      if (params.id) {
        this.profileOverviewService
          .LoadData(params.id, "0")
          .subscribe((response: any) => {
            if (response) {
              this.dataEmployee.dataRoot = response.Employee;
              this.dataEmployee.employeeInfo = response.InfoPersonal;
              this.profileOverviewService.appendID(params.id);
              this.profileOverviewService.empInfo.next(response);
              this.dt.detectChanges();
              // setTimeout(() => {
              //   this.imageAvatar.getFormServer();
              // }, 100);
            }
          });
      }

      if (params.funcID == "POR004") this.hideEdit = true;
      else this.hideEdit = false;
    });
  }

  ngOnInit(): void {
    this.profileOverviewService.refreshActive.subscribe((o) => {
      if (!o) return;
      this.profileOverviewService.currentSection = o;
      console.log(o);
      this.dt.detectChanges();
    });
    this.profileOverviewService.loadID.subscribe((res: string) => {
      if (res) {
        this.employeeMyTeam = null;
        this.profileOverviewService
          .LoadData(res, "3")
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

  //avatar: FileUpload = null;
  // async handleFileInput(event) {
  //   this.avatar = null;
  //   const t = this;
  //   const files = event.target.files as FileList;
  //   let data: ArrayBuffer;

  //   if (files.length < 0) return;

  //   data = await files[0].arrayBuffer();

  //   var bytes = new Uint8Array(data);

  //   //this.imageAvatar.setImage(bytes);

  //   //this.avatar = new FileUpload();
  //   var item = this.arrayBufferToBase64(data);
  //   this.avatar.fileName = files[0].name;
  //   this.avatar.avatar = this.getAvatar(files[0].name);
  //   this.avatar.extension =
  //     files[0].name.substring(
  //       files[0].name.lastIndexOf("."),
  //       files[0].name.length
  //     ) || files[0].name;
  //   this.avatar.userName = this.dataEmployee.dataRoot.employeeID;
  //   this.avatar.uploadDate = this.getNow();
  //   this.avatar.type = files[0].type;
  //   this.avatar.size = files[0].size;
  //   this.avatar.fileName = files[0].name;
  //   this.avatar.data = item;
  //   this.avatar.funcId = "AD006";
  //   this.avatar.objectType = "HR_Employees";
  //   this.avatar.objectID = this.dataEmployee.dataRoot.employeeID;

  //   // this.imageAvatar.setDb(
  //   //   this.dataEmployee.dataRoot.employeeID,
  //   //   this.avatar.data
  //   // );
  //   this.api
  //     .execSv<any>(
  //       "DM",
  //       "DM",
  //       "FileBussiness",
  //       "UploadAvatarAsync",
  //       this.avatar
  //     )
  //     .subscribe((res) => {});
  // }

  getNow() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    var ret = dd + "/" + mm + "/" + yyyy;
    return ret;
  }

  getAvatar(filename: string) {
    var ext =
      filename.substring(filename.lastIndexOf("."), filename.length) ||
      filename;

    if (ext == null) {
      // alert(1);
      return "file.svg";
    } else {
      switch (ext) {
        case ".txt":
          return "txt.svg";
        case ".doc":
        case ".docx":
          return "doc.svg";
        case ".7z":
        case ".rar":
        case ".zip":
          return "zip.svg";
        case ".jpg":
          return "jpg.svg";
        case ".mp4":
          return "mp4.svg";
        case ".xls":
        case ".xlsx":
          return "xls.svg";
        case ".pdf":
          return "pdf.svg";
        case ".png":
          return "png.svg";
        case ".js":
          return "javascript.svg";
        default:
          return "file.svg";
      }
    }
  }

  arrayBufferToBase64(buffer) {
    var binary = "";
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  scrollTo(section) {
    var parentElement: any = document.querySelector("#erm_content");
    var childElement: any = document.querySelector("#" + section);
    $(parentElement).animate({
      scrollTop: childElement.offsetTop - parentElement.offsetTop,
    });

    this.profileOverviewService.currentSection = section;
  }

  CheckActive(group) {
    if (group === this.profileOverviewService.currentSection) return "active";
  }

  editInfoMode() {
    this.editMode = true;
    this.profileOverviewService.modeEdit.next(true);
  }
  viewInfoMode() {
    this.editMode = false;
    this.profileOverviewService.modeEdit.next(false);
  }
}

