const AppError = require('../../errors/AppError');

class BaseService {
  /**
   * Throws 404 if document is null
   */
  throwIfNotFound(doc, message = 'Resource not found') {
    if (!doc) {
      throw new AppError(message, 404);
    }
    return doc;
  }

  /**
   * Build pagination options from query params
   */
  paginate(query = {}) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * Build standard paginated response
   */
  paginatedResponse(data, total, page, limit) {
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }
}

module.exports = BaseService;
