export class UserLoginExtend {
  public twoFA: string = '';
  public devices: Device[] = [];
}

export class Device {
  public name: string;
  public os: string;
  public ip: string;
  public imei: string;
  public id: string;
  public trust: boolean;
  public times: string;
  public tenantID: string;
  public createdOn?: Date;
  public loginType?: string;
  public session?: string;
}
