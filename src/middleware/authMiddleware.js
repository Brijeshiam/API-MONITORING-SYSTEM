const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check header
        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided",
            });
        }

        // Check format
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Invalid token format",
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🔥 IMPROVEMENT: attach only useful data
        req.user = {
            id: decoded.id,
        };

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};

module.exports = protect;