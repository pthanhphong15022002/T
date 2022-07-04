import { ApiHttpService } from "codx-core";

var api: ApiHttpService;

//Hàm chuyển đổi html thành text
function extractContent(s:any) {
  if(s)
  {
    var span = document.createElement('span');
    span.innerHTML = s;
    return span.textContent || span.innerText;
  }
  return ""
};


export{
  extractContent
}