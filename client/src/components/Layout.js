import React, { useState } from 'react';
import { Nav, Navbar, Button, Dropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const menuItems = [
    { path: '/products', label: 'Products', icon: '📦' },
    { path: '/categories', label: 'Categories', icon: '🏷️' },
    { path: '/brands', label: 'Brands', icon: '🏆' },
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
        <h4 className={`mb-0 text-white ${collapsed ? 'd-none' : ''}`}>ERP System</h4>
        <Button variant="link" className="text-white p-0" onClick={onToggle}>{collapsed ? '☰' : '←'}</Button>
      </div>

      <Nav className="flex-column">
        {menuItems.map((item) => (
          <Nav.Item key={item.path}>
            <Nav.Link as={Link} to={item.path} className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}>
              <span className="me-2">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <div className="mt-auto p-3 border-top">
        <Dropdown>
          <Dropdown.Toggle variant="link" className="text-white text-decoration-none p-0 d-flex align-items-center">
            <span className="me-2">👤</span>
            {!collapsed && <span>{user?.username}</span>}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

const TopNavbar = () => (
  <Navbar className="navbar" expand="lg" variant="dark">
    <Navbar.Brand href="#" className="ms-3">ERP System</Navbar.Brand>
  </Navbar>
);

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className="d-flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <TopNavbar />
        <div className="p-4 page-transition">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
