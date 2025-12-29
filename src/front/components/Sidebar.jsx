import { Link } from "react-router-dom";
import "../index.css"
export const Sidebar = () => {

    return (
        <div className="sidebar sidebar-narrow-unfoldable border-end" >
            <div className="sidebar-header border-bottom">
                <div className="sidebar-brand">CUI</div>
            </div>
            <ul className="sidebar-nav">
                <li className="nav-title">Nav Title</li>
                <li className="nav-item">
                    <a className="nav-link" href="#">
                        <i className="nav-icon cil-speedometer"></i> Nav item
                    </a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">
                        <i className="nav-icon cil-speedometer"></i> With badge
                        <span className="badge bg-primary ms-auto">NEW</span>
                    </a>
                </li>
                <li className="nav-item nav-group show">
                    <a className="nav-link nav-group-toggle" href="#">
                        <i className="nav-icon cil-puzzle"></i> Nav dropdown
                    </a>
                    <ul className="nav-group-items">
                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <span className="nav-icon"><span className="nav-icon-bullet"></span></span> Nav dropdown item
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <span className="nav-icon"><span className="nav-icon-bullet"></span></span> Nav dropdown item
                            </a>
                        </li>
                    </ul>
                </li>
                <li className="nav-item mt-auto">
                    <a className="nav-link" href="https://coreui.io">
                        <i className="nav-icon cil-cloud-download"></i> Download CoreUI</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="https://coreui.io/pro/">
                        <i className="nav-icon cil-layers"></i> Try CoreUI
                        <strong>PRO</strong>
                    </a>
                </li>
            </ul>
        </div>
    );
};