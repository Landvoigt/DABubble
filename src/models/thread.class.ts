export class Thread {
    id: any;
    content: string;
    date: any;
    ownerID: string;
    ownerName: string;
    ownerAvatarSrc: string;

    constructor(obj?: any) {
        this.id = obj && obj.id ? obj.id : '';
        this.content = obj && obj.content ? obj.content : '';
        this.date = obj && obj.date ? obj.date : '';
        this.ownerID = obj && obj.ownerID ? obj.ownerID : '';
        this.ownerName = obj && obj.ownerName ? obj.ownerName : '';
        this.ownerAvatarSrc = obj && obj.ownerAvatarSrc ? obj.ownerAvatarSrc : '';
    }

    public toJSON() {
        return {
            id: this.id,
            content: this.content,
            date: this.date,
            ownerID: this.ownerID,
            ownerName: this.ownerName,
            ownerAvatarSrc: this.ownerAvatarSrc,
        };
    }
}