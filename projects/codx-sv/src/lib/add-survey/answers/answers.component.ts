import { Browser } from '@syncfusion/ej2-base';
import {
  Component,
  Injector,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ApiHttpService, SeriesSetting, UIComponent } from 'codx-core';
import { CodxSVAnswerService } from './answers.service';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { isObservable } from 'rxjs';
import { ChartSettings } from 'projects/codx-om/src/lib/model/chart.model';
import moment from 'moment';
import { palettes } from '../setting/setting.data';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';

@Component({
  selector: 'app-answers',
  templateUrl: './answers.component.html',
  styleUrls: ['./answers.component.scss'],
})
export class AnswersComponent extends UIComponent implements OnInit, OnChanges {
  @ViewChild('tabContent') public tabContent: TabComponent;
  @Input() dataSV:any;
  @Input() formModel: any;
  @Input() recID: any; //Mã bảng khảo sát

  lstRespondents: any = [];
  respondents:any
  seletedDropDown: any
  indexQ : number = 1;
  next = true;
  pervious = false;
  question:any;
  lstCountQuestion = [];
  lstQuestion : any;
  indexQuesAns: number = 0;
  indexRepons: number = 0;
  primaryColor:any;
  backgroundColor:any;
  chartSettingsT: ChartSettings = {
    title: '',
    seriesSetting: [
      {
        type: 'Column',
        xName: 'answer',
        yName: 'count',
        dataLabel : {
          name: 'textMapping'
        },
        marker : { 
          dataLabel: { 
            visible: true, 
            position: 'Top',
            template: '<div class="text-white fw-bold">${point.y}</div>' 
          }
        }
      },
    ],
  };
  
  chartSettingsO2: ChartSettings = {
    title: '',
    seriesSetting: [
      {
        type: 'Column',
        xName: 'row',
        yName: 'count',
        dataLabel : {
          name: 'textMapping'
        },
        marker : { 
          dataLabel: { 
            visible: true, 
            position: 'Top',
            template: '<div class="text-white fw-bold">${point.y}</div>' 
          }
        }
      },
    ],
  };
  
  chartSettingsO: ChartSettings = {
    title: '',
    seriesSetting: [
      {
        type: 'Pie',
        xName: 'answer',
        yName: 'percent',

        dataLabel : {
          name: 'textMapping',
          visible: true, 
          position: 'Inside', 
          enableRotation : false, 
          connectorStyle: { type: 'Curve', length: '10%' }, 
          font: {color: 'white', fontWeight:'600' },
          showZero: false
        },
      },
    ],
  
  };

  palettes: string[] = palettes[0].data
  
  tooltipMatrix : Object = {
    enable: true,
    header: '<b>${point.tooltip}</b>',
    shared: true
  };
  constructor(
    private injector: Injector,
    private awserSV :CodxSVAnswerService,
    private codxShareService :CodxShareService,
  ) {
    super(injector);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if ( changes['recID'] && changes['recID']?.currentValue != changes['recID']?.previousValue) {
      this.recID = changes['recID']?.currentValue;
      this.getRespondents();
    }
    if(changes?.dataSV && changes.dataSV?.previousValue != changes.dataSV?.currentValue)
    {
      this.dataSV =  changes.dataSV?.currentValue;
      this.getAvatar();
    }
  }

  onInit(): void {
    //this.tabContent.refreshActiveTab();
  }

  getAvatar()
  {
    if(this.dataSV && this.dataSV.settings) {
      if(typeof this.dataSV.settings == "string") this.dataSV.settings = JSON.parse(this.dataSV.settings);
      if(this.dataSV?.settings?.backgroudColor) {
        document.getElementById("bg-color-sv-answer").style.backgroundColor = this.dataSV?.settings?.backgroudColor;
      }
    }
    this.backgroundColor = this.dataSV?.settings?.backgroudColor || "#EBDFFF";
    this.primaryColor = this.dataSV?.settings?.primaryColor || "#7248B9"
    this.setStyleIcon();
  }

  setStyleIcon()
  {
    var clsicon = document.getElementsByClassName('icon-chart-sv');
    for(var i = 0; i < clsicon.length; i++) {
      clsicon[i].removeAttribute("style");
    }
    var clsicon2 = document.getElementsByClassName('icon-chart-sv-1') as HTMLCollectionOf<HTMLElement>;
    for(var i = 0; i < clsicon2.length; i++) {
      clsicon2[i].style.color = this.primaryColor
    }
    var clsdiv = document.getElementsByClassName('div-icon-chart');
    for(var i = 0; i < clsdiv.length; i++) {
      clsdiv[i].removeAttribute("style");
    }

    var clsChart = document.getElementsByClassName('view-chart-1') as HTMLCollectionOf<HTMLElement>;
    for(var i = 0; i < clsChart.length; i++) {
      clsChart[i].classList.remove("invisible");
      clsChart[i].classList.add("visible");
    }
    
    var clsChart2 = document.getElementsByClassName('view-chart-2') as HTMLCollectionOf<HTMLElement>;
    for(var i = 0; i < clsChart2.length; i++) {
      clsChart2[i].classList.add("invisible");
      clsChart2[i].classList.remove("visible");
    }
  }

