import { HttpRequest } from '../../../src/_base/http/HttpRequest';

export class FakeHttpRequest extends HttpRequest {

    addHeader(key: string, value: string) {
        this.headers[key] = value;
    }
}