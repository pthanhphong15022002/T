import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { from, isObservable, of } from 'rxjs';
import axios from 'axios';
import { CallFuncService, DialogData, DialogModel, DialogRef, Util } from 'codx-core';
import { EmailModel, OKRModel, SocialMediaModel } from '../../workspace.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CvEvaluateComponent } from '../cv-evaluate/cv-evaluate.component';

@Component({
  selector: 'lib-cv-information',
  templateUrl: './cv-information.component.html',
  styleUrls: ['./cv-information.component.scss']
})
export class CvInformationComponent implements OnInit{
  
  emailModel:EmailModel = new EmailModel();
  socialMediaModel:SocialMediaModel = new SocialMediaModel();
  okrModel:OKRModel = new OKRModel();
  
  jsonExports:any[] = [];
  jsonExports2:any[] = [];
  dialog:any;
  cellExvalueate = false;
  request:any;
  columnGrid = [];
  listBreadCrumb = [];
  disabledBtn = true
  constructor(
    private callFunc: CallFuncService,
    private ngxLoader: NgxUiLoaderService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog
  }
  ngOnInit(): void {
    this.setColumn();
  }

  setColumn()
  {
    var colums = {
      field: 'name',
      headerText: "Tên hồ sơ",
    };
    this.columnGrid.push(colums);
  }

  onSelectFiles(e:any){
    let files = Array.from(e.target.files);
    if(files.length > 0)
    {
      this.ngxLoader.start();
      let i = 0;
      files.forEach((f) => {
        this.exportFileCV(f).subscribe((res:any) => {
          if(res)
          {
            res.id = Util.uid();
            this.jsonExports.push(res);
            this.jsonExports2.push(res);
            this.changeDetectorRef.detectChanges();
          }
          i++;
          if(i == (files.length)) 
          {
            this.ngxLoader.stop();
            this.disabledBtn = false;
          }
        });
      });
    }
        
  }

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
        "birthday":"",
        "birthPlace":"",
        "degreeName":"",
        "seniorityDate":"",
        "gender":"",
        "experience":"",
        "facebook":"",
        "github":"",
        "skills":[],
      }
      Lưu ý: Nếu thông tin không tìm thấy hãy để trống.`);
      form.append("sourceFile", file); 
      return from(axios.post(url, form)
      .then((res:any) => {
        var result = JSON.parse(res.data.Data.JsonResult); 
        result.fileName = res.data.Data?.FileName; 
        return result
      })
      .catch(() => {return null}));
    }
    else
    {
      return of(null);
    }
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

  searchCV(){
    this.cellExvalueate = true;
    if(this.jsonExports.length > 0 && this.request)
    {
      this.ngxLoader.start();
      let i = 0;
      //this.jsonExports = JSON.parse(JSON.stringify(this.jsonExports2));
      this.jsonExports.forEach((e:any) => {
        e.result = null;
       
        this.evaluateCV(e).subscribe((res:any) => {
          if(res.accept) e.result = res;
          i++;
          if(i == (this.jsonExports.length -1))
          {
            this.ngxLoader.stop();
            this.jsonExports = this.jsonExports.filter(x=>x.result);
            this.jsonExports = [...this.jsonExports]
          }
        });
      }); 
    }
  }

  // api đánh giá
  evaluateCV(json:any){
    let url2 = "https://apibot.trogiupluat.vn/api/v2.0/NLP/get-gpt-action";
    return from(axios.post(
      url2,
      {
        'Prompt': `Hãy đánh giá CV dạng JSON bên dưới có đáp ứng được các mục yêu cầu tuyển dụng như sau:
          ${this.listBreadCrumb.join(";")}.
          phân tích ưu điểm, khuyết điểm và đưa ra kết luận tuyển dụng hay không.
          Và trích xuất thành dạng JSON như sau 
          {
            "evaluate":"",
            "advantage":"",
            "weakness": "",
            "accept":true or false
          }`,
        'SourceText': JSON.stringify(json)
      }).then((res2:any) =>
      {
        
        return JSON.parse(res2.data.Data);
      }).catch(() => {return null}));
  }

  close()
  {
    this.dialog.close();
  }

  refeshEvaluate()
  {
    this.request = "";
    this.listBreadCrumb=[];
    this.cellExvalueate = false;
    this.jsonExports = JSON.parse(JSON.stringify(this.jsonExports2));
    this.jsonExports.forEach(element => {
      element.result = null;
    });
  }

  //Mở Form Đánh giá hồ sơ
  openForm()
  {
    this.callFunc.openForm(CvEvaluateComponent,"",600,200,"",this.listBreadCrumb,"").closed.subscribe((res) => {
      if(res?.event)
      {
        this.request = res?.event;
        this.listBreadCrumb.push(this.request);
        this.searchCV();
      }
    });
  }
}
