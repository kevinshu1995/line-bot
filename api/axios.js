const axios = require("axios");
const axiosInstance = axios.create();

const apiLogPrefix = config => {
    return `axios fetch api: [${config?.method ?? "NULL"}] ${config?.url ?? "NULL"}\n`;
};

axiosInstance.interceptors.response.use(
    function (response) {
        const responseJson = {
            message: "Success",
            responses: Array.isArray(response) ? response.map(res => res.data) : response.data,
        };

        console.log(apiLogPrefix(response.config), JSON.stringify(responseJson, null, 2), "\n");
        return response;
    },
    function (error) {
        const errorData = (() => {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                return {
                    config: error.config,
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers,
                    message: error.message,
                };
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                return {
                    config: error.config,
                    request: error.request,
                    message: error.message,
                };
            } else {
                // Something happened in setting up the request that triggered an Error
                return {
                    config: error.config,
                    message: error.message,
                };
            }
        })();

        console.error(apiLogPrefix(error.config), JSON.stringify(errorData, null, 2), "\n");
        Promise.reject(errorData);
    }
);

module.exports = axiosInstance;

