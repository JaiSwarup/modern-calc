export type Workbook = {
    id: string;
    name: string;
    owner: string;
    sheets: any[];
    allowedUsers: any[];
};

export type User = {
    id: string;
    username: string;
    email: string;
    clerkId: string;
    workbooks: any[];
};

export type Sheet = {
    id: string;
    name: string;
    config: any;
    order: number;
    color: string;
};
