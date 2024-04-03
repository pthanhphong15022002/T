import { Component, Injector, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { WSUIComponent } from '../default/wsui.component';
import { from, isObservable, of } from 'rxjs';
import { SpeedDialItemModel } from '@syncfusion/ej2-angular-buttons';
import axios from 'axios';
import { DialogModel, Util } from 'codx-core';
import { CvInformationComponent } from './AITool/cv-information/cv-information.component';

@Component({
  selector: 'lib-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent extends WSUIComponent{
  modules:any;
  funcs:any;
  funcIDF:any;
  constructor(inject: Injector) 
  {
    super(inject);
  }

  override onInit(): void {
    this.getModule();
  }

  getModule()
  {
    var modules = this.codxWsService.loadListFucByParentID("WS001") as any;
    if(isObservable(modules)) modules.subscribe((item:any)=>{
      if(item && item.length>0){
      this.funcs = item
      this.getDefaultFav();
    }})
    else {
      this.funcs = modules;
      this.getDefaultFav();
    }
  }

  formatModule(data:any)
  {
    var listChild = data.filter(x=>x.parentID == this.funcID);

    for(var i = 0 ; i < listChild.length ; i++)
    {
      var childs = data.filter(x=>x.parentID == listChild[i].functionID);
      if(childs && childs.length>0) listChild[i].childs = childs;
    }

    this.modules = listChild.filter(x=>x.childs.length>0);
  }

  selectedChange(data:any)
  {
    if(data?.functionID == "GPTTA") this.openPopupUploadFile();
    else
    {
      this.codxService.navigate("","/"+data.url)
      this.codxWsService.functionID = data.functionID;
      this.codxWsService.listBreadCumb.push(data);
    }
  }

  itemClick(funcId: string, data?: any, type?: string) 
  {
    this.funcID = funcId;
    if(type == "fv")
    {
      this.codxWsService.wsActive.activeFav = data.recID;
      this.codxWsService.wsActive.activeMenu.fav = data.recID;
      this.codxWsService.wsActive.activeMenu.favType = data.isSystem ? 'Fav' : 'FormFav';
      this.codxService.activeMenu.fav == data.recID;
      this.codxService.activeViews.dataService.predicates = '';
      this.codxService.activeViews.dataService.dataValues = '';
      this.codxService.activeViews?.dataService.changeFavorite(data);
    }
    else
    {
      this.resetActiveMenu();
      this.getDefaultFav();
    }
    this.codxService.navigate(this.funcID)
  }

  resetActiveMenu() {
    if(!this.codxWsService.wsActive) this.codxWsService.wsActive = {activeMenu:{}};
    this.codxWsService.wsActive.activeMenu.id = '';
    this.codxWsService.wsActive.activeMenu.func0 = '';
    this.codxWsService.wsActive.activeMenu.func1 = '';
    this.codxWsService.wsActive.activeMenu.fav = '';
    this.codxWsService.wsActive.activeMenu.favType = '';
    this.codxWsService.wsActive.activeMenu.reportID = '';
  }

  getDefaultFav()
  {
    if(this.funcs)
    {
      for(var i = 0 ; i < this.funcs.length ; i++)
      {
        if(this.funcs[i].childs && this.funcs[i].childs.length > 0)
        {
          for(var y = 0 ; y< this.funcs[i].childs.length ; y++)
          {
            if(this.funcs[i].childs[y].childs && this.funcs[i].childs[y].childs.length>0)
            {
              if(!this.funcIDF) this.funcIDF = this.funcs[i].childs[y].childs[0].functionID;

              var df = this.funcs[i].childs[y].childs.filter(x=>x.functionID == this.funcID);
              if(df[0]) {
                this.getFavs(df[0]);
                break;
              }
            }
          }
        }
      }
      if(this.funcID == "WS001") this.codxService.navigate("WTMT0201");
    }
  }

  getFavs(func:any)
  {
    this.codxService
    .getFavs(func, "1", null, false)
    .subscribe((x) => {
      this.codxWsService.wsActive = {
        activeMenu : {
          fav : x.defaultId,
          favType: x.defaultType
        },
        activeFav: this.codxService.activeMenu.fav
      }

      if (func.favs && func.favs.length > 0) {
        var favIDs: any[] = [];
        func.favs.forEach((x: any) => {
          favIDs.push(x.recID);
        });
        this.codxService
        .getCountFavs(func.functionID, func.entityName, favIDs)
        .subscribe((d) => {
          if (!d) return;
          func.favs.forEach((x: any) => {
            x.count = 0;
            if (d[x.recID]) x.count = d[x.recID];
          });
        });
      }
    })
  }
  //#region  Unitet chat GPT
  @ViewChild("popupCV") popupCV:TemplateRef<any>;
  @ViewChild("popupEmail") popupEmail:TemplateRef<any>;
  @ViewChild("popupSocial") popupSocial:TemplateRef<any>;
  @ViewChild("popupOKR") popupOKR:TemplateRef<any>;
  @ViewChild("popupUploads") popupUploads:TemplateRef<any>;

  cvModel:CVModel = new CVModel();
  emailModel:EmailModel = new EmailModel();
  socialMediaModel:SocialMediaModel = new SocialMediaModel();
  okrModel:OKRModel = new OKRModel();
  
  jsonExports:any[] = [];
  request:string = "";
  loading = false;
  speedDialItems: SpeedDialItemModel[] = [
    {
      id:'0',
      text:'Social Media',
      iconCss:'icon-mode_comment'
    },
    {
      id:'1',
      text:'Mail',
      iconCss:'icon-email'
    },
    {
      id:'2',
      text:'UPload',
      iconCss:'icon-upload'
    },
    {
      id:'3',
      text:'Key Result',
      iconCss:'icon-lightbulb'
    },
    {
      id:'4',
      text:'UPload Files',
      iconCss:'icon-upload'
    }
  ];

  // click open popupp
  disabledSpeedDial:boolean = false;
  openPoup(item:any){
    //this.disabledSpeedDial = true;
    switch(item.id){
      case"0":
        this.openPoupupSocial();
        break;
      case"1":
        this.openPopupMail();
        break;
      case"2":
        this.openPopupCV();
        break;
      case"3":
        this.openPoupupOKR();
        break;
      case"4":
        this.openPopupUploadFile();
        break;
    }
  }
  // CV
  openPopupCV(){
    if(this.popupCV)
    {
      let option = new DialogModel();
      this.cvModel = new CVModel();
      this.callFunc.openForm(this.popupCV,"",800,900,"",null,"",option);
    }
  }

  
  // Mail
  openPopupMail(){
    if(this.popupEmail)
    {
      let option = new DialogModel();
      this.emailModel = new EmailModel();
      this.callFunc.openForm(this.popupEmail,"",900,700,"",null,"",option);
    }
  }
  // Social media
  openPoupupSocial(){
    if(this.popupSocial)
    {
      let option = new DialogModel();
      this.socialMediaModel = new SocialMediaModel();
      this.callFunc.openForm(this.popupSocial,"",900,700,"",null,"",option);
    }
  }
  // OKR Result
  openPoupupOKR(){
    if(this.popupOKR)
    {
      let option = new DialogModel();
      this.okrModel = new OKRModel();
      this.callFunc.openForm(this.popupOKR,"",900,700,"",null,"",option);
    }
  }

  //open popup upload files
  openPopupUploadFile(){
    let option = new DialogModel();
    option.IsFull = true;
    this.callFunc.openForm(CvInformationComponent,"",1000,900,"",null,"",option).closed.subscribe((res) => {
      this.disabledSpeedDial = false; 
      this.changeDetectorRef.detectChanges()
    });
  }

  // value change
  valueChange(evt:any,type:string)
  {
    if(type === "email")
      this.emailModel[evt.field] = evt.data;
    else if(type === "social media")
      this.socialMediaModel[evt.field] = evt.data;
    else if(type === "okr")
      this.okrModel[evt.field] = evt.data;
    else if(type==="request")
      this.request = evt.data;
  }

  // select file cv
  onSelectFileCV(e:any){
    // api đọc CV
    let file = e.target.files[0];
    let url = "https://apibot.trogiupluat.vn/api/v2.0/NLP/get-information-extract";
    var form = new FormData();
    this.loading = true;
    form.append("prompt", `
    Hãy trích xuất thông tin CV ứng viên tới định dạng JSON như sau:
    {
      "name": "",
      "birthDay":"",
      "image":"",
      "phone": "",
      "email":"",
      "address":"",
      "educations": [
      {
        "date":"",
        "university":"",
        "gpa":"",
        "degree":""
      }
    ],
    "skills":[],
    "experience":[
      {
        "date":"",
        "company":"",
        "roles":"",
        "description":""
      }
    ],
    "projects":[
      {
        "date":"",
        "name":"",
        "description":"",
        "roles":"",
        "teamsize":""
      }
    ]
  }
    Lưu ý: Nếu thông tin không tìm thấy hãy để trống.
    `);
    form.append("sourceFile", file); 
    axios.post(url, form).then((res:any) => {
      this.cvModel = JSON.parse(res.data.Data.JsonResult); 
      this.changeDetectorRef.detectChanges();
      // api đánh giá
      let url2 = "https://apibot.trogiupluat.vn/api/v2.0/NLP/get-gpt-action";
      axios.post(
        url2,
        {
          'Prompt': "Một ứng viên có CV như bên dưới, hãy xem xét có nên tuyển dụng ứng viên này và nêu lý do nếu từ chối?",
          'GptApiKey': '',
          'SourceText': JSON.stringify(res.data.Data.SourceText)
        }).then((res2:any) => {
          this.loading = false;
          this.cvModel.result = res2.data.Data.replace(/\n/g,"<br/>");
          this.changeDetectorRef.detectChanges();
        }).catch((err) => {
          this.loading = false;
        });
    }).catch((err) => {
      this.loading = false;
    });
  }

  
  //
  onSelectFiles(e:any){
    let files = Array.from(e.target.files);
    if(files.length > 0)
    {
      files.forEach((f) => {
        this.exportFileCV(f).subscribe((res:any) => {
          if(res)
          {
            res.id = Util.uid();
            this.jsonExports.push(res);
            this.changeDetectorRef.detectChanges();
          }
        });
      });
    }
        
  }
  
  //
  exportFileCV(file){
    if(file)
    {
      let url = "https://apibot.trogiupluat.vn/api/v2.0/NLP/get-information-extract";
      var form = new FormData();
      form.append("prompt", `
      Hãy trích xuất thông tin CV ứng viên tới định dạng JSON như sau:
      {
        "name": "",
        "phone": "",
        "email":"",
        "skills":[]
      }
      Lưu ý: Nếu thông tin không tìm thấy hãy để trống.`);
      form.append("sourceFile", file); 
      return from(axios.post(url, form)
      .then((res:any) => {
        return JSON.parse(res.data.Data.JsonResult); 
      })
      .catch(() => {return null}));
    }
    else
    {
      return of(null);
    }
  }

  // api đánh giá
  evaluateCV(json:any){
    let url2 = "https://apibot.trogiupluat.vn/api/v2.0/NLP/get-gpt-action";
    return from(axios.post(
      url2,
      {
        'Prompt': `Hãy đánh giá CV dạng JSON bên dưới có đáp ứng được các mục yêu cầu tuyển dụng như sau:
         ${this.request}.
         Nhận xét ưu điểm và khuyết điểm để đưa ra kết luận tuyển dụng hay không.
         Và trích xuất thành dạng JSON như sau 
         {
            "evaluate":"",
            "accept":true or false
         }`,
        'SourceText': JSON.stringify(json)
      }).then((res2:any) =>
      {
        return JSON.parse(res2.data.Data);
      }).catch(() => {return null}));
  }
  //
  cellExvalueate = false;
  searchCV(){
    this.cellExvalueate = true;
    if(this.jsonExports.length > 0 && this.request)
    {
      this.jsonExports.forEach((e:any) => {
        e.result = null;
        this.evaluateCV(e).subscribe((res:any) => {
          if(res.accept)
            e.result = res;
          else
            this.jsonExports = [...this.jsonExports.filter(x => x.id != e.id)];
          this.changeDetectorRef.detectChanges();
        });
      }); 
    }
  }

  

  // create mail
  createdMail(){
    if(!this.emailModel.subject){
      this.notifySvr.notify("Vui lòng nhập chủ đề","2");
      return;
    }
    if(!this.emailModel.contents){
      this.notifySvr.notify("Vui lòng nhập nội dung gợi ý","2");
      return;
    }
    this.loading = true;
    let data = {
      subject:this.emailModel.subject,
      contents:this.emailModel.contents,
      contact:
      {
        name:this.userInfo.userName,
        phone:this.userInfo.phone,
        email:this.userInfo.email,
        company:'CPTH Lạc Việt',
        website:'https://www.codx.vn/'
      }
    };
    let prompt = `Mẫu promt (tiếng Việt): Hãy viết email về chủ đề ${this.emailModel.subject}, nội dung  ${this.emailModel.contents}. Tên của tôi là ${this.userInfo.userName}, công ty tôi là CPTH Lạc Việt.`;
    this.fetch(data,prompt).then((res:any) => {
        this.loading = false;
        this.emailModel.result = res.data.Data.replace(/\n/g,"<br/>");
        this.changeDetectorRef.detectChanges();
    }).catch((err)=> {
      this.loading = false;
    });
  }

  // create social media
  createdSocialMedia(){
    
    if(!this.socialMediaModel.type){
      this.notifySvr.notify("Vui lòng nhập nội dung truyền thông","2");
      return;
    }

    if(!this.socialMediaModel.contents){
      this.notifySvr.notify("Vui lòng nhập nội dung gợi ý","2");
      return;
    }
    this.loading = true;
    
    let data = {
      socialMedia:this.socialMediaModel.type,
      contents:this.socialMediaModel.contents
    };

    let prompt = `Mẫu promt (tiếng Việt): Hãy viết nội dung cho ${this.socialMediaModel.type} về nội dung ${this.socialMediaModel.contents}.`;
    this.fetch(data,prompt).then((res:any) => {
        this.loading = false;
        this.socialMediaModel.result = res.data.Data.replace(/\n/g,"<br/>");
        this.changeDetectorRef.detectChanges();
    }).catch((err)=> {
      console.log(err);
      this.loading = false;
    });
  }

  // create OKR
  createdOKR(){
    if(!this.okrModel.target){
      this.notifySvr.notify("Vui lòng nhập key result","2");
      return;
    }
    if(this.okrModel.num_KPI <= 0){
      this.notifySvr.notify("Vui lòng nhập key number","2");
      return;
    }
    this.loading = true;
   
    let data = {
      target:this.okrModel.target,
      num_KPI:this.okrModel.num_KPI
    };

    let prompt = `Mẫu promt (tiếng Việt): Bạn hành động như một chuyên gia về OKR, hãy gợi ý cho tôi ${this.okrModel.num_KPI} Key Result cho mục tiêu ${this.okrModel.target}.`;
    this.fetch(data,prompt).then((res:any) => 
      {
        this.loading = false;
        this.okrModel.result = res.data.Data.replace(/\n/g,"<br/>");
        this.changeDetectorRef.detectChanges();
      }).catch((err)=> {
        this.loading = false;
    });
  }

  fetch(data:any,prompt:any)
  {
    let url = "https://api.trogiupluat.vn/api/OpenAI/v1/get-gpt-action";
    return axios.post(
      url,
      {
        'Prompt': prompt,
        'openAIKey': '',
        'SourceText': JSON.stringify(data).replace(/\"/g,"'")
      },
      {
        headers: 
        {
          'api_key': "OTcNmUMmYxNDQzNJmMWQMDgxMTAMWJiMDYYTUZjANWUxZTgwOTBiNzQyNGYNMOGIOTENGFhNg",
          'Content-Type': 'multipart/form-data'
        }
      })
  }
  //#endregion
}


//#region model
class CVModel{
  name:string;
  phone:string;
  email:string;
  birthDay:string;
  address:string;
  educations:any[];
  skills:string;
  experience:any[];
  projects:any[];
  result:string;

  constructor() {
    this.name = "";
    this.phone = "";
    this.email = "";
    this.birthDay = "";
    this.address = "";
    this.educations = [];
    this.skills = "";
    this.experience = [];
    this.projects = [];
    this.result = "";
  }
}
export class EmailModel{
  // language:any;
  subject:string;
  contents:string;
  result:any;

  constructor() {
    // this.language = [
    //   {
    //     value:"vn",
    //     text:"Việt Nam"
    //   },
    //   {
    //     value:"en",
    //     text:"Tiếng anh"
    //   }
    // ];
    this.subject = "";
    this.contents = "";
    this.result = null;
  }
}
export class SocialMediaModel{
  // language:any;
  socialMedias:any[];
  type:string;
  contents:string;
  result:any;

  constructor() {
    // this.language = [
    //   {
    //     value:"vn",
    //     text:"Việt Nam"
    //   },
    //   {
    //     value:"en",
    //     text:"Tiếng anh"
    //   }
    // ];
    this.socialMedias = [
      {
        id:"0",
        text:"Facebook"
      },
      {
        id:"1",
        text:"Instagram"
      },
      {
        id:"2",
        text:"Linkedin"
      },
      {
        id:"3",
        text:"Tiktok"
      },
      {
        id:"4",
        text:"Twitter"
      }
    ];
    this.type = "Facebook";
    this.contents = "";
    this.result = null;
  }
}
export class OKRModel
{
  target:string;
  num_KPI:number;
  result:string;
  constructor() {
    this.target = "";
    this.num_KPI = 0;
    this.result = "";
  }
}
//#endregion
