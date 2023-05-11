import each from 'jest-each'
import {
    BaseError,
    HttpError,
    HttpInterceptor,
    HttpMethod,
    HttpRequest,
    HttpResponse,
    NetworkError
} from '@nbottarini/abstract-http-client'
import { AxiosStub } from './testing/AxiosStub'
import { AxiosHttpClient } from '../src'
import { expectThrows } from './testing/expectThrows'

describe('get', () => {
    test('should execute an HTTP GET request to the given URL', async () => {
        const response = await httpClient().get('http://server.com/page?param1=45')

        expect(axios.getRequestedMethod()).toEqual('get')
        expect(axios.getRequestedUrl()).toEqual('http://server.com/page?param1=45')
        expect(response.method).toEqual(HttpMethod.GET)
        expect(response.url).toEqual('http://server.com/page?param1=45')
    })

    test('can set custom headers', async () => {
        await httpClient().get('http://server.com/page?param1=45', { 'myHeader': '1' })

        expect(axios.getRequestedHeaders()['myHeader']).toEqual('1')
    })

    each([
        'http://server.com/', 'http://server.com',
    ]).test('relativeUrl returns the url without the baseUrl', async (baseUrl: string) => {
        const response = await httpClient(baseUrl).get('http://server.com/page?param1=45')

        expect(response.relativeUrl).toEqual('/page?param1=45')
    })

    test('baseUrl returns the baseUrl', async () => {
        const baseUrl = 'http://server.com'
        const response = await httpClient(baseUrl).get('http://server.com/page?param1=45')

        expect(response.baseUrl).toEqual(baseUrl)
    })

    each([
        'http://server.com/', 'http://server.com',
    ]).test('url contains the absolute url', async (baseUrl) => {
        const response = await httpClient(baseUrl).get('/page?param1=45')

        expect(response.url).toEqual('http://server.com/page?param1=45')
    })

    test('body contains the response body', async () => {
        axios.setResponseBody('some body')

        const response = await httpClient().get('/page?param1=45')

        expect(response.body).toEqual('some body')
    })

    test('json body is converted to json', async () => {
        axios.setResponseBody('{"name":"John","lastname":"Lennon"}')

        const response = await httpClient().get('/page?param1=45')

        expect(response.body).toEqual({ name: 'John', lastname: 'Lennon' })
    })

    each([
        200, 404, 500,
    ]).test('status has the request status code', async (status: number) => {
        axios.setResponseStatus(status)

        const response = await httpClient().get('/page?param1=45')

        expect(response.status).toEqual(status)
    })

    test('headers contains the response headers', async () => {
        axios.setResponseHeader('Content-Type', 'application/json')
        axios.setResponseHeader('Server', 'Apache')

        const response = await httpClient().get('/page?param1=45')

        expect(response.headers).toEqual({ 'Content-Type': 'application/json', Server: 'Apache' })
    })

    test('network errors throws NetworkError', async () => {
        axios.setRequestError(new Error('Network Error'))

        await expectThrows(httpClient().get('http://notfound.com'), NetworkError)
    })

    test('http errors throws HttpError', async () => {
        axios.setRequestError(axiosError('Page not found', 404))

        await expectThrows(httpClient().get('http://notfound.com'), HttpError)
    })

    it('should intercept requests', async () => {
        const client = httpClient()
        client.addInterceptor(new AppendHelloInterceptor())

        await client.get('http://server.com/page')

        expect(axios.getRequestedUrl()).toEqual('http://server.com/page/hello')
    })

    it('should intercept responses', async () => {
        axios.setResponseBody('some body')
        const client = httpClient()
        client.addInterceptor(new AppendHelloInterceptor())

        const response = await client.get('http://server.com/page')

        expect(response.body).toEqual('some body/hello')
    })

    it('should intercept errors', async () => {
        axios.setRequestError(axiosError('Must update', 426))
        const client = httpClient()
        client.addInterceptor(new MyErrorOnStatusCodeInterceptor(426))

        await expectThrows(client.get('http://server.com/page'), MyError)
    })

    it('should intercept errors with multiple interceptors', async () => {
        axios.setRequestError(axiosError('Must update', 426))
        const client = httpClient()
        client.addInterceptor(new MyErrorOnStatusCodeInterceptor(426))
        client.addInterceptor(new MyOtherErrorOnMyErrorInterceptor())

        await expectThrows(client.get('http://server.com/page'), MyOtherError)
    })
})

