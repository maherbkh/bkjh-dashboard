export default defineEventHandler((event) => {
    throw createError({
        statusCode: 404,
        message: 'Directory Access Not Allowed',
    });
});
