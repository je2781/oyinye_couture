export enum EmailType{
    verify, reset
}

export interface  SendMail{
    userId: any;
    emailType: EmailType;
    email: string;
}