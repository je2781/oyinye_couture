export enum EmailType{
    verify, reset, reminder, request
}

export interface  SendMail{
    userId: any;
    emailType: EmailType;
    email: string;
    emailBody?: string
}