describe('post', () => {
    test('should execute an HTTP POST request to the given URL', async () => {
        const response = await httpClient().post('http://server.com/page?param1=45')

        expect(axios.getRequestedMethod()).toEqual('post')
        expect(axios.getRequestedUrl()).toEqual('http://server.com/page?param1=45')
        expect(response.method).toEqual(HttpMethod.POST)
        expect(response.url).toEqual('http://server.com/page?param1=45')
    })

    test('can set custom headers', async () => {
        await httpClient().post('http://server.com/page?param1=45', null, { 'myHeader': '1' })

        expect(axios.getRequestedHeaders()['myHeader']).toEqual('1')
    })

    each([
        'http://server.com/', 'http://server.com',
    ]).test('relativeUrl returns the url without the baseUrl', async (baseUrl: string) => {
        const response = await httpClient(baseUrl).post('http://server.com/page?param1=45')

        expect(response.relativeUrl).toEqual('/page?param1=45')
    })

    test('baseUrl returns the baseUrl', async () => {
        const baseUrl = 'http://server.com'
        const response = await httpClient(baseUrl).post('http://server.com/page?param1=45')

        expect(response.baseUrl).toEqual(baseUrl)
    })

    each([
        'http://server.com/', 'http://server.com',
    ]).test('url contains the absolute url', async (baseUrl) => {
        const response = await httpClient(baseUrl).post('/page?param1=45')

        expect(response.url).toEqual('http://server.com/page?param1=45')
    })

    test('body contains the response body', async () => {
        axios.setResponseBody('some body')

        const response = await httpClient().post('/page?param1=45')

        expect(response.body).toEqual('some body')
    })

    test('json body is converted to json', async () => {
        axios.setResponseBody('{"name":"John","lastname":"Lennon"}')

        const response = await httpClient().post('/page?param1=45')

        expect(response.body).toEqual({ name: 'John', lastname: 'Lennon' })
    })

    each([
        200, 404, 500,
    ]).test('status has the request status code', async (status: number) => {
        axios.setResponseStatus(status)

        const response = await httpClient().post('/page?param1=45')

        expect(response.status).toEqual(status)
    })

    test('headers contains the response headers', async () => {
        axios.setResponseHeader('Content-Type', 'application/json')
        axios.setResponseHeader('Server', 'Apache')

        const response = await httpClient().post('/page?param1=45')

        expect(response.headers).toEqual({ 'Content-Type': 'application/json', Server: 'Apache' })
    })

    test('sends request body', async () => {
        const body = { userId: 1, newName: 'Hector' }

        await httpClient().post('/page?param1=45', body)

        expect(JSON.parse(axios.getRequestedData())).toEqual(body)
    })

    test('requestBody contains the request body', async () => {
        const body = { userId: 1, newName: 'Hector' }

        const response = await httpClient().post('/page?param1=45', body)

        expect(response.requestBody).toEqual(body)
    })

    test('network errors throws NetworkError', async () => {
        axios.setRequestError(new Error('Network Error'))

        await expectThrows(httpClient().post('http://notfound.com'), NetworkError)
    })

    test('http errors throws HttpError', async () => {
        axios.setRequestError(axiosError('Page not found', 404))

        await expectThrows(httpClient().post('http://notfound.com'), HttpError)
    })

    it('should intercept requests', async () => {
        const client = httpClient()
        client.addInterceptor(new AppendHelloInterceptor())

        await client.post('http://server.com/page')

        expect(axios.getRequestedUrl()).toEqual('http://server.com/page/hello')
    })

    it('should intercept responses', async () => {
        axios.setResponseBody('some body')
        const client = httpClient()
        client.addInterceptor(new AppendHelloInterceptor())

        const response = await client.post('http://server.com/page')

        expect(response.body).toEqual('some body/hello')
    })

    it('should intercept errors', async () => {
        axios.setRequestError(axiosError('Must update', 426))
        const client = httpClient()
        client.addInterceptor(new MyErrorOnStatusCodeInterceptor(426))

        await expectThrows(client.post('http://server.com/page'), MyError)
    })

    it('should intercept errors with multiple interceptors', async () => {
        axios.setRequestError(axiosError('Must update', 426))
        const client = httpClient()
        client.addInterceptor(new MyErrorOnStatusCodeInterceptor(426))
        client.addInterceptor(new MyOtherErrorOnMyErrorInterceptor())

        await expectThrows(client.post('http://server.com/page'), MyOtherError)
    })
})

