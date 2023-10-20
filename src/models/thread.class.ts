export class Thread {
    id: any;
    channelId: string;
    channelName: string;
    content: string;
    date: any;
    ownerID: string;
    ownerName: string;
    ownerAvatarSrc: string;
    ownerEmail: string;
    lastAnswerTime: any;
    amountOfAnswers: number;
    userReactions: { [key: string]: string } = {};
    editMessageContent: string;
    uploadedFile: string;

    constructor(obj?: any) {
        this.id = obj && obj.id ? obj.id : '';
        this.channelId = obj && obj.channelId ? obj.channelId : '';
        this.channelName = obj && obj.channelName ? obj.channelName : '';
        this.content = obj && obj.content ? obj.content : '';
        this.date = obj && obj.date ? obj.date : '';
        this.ownerID = obj && obj.ownerID ? obj.ownerID : '';
        this.ownerName = obj && obj.ownerName ? obj.ownerName : '';
        this.ownerAvatarSrc = obj && obj.ownerAvatarSrc ? obj.ownerAvatarSrc : '';
        this.ownerEmail = obj && obj.ownerEmail ? obj.ownerEmail : '';
        this.lastAnswerTime = obj && obj.lastAnswerTime ? obj.lastAnswerTime : '';
        this.amountOfAnswers = obj && obj.amountOfAnswers ? obj.amountOfAnswers : '';
        this.userReactions = obj && obj.userReactions ? obj.userReactions : {};
        this.editMessageContent = obj && obj.editMessageContent ? obj.editMessageContent : '';
        this.uploadedFile = obj && obj.uploadedFile ? obj.uploadedFile : '';
    }

    public toJSON() {
        return {
            id: this.id,
            channelId: this.channelId,
            channelName: this.channelName,
            content: this.content,
            date: this.date,
            ownerID: this.ownerID,
            ownerName: this.ownerName,
            ownerAvatarSrc: this.ownerAvatarSrc,
            ownerEmail: this.ownerEmail,
            lastAnswerTime: this.lastAnswerTime,
            amountOfAnswers: this.amountOfAnswers,
            userReactions: this.userReactions,
            editMessageContent: this.editMessageContent,
            uploadedFile: this.uploadedFile,
        };
    }
}