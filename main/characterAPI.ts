import { BaseAPI } from './BaseAPI';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

export interface Character {
    name: string;
    status: string;
    species: string;
    gender: string;
    origin: { name: string };
    location: { name: string };
}
export class CharacterAPI extends BaseAPI {

    private characterEndpoint = '/character';

    async init() { 
        await super.init();
    }

    async getAllCharacters(callIteration: string = '') {
        return await this.requestContext.get(`${this.baseURL}${this.characterEndpoint}${callIteration}`);
    }

    async getCharacterById(id: number) {
        return await this.requestContext.get(`${this.baseURL}${this.characterEndpoint}/${id}`);
    }

    async getRandomCharacter() {
        const response = await this.getAllCharacters();
        const { info } = await response.json();
        const randomId = Math.floor(Math.random() * info.count) + 1;
        return await (await this.getCharacterById(randomId)).json();
    }

    async getMultipleCharacters(ids: string) {
        return await this.requestContext.get(`${this.baseURL}${this.characterEndpoint}/${ids}`);
    }

    async filterByQueryParams(param: string, value: string) {
        return await this.requestContext.get(`${this.baseURL}${this.characterEndpoint}`, {
            params: { [param]: value },
        });
    }

    async readCSVtoJSON(): Promise<any> {
        const fileContent = fs.readFileSync('./test_data/username.csv', 'utf-8');
        console.log(fileContent);

        const csvContent = parse(fileContent, {
            columns: true,
            cast: (value, context) => {
                if (context.column === "id") return Number(value)
                return value
            }
        });
        console.log(csvContent);
        return csvContent
    }
}
