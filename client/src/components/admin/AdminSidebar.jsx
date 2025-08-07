import React from "react";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, BadgePlus, List, BookMarked } from "lucide-react";

const AdminSidebar = () => {
  const user = {
    firstName: "Admin",
    lastName: "User",
    imageUrl: assets.profile,
  };

  const AdminLinks = [
    { linkName: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { linkName: "Add Shows", path: "/admin/add-show", icon: BadgePlus },
    { linkName: "List Shows", path: "/admin/list-show", icon: List },
    { linkName: "List Bookings", path: "/admin/book-show", icon: BookMarked },
  ];

  return (
    <div className="h-[calc(100vh-75px)] overflow-hidden md:flex flex-col items-center pt-8 max-w-13 md:max-w-full w-full text-sm">
      {/* User info */}
      <img
        src={user.imageUrl}
        alt="Admin"
        className="h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto"
      />
      <p className="text-sm font-medium mt-2 mb-6">
        {user.firstName} {user.lastName}
      </p>

      {/* Navigation */}
      <div className="w-full">
        {AdminLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={index}
              to={link.path}
              end
              className={({ isActive }) =>
                `relative flex items-center max-md:justify-center gap-2 w-full py-4 min-md:pl-10 first:mt-6 text-gray-400 ${
                  isActive ? "bg-[var(--primary-color)]/15 text-primary group" : ""
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-6 h-6 ${isActive? "text-[var(--primary-color)]" : "text-gray-500"} `} />
                  <p className="max-md:hidden text-lg text-white">{link.linkName}</p>
                  <span
                    className={`w-1.5 h-10 rounded-l right-0 absolute ${
                      isActive ? "bg-[var(--primary-color)]" : ""
                    }`}
                  ></span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSidebar;
