export class UserLoginExtend {
  public twoFA: string = '';
  public devices: Device[] = [];
}

export class Device {
  public id: string;
  public name: string;
  public os: string;
  public imei?: string;
  public trust: boolean;
  public times: string;
  public tenantID: string;
  public loginType?: string;
  public session?: string;
}
