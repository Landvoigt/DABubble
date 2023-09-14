export class Thread {
    name: string;
    content: string;
    owner: string;
    date: any;
    members: any[] = [];
    answers: any[] = [];

    constructor(obj?: any) {
        this.name = obj && obj.name ? obj.name : '';
        this.content = obj && obj.content ? obj.content : '';
        this.owner = obj && obj.owner ? obj.owner : '';
        this.date = obj && obj.date ? obj.date : '';
        this.members = obj && obj.members ? obj.members : [];
        this.answers = obj && obj.answers ? obj.answers : [];
    }

    public toJSON() {
        return {
            name: this.name,
            content: this.content,
            owner: this.owner,
            date: this.date,
            members: this.members,
            answers: this.answers
        };
    }
}