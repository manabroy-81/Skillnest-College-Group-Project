// Posts use remote image URLs today. Keeping normalization here makes it easy
// to add disk/cloud uploads later without changing controllers.
const normalizeImageFields = (req, res, next) => {
  for (const container of [req.body.post, req.body.user]) {
    if (!container) continue;
    for (const field of ["image", "profileImage", "bannerImage"]) {
      if (typeof container[field] === "string")
        container[field] = container[field].trim() || null;
    }
  }
  next();
};

module.exports = { normalizeImageFields };
