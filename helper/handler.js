
exports.errHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let errMessage = 'server error';

    if (err.name === "ValidationError") {
        const errors = err.errors
            ? (Array.isArray(err.errors) ? err.errors : Object.values(err.errors))
            : [];
        const error = errors.map(el => {
            return {
                path: el.path,
                message: el.message
            }
        })

        statusCode = 400;
        errMessage = error;
    }

    // PostgreSQL unique violation code is 23505 (11000 is MongoDB)
    if (err.code === '23505') {
        const match = err.detail ? err.detail.match(/\(([^)]+)\)/) : null;
        const field = match ? match[1] : 'unknown';
        errMessage = `duplicate value for field ${field}`;
        statusCode = 400;
    }

    if (process.env.NODE_URL === 'development') {
        res.status(statusCode).json({
            success: false,
            message: errMessage,
            stack: err.stack
        })
    } else {
        res.status(statusCode).json({
            success: false,
            error: errMessage || 'server error'
        })
    }
}
