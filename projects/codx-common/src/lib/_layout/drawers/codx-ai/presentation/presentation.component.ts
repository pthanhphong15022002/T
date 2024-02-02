import { Component, Optional } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import axios from 'axios';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-presentation',
  templateUrl: './presentation.component.html',
  styleUrls: ['./presentation.component.scss']
})
export class PresentationComponent {
  dialog:any;
  presentationForm = new FormGroup({
    content: new FormControl(),
    number : new FormControl(0),
    result : new FormControl(),
  });
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
  }
 
  onSave()
  {
    let data = {
      content :this.presentationForm.value.content,
      num_Slide :this.presentationForm.value.number
    };
    let prompt = `Mẫu promt (tiếng Việt): Bạn hãy tạo bài thuyết trình dạng ppt theo nội dung ${this.presentationForm.value.content} , khoảng ${this.presentationForm.value.number} slide.`;
    this.fetch(data,prompt).then((res:any) => 
      {
        //this.presentationForm.result = res.data.Data.replace(/\n/g,"<br/>");
        this.presentationForm.get('result').patchValue(res.data.Data.replace(/\n/g,"<br/>"));
      }).catch((err)=> {
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
}
