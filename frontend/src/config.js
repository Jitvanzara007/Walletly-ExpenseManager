const config = {
    API_URL: process.env.REACT_APP_API_URL
};

if (!config.API_URL) {
    console.error('REACT_APP_API_URL environment variable is not set');
}

export default config;