describe('put', () => {
    test('should execute an HTTP PUT request to the given URL', async () => {
        const response = await httpClient().put('http://server.com/page?param1=45')

        expect(axios.getRequestedMethod()).toEqual('put')
        expect(axios.getRequestedUrl()).toEqual('http://server.com/page?param1=45')
        expect(response.method).toEqual(HttpMethod.PUT)
        expect(response.url).toEqual('http://server.com/page?param1=45')
    })

    test('can set custom headers', async () => {
        await httpClient().put('http://server.com/page?param1=45', null, { 'myHeader': '1' })

        expect(axios.getRequestedHeaders()['myHeader']).toEqual('1')
    })

    each([
        'http://server.com/', 'http://server.com',
    ]).test('relativeUrl returns the url without the baseUrl', async (baseUrl: string) => {
        const response = await httpClient(baseUrl).put('http://server.com/page?param1=45')

        expect(response.relativeUrl).toEqual('/page?param1=45')
    })

    test('baseUrl returns the baseUrl', async () => {
        const baseUrl = 'http://server.com'
        const response = await httpClient(baseUrl).put('http://server.com/page?param1=45')

        expect(response.baseUrl).toEqual(baseUrl)
    })

    each([
        'http://server.com/', 'http://server.com',
    ]).test('url contains the absolute url', async (baseUrl) => {
        const response = await httpClient(baseUrl).put('/page?param1=45')

        expect(response.url).toEqual('http://server.com/page?param1=45')
    })

    test('body contains the response body', async () => {
        axios.setResponseBody('some body')

        const response = await httpClient().put('/page?param1=45')

        expect(response.body).toEqual('some body')
    })

    test('json body is converted to json', async () => {
        axios.setResponseBody('{"name":"John","lastname":"Lennon"}')

        const response = await httpClient().put('/page?param1=45')

        expect(response.body).toEqual({ name: 'John', lastname: 'Lennon' })
    })

    each([
        200, 404, 500,
    ]).test('status has the request status code', async (status: number) => {
        axios.setResponseStatus(status)

        const response = await httpClient().put('/page?param1=45')

        expect(response.status).toEqual(status)
    })

    test('headers contains the response headers', async () => {
        axios.setResponseHeader('Content-Type', 'application/json')
        axios.setResponseHeader('Server', 'Apache')

        const response = await httpClient().put('/page?param1=45')

        expect(response.headers).toEqual({ 'Content-Type': 'application/json', Server: 'Apache' })
    })

    test('sends request body', async () => {
        const body = { userId: 1, newName: 'Hector' }

        await httpClient().put('/page?param1=45', body)

        expect(JSON.parse(axios.getRequestedData())).toEqual(body)
    })

    test('requestBody contains the request body', async () => {
        const body = { userId: 1, newName: 'Hector' }

        const response = await httpClient().put('/page?param1=45', body)

        expect(response.requestBody).toEqual(body)
    })

    test('network errors throws NetworkError', async () => {
        axios.setRequestError(new Error('Network Error'))

        await expectThrows(httpClient().put('http://notfound.com'), NetworkError)
    })

    test('http errors throws HttpError', async () => {
        axios.setRequestError(axiosError('Page not found', 404))

        await expectThrows(httpClient().put('http://notfound.com'), HttpError)
    })

    it('should intercept requests', async () => {
        const client = httpClient()
        client.addInterceptor(new AppendHelloInterceptor())

        await client.put('http://server.com/page')

        expect(axios.getRequestedUrl()).toEqual('http://server.com/page/hello')
    })

    it('should intercept responses', async () => {
        axios.setResponseBody('some body')
        const client = httpClient()
        client.addInterceptor(new AppendHelloInterceptor())

        const response = await client.put('http://server.com/page')

        expect(response.body).toEqual('some body/hello')
    })

    it('should intercept errors', async () => {
        axios.setRequestError(axiosError('Must update', 426))
        const client = httpClient()
        client.addInterceptor(new MyErrorOnStatusCodeInterceptor(426))

        await expectThrows(client.put('http://server.com/page'), MyError)
    })

    it('should intercept errors with multiple interceptors', async () => {
        axios.setRequestError(axiosError('Must update', 426))
        const client = httpClient()
        client.addInterceptor(new MyErrorOnStatusCodeInterceptor(426))
        client.addInterceptor(new MyOtherErrorOnMyErrorInterceptor())

        await expectThrows(client.put('http://server.com/page'), MyOtherError)
    })
})

