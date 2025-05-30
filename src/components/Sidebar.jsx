import { useState } from 'react';
import { ActivityStatus } from './ActivityStatus';
import { MenuIcon } from './MenuIcon';
import './Sidebar.css';

export function Sidebar({ activeTab, setActiveTab, onlinePlayers }) {
  const [collapsed, setCollapsed] = useState(false);
  
  const menuItems = [
    { id: 'play', icon: 'play', label: 'Играть' },
    { id: 'shop', icon: 'shop', label: 'Магазин' },
    { id: 'news', icon: 'news', label: 'Новости' },
    { id: 'friends', icon: 'forum', label: 'Друзья' },
    { id: 'discord', icon: 'discord', label: 'Discord' },
    { id: 'mods', icon: 'mods', label: 'Моды' },
    { id: 'settings', icon: 'settings', label: 'Настройки' }
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="logo">
        {!collapsed ? (
          <>
            <span className="logo-text">
              Parad<span className="logo-i">i<span className="logo-dot"></span></span>se
              <span className="logo-palm">
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 512 512" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M189.895,77.707c6.935-17.31,20.551-31.902,39.134-39.606c18.571-7.7,38.529-7.027,55.667,0.303
                    l3.88,23.346l-32.324,42.024l-61.758-6.942" fill="#12f0ff" />
                  <path d="M308.109,430.278l-84.374-5.25c21.97-51.163,31.322-106.248,28.021-160.759l-17.246-50.541
                    l-11.314-33.176l15.44-69.784l37.11-32.338l28.978,53.172c9.197,24.23,16.145,49.082,20.833,74.256
                    C339.503,280.51,333.679,357.971,308.109,430.278z" fill="#00c0db" />
                  <g>
                    <path d="M256.253,103.772c-21.467-0.897-42.528,5.298-59.989,17.234
                      c-15.308,10.465-27.866,25.354-35.484,43.772c-16.313,39.418-5.238,83.346,24.445,110.625c-11.278-0.466-22.651-2.894-33.69-7.451
                      c-50.445-20.881-74.424-78.705-53.543-129.162c20.881-50.445,78.705-74.424,129.151-53.543
                      C238.182,89.816,247.941,96.141,256.253,103.772z" fill="#12f0ff" />
                    <path d="M446.409,145.702c-4.569,11.027-10.895,20.786-18.525,29.097
                      c1.674-40.28-21.587-79.16-61.005-95.473c-15.739-6.518-32.207-8.659-48.041-6.996h-0.012c-23.811,2.5-46.188,13.61-62.572,31.441
                      c0.466-11.266,2.882-22.651,7.451-33.678c20.881-50.457,78.705-74.436,129.162-53.555c11.804,4.891,22.161,11.804,30.832,20.176
                      h0.012C452.078,64.103,462.399,107.061,446.409,145.702z" fill="#12f0ff" />
                  </g>
                </svg>
              </span>
            </span>
            <ActivityStatus count={onlinePlayers} />
          </>
        ) : (
          <div className="logo-icon">
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 512 512" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M189.895,77.707c6.935-17.31,20.551-31.902,39.134-39.606c18.571-7.7,38.529-7.027,55.667,0.303
                l3.88,23.346l-32.324,42.024l-61.758-6.942" fill="#12f0ff" />
              <path d="M308.109,430.278l-84.374-5.25c21.97-51.163,31.322-106.248,28.021-160.759l-17.246-50.541
                l-11.314-33.176l15.44-69.784l37.11-32.338l28.978,53.172c9.197,24.23,16.145,49.082,20.833,74.256
                C339.503,280.51,333.679,357.971,308.109,430.278z" fill="#00c0db" />
              <g>
                <path d="M256.253,103.772c-21.467-0.897-42.528,5.298-59.989,17.234
                  c-15.308,10.465-27.866,25.354-35.484,43.772c-16.313,39.418-5.238,83.346,24.445,110.625c-11.278-0.466-22.651-2.894-33.69-7.451
                  c-50.445-20.881-74.424-78.705-53.543-129.162c20.881-50.445,78.705-74.424,129.151-53.543
                  C238.182,89.816,247.941,96.141,256.253,103.772z" fill="#12f0ff" />
                <path d="M446.409,145.702c-4.569,11.027-10.895,20.786-18.525,29.097
                  c1.674-40.28-21.587-79.16-61.005-95.473c-15.739-6.518-32.207-8.659-48.041-6.996h-0.012c-23.811,2.5-46.188,13.61-62.572,31.441
                  c0.466-11.266,2.882-22.651,7.451-33.678c20.881-50.457,78.705-74.436,129.162-53.555c11.804,4.891,22.161,11.804,30.832,20.176
                  h0.012C452.078,64.103,462.399,107.061,446.409,145.702z" fill="#12f0ff" />
              </g>
              <path d="M256.253,103.772c-21.467-0.897-42.528,5.298-59.989,17.234c0,0-54.452-33.534-98.271,17.784
                c20.881-50.445,78.705-74.424,129.151-53.543C238.182,89.816,247.941,96.141,256.253,103.772z" fill="#009baf" />
              <path d="M325.558,205.859c-34.419,34.431-76.888,12.892-76.888,12.892l-14.16-5.023l-11.314-33.176
                l15.44-69.784l37.11-32.338l28.978,53.172C313.922,155.832,320.87,180.684,325.558,205.859z" fill="#009baf" />
              <path d="M423.698,36.714c-79.578-11.397-104.526,34.97-104.861,35.615h-0.012
                c-23.811,2.5-46.188,13.61-62.572,31.441c0.466-11.266,2.882-22.651,7.451-33.678c20.881-50.457,78.705-74.436,129.163-53.555
                C404.67,21.431,415.027,28.343,423.698,36.714z" fill="#009baf" />
              <g>
                <path d="M275.412,268.502c-40.818-1.316-75.62-32.326-80.475-74.113c-0.777-6.649-0.753-13.203,0-19.566
                  c3.959-33.666,28.153-62.082,61.316-71.051c-8.671,18.238-13.897,38.294-14.902,59.271c-0.419,8.491-0.144,17.126,0.873,25.844
                  C245.741,219.146,257.676,246.365,275.412,268.502z" fill="#12f0ff" />
                <path d="M359.26,233.747c-3.121-28.2-13.945-55.887-32.877-79.758c-3.086-3.899-6.327-7.606-9.699-11.134
                  c-17.281-18.047-38.067-31.154-60.431-39.084c26.132-15.033,57.98-14.591,83.382-0.06c9.017,5.143,17.222,12.067,24.062,20.702
                  C389.829,157.387,387.185,203.933,359.26,233.747z" fill="#12f0ff" />
              </g>
              <g>
                <path d="M256.253,103.772c-8.671,18.238-13.897,38.294-14.902,59.271
                  c-28.093-12.725-46.415,11.78-46.415,11.78C198.895,141.158,223.089,112.742,256.253,103.772z" fill="#009baf" />
                <path d="M316.684,142.855c-17.281-18.047-38.067-31.154-60.431-39.084
                  c26.132-15.033,57.98-14.591,83.382-0.06C307.798,112.204,316.684,142.855,316.684,142.855z" fill="#009baf" />
              </g>
              <path d="M440.482,503.03c-105.597-105.597-276.805-105.597-382.403,0" fill="#00c0db" strokeWidth="2" stroke="#008B9E" strokeLinecap="round" />
              
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </svg>
            <div className="particles"></div>
          </div>
        )}
      </div>
      
      <nav className="menu">
        {menuItems.map(item => (
          <button 
            key={item.id} 
            className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            data-tooltip={item.label}
          >
            <span className="menu-icon">
              <MenuIcon type={item.icon} />
            </span>
            {!collapsed && <span className="menu-label">{item.label}</span>}
          </button>
        ))}
      </nav>
      
      <button 
        className="collapse-button" 
        onClick={toggleSidebar}
        data-tooltip={collapsed ? "Развернуть меню" : "Свернуть меню"}
      >
        <span className="collapse-arrow">←</span>
      </button>
    </aside>
  );
} 