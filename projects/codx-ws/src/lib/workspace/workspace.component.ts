import { Component, Injector, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { WSUIComponent } from '../default/wsui.component';
import { isObservable } from 'rxjs';
import { SpeedDialItemModel } from '@syncfusion/ej2-angular-buttons';
import axios from 'axios';
import { DialogModel } from 'codx-core';

@Component({
  selector: 'lib-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent extends WSUIComponent{
  modules:any;
  constructor(inject: Injector) 
  {
    super(inject);
  }

  override onInit(): void {
    this.getModule();
  }

  getModule()
  {
    var module = this.codxWsService.loadModule(this.module) as any;
    if(isObservable(module)) module.subscribe((item:any)=>{if(item && item.length>0)this.formatModule(item)})
    else if(module && module.length>0) this.formatModule(module)
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
    this.codxService.navigate("","/"+data.url)
    this.codxWsService.functionID = data.functionID;
    this.codxWsService.listBreadCumb.push(data);
  }

  // speed dial
  @ViewChild("popupCV") popupCV:TemplateRef<any>;
  @ViewChild("popupEmail") popupEmail:TemplateRef<any>;
  @ViewChild("popupSocial") popupSocial:TemplateRef<any>;
  cvModel:CVModel = new CVModel();
  emailModel:EmailModel = new EmailModel();
  socialMediaModel:SocialMediaModel = new SocialMediaModel();
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
    }
  ];

  // click open popupp
  openPoup(item:any){
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
    }
  }
  // CV
  openPopupCV(){
    if(this.popupCV)
    {
      let option = new DialogModel();
      this.cvModel = new CVModel();
      this.callFunc.openForm(this.popupCV,"",600,700,"",null,"",option);
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
  //Social media
  openPoupupSocial(){
    if(this.popupSocial)
    {
      let option = new DialogModel();
      this.socialMediaModel = new SocialMediaModel();
      this.callFunc.openForm(this.popupSocial,"",900,700,"",null,"",option);
    }
  }
  // value change
  valueChange(evt:any){
    this.emailModel[evt.field] = evt.data;
  }
  // select file cv
  onSelectFileCV(e:any){
    // api đọc CV
    let url = "https://apibot.trogiupluat.vn/api/v2.0/NLP/get-information-extract";
    let file = e.target.files[0];
    var form = new FormData();
    this.loading = true;
    form.append("prompt", `
    Hãy trích xuất thông tin CV ứng viên tới định dạng JSON như sau:
    {
      "name": "",
      birthDay:"",
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
    setTimeout(() => {
      this.loading = false;
    }),10000;    
    axios.post(url, form).then((res:any) => {
      this.loading = false;
      this.cvModel = JSON.parse(res.data.Data.JsonResult); 
      console.log(this.cvModel);
      this.changeDetectorRef.detectChanges();
      // api đánh giá
      let url2 = "https://apibot.trogiupluat.vn/api/v2.0/NLP/get-gpt-action";
      var form2 = new FormData();
      form2.append("prompt","Một ứng viên có CV như bên dưới, hãy xem xét có nên tuyển dụng ứng viên này và nêu lý do nếu từ chối?");
      form2.append("sourceText",JSON.stringify(res.data.Data.SourceText));
      axios.post(url2, form2).then((res2:any) => {
        console.log("respone2: ",res2);
      });
    });
  }
  // create mail
  createdMail(){
    if(this.emailModel.subject == ""){
      this.notifySvr.notify("Vui lòng nhập chủ đề","2");
      return;
    }
    if(this.emailModel.contents == ""){
      this.notifySvr.notify("Vui lòng nhập nội dung gợi ý","2");
      return;
    }
    let url = "https://apibot.trogiupluat.vn/api/v2.0/NLP/get-gpt-action";
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }),10000;   
    let data = {
      subject:this.emailModel.subject,
      contents:this.emailModel.contents,
      language:'Tiếng việt',
      contact:
      {
        name:this.userInfo.userName,
        phone:this.userInfo.phone,
        email:this.userInfo.email,
        company:'CPTH Lạc Việt',
        website:'https://www.codx.vn/'
      }
    };
    let sourceText = JSON.stringify(data).replace(/\"/g,"'");
    axios.post(
      url,
      {
        'Prompt': `Hãy viết email về chủ đề ${this.emailModel.subject}, với nội dung ${this.emailModel.contents}.`,
        'GptApiKey': '',
        'SourceText': sourceText
      }).then((res:any) => {
        this.loading = false;
        this.emailModel.result = res.data.Data.replace(/\n/g,"<br/>");
        this.changeDetectorRef.detectChanges();
    }).catch((err)=> {
      console.log(err);
      this.loading = false;
    });
  }

  selectMediaType(value:any){
    this.socialMediaModel.type = value ? value.text : "";
  }
  // create social media
  createdSocialMedia(){
    if(this.socialMediaModel.type == ""){
      this.notifySvr.notify("Vui lòng nhập nội dung truyền thông","2");
      return;
    }
    if(this.socialMediaModel.contents == ""){
      this.notifySvr.notify("Vui lòng nhập nội dung gợi ý","2");
      return;
    }
    let url = "https://apibot.trogiupluat.vn/api/v2.0/NLP/get-gpt-action";
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }),10000;
    let data = {
      socialMedia:this.socialMediaModel.type,
      contents:this.socialMediaModel.contents,
      language:'Tiếng việt',
      contact:
      {
        name:this.userInfo.userName,
        phone:this.userInfo.phone,
        email:this.userInfo.email,
        company:'CPTH Lạc Việt',
        website:'https://www.codx.vn/'
      }
    };
    let sourceText = JSON.stringify(data).replace(/\"/g,"'");
    axios.post(
      url,
      {
        'Prompt': `Hãy viết nội dung cho Facebook, về nội dung ${this.socialMediaModel.contents}.`,
        'GptApiKey': '',
        'SourceText': sourceText
      }).then((res:any) => {
        this.loading = false;
        this.socialMediaModel.result = res.data.Data.replace(/\n/g,"<br/>");
        this.changeDetectorRef.detectChanges();
    }).catch((err)=> {
      console.log(err);
      this.loading = false;
    });
  }
}

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
  }
}
class EmailModel{
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
class SocialMediaModel{
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
    this.type = "";
    this.contents = "";
    this.result = null;
  }
}