describe('delete', () => {
    test('should execute an HTTP DELETE request to the given URL', async () => {
        const response = await httpClient().delete('http://server.com/page?param1=45')

        expect(axios.getRequestedMethod()).toEqual('delete')
        expect(axios.getRequestedUrl()).toEqual('http://server.com/page?param1=45')
        expect(response.method).toEqual(HttpMethod.DELETE)
        expect(response.url).toEqual('http://server.com/page?param1=45')
    })

    test('can set custom headers', async () => {
        await httpClient().delete('http://server.com/page?param1=45', { 'myHeader': '1' })

        expect(axios.getRequestedHeaders()['myHeader']).toEqual('1')
    })

    each([
        'http://server.com/', 'http://server.com',
    ]).test('relativeUrl returns the url without the baseUrl', async (baseUrl: string) => {
        const response = await httpClient(baseUrl).delete('http://server.com/page?param1=45')

        expect(response.relativeUrl).toEqual('/page?param1=45')
    })

    test('baseUrl returns the baseUrl', async () => {
        const baseUrl = 'http://server.com'
        const response = await httpClient(baseUrl).delete('http://server.com/page?param1=45')

        expect(response.baseUrl).toEqual(baseUrl)
    })

    each([
        'http://server.com/', 'http://server.com',
    ]).test('url contains the absolute url', async (baseUrl) => {
        const response = await httpClient(baseUrl).delete('/page?param1=45')

        expect(response.url).toEqual('http://server.com/page?param1=45')
    })

    test('body contains the response body', async () => {
        axios.setResponseBody('some body')

        const response = await httpClient().delete('/page?param1=45')

        expect(response.body).toEqual('some body')
    })

    test('json body is converted to json', async () => {
        axios.setResponseBody('{"name":"John","lastname":"Lennon"}')

        const response = await httpClient().delete('/page?param1=45')

        expect(response.body).toEqual({ name: 'John', lastname: 'Lennon' })
    })

    each([
        200, 404, 500,
    ]).test('status has the request status code', async (status: number) => {
        axios.setResponseStatus(status)

        const response = await httpClient().delete('/page?param1=45')

        expect(response.status).toEqual(status)
    })

    test('headers contains the response headers', async () => {
        axios.setResponseHeader('Content-Type', 'application/json')
        axios.setResponseHeader('Server', 'Apache')

        const response = await httpClient().delete('/page?param1=45')

        expect(response.headers).toEqual({ 'Content-Type': 'application/json', Server: 'Apache' })
    })

    test('network errors throws NetworkError', async () => {
        axios.setRequestError(new Error('Network Error'))

        await expectThrows(httpClient().delete('http://notfound.com'), NetworkError)
    })

    test('http errors throws HttpError', async () => {
        axios.setRequestError(axiosError('Page not found', 404))

        await expectThrows(httpClient().delete('http://notfound.com'), HttpError)
    })

    it('should intercept requests', async () => {
        const client = httpClient()
        client.addInterceptor(new AppendHelloInterceptor())

        await client.delete('http://server.com/page')

        expect(axios.getRequestedUrl()).toEqual('http://server.com/page/hello')
    })

    it('should intercept responses', async () => {
        axios.setResponseBody('some body')
        const client = httpClient()
        client.addInterceptor(new AppendHelloInterceptor())

        const response = await client.delete('http://server.com/page')

        expect(response.body).toEqual('some body/hello')
    })

    it('should intercept errors', async () => {
        axios.setRequestError(axiosError('Must update', 426))
        const client = httpClient()
        client.addInterceptor(new MyErrorOnStatusCodeInterceptor(426))

        await expectThrows(client.delete('http://server.com/page'), MyError)
    })

    it('should intercept errors with multiple interceptors', async () => {
        axios.setRequestError(axiosError('Must update', 426))
        const client = httpClient()
        client.addInterceptor(new MyErrorOnStatusCodeInterceptor(426))
        client.addInterceptor(new MyOtherErrorOnMyErrorInterceptor())

        await expectThrows(client.delete('http://server.com/page'), MyOtherError)
    })
})

