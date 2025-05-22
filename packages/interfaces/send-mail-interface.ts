export enum EmailType{
    verify_account, reset, reminder, request, verify_reviewer, verify_buyer
}

export interface  SendMail{
    password?: string
    userId?: any;
    emailType: EmailType;
    email: string;
    emailBody?: any;
}