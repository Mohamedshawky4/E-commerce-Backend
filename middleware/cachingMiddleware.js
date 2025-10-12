//caching middleware
import NodeCache from "node-cache";
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
export const cachingMiddleware = (req, res, next) => {
  const key = req.originalUrl || req.url;
  const cachedResponse = cache.get(key);
    if (cachedResponse) {
    return res.json(cachedResponse);
    } else {
    res.sendResponse = res.json;
    res.json = (body) => {
      cache.set(key, body);
      res.sendResponse(body);
    };
    next();
  }
};