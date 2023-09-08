export class User {
   // userId: any; 
    name: string;
    email: string;
    password: string;
    loggedIn: boolean;
    isActive: boolean;
    chanel: string;
    profile: any;

    constructor(obj?: any) {
       // this.userId = obj ? obj.userId : ''; 
        this.name = obj ? obj.name : '';
        this.email = obj ? obj.email : '';
        this.password = obj ? obj.password : '';
        this.loggedIn = obj ? obj.loggedIn : false; 
        this.isActive = obj ? obj.isActive : false;
        this.chanel = obj ? obj.chanel : '';
        this.profile = obj ? obj.profile : '';
    }

    public toJSON() {
        return {
            //userId: this.userId, 
            name: this.name,
            email: this.email,
            password: this.password,
            loggedIn: this.loggedIn,
            isActive: this.isActive,
            chanel: this.chanel,
            profile: this.profile
        };
    }
}