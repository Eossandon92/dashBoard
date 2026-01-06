import { NavLink } from "react-router-dom";
import "../index.css";

export const Sidebar = () => {
    return (
        <div className="sidebar sidebar-narrow-unfoldable border-end">
            <div className="sidebar-header border-bottom">
                <div className="sidebar-brand">CUI</div>
            </div>

            <ul className="sidebar-nav">

                <li className="nav-item">
                    <NavLink
                        to="/app/admin-panel"
                        className={({ isActive }) =>
                            `nav-link ${isActive ? "active" : ""}`
                        }
                    >
                        <i className="nav-icon cil-puzzle"></i>
                        Panel Administrador
                    </NavLink>
                </li>

                <li className="nav-item">
                    <NavLink to="/app" className="nav-link">
                        <i className="nav-icon cil-speedometer"></i>
                        Dashboard
                    </NavLink>
                </li>

                <li className="nav-item">
                    <NavLink to="/app/expense" className="nav-link">
                        <i className="nav-icon cil-money"></i>
                        Gastos
                    </NavLink>
                </li>

                <li className="nav-item nav-group show">
                    <span className="nav-link nav-group-toggle">
                        <i className="nav-icon cil-puzzle"></i>
                        Nav dropdown
                    </span>

                    <ul className="nav-group-items">
                        <li className="nav-item">
                            <NavLink to="/item-1" className="nav-link">
                                <span className="nav-icon">
                                    <span className="nav-icon-bullet"></span>
                                </span>
                                Nav dropdown item
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink to="/item-2" className="nav-link">
                                <span className="nav-icon">
                                    <span className="nav-icon-bullet"></span>
                                </span>
                                Nav dropdown item
                            </NavLink>
                        </li>
                    </ul>
                </li>

                {/* Links externos se dejan con <a> */}
                <li className="nav-item mt-auto">
                    <a className="nav-link" href="https://coreui.io" target="_blank">
                        <i className="nav-icon cil-cloud-download"></i>
                        Download CoreUI
                    </a>
                </li>

                <li className="nav-item">
                    <a className="nav-link" href="https://coreui.io/pro/" target="_blank">
                        <i className="nav-icon cil-layers"></i>
                        Try CoreUI <strong>PRO</strong>
                    </a>
                </li>
            </ul>
        </div>
    );
};
