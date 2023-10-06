export class DirectMessage {
    date: any;
    members: any[] = [];
    id: any;

    constructor(obj?: any) {
        this.date = obj && obj.date ? obj.date : '';
        this.members = obj && obj.members ? obj.members : [];
        this.id = obj && obj.id ? obj.id : '';
    }

    public toJSON() {
        return {
            date: this.date,
            members: this.members,
            id: this.id
        };
    }
}