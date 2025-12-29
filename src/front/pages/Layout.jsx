import { Outlet } from "react-router-dom"
import ScrollToTop from "../components/ScrollToTop"
import { Sidebar } from "../components/Sidebar"
import { Footer } from "../components/Footer"
import Header from "../components/Header";

export const Layout = () => {
    return (
        <ScrollToTop>
            <div className="d-flex min-vh-100">

                {/* Sidebar */}
                <Sidebar />

                {/* Contenido */}
                <div className="flex-grow-1 d-flex flex-column">
                    <Header />
                    <main className="flex-grow-1 p-4">
                        <Outlet />
                    </main>

                    <Footer />
                </div>

            </div>
        </ScrollToTop>
    )
}
