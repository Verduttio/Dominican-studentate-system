const getApiBaseUrl = (port: number) => {
    if(window.location.port === '80') {
        return `${window.location.protocol}//${window.location.hostname}`;
    } else {
        return `${window.location.protocol}//${window.location.hostname}:${port}`;
    }
}

// export const backendUrl : string  = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";
// export const frontendUrl : string  = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";

export const backendUrl : string  = getApiBaseUrl(8080) || "http://localhost:8080";
export const frontendUrl : string  = getApiBaseUrl(3000) || "http://localhost:3000";