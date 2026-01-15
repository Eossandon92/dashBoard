import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
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
    CDropdownDivider
} from "@coreui/react"
const backendUrl = import.meta.env.VITE_BACKEND_URL

export default function Header() {
    const [visible, setVisible] = useState(true)
    const [uf, setUf] = useState(null)
    const navigate = useNavigate()
    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/signin")
    }

    useEffect(() => {
        const hoy = new Date().toISOString().split("T")[0]
        const ufGuardada = localStorage.getItem("uf")

        if (ufGuardada) {
            const parsed = JSON.parse(ufGuardada)

            if (parsed.fecha === hoy) {
                setUf(parsed.valor)
                return
            }
        }

        fetch(`${backendUrl}/api/uf`)
            .then(res => res.json())
            .then(data => {
                setUf(data.valorUF)

                localStorage.setItem("uf", JSON.stringify({
                    valor: data.valorUF,
                    fecha: hoy
                }))
            })
            .catch(err => {
                console.error("Error cargando UF", err)
            })

    }, [])

    return (
        <CHeader>
            <CContainer fluid>
                <CHeaderBrand href="#">Nombre condominio</CHeaderBrand>

                <CHeaderToggler onClick={() => setVisible(!visible)} />

                <CCollapse className="header-collapse" visible={visible}>
                    <CHeaderNav>

                        <CNavItem className="me-3">
                            <CNavLink href="#" onClick={(e) => e.preventDefault()} style={{ cursor: "default" }}>
                                <strong>
                                    UF hoy:{" "}
                                    {uf
                                        ? `$${uf.toLocaleString("es-CL")}`
                                        : "Cargando..."}
                                </strong>
                            </CNavLink>
                        </CNavItem>

                        <CNavItem>
                            <Link to="/app" style={{ textDecoration: "none" }}>
                                <CNavLink>Home</CNavLink>
                            </Link>
                        </CNavItem>


                        <CDropdown variant="nav-item">
                            <CDropdownToggle color="secondary">
                                Menú
                            </CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem>Perfil</CDropdownItem>
                                <CDropdownDivider />
                                <CDropdownItem
                                    component={Link}
                                    to="/signin"
                                    onClick={handleLogout}
                                >
                                    Cerrar sesión
                                </CDropdownItem>


                            </CDropdownMenu>
                        </CDropdown>

                        <CNavItem>

                        </CNavItem>

                    </CHeaderNav>
                </CCollapse>
            </CContainer>
        </CHeader>
    )
}