  onSelectTab(e:any)
  {
    var dc= document.getElementById("ejstab-survey-id");
    if(e.selectedIndex == 1 || e.selectedIndex == 2) {
      dc.classList.add("border-bt-none","ejstab-survey-answer");
      dc.classList.remove("ejstab-survey-answer2");
    }
    else {
      dc.classList.remove("border-bt-none","ejstab-survey-answer");
      dc.classList.add("ejstab-survey-answer2");
    }
  }

  //Ẩn hiện collaspe
  showCollapse()
  {
    var dc= document.getElementById("collapseExample");
    if(dc.classList.contains('show')) dc.classList.remove('show');
    else dc.classList.add('show');
  }
  //Lấy thông tin danh sách câu trả lời bằng id SV
  getRespondents()
  {
    if(this.recID)
    {
      this.awserSV.getRespondents(this.recID).subscribe((item:any) =>{
        if(item) {
          this.lstRespondents = item[0];
          this.lstQuestion = item[1]
          this.lstCountQuestion = item[2];
          debugger
          var index = this.lstRespondents.findIndex(x=>x.responds && x.responds.length >0);
          if(index >= 0) this.respondents = this.lstRespondents[index];
          this.getSetting();
          if(this.respondents && this.respondents?.responds && this.respondents?.responds[0])
          {
            this.setSelectedDropDown(this.respondents.responds[0].question)
            this.loadQuestionByID(this.respondents.responds[0].questionID);
          }
          if(this.respondents.responds && this.respondents.responds.length == 1) this.next = false
        }
      })
    }
  }
  
  getSetting()
  {
    this.lstCountQuestion.forEach(element => {
      if(element.answerType == "O2" || element.answerType == "C2") {
        element.setting = this.settingChart(element?.answerType,'seriesSetting' , element.dataChart);
        element.grid = {}
        element.grid.column = this.getColum(element.recID);
        element.grid.row = this.getRow(element.recID)
      }
      else
      {
        element.grid = {}
        element.grid.column = [{answer:"Câu trả lời"}];
        element.grid.row = this.getRow2(element.recID);
      }
    });
  }


  getColum(questionID:any)
  {
    var ques = this.lstQuestion.filter(x=>x.recID == questionID);
    if(ques && ques.length >0) return (ques[0].answers.filter(x=>!x.isColumn)).sort((a:any,b:any)=> a?.seqNo - b?.seqNo);
    return [];
  }

  getRow(questionID:any)
  {
    let result = [];
    this.lstRespondents.forEach(element => {
      if(element.responds && element.responds.length>0)
      {
        var results = element.responds.filter(x=>x.questionID == questionID);
        if(results && results.length > 0)
        {
          var data = [];
          var listResult = results[0].results.sort((a:any,b:any)=> a?.seqNo - b?.seqNo);
          listResult.forEach(element2 => {
            if(data[element2.seqNo] && Array.isArray(data[element2.seqNo])) data[element2.seqNo].push(element2.answer)
            else data.push([element2.answer]);   
          });
          data.unshift({objectID:element.objectID,name:element.respondent,email:element.email})
          result.push(data);
        }
      }
    });
    return result;
  }

  getRow2(questionID:any)
  {
    let result = [];
    this.lstRespondents.forEach(element => {
      if(element.responds && element.responds.length>0)
      {
        var results = element.responds.filter(x=>x.questionID == questionID);
        if(results && results.length > 0)
        {
          var data = [{objectID:element.objectID,name:element.respondent,email:element.email},{data:[]}];
          results[0].results.forEach(element2 => {
            data[1].data.push(element2.answer)
          });
          result.push(data);
        }
      }
    });
    return result;
  }
  //Get content form string html
  extractContent(s:any) {
    var span = document.createElement('span');
    span.innerHTML = s;
    return span.textContent || span.innerText;
  };

  //Set text selected dropdown
  setSelectedDropDown(item:any)
  {
    if(item) this.seletedDropDown = this.extractContent(item);
  }

