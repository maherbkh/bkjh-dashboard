/**
 * Handles GET /static/ and GET /static to avoid unhandled 404 when
 * buildAssetsDir is /static/ and directory index is requested (e.g. by crawlers or links).
 * Returns a proper 404 response so the request is handled and does not bubble as unhandled.
 */
export default defineEventHandler((event) => {
    setResponseStatus(event, 404);
    return {
        statusCode: 404,
        message: 'Not Found',
    };
});
