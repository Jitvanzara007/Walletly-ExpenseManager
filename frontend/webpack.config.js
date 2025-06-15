module.exports = {
    devServer: {
        allowedHosts: 'all',
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                secure: false,
                changeOrigin: true
            }
        }
    }
};