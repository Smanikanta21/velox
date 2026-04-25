export interface UserProfile {
    name: string;
    email: string;
}

export class User {
    constructor(public name: string, public email: string) {}

    static fromJSON(data: any): User {
        return new User(data.user_name || "User", data.user_email || "");
    }
}
