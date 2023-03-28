import { Component, OnInit } from '@angular/core';
import { auto } from '@popperjs/core';
import { CallFuncService, DialogModel, DialogRef, FormModel, SidebarModel } from 'codx-core';
import { PopupTypeTaskComponent } from 'projects/codx-dp/src/lib/dynamic-process/popup-add-dynamic-process/step-task/popup-type-task/popup-type-task.component';
import { PopupAddQuotationsComponent } from '../quotations/popup-add-quotations/popup-add-quotations.component';
import { PopupTaskComponent } from '../task/popup-task/popup-task.component';

@Component({
  selector: 'lib-test-componet',
  templateUrl: './test-componet.component.html',
  styleUrls: ['./test-componet.component.scss']
})
export class TestComponetComponent implements OnInit {
  popupJob: DialogRef;
  taskGroupList = {"id":"6410395ae327812e55bce338","recID":"9f95642a-7799-470a-bb43-7a16bb8d6669","stepStatus":"1","reasonControl":false,"instanceID":"eb1265cd-82a1-4cb2-a08b-1e706ae0d0c5","stepID":"4824d312-24a3-4edf-8f92-5695a333fff3","stepName":"Yêu cầu khách hàng","durationDay":4,"durationHour":0.5,"interval":"1","startDate":"2023-03-18T16:07:38.136+07:00","excludeDayoff":"7;8","endDate":null,"progress":20,"assignControl":"1","actualStart":"2023-03-14T16:07:38.177+07:00","actualEnd":null,"actualHours":0,"leadtimeControl":true,"durationControl":true,"roles":[{"id":"6410392fe327812e55bcdb70","recID":"9b9f5d28-1686-4d9b-862c-108ef93c9c59","instanceID":"00000000-0000-0000-0000-000000000000","stepID":"00000000-0000-0000-0000-000000000000","roleType":"R","objectType":"D","objectName":"Phòng kinh doanh","objectID":"CODX282023-03","note":null,"createdOn":"2023-03-14T16:06:55.443+07:00","createdBy":null,"modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null},{"id":"6410392fe327812e55bcdb71","recID":"5ca4be65-bc51-4bff-9b55-5f0c343948b1","instanceID":"00000000-0000-0000-0000-000000000000","stepID":"00000000-0000-0000-0000-000000000000","roleType":"R","objectType":null,"objectName":"Lê Phạm Hoài Thương","objectID":"ADMIN","note":null,"createdOn":"2023-03-14T16:06:55.443+07:00","createdBy":null,"modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null},{"id":"6410392fe327812e55bcdb72","recID":"c54262cd-8909-41e5-82c1-f719a48d527d","instanceID":"00000000-0000-0000-0000-000000000000","stepID":"00000000-0000-0000-0000-000000000000","roleType":"S","objectType":"P","objectName":"Nhân viên Sales","objectID":"GR-01","note":null,"createdOn":"2023-03-14T16:06:55.443+07:00","createdBy":null,"modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null}],"taskGroups":[{"id":"6410395ae327812e55bce33a","recID":"67698d81-6acb-4591-9d05-f31721238675","note":null,"isTaskDefault":true,"instanceID":"eb1265cd-82a1-4cb2-a08b-1e706ae0d0c5","stepID":"9f95642a-7799-470a-bb43-7a16bb8d6669","indexNo":1,"taskGroupName":"Yêu cầu khách hàng","durationDay":1,"durationHour":0,"interval":"1","startDate":"2023-03-14T16:07:38.187+07:00","endDate":"2023-03-15T16:07:38.187+07:00","progress":0,"actualStart":null,"actualEnd":null,"actualHours":0,"roles":[{"id":"6410395ae327812e55bce33c","recID":"2bb6592f-d0b0-44b1-acbe-8b667ff5e53c","taskGroupID":"77175b97-fb86-43fc-b5df-4db7da0c1c12","roleType":null,"objectType":null,"objectName":"Lê Phạm Hoài Thương","objectID":"ADMIN","note":null,"createdOn":"2023-03-10T14:40:29.404+07:00","createdBy":"ADMIN","modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null}],"statusCodeID":null,"refID":"cb213eca-fa1d-4a50-8c5d-425f08a307f6","memo":null,"createdOn":"2023-03-14T16:07:38.192+07:00","createdBy":"ADMIN","modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null},{"id":"6410395ae327812e55bce33e","recID":"28bb034f-bef8-4e3e-87b4-48fdf5a35f86","note":null,"isTaskDefault":true,"instanceID":"eb1265cd-82a1-4cb2-a08b-1e706ae0d0c5","stepID":"9f95642a-7799-470a-bb43-7a16bb8d6669","indexNo":1,"taskGroupName":"Xem xét khả năng","durationDay":2,"durationHour":0.5,"interval":"1","startDate":"2023-03-15T16:07:38.187+07:00","endDate":"2023-03-17T16:37:38.187+07:00","progress":10,"actualStart":null,"actualEnd":null,"actualHours":0,"roles":[{"id":"6410395ae327812e55bce340","recID":"368ce1a9-94ee-43ab-b9ba-3dde62a3263d","taskGroupID":"708f388c-25eb-4835-961a-9a2b442bad22","roleType":null,"objectType":null,"objectName":"Lê Phạm Hoài Thương","objectID":"ADMIN","note":null,"createdOn":"2023-03-10T14:40:50.587+07:00","createdBy":"ADMIN","modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null}],"statusCodeID":null,"refID":"fe9f633a-dbb8-4a10-aa10-a01e023d3cad","memo":null,"createdOn":"2023-03-14T16:07:38.193+07:00","createdBy":"ADMIN","modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null},{"id":"6410395ae327812e55bce342","recID":"4af7ce47-0e0a-450f-916c-d1843903bc5e","note":null,"isTaskDefault":true,"instanceID":"eb1265cd-82a1-4cb2-a08b-1e706ae0d0c5","stepID":"9f95642a-7799-470a-bb43-7a16bb8d6669","indexNo":1,"taskGroupName":"Giới thiệu & đàm phán","durationDay":1,"durationHour":0,"interval":"1","startDate":"2023-03-17T16:37:38.187+07:00","endDate":"2023-03-20T16:37:38.187+07:00","progress":30,"actualStart":null,"actualEnd":null,"actualHours":0,"roles":[{"id":"6410395ae327812e55bce344","recID":"127817e4-e36c-4614-8b7e-f7f9f972b8fc","taskGroupID":"b59c0924-a152-4856-88db-518a76c99627","roleType":null,"objectType":null,"objectName":"Lê Phạm Hoài Thương","objectID":"ADMIN","note":null,"createdOn":"2023-03-10T14:50:43.499+07:00","createdBy":"ADMIN","modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null}],"statusCodeID":null,"refID":"0d93b458-0b40-43ce-a804-ad820665cc7a","memo":null,"createdOn":"2023-03-14T16:07:38.193+07:00","createdBy":"ADMIN","modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null}],"tasks":[{"id":"6410395ae327812e55bce346","recID":"1891c713-40bb-494d-8b35-95c09e39bff2","note":null,"isTaskDefault":true,"instanceID":"eb1265cd-82a1-4cb2-a08b-1e706ae0d0c5","stepID":"9f95642a-7799-470a-bb43-7a16bb8d6669","indexNo":1,"taskType":"E","taskName":"Cung cấp thông tin sản phẩm","taskGroupID":"fe9f633a-dbb8-4a10-aa10-a01e023d3cad","parentID":"","reference":null,"durationDay":0,"durationHour":0.5,"interval":"1","startDate":"2023-03-15T16:07:38.187+07:00","endDate":"2023-03-15T16:37:38.187+07:00","progress":50,"actualStart":null,"refID":"6522e6ea-b5e3-4e26-923c-1f05cabe9f6f","actualEnd":null,"actualHours":0,"statusCodeID":null,"status":null,"reminders":null,"reminderBy":"1","dependOnTasks":null,"dependRule":"1","assignControl":"1","callType":"1","isOnline":false,"requireCompleted":true,"roles":[{"id":"6410392fe327812e55bcdb7a","recID":"0796f2f0-e359-4ecc-bb7b-791a93c8d6d2","taskID":"d8045e1a-5c1b-4faf-b18e-50e5a35139f9","roleType":"Roles","objectType":"R","objectName":"Nhân viên nghiệp vụ","objectID":"00000000-0000-0000-0000-000000000013","note":null,"createdOn":"2023-03-10T15:10:23.602+07:00","createdBy":null,"modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null}],"memo":null,"createTask":false,"createTaskControl":null,"lastUpdate":null,"comment":null,"attachments":0,"comments":0,"owner":null,"buid":null,"createdOn":"2023-03-14T16:07:38.204+07:00","createdBy":null,"modifiedOn":"2023-03-14T17:16:40.643+07:00","modifiedBy":"ADMIN","write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null},{"id":"6410395ae327812e55bce348","recID":"11139f23-9f75-40b3-8669-3992154f0c77","note":null,"isTaskDefault":true,"instanceID":"eb1265cd-82a1-4cb2-a08b-1e706ae0d0c5","stepID":"9f95642a-7799-470a-bb43-7a16bb8d6669","indexNo":2,"taskType":"M","taskName":"Hỏi đáp/Thương lượng khi không đủ khả năng đáp ứng","taskGroupID":"fe9f633a-dbb8-4a10-aa10-a01e023d3cad","parentID":"6522e6ea-b5e3-4e26-923c-1f05cabe9f6f","reference":null,"durationDay":1,"durationHour":0,"interval":"1","startDate":"2023-03-15T16:37:38.187+07:00","endDate":"2023-03-16T16:37:38.187+07:00","progress":40,"actualStart":null,"refID":"e1bfa620-9d3d-49ab-afe1-9030e20614c7","actualEnd":null,"actualHours":0,"statusCodeID":null,"status":null,"reminders":null,"reminderBy":"1","dependOnTasks":null,"dependRule":"1","assignControl":"1","callType":"1","isOnline":true,"requireCompleted":false,"roles":[{"id":"6410392fe327812e55bcdb7c","recID":"c0be18a1-da3a-4616-bec1-beb8d35bcf09","taskID":"3a2a1a42-43b8-4ad2-aff3-561c2c043efa","roleType":"Departments","objectType":"D","objectName":"Phòng Sales","objectID":"SL02","note":null,"createdOn":"2023-03-10T15:10:23.607+07:00","createdBy":null,"modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null},{"id":"6410392fe327812e55bcdb7d","recID":"b47e7276-aa8e-4b3a-8b23-6736ca3f128f","taskID":"3a2a1a42-43b8-4ad2-aff3-561c2c043efa","roleType":"Departments","objectType":"D","objectName":"Trung tâm Viễn thông","objectID":"ORG-0018","note":null,"createdOn":"2023-03-10T15:10:23.607+07:00","createdBy":null,"modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null},{"id":"6410392fe327812e55bcdb7e","recID":"f2612ee6-1aa6-4782-bd33-90febbb21e6f","taskID":"3a2a1a42-43b8-4ad2-aff3-561c2c043efa","roleType":"Departments","objectType":"D","objectName":"Trung tâm DXC","objectID":"ORG-0017","note":null,"createdOn":"2023-03-10T15:10:23.607+07:00","createdBy":null,"modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null}],"memo":"<p><span>thường được lưu trữ và truy cập điện tử từ hệ thống máy tính, Khi áp dụng hình thức lưu trữ này, nó sẽ giúp khắc phục được những điểm yếu của việc lưu file thông thường trên máy tính.</span><br></p>","createTask":false,"createTaskControl":null,"lastUpdate":null,"comment":null,"attachments":0,"comments":0,"owner":null,"buid":null,"createdOn":"2023-03-14T16:07:38.206+07:00","createdBy":null,"modifiedOn":"2023-03-10T17:04:28.121+07:00","modifiedBy":"ADMIN","write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null},{"id":"6410395ae327812e55bce34a","recID":"aae0a73d-f1b9-4d79-a07f-fa36c7f8c642","note":null,"isTaskDefault":true,"instanceID":"eb1265cd-82a1-4cb2-a08b-1e706ae0d0c5","stepID":"9f95642a-7799-470a-bb43-7a16bb8d6669","indexNo":3,"taskType":"T","taskName":"Phối hợp Trung tâm/phòng liên quan xem xét khả năng đáp ứng","taskGroupID":"fe9f633a-dbb8-4a10-aa10-a01e023d3cad","parentID":"e1bfa620-9d3d-49ab-afe1-9030e20614c7","reference":null,"durationDay":1,"durationHour":0,"interval":"1","startDate":"2023-03-16T16:37:38.187+07:00","endDate":"2023-03-17T16:37:38.187+07:00","progress":0,"actualStart":null,"refID":"6f907d18-c371-459a-9bd1-5cfc03dcf02d","actualEnd":null,"actualHours":0,"statusCodeID":null,"status":null,"reminders":null,"reminderBy":"1","dependOnTasks":null,"dependRule":"1","assignControl":"1","callType":"1","isOnline":false,"requireCompleted":false,"roles":[{"id":"6410392fe327812e55bcdb80","recID":"8eb8ba5b-3fca-4f5a-a783-d7a7eae05d50","taskID":"bef1499a-e0e8-4bd0-a1f6-63578a19a353","roleType":"Positions","objectType":"P","objectName":"Nhân viên Sales","objectID":"GR-01","note":null,"createdOn":"2023-03-10T15:10:23.607+07:00","createdBy":null,"modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null}],"memo":"<p><span>thường được lưu trữ và truy cập điện tử từ hệ thống máy tính, Khi áp dụng hình thức lưu trữ này, nó sẽ giúp khắc phục được những điểm yếu của việc lưu file thông thường trên máy tính.</span><br></p>","createTask":false,"createTaskControl":null,"lastUpdate":null,"comment":null,"attachments":0,"comments":0,"owner":null,"buid":null,"createdOn":"2023-03-14T16:07:38.207+07:00","createdBy":null,"modifiedOn":"2023-03-10T17:04:13.915+07:00","modifiedBy":"ADMIN","write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null},{"id":"6410395ae327812e55bce34c","recID":"8a57bd87-2da8-47bb-b058-8bc4357abafe","note":null,"isTaskDefault":true,"instanceID":"eb1265cd-82a1-4cb2-a08b-1e706ae0d0c5","stepID":"9f95642a-7799-470a-bb43-7a16bb8d6669","indexNo":1,"taskType":"M","taskName":"GIới thiệu chi tiết về dịch vụ văn phòng cho thuê","taskGroupID":"0d93b458-0b40-43ce-a804-ad820665cc7a","parentID":"","reference":null,"durationDay":1,"durationHour":0,"interval":"1","startDate":"2023-03-17T16:37:38.187+07:00","endDate":"2023-03-20T16:37:38.187+07:00","progress":0,"actualStart":null,"refID":"64c8ad8f-4421-414d-a8aa-ba503ad3dcee","actualEnd":null,"actualHours":0,"statusCodeID":null,"status":null,"reminders":null,"reminderBy":"1","dependOnTasks":null,"dependRule":"3","assignControl":"1","callType":"1","isOnline":false,"requireCompleted":false,"roles":[{"id":"6410392fe327812e55bcdb82","recID":"f9f73053-25be-4a1a-a878-3fb828db5960","taskID":"16c9030e-2b30-4252-9893-234739d5ab29","roleType":"Departments","objectType":"D","objectName":"Phòng Hỗ trợ & Chăm sóc khách hàng","objectID":"ORG-0009","note":null,"createdOn":"2023-03-10T15:10:23.607+07:00","createdBy":null,"modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null},{"id":"6410392fe327812e55bcdb83","recID":"fb6a353b-bb69-470d-8f3b-d5205e9bb83f","taskID":"16c9030e-2b30-4252-9893-234739d5ab29","roleType":"Departments","objectType":"D","objectName":"Phòng nhân sự","objectID":"HR","note":null,"createdOn":"2023-03-10T15:10:23.607+07:00","createdBy":null,"modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null}],"memo":"<p><span>thường được lưu trữ và truy cập điện tử từ hệ thống máy tính, Khi áp dụng hình thức lưu trữ này, nó sẽ giúp khắc phục được những điểm yếu của việc lưu file thông thường trên máy tính.</span><br></p>","createTask":false,"createTaskControl":null,"lastUpdate":null,"comment":null,"attachments":0,"comments":0,"owner":null,"buid":null,"createdOn":"2023-03-14T16:07:38.212+07:00","createdBy":null,"modifiedOn":"2023-03-10T17:04:46.957+07:00","modifiedBy":"ADMIN","write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null},{"id":"6410395ae327812e55bce34e","recID":"d30778bc-faed-46a6-8164-782fd1360326","note":null,"isTaskDefault":true,"instanceID":"eb1265cd-82a1-4cb2-a08b-1e706ae0d0c5","stepID":"9f95642a-7799-470a-bb43-7a16bb8d6669","indexNo":1,"taskType":"E","taskName":"Gửi báo giá","taskGroupID":"0d93b458-0b40-43ce-a804-ad820665cc7a","parentID":"64c8ad8f-4421-414d-a8aa-ba503ad3dcee","reference":null,"durationDay":1,"durationHour":0,"interval":"1","startDate":"2023-03-17T16:37:38.187+07:00","endDate":"2023-03-20T16:37:38.187+07:00","progress":0,"actualStart":null,"refID":"0dc3ea21-2517-46ea-b715-f342bc089066","actualEnd":null,"actualHours":0,"statusCodeID":null,"status":null,"reminders":null,"reminderBy":"1","dependOnTasks":null,"dependRule":"3","assignControl":"1","callType":"1","isOnline":false,"requireCompleted":true,"roles":[{"id":"6410392fe327812e55bcdb85","recID":"052b70dd-2fe6-4055-86ea-785e1ec70786","taskID":"019ffc95-d664-4463-8250-21373525fa49","roleType":"Roles","objectType":"R","objectName":"Nhân viên nghiệp vụ","objectID":"00000000-0000-0000-0000-000000000013","note":null,"createdOn":"2023-03-10T15:10:23.608+07:00","createdBy":null,"modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null}],"memo":"<p><span>thường được lưu trữ và truy cập điện tử từ hệ thống máy tính, Khi áp dụng hình thức lưu trữ này, nó sẽ giúp khắc phục được những điểm yếu của việc lưu file thông thường trên máy tính.</span><br></p>","createTask":true,"createTaskControl":null,"lastUpdate":null,"comment":null,"attachments":0,"comments":0,"owner":null,"buid":null,"createdOn":"2023-03-14T16:07:38.212+07:00","createdBy":null,"modifiedOn":"2023-03-10T17:08:04.924+07:00","modifiedBy":"ADMIN","write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null},{"id":"6410395ae327812e55bce350","recID":"4b715036-e1ef-47ed-8141-72060caef915","note":null,"isTaskDefault":true,"instanceID":"eb1265cd-82a1-4cb2-a08b-1e706ae0d0c5","stepID":"9f95642a-7799-470a-bb43-7a16bb8d6669","indexNo":1,"taskType":"T","taskName":"Thu tiền hằng tháng thôi ","taskGroupID":null,"parentID":"6522e6ea-b5e3-4e26-923c-1f05cabe9f6f;e1bfa620-9d3d-49ab-afe1-9030e20614c7;6f907d18-c371-459a-9bd1-5cfc03dcf02d;64c8ad8f-4421-414d-a8aa-ba503ad3dcee;0dc3ea21-2517-46ea-b715-f342bc089066","reference":null,"durationDay":1,"durationHour":0,"interval":"1","startDate":"2023-03-20T16:37:38.187+07:00","endDate":"2023-03-21T16:37:38.187+07:00","progress":0,"actualStart":null,"refID":"f593004b-7e98-455f-89cb-2e39fe0679dd","actualEnd":null,"actualHours":0,"statusCodeID":null,"status":null,"reminders":"Trước 3 giờ","reminderBy":"1","dependOnTasks":null,"dependRule":"1","assignControl":"0","callType":"1","isOnline":false,"requireCompleted":true,"roles":[{"id":"6410392fe327812e55bcdb87","recID":"e216fb32-657e-49ca-8a5d-40898b8328d2","taskID":"b0aa14ea-3530-412a-a610-3aa231e1a7f6","roleType":"Owner","objectType":"1","objectName":"Lê Phạm Hoài Thương","objectID":"ADMIN","note":null,"createdOn":"2023-03-10T17:09:17.724+07:00","createdBy":null,"modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null}],"memo":"<p><span>thường được lưu trữ và truy cập điện tử từ hệ thống máy tính, Khi áp dụng hình thức lưu trữ này, nó sẽ giúp khắc phục được những điểm yếu của việc lưu file thông thường trên máy tính.</span><br></p>","createTask":true,"createTaskControl":null,"lastUpdate":null,"comment":null,"attachments":0,"comments":0,"owner":null,"buid":null,"createdOn":"2023-03-14T16:07:38.213+07:00","createdBy":null,"modifiedOn":null,"modifiedBy":null,"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null}],"fields":[{"id":"6410395ae327812e55bce352","recID":"033e134e-2b5a-4322-a762-2ecc95a22aff","controlType":null,"instanceID":"eb1265cd-82a1-4cb2-a08b-1e706ae0d0c5","stepID":"8d5f17eb-5ef9-4d8e-a40b-638b5491c9ae","fieldName":"Nhu_cau_khach_hang","title":"Nhu cầu khách hàng","dataType":"T","dataFormat":"L","dataValue":"Rẻ","refType":null,"refValue":null,"multiselect":false,"rank":0,"rankIcon":null,"isRequired":true,"defaultValue":null,"note":"Nhập nhu cầu","sorting":1,"createdOn":"2023-03-10T15:10:23.649+07:00","createdBy":"ADMIN","modifiedOn":"2023-03-14T15:49:52.3+07:00","modifiedBy":"ADMIN","write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null}],"owner":"GR-01","memo":"<p>Hướng dẫn ABC</p>","isSuccessStep":false,"buid":null,"createdOn":"2023-03-10T14:21:16.966+07:00","isFailStep":false,"createdBy":"ADMIN","modifiedOn":"2023-03-14T17:16:40.795+07:00","modifiedBy":"ADMIN","reasons":[],"write":true,"delete":true,"share":true,"assign":true,"includeTables":null,"updateColumns":"","unbounds":null}
  constructor( 
    private callfc: CallFuncService,) { }

  ngOnInit(): void {
  }
 
  openFormAddQuotations(){
        var obj = {
          action: 'add',
          headerText: 'sdasdsadasdasd',
        };
        let option = new DialogModel();
        option.IsFull = true;
        var dialog = this.callfc.openForm(
          PopupAddQuotationsComponent,
          '',
          null,
          null,
          '',
          obj,
          '',
          option
        );
  }
  

}