describe('patch', () => {
    test('should execute an HTTP PATCH request to the given URL', async () => {
        const response = await httpClient().patch('http://server.com/page?param1=45')

        expect(axios.getRequestedMethod()).toEqual('patch')
        expect(axios.getRequestedUrl()).toEqual('http://server.com/page?param1=45')
        expect(response.method).toEqual(HttpMethod.PATCH)
        expect(response.url).toEqual('http://server.com/page?param1=45')
    })

    test('can set custom headers', async () => {
        await httpClient().patch('http://server.com/page?param1=45', null, { 'myHeader': '1' })

        expect(axios.getRequestedHeaders()['myHeader']).toEqual('1')
    })

    each([
        'http://server.com/', 'http://server.com',
    ]).test('relativeUrl returns the url without the baseUrl', async (baseUrl: string) => {
        const response = await httpClient(baseUrl).patch('http://server.com/page?param1=45')

        expect(response.relativeUrl).toEqual('/page?param1=45')
    })

    test('baseUrl returns the baseUrl', async () => {
        const baseUrl = 'http://server.com'
        const response = await httpClient(baseUrl).patch('http://server.com/page?param1=45')

        expect(response.baseUrl).toEqual(baseUrl)
    })

    each([
        'http://server.com/', 'http://server.com',
    ]).test('url contains the absolute url', async (baseUrl) => {
        const response = await httpClient(baseUrl).patch('/page?param1=45')

        expect(response.url).toEqual('http://server.com/page?param1=45')
    })

    test('body contains the response body', async () => {
        axios.setResponseBody('some body')

        const response = await httpClient().patch('/page?param1=45')

        expect(response.body).toEqual('some body')
    })

    test('json body is converted to json', async () => {
        axios.setResponseBody('{"name":"John","lastname":"Lennon"}')

        const response = await httpClient().patch('/page?param1=45')

        expect(response.body).toEqual({ name: 'John', lastname: 'Lennon' })
    })

    each([
        200, 404, 500,
    ]).test('status has the request status code', async (status: number) => {
        axios.setResponseStatus(status)

        const response = await httpClient().patch('/page?param1=45')

        expect(response.status).toEqual(status)
    })

    test('headers contains the response headers', async () => {
        axios.setResponseHeader('Content-Type', 'application/json')
        axios.setResponseHeader('Server', 'Apache')

        const response = await httpClient().patch('/page?param1=45')

        expect(response.headers).toEqual({ 'Content-Type': 'application/json', Server: 'Apache' })
    })

    test('sends request body', async () => {
        const body = { userId: 1, newName: 'Hector' }

        await httpClient().patch('/page?param1=45', body)

        expect(JSON.parse(axios.getRequestedData())).toEqual(body)
    })

    test('requestBody contains the request body', async () => {
        const body = { userId: 1, newName: 'Hector' }

        const response = await httpClient().patch('/page?param1=45', body)

        expect(response.requestBody).toEqual(body)
    })

    test('network errors throws NetworkError', async () => {
        axios.setRequestError(new Error('Network Error'))

        await expectThrows(httpClient().patch('http://notfound.com'), NetworkError)
    })

    test('http errors throws HttpError', async () => {
        axios.setRequestError(axiosError('Page not found', 404))

        await expectThrows(httpClient().patch('http://notfound.com'), HttpError)
    })

    it('should intercept requests', async () => {
        const client = httpClient()
        client.addInterceptor(new AppendHelloInterceptor())

        await client.patch('http://server.com/page')

        expect(axios.getRequestedUrl()).toEqual('http://server.com/page/hello')
    })

    it('should intercept responses', async () => {
        axios.setResponseBody('some body')
        const client = httpClient()
        client.addInterceptor(new AppendHelloInterceptor())

        const response = await client.patch('http://server.com/page')

        expect(response.body).toEqual('some body/hello')
    })

    it('should intercept errors', async () => {
        axios.setRequestError(axiosError('Must update', 426))
        const client = httpClient()
        client.addInterceptor(new MyErrorOnStatusCodeInterceptor(426))

        await expectThrows(client.patch('http://server.com/page'), MyError)
    })

    it('should intercept errors with multiple interceptors', async () => {
        axios.setRequestError(axiosError('Must update', 426))
        const client = httpClient()
        client.addInterceptor(new MyErrorOnStatusCodeInterceptor(426))
        client.addInterceptor(new MyOtherErrorOnMyErrorInterceptor())

        await expectThrows(client.patch('http://server.com/page'), MyOtherError)
    })
})

