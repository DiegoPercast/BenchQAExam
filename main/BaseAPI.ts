import { request, APIRequestContext } from '@playwright/test';

export class BaseAPI {
    protected requestContext!: APIRequestContext;
    protected baseURL: string = 'https://rickandmortyapi.com/api';

    async init() {  
        this.requestContext = await request.newContext();
    }
}
