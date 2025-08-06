// Paste the Sidebar.jsx code you provided here.
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faClipboardList, faBell, faGear, faCircleInfo, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom'; // Use Link for navigation

const Sidebar = () => {
    const [activeLink, setActiveLink] = useState('Dashboard');

    const navItems = [
        { name: 'Complaints', icon: faClipboardList, path: '/allissue' },
    ];

    const bottomNavItems = [
        { name: 'Settings', icon: faGear, path: '/settings' },
        { name: 'Help', icon: faCircleInfo, path: '/help' },
        { name: 'Logout', icon: faRightFromBracket, path: '/login' },
    ]

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <FontAwesomeIcon icon={faClipboardList} className="logo-icon" />
                <h1>FlatConnect</h1>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.name} className={activeLink === item.name ? 'active' : ''}>
                            <Link to={item.path} onClick={() => setActiveLink(item.name)}>
                                <FontAwesomeIcon icon={item.icon} />
                                <span>{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <nav className="sidebar-footer">
                 <ul>
                    {bottomNavItems.map((item) => (
                        <li key={item.name} className={activeLink === item.name ? 'active' : ''}>
                            <Link to={item.path} onClick={() => setActiveLink(item.name)}>
                                <FontAwesomeIcon icon={item.icon} />
                                <span>{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;