describe('head', () => {
    test('should execute an HTTP HEAD request to the given URL', async () => {
        const response = await httpClient().head('http://server.com/page?param1=45')

        expect(axios.getRequestedMethod()).toEqual('head')
        expect(axios.getRequestedUrl()).toEqual('http://server.com/page?param1=45')
        expect(response.method).toEqual(HttpMethod.HEAD)
        expect(response.url).toEqual('http://server.com/page?param1=45')
    })

    test('can set custom headers', async () => {
        await httpClient().head('http://server.com/page?param1=45', { 'myHeader': '1' })

        expect(axios.getRequestedHeaders()['myHeader']).toEqual('1')
    })

    each([
        'http://server.com/', 'http://server.com',
    ]).test('relativeUrl returns the url without the baseUrl', async (baseUrl: string) => {
        const response = await httpClient(baseUrl).head('http://server.com/page?param1=45')

        expect(response.relativeUrl).toEqual('/page?param1=45')
    })

    test('baseUrl returns the baseUrl', async () => {
        const baseUrl = 'http://server.com'
        const response = await httpClient(baseUrl).head('http://server.com/page?param1=45')

        expect(response.baseUrl).toEqual(baseUrl)
    })

    each([
        'http://server.com/', 'http://server.com',
    ]).test('url contains the absolute url', async (baseUrl) => {
        const response = await httpClient(baseUrl).head('/page?param1=45')

        expect(response.url).toEqual('http://server.com/page?param1=45')
    })

    each([
        200, 404, 500,
    ]).test('status has the request status code', async (status: number) => {
        axios.setResponseStatus(status)

        const response = await httpClient().head('/page?param1=45')

        expect(response.status).toEqual(status)
    })

    test('headers contains the response headers', async () => {
        axios.setResponseHeader('Content-Type', 'application/json')
        axios.setResponseHeader('Server', 'Apache')

        const response = await httpClient().head('/page?param1=45')

        expect(response.headers).toEqual({ 'Content-Type': 'application/json', Server: 'Apache' })
    })

    test('network errors throws NetworkError', async () => {
        axios.setRequestError(new Error('Network Error'))

        await expectThrows(httpClient().head('http://notfound.com'), NetworkError)
    })

    test('http errors throws HttpError', async () => {
        axios.setRequestError(axiosError('Page not found', 404))

        await expectThrows(httpClient().head('http://notfound.com'), HttpError)
    })

    it('should intercept requests', async () => {
        const client = httpClient()
        client.addInterceptor(new AppendHelloInterceptor())

        await client.head('http://server.com/page')

        expect(axios.getRequestedUrl()).toEqual('http://server.com/page/hello')
    })

    it('should intercept responses', async () => {
        axios.setResponseBody('some body')
        const client = httpClient()
        client.addInterceptor(new AppendHelloInterceptor())

        const response = await client.head('http://server.com/page')

        expect(response.body).toEqual('some body/hello')
    })

    it('should intercept errors', async () => {
        axios.setRequestError(axiosError('Must update', 426))
        const client = httpClient()
        client.addInterceptor(new MyErrorOnStatusCodeInterceptor(426))

        await expectThrows(client.head('http://server.com/page'), MyError)
    })

    it('should intercept errors with multiple interceptors', async () => {
        axios.setRequestError(axiosError('Must update', 426))
        const client = httpClient()
        client.addInterceptor(new MyErrorOnStatusCodeInterceptor(426))
        client.addInterceptor(new MyOtherErrorOnMyErrorInterceptor())

        await expectThrows(client.head('http://server.com/page'), MyOtherError)
    })
})

