

const API_METHODS = {
    GET: "get",
    POST: "post",
    PUT: "put",
    DELETE: "delete"
}
interface IApiParams {
    method: keyof typeof API_METHODS,
    endpoint: string,
    data?: object | string,
    headers?: Record<string, string>
}
