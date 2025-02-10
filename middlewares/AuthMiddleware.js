module.exports = async function (req, res, next) {
    try {
        // Check if the user is authenticated
        const user = req.user; // Populated by isLoggedIn middleware

        console.log("User is in admin middleware-------", user);

        // Validate if the user object exists
        if (!user) {
            console.log("No user found in request. Please log in first.");
            return res.status(401).json({ message: 'You need to log in first.' });
        }

        // Check if the user has the admin role
        if (user.role !== 'admin') {
            console.log("Access denied. User does not have admin privileges.");
            return res.status(403).json({ message: 'Access denied. Only admins can access this route.' });
        }

        // If the user is an admin, proceed
        console.log("User is authorized as admin. Proceeding to the next middleware...");
        next();
    } catch (err) {
        console.error('Error in isAdmin middleware:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
