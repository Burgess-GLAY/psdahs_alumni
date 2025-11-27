import {
    Home,
    PeopleAlt,
    EmojiEvents,
    Forum,
    ContactMail,
    Info,
    Dashboard,
    AdminPanelSettings,
    Image
} from '@mui/icons-material';

/**
 * Role-based navigation configuration
 * Defines which navigation items are visible for each user role
 */
export const navigationConfig = {
    guest: [
        { text: 'Home', path: '/', icon: <Home /> },
        { text: 'Events', path: '/events', icon: <EmojiEvents /> },
        { text: 'About', path: '/about', icon: <Info /> },
        { text: 'Contact', path: '/contact', icon: <ContactMail /> },
    ],
    user: [
        { text: 'Home', path: '/', icon: <Home /> },
        {
            text: 'Alumni',
            icon: <PeopleAlt />,
            children: [
                { text: 'Directory', path: '/alumni' },
                { text: 'Class Groups', path: '/classes' },
                { text: 'Community', path: '/community' },
                { text: 'Announcements', path: '/announcements' },
            ],
        },
        {
            text: 'Events & Media',
            icon: <EmojiEvents />,
            children: [
                { text: 'Events', path: '/events' },
                { text: 'Gallery', path: '/gallery' },
            ],
        },
        { text: 'Contact', path: '/contact', icon: <ContactMail /> },
    ],
    admin: [
        { text: 'Home', path: '/', icon: <Home /> },
        {
            text: 'Alumni',
            icon: <PeopleAlt />,
            children: [
                { text: 'Directory', path: '/alumni' },
                { text: 'Class Groups', path: '/classes' },
                { text: 'Community', path: '/community' },
                { text: 'Announcements', path: '/announcements' },
            ],
        },
        {
            text: 'Events & Media',
            icon: <EmojiEvents />,
            children: [
                { text: 'Events', path: '/events' },
                { text: 'Gallery', path: '/gallery' },
            ],
        },
        { text: 'Contact', path: '/contact', icon: <ContactMail /> },
    ],
};

/**
 * Get navigation items for a specific role
 * @param {string} role - The user role ('guest', 'user', or 'admin')
 * @returns {Array} Array of navigation items for the role
 */
export const getNavigationForRole = (role) => {
    return navigationConfig[role] || navigationConfig.guest;
};

/**
 * Get all paths accessible by a role (including nested children)
 * @param {string} role - The user role
 * @returns {Array<string>} Array of accessible paths
 */
export const getAccessiblePaths = (role) => {
    const navItems = getNavigationForRole(role);
    const paths = [];

    const extractPaths = (items) => {
        items.forEach((item) => {
            if (item.path) {
                paths.push(item.path);
            }
            if (item.children) {
                extractPaths(item.children);
            }
        });
    };

    extractPaths(navItems);
    return paths;
};
