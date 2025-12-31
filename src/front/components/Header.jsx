import { useState } from "react"
import { Link } from "react-router-dom"
import {
    CHeader,
    CContainer,
    CHeaderBrand,
    CHeaderToggler,
    CCollapse,
    CHeaderNav,
    CNavItem,
    CNavLink,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
    CDropdownDivider,
    CForm,
    CFormInput,
    CButton
} from "@coreui/react"

export default function Header() {
    const [visible, setVisible] = useState(true)

    return (
        <CHeader>
            <CContainer fluid>
                <CHeaderBrand href="#">Nombre condominio</CHeaderBrand>

                <CHeaderToggler onClick={() => setVisible(!visible)} />

                <CCollapse className="header-collapse" visible={visible}>
                    <CHeaderNav>
                        <CNavItem>
                            UF hoy: $39.720
                        </CNavItem>
                        <CNavItem>
                            <CNavLink href="#" active>Home</CNavLink>
                        </CNavItem>

                        <CNavItem>
                            <CNavLink href="#">Link</CNavLink>
                        </CNavItem>

                        <CDropdown variant="nav-item">
                            <CDropdownToggle color="secondary">
                                Dropdown button
                            </CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem href="#">Action</CDropdownItem>
                                <CDropdownItem href="#">Another action</CDropdownItem>
                                <CDropdownDivider />
                                <CDropdownItem href="#">Something else here</CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>

                        <CNavItem>
                            <Link to="/signin">Link</Link>
                        </CNavItem>
                    </CHeaderNav>
                </CCollapse>
            </CContainer>
        </CHeader>
    )
}
