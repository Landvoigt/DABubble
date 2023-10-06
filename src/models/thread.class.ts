export class Thread {
    id: any;
    content: string;
    date: any;
    ownerID: string;
    ownerName: string;
    ownerAvatarSrc: string;
<<<<<<< HEAD
    ownerEmail: string;
    lastAnswerTime: any;
    amountOfAnswers: number;
    userReactions: { [key: string]: string } = {};
    editMessageContent: string;
=======
    ownerEmail:string;
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8

    constructor(obj?: any) {
        this.id = obj && obj.id ? obj.id : '';
        this.content = obj && obj.content ? obj.content : '';
        this.date = obj && obj.date ? obj.date : '';
        this.ownerID = obj && obj.ownerID ? obj.ownerID : '';
        this.ownerName = obj && obj.ownerName ? obj.ownerName : '';
        this.ownerAvatarSrc = obj && obj.ownerAvatarSrc ? obj.ownerAvatarSrc : '';
        this.ownerEmail = obj && obj.ownerEmail ? obj.ownerEmail : '';
<<<<<<< HEAD
        this.lastAnswerTime = obj && obj.lastAnswerTime ? obj.lastAnswerTime : '';
        this.amountOfAnswers = obj && obj.amountOfAnswers ? obj.amountOfAnswers : '';
        this.userReactions = obj && obj.userReactions ? obj.userReactions : {};
        this.editMessageContent = obj && obj.editMessageContent ? obj.editMessageContent : '';
=======
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
    }

    public toJSON() {
        return {
            id: this.id,
            content: this.content,
            date: this.date,
            ownerID: this.ownerID,
            ownerName: this.ownerName,
            ownerAvatarSrc: this.ownerAvatarSrc,
<<<<<<< HEAD
            ownerEmail: this.ownerEmail,
            lastAnswerTime: this.lastAnswerTime,
            amountOfAnswers: this.amountOfAnswers,
            userReactions: this.userReactions,
            editMessageContent: this.editMessageContent,
=======
            ownerEmail: this.ownerEmail
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
        };
    }
}