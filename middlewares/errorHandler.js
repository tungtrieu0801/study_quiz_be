module.exports = (err, req, res, next) => {
    // Default values
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';

    res.status(statusCode).json({
        success: false,
        status,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
