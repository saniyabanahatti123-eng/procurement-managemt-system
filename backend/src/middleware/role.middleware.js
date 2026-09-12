const  authorizaRoles = (...allowedRoles) => {
    return (req,res,next) => {
        // check whther authenticated user exist
        if(!req.user) {
            return res.status(401).json({
                success: false,
                message: "authentication required"
            });
        }

        // check whether users role is allowed
        if(!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "you do not have the permission to access this resource"
            });

        }
        // user has required role
        next();
    }
}

export default authorizaRoles