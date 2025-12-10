const loggerUtil = {
    info: (message) => {
        console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
    },
    error: (message) => {
        console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
    },
    warn: (message) => {
        console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
    }
};

// Middleware for Express
const loggerMiddleware = (req, res, next) => {
    loggerUtil.info(`${req.method} ${req.path}`);
    next();
};

module.exports = loggerMiddleware;