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
                        end
                        className={({ isActive }) =>
                            `nav-link ${isActive ? "active" : ""}`
                        }
                    >
                        <i className="nav-icon cil-puzzle"></i>
                        Panel Administrador
                    </NavLink>
                </li>

                <li className="nav-item">
                    <NavLink to="/app"
                        end
                        className={({ isActive }) =>
                            `nav-link ${isActive ? "active" : ""}`
                        }
                    >
                        <i className="nav-icon cil-speedometer"></i>
                        Dashboard
                    </NavLink>
                </li>

                <li className="nav-item">
                    <NavLink to="/app/expense"
                        end
                        className={({ isActive }) =>
                            `nav-link ${isActive ? "active" : ""}`
                        }
                    >
                        <i className="nav-icon cil-money"></i>
                        Gastos
                    </NavLink>
                </li>

                <li className="nav-item">
                    <NavLink to="/app/maintenance"
                        end
                        className={({ isActive }) =>
                            `nav-link ${isActive ? "active" : ""}`
                        }
                    >
                        <i className="nav-icon cil-settings"></i>
                        Mantenimientos
                    </NavLink>
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
