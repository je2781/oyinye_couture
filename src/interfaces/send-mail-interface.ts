export enum EmailType{
    verify, reset, reminder, request
}

export interface  SendMail{
    password?: string
    userId?: any;
    emailType: EmailType;
    email: string;
    emailBody?: string;
}