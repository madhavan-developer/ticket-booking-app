import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AdminNavbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-104 bg-[#1a0b10] border-r border-[#4b1d26]">
          <AdminSidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-4 bg-[#0f0c0e]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
