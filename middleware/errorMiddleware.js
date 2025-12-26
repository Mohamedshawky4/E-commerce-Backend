export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Structured Logging
    console.error(`[GENESIS-ERROR] ${new Date().toISOString()}`);
    console.error(`Method: ${req.method} | URL: ${req.originalUrl}`);
    console.error(`Message: ${err.message}`);
    if (process.env.NODE_ENV !== "production") {
        console.error(`Stack: ${err.stack}`);
    }

    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};
