export class User {
    id: any;
    name: string;
    email: string;
    password: string;
    loggedIn: boolean;
    isActive: boolean;
    friends: string[];
    channels: string[];
    avatarSrc: any;

    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.name = obj ? obj.name : '';
        this.email = obj ? obj.email : '';
        this.password = obj ? obj.password : '';
        this.loggedIn = obj ? obj.loggedIn : false;
        this.isActive = obj ? obj.isActive : false;
        this.friends = obj ? obj.friends : '';
        this.channels = obj ? obj.channels : '';
        this.avatarSrc = obj ? obj.avatarSrc : '';
    }

    public toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            password: this.password,
            loggedIn: this.loggedIn,
            isActive: this.isActive,
            friends: this.friends,
            channels: this.channels,
            avatarSrc: this.avatarSrc
        };
    }
}