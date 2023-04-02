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
import { UIComponent } from 'codx-core';
import { CodxSVAnswerService } from './answers.service';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { isObservable } from 'rxjs';
import { ChartSettings } from 'projects/codx-om/src/lib/model/chart.model';

@Component({
  selector: 'app-answers',
  templateUrl: './answers.component.html',
  styleUrls: ['./answers.component.scss'],
})
export class AnswersComponent extends UIComponent implements OnInit, OnChanges {
  @ViewChild('tabContent') public tabContent: TabComponent;
  
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
  Objs =  [
    { Country : "GBR", GoldMedal : 27, SilverMedal : 23, BronzeMedal : 17, MappingName : "Great Britain" },
    { Country : "CHN", GoldMedal : 26, SilverMedal : 18, BronzeMedal : 26, MappingName : "China" },
    { Country : "AUS", GoldMedal : 8, SilverMedal : 11, BronzeMedal : 10, MappingName : "Australia" },
    { Country : "RUS", GoldMedal : 19, SilverMedal : 17, BronzeMedal : 20, MappingName : "Russia" },
];
primaryXAxis: Object = {
  labelIntersectAction: Browser.isDevice ? 'None' : 'Rotate45', labelRotation: Browser.isDevice ? -45 : 0 , edgeLabelPlacement: 'Shift',valueType: 'Category', interval: 1, majorGridLines: { width: 0 }, majorTickLines: { width: 0 }
};
//Initializing Primary Y Axis
primaryYAxis: Object = {
  majorTickLines: { width: 0 }, lineStyle: { width: 0 }, 
};
chartSettings: ChartSettings = {
  title: '15 Objectives',
  seriesSetting: [
    {
      type: 'Column',
      xName: 'answer',
      yName: 'count',
    },
  ],

};
  constructor(
    private injector: Injector,
    private awserSV :CodxSVAnswerService
  ) {
    super(injector);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['changeModeA']) {
    }
  }

  onInit(): void {
    //Lấy thông tin danh sách câu trả lời bằng id SV
    this.getRespondents();
    //this.tabContent.refreshActiveTab();
  }

 
  onSelectTab(e:any)
  {
    var dc= document.getElementById("ejstab-survey-id");
    if(e.selectedIndex == 1) dc.classList.add("border-bt-none");
    else dc.classList.remove("border-bt-none")
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
          this.lstCountQuestion = item[2]
          this.respondents = this.lstRespondents[this.lstRespondents.length - 1];
          this.setSelectedDropDown(this.respondents.responds[0].question)
          this.loadQuestionByID(this.respondents.responds[0].questionID);
          if(this.respondents.responds.length == 1) this.next = false
        }
      })
    }
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
    if(listAnswers.length > 0)
      listAnswers.forEach(elm => {
        count = count + elm.count;
      });
    return count
  }

  dataSourceChart(data:any)
  {
    debugger
    var list = data.filter(x=>x.answer);
    var arr=[];
    if(list && list.length > 0 ) 
    {
      list.forEach(elm =>{
        var obj = 
        {
          Answer : elm.answer,
          Count : elm.count
        }
        arr.push(obj)
      });
    }
    return arr;
  }
}
