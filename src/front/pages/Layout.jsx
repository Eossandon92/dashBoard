import { Outlet } from "react-router-dom"
import ScrollToTop from "../components/ScrollToTop"
import { Sidebar } from "../components/Sidebar"
import { Footer } from "../components/Footer"
import Header from "../components/Header";

export const Layout = () => {
    return (
        <ScrollToTop>
            <div className="d-flex vh-100 overflow-hidden">

                {/* Sidebar */}
                <Sidebar />

                {/* Contenido */}
                <div className="flex-grow-1 d-flex flex-column h-100 overflow-hidden">
                    <Header />
                    <main className="flex-grow-1 p-4 overflow-auto">
                        <Outlet />
                    </main>

                </div>

            </div>
        </ScrollToTop>
    )
}
