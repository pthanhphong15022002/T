export class UserLoginExtend {
  public twoFA: string = '';
  public devices: Device[] = [];
}

export class Device {
  public name: string;
  public os: string;
  public ip: string;
  public imei: string;
  public trust: boolean;
  public times: string;
  public createdOn?: Date;
}
