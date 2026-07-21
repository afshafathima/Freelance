import { useLocation } from "react-router-dom";

const titles = {
    "/dashboard":  "Dashboard",
    "/clients":    "Clients",
    "/projects":   "Projects",
    "/tasks":      "Tasks",
    "/timer":      "Time Tracking",
    "/invoices":   "Invoices",
    "/financials": "Financials",
};

function Navbar() {
    const { pathname } = useLocation();
    const title = titles[pathname] || "FreelanceFlow";
    return (
        <header className="navbar">
            <span className="navbar-title">{title}</span>
        </header>
    );
}

export default Navbar;