  selectedDropDown(index:any,item:any=null)
  {
    if(!item) item = this.respondents.responds[(index - 1)].question;
    else if(this.respondents.responds.length > 1)
    {
      var e = {data : index + 1 };
      this.valueChangeIndex(e);
    }

    this.setSelectedDropDown(item);
    this.loadQuestionByID(this.respondents.responds[this.indexQ-1].questionID);
  }

  loadQuestionByID(id:any)
  {
    this.question = this.lstQuestion.filter(x=>x.recID == id)[0];
    if(this.lstCountQuestion) this.indexRepons = this.lstCountQuestion.findIndex(x=>x.recID == id);
  }
  //Thay đổi câu hỏi kế tiếp hoặc câu hỏi trước đó
  changeQuestion(type:any)
  {
    //Câu hỏi kế tiếp
    if(type == 'next')
    {
      if(!this.next) return;
      this.indexQ ++;

      if(this.indexQ == this.respondents.responds.length) {
        this.next = false;
        this.removeAddDis("div-next" , 'add');
      }
      if(this.indexQ <= 2) {
        this.pervious = true;
        this.removeAddDis("div-pervious" , 'remove');
      }
    }
    else
    {
      if(!this.pervious) return;

      this.indexQ --;

      if(this.indexQ == 1) {
        this.pervious = false;
        this.removeAddDis("div-pervious" , 'add');
      }
      this.next = true
      this.removeAddDis("div-next" , 'remove');
    }
    this.selectedDropDown(this.indexQ);
  }

  //Add class disable 
  removeAddDis(id:any,type:any)
  {
    var clss = document.getElementById(id);
    if(type == 'remove')
    {
      clss.classList.add("div-back-cricle");
      clss.classList.remove("disabled");
    }
    else
    {
      clss.classList.remove("div-back-cricle");
      clss.classList.add("disabled");
    }
  }
  
  valueChangeIndex(e:any)
  {
    if(e?.data)
    {
      this.indexQ = e?.data;

      var nexts = true , 
          perviouss = true,
          handleNext = "remove",
          handlePervious = "remove";

      if(this.indexQ == 1)
      {
        nexts = true;
        perviouss = false;
        handleNext = "remove";
        handlePervious = "add";
      }
      else if(this.indexQ == this.respondents.responds.length)
      {
        nexts = false;
        perviouss = true;
        handleNext = "add";
        handlePervious = "remove";
      }
      this.next = nexts;
      this.pervious = perviouss;
      this.removeAddDis("div-next" , handleNext);
      this.removeAddDis("div-pervious" , handlePervious);
      this.selectedDropDown(this.indexQ);
      this.refeshShowDropDown();
    }
  }

  refeshShowDropDown()
  {
    var dc= document.getElementById("collapseExample");
    dc.classList.remove("show");
  }

  //Đếm số lượng câu hỏi khác rỗng
  countAnswer(answers:any)
  {
    var count = 0 ;
    if(answers && answers.length > 0) 
    var listAnswers =  answers.filter(x=>x.answer);
    if(listAnswers && listAnswers.length > 0)
      listAnswers.forEach(elm => {
        count = count + elm.count;
      });
    return count
  }