describe('send', () => {
    test('should execute request to the given URL and http method', async () => {
        const response = await httpClient().send(new HttpRequest(HttpMethod.POST, 'http://server.com/page?param1=45'))

        expect(axios.getRequestedMethod()).toEqual('post')
        expect(axios.getRequestedUrl()).toEqual('http://server.com/page?param1=45')
        expect(response.method).toEqual(HttpMethod.POST)
        expect(response.url).toEqual('http://server.com/page?param1=45')
    })

    test('can set custom headers', async () => {
        let request = new HttpRequest(HttpMethod.POST, 'http://server.com/page?param1=45', null, { 'myHeader': '1' })

        await httpClient().send(request)

        expect(axios.getRequestedHeaders()['myHeader']).toEqual('1')
    })

    each([
        'http://server.com/', 'http://server.com',
    ]).test('relativeUrl returns the url without the baseUrl', async (baseUrl: string) => {
        const response = await httpClient(baseUrl).send(new HttpRequest(HttpMethod.POST, 'http://server.com/page?param1=45'))

        expect(response.relativeUrl).toEqual('/page?param1=45')
    })

    test('baseUrl returns the baseUrl', async () => {
        const baseUrl = 'http://server.com'
        const response = await httpClient(baseUrl).send(new HttpRequest(HttpMethod.GET, 'http://server.com/page?param1=45'))

        expect(response.baseUrl).toEqual(baseUrl)
    })

    each([
        'http://server.com/', 'http://server.com',
    ]).test('url contains the absolute url', async (baseUrl) => {
        const response = await httpClient(baseUrl).send(new HttpRequest(HttpMethod.POST, '/page?param1=45'))

        expect(response.url).toEqual('http://server.com/page?param1=45')
    })

    test('body contains the response body', async () => {
        axios.setResponseBody('some body')

        const response = await httpClient().send(new HttpRequest(HttpMethod.POST, '/page?param1=45'))

        expect(response.body).toEqual('some body')
    })

    test('json body is converted to json', async () => {
        axios.setResponseBody('{"name":"John","lastname":"Lennon"}')

        const response = await httpClient().send(new HttpRequest(HttpMethod.POST, '/page?param1=45'))

        expect(response.body).toEqual({ name: 'John', lastname: 'Lennon' })
    })

    each([
        200, 404, 500,
    ]).test('status has the request status code', async (status: number) => {
        axios.setResponseStatus(status)

        const response = await httpClient().send(new HttpRequest(HttpMethod.POST, '/page?param1=45'))

        expect(response.status).toEqual(status)
    })

    test('headers contains the response headers', async () => {
        axios.setResponseHeader('Content-Type', 'application/json')
        axios.setResponseHeader('Server', 'Apache')

        const response = await httpClient().send(new HttpRequest(HttpMethod.POST, '/page?param1=45'))

        expect(response.headers).toEqual({ 'Content-Type': 'application/json', Server: 'Apache' })
    })

    test('sends request body', async () => {
        const body = { userId: 1, newName: 'Hector' }

        await httpClient().send(new HttpRequest(HttpMethod.POST, '/page?param1=45', body))

        expect(JSON.parse(axios.getRequestedData())).toEqual(body)
    })

    test('requestBody contains the request body', async () => {
        const body = { userId: 1, newName: 'Hector' }

        const response = await httpClient().send(new HttpRequest(HttpMethod.POST, '/page?param1=45', body))

        expect(response.requestBody).toEqual(body)
    })

    test('network errors throws NetworkError', async () => {
        axios.setRequestError(new Error('Network Error'))

        await expectThrows(httpClient().send(new HttpRequest(HttpMethod.POST, 'http://notfound.com')), NetworkError)
    })

    test('http errors throws HttpError', async () => {
        axios.setRequestError(axiosError('Page not found', 404))

        await expectThrows(httpClient().send(new HttpRequest(HttpMethod.POST, 'http://notfound.com')), HttpError)
    })

    it('should intercept requests', async () => {
        const client = httpClient()
        client.addInterceptor(new AppendHelloInterceptor())

        await client.send(new HttpRequest(HttpMethod.POST, 'http://server.com/page'))

        expect(axios.getRequestedUrl()).toEqual('http://server.com/page/hello')
    })

    it('should intercept responses', async () => {
        axios.setResponseBody('some body')
        const client = httpClient()
        client.addInterceptor(new AppendHelloInterceptor())

        const response = await client.send(new HttpRequest(HttpMethod.POST, 'http://server.com/page'))

        expect(response.body).toEqual('some body/hello')
    })

    it('should intercept errors', async () => {
        axios.setRequestError(axiosError('Must update', 426))
        const client = httpClient()
        client.addInterceptor(new MyErrorOnStatusCodeInterceptor(426))

        await expectThrows(client.send(new HttpRequest(HttpMethod.POST, 'http://server.com/page')), MyError)
    })

    it('should intercept errors with multiple interceptors', async () => {
        axios.setRequestError(axiosError('Must update', 426))
        const client = httpClient()
        client.addInterceptor(new MyErrorOnStatusCodeInterceptor(426))
        client.addInterceptor(new MyOtherErrorOnMyErrorInterceptor())

        await expectThrows(client.send(new HttpRequest(HttpMethod.POST, 'http://server.com/page')), MyOtherError)
    })

    it('should notify request progress on given callback', async () => {
        let request = new HttpRequest(HttpMethod.POST, 'http://server.com/page')
        let notifiedPercents: number[] = []
        const onProgress = (number) => notifiedPercents.push(number)
        await httpClient().send(request, onProgress)

        axios.notifyUploadProgress({ loaded: 10000000, total: 20000000 })
        axios.notifyUploadProgress({ loaded: 15000000, total: 20000000 })
        axios.notifyUploadProgress({ loaded: 20000000, total: 20000000 })

        expect(notifiedPercents).toEqual([50, 75, 100])
    })
})

beforeEach(() => {
    axios = new AxiosStub()
})

function axiosError(data: any, status: number): any {
    const error: any = new Error('Http error')
    error.response = {
        data,
        status,
    }
    return error
}

function httpClient(baseUrl = ''): AxiosHttpClient {
    return new AxiosHttpClient(baseUrl, axios.getAdapter())
}

class AppendHelloInterceptor implements HttpInterceptor {
    async onRequest(request: HttpRequest) {
        request.url += '/hello'
    }

    async onResponse(response: HttpResponse<any>) {
        response.body += '/hello'
    }
}

class MyError extends BaseError {}
class MyOtherError extends BaseError {}

class MyErrorOnStatusCodeInterceptor implements HttpInterceptor {
    constructor(private expectedStatusCode: number) {
    }

    onError(error: Error): Error {
        if (!(error instanceof HttpError) || error.status !== this.expectedStatusCode) return error
        return new MyError()
    }
}

class MyOtherErrorOnMyErrorInterceptor implements HttpInterceptor {
    onError(error: Error): Error {
        if (!(error instanceof MyError)) return error
        return new MyOtherError()
    }
}

let axios: AxiosStub
