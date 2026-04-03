const InclusiFundNav = (function () {
    'use strict';

    function init() {
        const appShell = document.querySelector('.app-shell');
        if (!appShell) return;

        // Remove existing sidebar
        const existingSidebar = appShell.querySelector('.app-sidebar');
        if (existingSidebar) existingSidebar.remove();

        // Create Sidebar
        const sidebar = document.createElement('aside');
        sidebar.className = 'app-sidebar';

        // Logo
        const logoDiv = document.createElement('div');
        logoDiv.className = 'sidebar-logo';
        logoDiv.textContent = 'InclusiFund';
        sidebar.appendChild(logoDiv);

        // Nav Links
        const nav = document.createElement('nav');
        nav.className = 'sidebar-nav';

        const currentPath = window.location.pathname;

        const menuItems = [
            { label: 'Dashboard', icon: '📊', href: 'dashboard.html', match: ['/dashboard', '/dashboard.html'] },
            { type: 'section', label: 'CORE TOOLS' },
            { label: 'Benefit Statement', icon: '✍️', href: 'benefit-statement.html', match: ['/benefit-statement', '/benefit-statement.html'] },
            { label: 'Business Model', icon: '📈', href: 'business-model.html', match: ['/business-model', '/business-model.html'] },
            { label: 'Eligibility', icon: '✅', href: 'eligibility-checker.html', match: ['/eligibility-checker', '/eligibility-checker.html'] },
            { type: 'section', label: 'COMPLIANCE' },
            { label: 'Deadlines', icon: '📅', href: 'compliance-calendar.html', match: ['/compliance-calendar', '/compliance-calendar.html'] },
            { label: 'CIC34 Report', icon: '📄', href: 'cic34-generator.html', match: ['/cic34-generator', '/cic34-generator.html'] },
            { type: 'section', label: 'FUNDING' },
            { label: 'Find Grants', icon: '🔍', href: 'grants-list.html', match: ['/grants-list', '/grant-filters'] },
            { type: 'spacer' },
            { label: 'Account Overview', icon: '👤', href: 'user-account-dashboard.html', match: ['/user-account-dashboard', '/user-account-dashboard.html'] },
            { label: 'Settings', icon: '⚙️', href: 'settings.html', match: ['/settings', '/settings.html'] },
            { label: 'Support & FAQ', icon: '❓', href: 'support.html', match: ['/support', '/support.html'] },
            { label: 'Logout', icon: '🚪', href: '#', id: 'logout-btn' }
        ];

        menuItems.forEach(item => {
            if (item.type === 'section') {
                const div = document.createElement('div');
                div.className = 'nav-section';
                div.textContent = item.label;
                nav.appendChild(div);
            } else if (item.type === 'spacer') {
                const div = document.createElement('div');
                div.style.marginTop = 'auto';
                nav.appendChild(div);
            } else {
                const a = document.createElement('a');
                a.href = item.href;
                a.className = 'nav-item';
                if (item.id) a.id = item.id;

                // Active State Logic
                let isActive = false;
                if (item.match) {
                    isActive = item.match.some(path => currentPath.includes(path));
                }
                if (isActive) a.classList.add('active');

                // Icon
                const iconSpan = document.createElement('span');
                iconSpan.className = 'nav-icon';
                iconSpan.textContent = item.icon;
                a.appendChild(iconSpan);

                // Text
                const textSpan = document.createElement('span');
                textSpan.textContent = item.label;
                a.appendChild(textSpan);

                nav.appendChild(a);
            }
        });

        sidebar.appendChild(nav);

        // User Profile
        const profile = document.createElement('div');
        profile.className = 'user-profile';
        profile.innerHTML = `
            <div class="avatar" id="user-avatar">IF</div>
            <div style="font-size: 0.875rem; overflow: hidden;">
                <div style="font-weight: 600; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;" id="user-name">Loading...</div>
                <div style="opacity: 0.7; font-size: 0.75rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;" id="user-email">...</div>
            </div>
        `;
        sidebar.appendChild(profile);

        // Prepend to shell
        appShell.prepend(sidebar);

        // Populate User Info
        if (window.InclusiFundAuth) {
            const user = InclusiFundAuth.checkSession();
            InclusiFundAuth.populateUserProfile(user);
            InclusiFundAuth.setupLogoutButton();
        }
    }

    document.addEventListener('DOMContentLoaded', init);
    return { init };
})();