  settingChart(answerType:any , properties:any , dataChart:any=null)
  {
    switch(answerType)
    {
      case "C":
      case "T":
      case "T2":
      case "R":
        {
          switch(properties)
          {
            case "height":
            {
              return "auto"
              break;
            }
            case 'primaryXAxis':
            {
              return {
                majorGridLines: { width: 0 }, 
                minorGridLines: { width: 0 },
                majorTickLines: { width: 0 }, 
                minorTickLines: { width: 0 },
                interval: 1, 
                lineStyle: { width: 0 },
                labelIntersectAction: 'Rotate45', valueType: 'Category'
              }
              break;
            }
            case 'primaryYAxis':
            {
              return {
                majorTickLines: { width: 0 }, 
                lineStyle: { width: 0 }, 
                majorGridLines: { width: 0.3 },
                minorGridLines: { width: 0 }, 
                minorTickLines: { width: 0 },
              }
              break;
            }
            case 'seriesSetting':
            {
              return this.chartSettingsT.seriesSetting
              break;
            }
            case 'chartArea':
            {
              return  {
                border: {
                    width: 0
                }
              };
            }
            case 'legendSettings':
            {
              return {
                width: 50,
                textOverflow : 'Ellipsis',
                textWrap: 'Wrap'
              };
            }
            case 'isTransposed':
              {
                if(answerType == "C") return true;
                return false;
              }
          }
          break;
        }
      case "L":
      case "O":
      {
        switch(properties)
        {
          case "height":
            {
              return "300"
              break;
            }
          case 'primaryXAxis':
          case 'primaryYAxis':
          case 'chartArea':
            {
              return null;
              break;
            }
          case 'seriesSetting':
            {
              return this.chartSettingsO.seriesSetting
              break;
            }
          case 'legendSettings':
            {
              return {
                toggleVisibility : false
              };
              break;
            }
          case 'isTransposed':
            {
              return false;
            }
        }
        break;
      }

      case "O2":
      case "C2":
        {
          switch(properties)
          {
            case "height":
            {
              return "auto"
              break;
            }
            case 'primaryXAxis':
            {
              return {
                labelIntersectAction: Browser.isDevice ? 'None' : 'Trim', 
                labelRotation: Browser.isDevice ? -45 : 0,
                majorGridLines: { width: 0 }, 
                majorTickLines: { width: 0 }, 
                interval: 1, 
                lineStyle: { width: 0 },
                valueType: 'Category'
              }
              break;
            }
            case 'primaryYAxis':
            {
              return {
                interval: 1,
                majorTickLines: { width: 0 },
                lineStyle: { width: 0 },
              }
              break;
            }
            case 'seriesSetting':
            {
              var list = [];
              var key = Object.keys(dataChart[0])
              key.forEach(element => {
                if(element != "row")
                {
                  var setting =   {
                    type: 'Column',
                    xName: "row",
                    yName: element,
                    name: element,
                    marker:{ dataLabel: { visible: false, position: 'Top', font: { fontWeight: '600', color: '#ffffff' } } },
                    width: 2
                  }
                  list.push(setting);
                }
                
              });
              return list;
            }
            case 'chartArea':
            {
              return  {
                border: {
                    width: 0
                }
              };
            }
            case 'legendSettings':
            {
              return {
                visible: true,
                enableHighlight : true
              }
            }
            case 'isTransposed':
              {
                if(answerType == "C") return true;
                return false;
              }
          }
          break;
        }
    }
    return null;
  }
  
  formatValueDate(data:any)
  {
    if(moment(data, moment.ISO_8601, true).isValid()) return moment(data).format('DD/MM/YYYY');
    return data;
  }

  showHideChart(recID:any , index:any)
  {

    var element = document.getElementById("chart"+recID+index);
    element.classList.remove("invisible");
    element.classList.add("visible");
    var elementIcon = document.getElementById("icon"+recID+index);
    var elementDivIcon = document.getElementById("div-icon"+recID+index);
    elementIcon.style.color = this.primaryColor;
    elementDivIcon.style.backgroundColor = this.backgroundColor;

    var dif = index == "2" ? "1": "2";
    element = document.getElementById("chart"+recID+dif);
    element.classList.add("invisible");
    element.classList.remove("visible");
    elementIcon = document.getElementById("icon"+recID+dif);
    elementDivIcon = document.getElementById("div-icon"+recID+dif);
    elementIcon.style.color = "";
    elementDivIcon.style.backgroundColor = "#F5F9FA";
  }

  //Print Report
  printReport(){   
    let params = {
      SurveyID:this.dataSV?.recID,
    }
    this.codxShareService.printReport('SVR001',"R",params,this.view?.formModel);
        
  }
  //Export 
  export()
  {
    this.api.execSv("SV","SV","AnswerSurveyBusiness","ExportAsync",this.dataSV.recID).subscribe(item=>{
      if(item)
      {
        var data = this.formatData(item)
        this.api
        .execSv<any>(
          "SV",
          'Core',
          'CMBusiness',
          'ExportExcelDataAsync',
          [data, '1eab1738-6bd0-11ee-91c8-d89ef34ba7ae']
        )
        .subscribe((item2) => {
          if (item2) {
            this.downloadFile(item2);
          }
        });
      }
    })
  }

  formatData(data:any)
  {
    var result = [];
    data.forEach(element => {
      var dt = 
      {
        SessionNo : element.sessionNo,
        Session :  element.session,
        SegNo : element.segNo,
        Question :  element.question,
        Type: element.type,
        Details : element.details,
        UserID : element.userID,
        UserName : element.userName,
        PositionID : element.positionID,
        PositionName : element.positionName,
        DepartmentID : element.departmentID,
        DepartmentName : element.departmentName,
        Answer: element.answer
      }
      result.push(dt);
    });
    return result
  }

  downloadFile(data: any) {
    var sampleArr = this.base64ToArrayBuffer(data[0]);
    this.saveByteArray("SV_Surveys" || 'excel', sampleArr);
  }

  base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  }

  saveByteArray(reportName, byte) {
    var dataType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    var blob = new Blob([byte], {
      type: dataType,
    });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
    link.click();
  }
}
