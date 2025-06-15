// Theme manager for handling light/dark mode
const themes = {
    dark: {
        root: 'dark',
        body: ['bg-gradient-to-br', 'from-gray-900', 'via-purple-900', 'to-gray-900'],
        text: 'text-white',
        bg: 'bg-gray-800',
        border: 'border-gray-700',
        card: 'bg-gray-800',
        navbar: {
            bg: 'bg-gray-800',
            border: 'border-gray-700',
            text: 'text-white',
            hover: 'hover:bg-gray-700',
            active: 'bg-gray-700'
        },
        chart: {
            text: 'text-white',
            grid: 'text-gray-700',
            line: 'text-blue-400'
        }
    },
    light: {
        root: 'light',
        body: ['bg-gray-50'],
        text: 'text-gray-900',
        bg: 'bg-white',
        border: 'border-gray-200',
        card: 'bg-white',
        navbar: {
            bg: 'bg-white',
            border: 'border-gray-200',
            text: 'text-gray-900',
            hover: 'hover:bg-gray-100',
            active: 'bg-gray-100'
        },
        chart: {
            text: 'text-gray-900',
            grid: 'text-gray-300',
            line: 'text-blue-600'
        }
    }
};

// Original dark theme classes
const originalDarkTheme = {
    main: 'min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900',
    navbar: 'bg-gray-800 border-b border-gray-700',
    navItem: 'text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium',
    navActive: 'bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium',
    card: 'bg-gray-800 border border-gray-700 rounded-lg shadow-lg',
    text: 'text-white',
    border: 'border-gray-700',
    hover: 'hover:bg-gray-700'
};

// Function to update element classes
const updateElementClasses = (element, oldClasses, newClasses) => {
    if (!element) return;
    oldClasses.forEach(cls => element.classList.remove(cls));
    newClasses.forEach(cls => element.classList.add(cls));
};

