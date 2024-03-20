import { Component } from '@angular/core';
import { CallFuncService } from 'codx-core';
import { PresentationComponent } from './presentation/presentation.component';

@Component({
  selector: 'codx-ai',
  templateUrl: './codx-ai.component.html',
  styleUrls: ['./codx-ai.component.scss']
})
export class CodxAiComponent {
  listItems = [
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
    // {
    //   id:'2',
    //   text:'UPload',
    //   iconCss:'icon-upload'
    // },
    {
      id:'3',
      text:'Mục tiêu',
      iconCss:'icon-lightbulb'
    },
    // {
    //   id:'4',
    //   text:'UPload Files',
    //   iconCss:'icon-upload'
    // }
    {
      id:'5',
      text:'Bài trình bày',
      iconCss:'icon-i-file-earmark-medical'
    },
  ];
  constructor(
    private callFunc : CallFuncService
  ) {
    
  }
  clickItem(id:any)
  {
    switch(id)
    {
      case '5':
      {
        this.presentation();
        break;
      }
    }
  }

  //Bài trình bày
  presentation()
  {
    this.callFunc.openForm(PresentationComponent,"",800,700)
  }

  tets(){
    window.open("https://console.trogiupluat.vn/Chatbox/Index?p=eyJ1c2VyQWdlbnREb2N1bWVudElkIjoiNjVlZTgzNDIxMzQzOWJhN2RmMTJjMjZhIiwibHZPcGVuQXBpS2V5SWQiOiI2NWJiM2EwMmNiMWQ4ZmZhYzdlZDcxOTYifQ==");
  }
}
