export class LoginRequest{
  constructor(private mail: string, private password: string) {
    this.mail = mail;
    this.password = password;
  }
}