// Function to apply theme
export const applyTheme = (isDark) => {
    const theme = isDark ? themes.dark : themes.light;
    const root = document.documentElement;
    const body = document.body;

    // Update root class
    root.className = theme.root;

    // Update body background
    body.className = ''; // Clear existing classes
    theme.body.forEach(cls => body.classList.add(cls));

    // Update main container and dashboard
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
        if (isDark) {
            // Restore original dark theme
            mainContainer.className = originalDarkTheme.main;
        } else {
            mainContainer.className = 'min-h-screen bg-gray-50';
        }
    }

    // Update main dashboard and settings containers
    const dashboardSection = document.querySelector('.dashboard-section, .dashboard-main, .dashboard-gradient, .dashboard-bg, .dashboard-root');
    if (dashboardSection) {
        if (isDark) {
            dashboardSection.className = 'dashboard-section bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6 rounded-lg';
        } else {
            dashboardSection.className = 'dashboard-section bg-white p-6 rounded-lg border border-gray-200';
        }
    }

    // Update settings main container
    const settingsSection = document.querySelector('.settings-section, .settings-main, .settings-gradient, .settings-bg, .settings-root');
    if (settingsSection) {
        if (isDark) {
            settingsSection.className = 'settings-section bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6 rounded-lg';
        } else {
            settingsSection.className = 'settings-section bg-white p-6 rounded-lg border border-gray-200';
        }
    }

    // Update all cards inside dashboard and settings
    document.querySelectorAll('.dashboard-section .card, .settings-section .card, .dashboard-section .rounded-lg, .settings-section .rounded-lg').forEach(el => {
        if (isDark) {
            el.className = 'card bg-gray-800 border border-gray-700 rounded-lg shadow-lg';
        } else {
            el.className = 'card bg-white border border-gray-200 rounded-lg shadow-lg';
        }
    });

    // Update dashboard container
    const dashboardContainer = document.querySelector('.dashboard-container');
    if (dashboardContainer) {
        if (isDark) {
            dashboardContainer.className = 'dashboard-container bg-gray-800';
        } else {
            dashboardContainer.className = 'dashboard-container bg-white';
        }
    }

    // Update navbar
    const navbar = document.querySelector('nav');
    if (navbar) {
        if (isDark) {
            // Restore original dark theme
            navbar.className = originalDarkTheme.navbar;

            // Update navbar items
            navbar.querySelectorAll('a, button').forEach(el => {
                el.className = originalDarkTheme.navItem;
            });

            // Update active item
            const activeItem = navbar.querySelector('[aria-current="page"]');
            if (activeItem) {
                activeItem.className = originalDarkTheme.navActive;
            }

            // Update logo/brand
            const brand = navbar.querySelector('.flex-shrink-0');
            if (brand) {
                brand.className = 'flex-shrink-0 text-white';
            }
        } else {
            // Light theme navbar
            navbar.className = 'bg-white border-b border-gray-200';

            // Update all navbar elements
            navbar.querySelectorAll('*').forEach(el => {
                // Update text colors
                if (el.classList.contains('text-white')) {
                    el.classList.remove('text-white');
                    el.classList.add('text-gray-900');
                }

                // Update backgrounds
                if (el.classList.contains('bg-gray-800')) {
                    el.classList.remove('bg-gray-800');
                    el.classList.add('bg-white');
                }

                // Update hover states
                if (el.classList.contains('hover:bg-gray-700')) {
                    el.classList.remove('hover:bg-gray-700');
                    el.classList.add('hover:bg-gray-100');
                }
            });

            // Update navbar items
            navbar.querySelectorAll('a, button').forEach(el => {
                el.className = 'text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium';
            });

            // Update active item
            const activeItem = navbar.querySelector('[aria-current="page"]');
            if (activeItem) {
                activeItem.className = 'bg-gray-100 text-gray-900 px-3 py-2 rounded-md text-sm font-medium';
            }

            // Update logo/brand
            const brand = navbar.querySelector('.flex-shrink-0');
            if (brand) {
                brand.className = 'flex-shrink-0 text-gray-900';
            }
        }
    }

    // Update all cards and containers
    document.querySelectorAll('.card, .container, .rounded-lg, .p-4, .p-6, .bg-gray-800, .bg-white, .bg-gray-50, [class*="bg-"]').forEach(el => {
        if (isDark) {
            // Restore original dark theme
            el.className = originalDarkTheme.card;
        } else {
            el.className = 'bg-white border border-gray-200 rounded-lg shadow-lg';
        }
    });

    // Update all text elements
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, button, a, label').forEach(el => {
        if (el.classList.contains('text-white') || el.classList.contains('text-gray-900')) {
            if (isDark) {
                el.className = originalDarkTheme.text;
            } else {
                el.className = 'text-gray-900';
            }
        }
    });

    // Update all borders
    document.querySelectorAll('.border-gray-700, .border-gray-200, [class*="border-"]').forEach(el => {
        if (isDark) {
            el.className = originalDarkTheme.border;
        } else {
            el.className = 'border-gray-200';
        }
    });

    // Update all hover states
    document.querySelectorAll('button, a, [class*="hover:"]').forEach(el => {
        if (isDark) {
            el.className = originalDarkTheme.hover;
        } else {
            el.className = 'hover:bg-gray-100';
        }
    });

    // Update all charts and graphs
    document.querySelectorAll('.recharts-wrapper, .chart-container, [class*="chart"]').forEach(el => {
        if (isDark) {
            // Restore original dark theme
            el.className = 'bg-gray-800 border border-gray-700 rounded-lg shadow-lg';
        } else {
            el.className = 'bg-white border border-gray-200 rounded-lg shadow-lg';
        }
    });

    // Update expenses screen
    document.querySelectorAll('.expense-card, .transaction-item, .expense-list, .expense-form, .expenses-container').forEach(el => {
        if (isDark) {
            // Restore original dark theme
            el.className = originalDarkTheme.card;
        } else {
            el.className = 'bg-white border border-gray-200 rounded-lg shadow-lg';
        }
    });

    // Update main dashboard background
    const dashboardBg = document.querySelector('.min-h-screen.bg-gradient-to-br.from-gray-900.via-purple-900.to-gray-900');
    if (dashboardBg) {
        if (isDark) {
            dashboardBg.className = 'min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900';
        } else {
            dashboardBg.className = 'min-h-screen bg-white';
        }
    }

    // Update all cards, charts, and containers with gradients or dark backgrounds
    document.querySelectorAll('[class*="bg-gradient-to-br"], [class*="from-indigo-600"], [class*="from-green-600"], [class*="from-red-600"], [class*="from-gray-900"], [class*="to-indigo-700"], [class*="to-green-700"], [class*="to-red-700"], [class*="to-gray-900"], .bg-gray-800, .bg-gray-700, .bg-opacity-50, .backdrop-blur-lg').forEach(el => {
        if (isDark) {
            // Restore original dark/gradient classes (skip for now, as original classes may be complex)
        } else {
            el.classList.remove('bg-gradient-to-br', 'from-indigo-600', 'to-indigo-700', 'from-green-600', 'to-green-700', 'from-red-600', 'to-red-700', 'from-gray-900', 'to-gray-900', 'bg-gray-800', 'bg-gray-700', 'bg-opacity-50', 'backdrop-blur-lg');
            el.classList.add('bg-white', 'border', 'border-gray-200', 'shadow-lg');
        }
    });

    // Force a reflow to ensure changes are applied
    void document.body.offsetHeight;
};

// Function to initialize theme
export const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const isDark = savedTheme === 'dark';
    applyTheme(isDark);
    return isDark;
};

// Function to toggle theme
export const toggleTheme = (isDark) => {
    applyTheme(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
};