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
            { label: 'Dashboard', icon: '📊', href: 'dashboard-2.0.html', match: ['/dashboard'] },
            { type: 'section', label: 'CORE TOOLS' },
            { label: 'Benefit Statement', icon: '✍️', href: 'benefit-statement-2.0.html', match: ['/benefit-statement'] },
            { label: 'Business Model', icon: '📈', href: 'business-model-2.0.html', match: ['/business-model'] },
            { label: 'Eligibility', icon: '✅', href: 'eligibility-checker-2.0.html', match: ['/eligibility-checker'] },
            { type: 'section', label: 'COMPLIANCE' },
            { label: 'Deadlines', icon: '📅', href: 'compliance-calendar-2.0.html', match: ['/compliance-calendar'] },
            { label: 'CIC34 Report', icon: '📄', href: 'cic34-generator-2.0.html', match: ['/cic34-generator'] },
            { type: 'section', label: 'FUNDING' },
            { label: 'Find Grants', icon: '🔍', href: 'grants-list-2.0.html', match: ['/grants-list', '/grant-filters'] },
            { type: 'spacer' },
            { label: 'Account Overview', icon: '👤', href: 'user-account-dashboard-2.0.html', match: ['/user-account-dashboard'] },
            { label: 'Settings', icon: '⚙️', href: 'settings-2.0.html', match: ['/settings'] },
            { label: 'Support & FAQ', icon: '❓', href: 'support-2.0.html', match: ['/support'] },
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
