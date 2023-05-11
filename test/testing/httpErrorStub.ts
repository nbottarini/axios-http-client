import { HttpMethod } from '../../../src/_base/http/HttpMethod';
import { HttpError } from '../../../src/_base/http/errors/HttpError';

export function httpError(type: string, message: string = '', code = 400) {
    return new HttpError(new Error(), HttpMethod.GET, 'http://some.url', code, 'Bad Request', { type, message }, []);
}
