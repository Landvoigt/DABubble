export class Channel {
    name: string;
    description: string;
    owner: string;
    date: any;
    members: any[] = [];
    id: any;

    constructor(obj?: any) {
        this.name = obj && obj.name ? obj.name : '';
        this.description = obj && obj.description ? obj.description : '';
        this.owner = obj && obj.owner ? obj.owner : '';
        this.date = obj && obj.date ? obj.date : '';
        this.members = obj && obj.members ? obj.members : [];
        this.id = obj && obj.id ? obj.id : '';
    }

    public toJSON() {
        return {
            name: this.name,
            description: this.description,
            owner: this.owner,
            date: this.date,
            members: this.members,
            id: this.id
        };
    }
}