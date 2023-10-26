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
    this.setDataDefault();
  }

  setDataDefault()
  {
    this.jsonExports = 
    [
      {
          "name": "PHAM NGUYEN DUC DUY",
          "phone": "0393827974",
          "email": "phamducduy1506@gmail.com",
          "birthday": "15/06/2000",
          "birthPlace": "",
          "degreeName": "",
          "seniorityDate": "",
          "gender": "Male",
          "experience": "",
          "facebook": "",
          "github": "https://github.com/duypham-11",
          "skills": [
              "Html",
              "Css",
              "Boostrap",
              "MaterialUI",
              "Bem",
              "Flocss",
              "Typescript",
              "Responsive Website",
              "SEO",
              "ReactJs",
              "Redux",
              "Angular",
              "JavaScript",
              ".NET",
              "C#",
              "Microservice",
              "SQLServer",
              "PostgreSQL",
              "Design Pattern",
              "Solid",
              "Kiss",
              "Dry",
              "Yagni",
              "Principles",
              "Github",
              "Gitlab",
              "SVN",
              "Agile(Scrum)",
              "Visual Studio",
              "Visual Studio Code"
          ],
          "fileName": "PhamNguyenDucDuy_Fullstack.pdf",
          "id": "e5f7a7bd-5308-4970-935d-b493679e5141"
      },
      {
          "name": "NGUYEN HOANG BUU",
          "phone": "0763201225",
          "email": "hoangbuu313@gmail.com",
          "birthday": "13/03/2001",
          "birthPlace": "",
          "degreeName": "Bachelor of Software Engineering - Infomation Technology",
          "seniorityDate": "",
          "gender": "",
          "experience": "Over 1.5 years of experience in programing with ERP System.",
          "facebook": "https://facebook.com/prole.php?id=100010085918788",
          "github": "https://github.com/maiyozkyo?tab=repositories",
          "skills": [
              "ANGULAR FRAMEWORK",
              "Syncfusion",
              "Material UI",
              "C# (APS.NET)",
              "Repository Pattern",
              "HTML",
              "CSS",
              "JS",
              "Boostrap",
              "Tailwind",
              "PYTHON",
              "Tkinter",
              "SQL SERVER",
              "MONGODB",
              "POSTGRESQL"
          ],
          "fileName": "CV_Nguyen_Hoang_Buu.pdf",
          "id": "4daf1df9-2537-4494-9035-32ae5454444f"
      },
      {
          "name": "Nguyen Van Hieu",
          "phone": "0355244102",
          "email": "nguyenvanhieu.hq@gmail.com",
          "birthday": "",
          "birthPlace": "",
          "degreeName": "Master's degree",
          "seniorityDate": "",
          "gender": "",
          "experience": "WEB DEVELOPER AND WINFORM DEVELOPER\n07/2020 - NOW\n\nPSC Telecom\n\n- Web Programming ASP.Net MVC, Webform Website For\nUniversities\n- Winform programming including interface design and SQL\ndatabase\n\nWEB DEVELOPER 01/2020 - 06/2020\nAutoAndSI\n\n- ASP.Net MVC programming\n+ Programming UI using html and JavaScript\n+ Programming databases MariaDB, mySQL",
          "facebook": "",
          "github": "",
          "skills": [
              "C#",
              "Python",
              "SQL",
              "HTML",
              "CSS",
              "JavaScript",
              "Machine learning",
              "Database",
              "Image Recognition",
              "NLP",
              "Data Science"
          ],
          "fileName": "2207. Nguyen Van Hieu.pdf",
          "id": "554f4519-b9ab-4099-b5ef-5039c63c67d3"
      },
      {
          "name": "NGUYỄN VĂN THƯƠNG",
          "phone": "0356210784",
          "email": "nvthuong1508@gmail.com",
          "birthday": "15/08/2001",
          "birthPlace": "Van Ninh, Khanh Hoa",
          "degreeName": "HO CHI MINH CITY UNIVERSITY OF TECHNOLOGY",
          "seniorityDate": "",
          "gender": "Male",
          "experience": "Back-end Developer",
          "facebook": "",
          "github": "linkedin.com/in/nvthuong",
          "skills": [
              "C#",
              "C++",
              "Python",
              "Html",
              "JavaScript",
              "ReactJs",
              "Relational Database(SQL Server, MySQL, Postgres)",
              "Non Relational Database(MongoDB, Neo4j, Redis)",
              "Message queue(Kafka)",
              "Docker"
          ],
          "fileName": "2222. Nguyen Van Thuong.pdf",
          "id": "6ba94697-011c-4a95-9807-975e7384b24b"
      },
      {
          "name": "Nguyen Ngoc Phu Sy",
          "phone": "+84 868866071",
          "email": "phusy9a11516@gmail.com",
          "birthday": "31/03/2001",
          "birthPlace": "",
          "degreeName": "",
          "seniorityDate": "",
          "gender": "",
          "experience": "1.5 years of experience",
          "facebook": "",
          "github": "",
          "skills": [
              "Reactjs(Next.js)",
              "React Native",
              "Angular",
              "Node.js(Express.js, NestJS)",
              ".NET(MVC, API)",
              "RESTful API",
              "GraphQL",
              "PostgreSQL",
              "NoSQL (MongoDB, Redis)",
              "GIT",
              "Docker",
              "AWS",
              "Firebase",
              "RabbitMQ",
              "Payment method (Paypal, Zalopay)"
          ],
          "fileName": "CV_Nguyen_Ngoc_Phu_Sy_Junior_Fullstack_Developer.pdf",
          "id": "6c6bf7f7-e98a-4a1c-b640-8cc114feccf5"
      },
      {
          "name": "Võ Văn Thanh Phúc",
          "phone": "0978665441",
          "email": "vovanthanhphuc@gmail.com",
          "birthday": "08/11/2000",
          "birthPlace": "82 DT743 Di An, Binh Duong",
          "degreeName": "Software Engineering",
          "seniorityDate": "",
          "gender": "Male",
          "experience": "FPT Software Internship",
          "facebook": "",
          "github": "https://github.com/funnything811",
          "skills": [
              "Database Migrations",
              "Java Spring Boot",
              ".NET",
              "Angular",
              "HTML",
              "CSS",
              "JS",
              "Azure",
              "Git/Github",
              "OOP Mindset"
          ],
          "fileName": "2224. Vo Van Thanh Phuc.pdf",
          "id": "8fc6337f-dace-4901-8400-0cfec483c9c4"
      },
      {
          "name": "HOANG MANH TIEN",
          "phone": "0797680918",
          "email": "manhtien30062000@gmail.com",
          "birthday": "30/6/2000",
          "birthPlace": "Thu Duc, Ho Chi Minh, Vietnam",
          "degreeName": "Student",
          "seniorityDate": "",
          "gender": "",
          "experience": "",
          "facebook": "",
          "github": "",
          "skills": [
              "C#",
              "Typescript",
              "MySQL",
              "SQL Server",
              "PostgreSQL",
              ".NET",
              "Angular TypeScript",
              "Visual Studio",
              "Visual Studio code",
              "Git",
              "MVC",
              "AGILE"
          ],
          "fileName": "HOANG-MANH-TIEN.pdf",
          "id": "79ac5a96-d3e3-4dd2-a4c5-3cdd3aca3a31"
      }
    ]
    this.jsonExports2 = JSON.parse(JSON.stringify(this.jsonExports))
    this.disabledBtn = false;
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
      const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
      files.forEach(async(f) => {
        await sleep(1000);
        this.exportFileCV(f).subscribe((res:any) => {
          if(res)
          {
            res.id = Util.uid();
            this.jsonExports.unshift(res);
            this.jsonExports2.unshift(res);
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
      console.log(new Date())
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
          if(res.accept) {
            e.result = res;
            e.result.status = "Phù hợp"
          }
          else
          {
            e.result = {
              status : "Không phù hợp"
            };
          }
          i++;
          if(i == (this.jsonExports.length -1))
          {
            this.ngxLoader.stop();
            //this.jsonExports = this.jsonExports.filter(x=>x.result);
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
