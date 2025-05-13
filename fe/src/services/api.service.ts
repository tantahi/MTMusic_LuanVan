const commonHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const apiBaseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const authHeader = (token?: string) => {
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
};

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

const createApiClient = (baseURL: string = apiBaseURL) => {
  const fetchApi = async (
    url: string,
    options: RequestInit = {}
  ): Promise<any> => {
    try {
      const response = await fetch(baseURL + url, {
        ...options,
        headers: {
          ...commonHeaders,
          ...options.headers,
        },
        credentials: 'include',
      });

      if (response.status === 204) {
        return {}; // Trả về đối tượng rỗng cho status 204 No Content
      }

      const data = await response.json();

      if (!response.ok) {
        return Promise.reject(data.error);
      }

      return Promise.resolve(data);
    } catch (error) {
      console.error('Fetch Error:', error);
      throw new Error('Failed to fetch data');
    }
  };

  return {
    get: (url: string, token?: string, options?: RequestOptions) =>
      fetchApi(url, {
        ...options,
        method: 'GET',
        headers: Object.assign({}, authHeader(token), options?.headers),
      }),
    post: (url: string, data: any, token?: string, options?: RequestOptions) =>
      fetchApi(url, {
        ...options,
        method: 'POST',
        headers: Object.assign({}, authHeader(token), options?.headers),
        body: JSON.stringify(data),
      }),
    put: (url: string, data: any, token?: string, options?: RequestOptions) =>
      fetchApi(url, {
        ...options,
        method: 'PUT',
        headers: Object.assign({}, authHeader(token), options?.headers),
        body: JSON.stringify(data),
      }),
    delete: (url: string, token?: string, options?: RequestOptions) =>
      fetchApi(url, {
        ...options,
        method: 'DELETE',
        headers: Object.assign({}, authHeader(token), options?.headers),
      }),
  };
};

export default createApiClient;

interface MultipartRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const createMultipartApiClient = (baseURL: string = apiBaseURL) => {
  const fetchMultipart = async (
    url: string,
    options: MultipartRequestOptions = {}
  ): Promise<any> => {
    try {
      const response = await fetch(baseURL + url, {
        ...options,
        headers: Object.assign(
          {},
          { Accept: 'multipart/form-data' },
          options.headers
        ),
        credentials: 'include',
      });

      if (response.status === 204) {
        return {}; // Trả về đối tượng rỗng cho status 204 No Content
      }

      const data = await response.json();

      if (!response.ok) {
        return Promise.reject(data.error);
      }

      return Promise.resolve(data);
    } catch (error) {
      console.error('Fetch Error:', error);
      throw new Error('Failed to connect to the server');
    }
  };

  return {
    get: (url: string, token?: string, options?: MultipartRequestOptions) =>
      fetchMultipart(url, {
        ...options,
        method: 'GET',
        headers: Object.assign({}, authHeader(token), options?.headers),
      }),
    post: (
      url: string,
      data: any,
      token?: string,
      options?: MultipartRequestOptions
    ) =>
      fetchMultipart(url, {
        ...options,
        method: 'POST',
        headers: Object.assign({}, authHeader(token), options?.headers),
        body: data,
      }),
    put: (
      url: string,
      data: any,
      token?: string,
      options?: MultipartRequestOptions
    ) =>
      fetchMultipart(url, {
        ...options,
        method: 'PUT',
        headers: Object.assign({}, authHeader(token), options?.headers),
        body: data,
      }),
    delete: (url: string, token?: string, options?: MultipartRequestOptions) =>
      fetchMultipart(url, {
        ...options,
        method: 'DELETE',
        headers: Object.assign({}, authHeader(token), options?.headers),
      }),
  };
};
