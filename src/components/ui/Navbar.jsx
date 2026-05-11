import React, { useState, useMemo } from "react";

import { Text } from "./Text";
import { NavItem } from "./NavItem";

import {
  Home,
  Info,
  Lock,
  Menu,
  X,
  Trophy,
  Users,
} from "lucide-react";

import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase/config";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export function Navbar() {
  const [mobileMenu, setMobileMenu] = useState(false);

  const navigate = useNavigate();

  // Auth Context
  const { user, userData } = useAuth();

  // Dynamic Home Route
  const homeLink = useMemo(() => {
    if (userData?.role === "admin") {
      return "/admin";
    }

    if (userData?.role === "user") {
      return "/user";
    }

    return "/";
  }, [userData]);

  // Toggle Mobile Menu
  const toggleMenu = () => {
    setMobileMenu((prev) => !prev);
  };

  // Logout Handler
  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      await signOut(auth);

      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Close Mobile Menu After Navigation
  const closeMenu = () => {
    setMobileMenu(false);
  };

  return (
    <nav
      className="
        relative
        z-50
        flex
        md:min-h-screen
        md:w-24
        flex-row
        md:flex-col
        justify-between
        items-center
        px-4
        py-5
        text-white
      "
    >
      {/* Logo */}
      <div
        onClick={() => navigate(homeLink)}
        className="cursor-pointer"
      >
        <Text
          variant="subheading"
          className="
            text-xl
            font-bold
            tracking-wide
            text-white
          "
        >
          Nilam420
        </Text>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-col items-center gap-6">
        <NavItem
          label="Home"
          link={homeLink}
          Icon={Home}
        />

        <NavItem
          label="Auction"
          link="/auction"
          Icon={Trophy}
        />

        {user && (
          <NavItem
            label="Squad"
            link="/user/squad"
            Icon={Users}
          />
        )}

        <NavItem
          label="About"
          link="/about"
          Icon={Info}
        />

        {user && (
          <NavItem
            label="Logout"
            link="#"
            Icon={Lock}
            onClick={handleLogout}
          />
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={toggleMenu}
          aria-label="Toggle Menu"
          className="relative z-50"
        >
          {mobileMenu ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenu && (
        <div
          className="
            fixed
            inset-0
            bg-black/40
            backdrop-blur-md
            z-40
          "
        >
          <div
            className="
              absolute
              top-0
              right-0
              h-full
              w-64
              bg-white/10
              backdrop-blur-lg
              border-l
              border-white/10
              shadow-2xl
              p-6
            "
          >
            <ul className="flex flex-col gap-6 mt-16">
              <NavItem
                label="Home"
                link={homeLink}
                Icon={Home}
                onClick={closeMenu}
              />

              <NavItem
                label="Auction"
                link="/auction"
                Icon={Trophy}
                onClick={closeMenu}
              />

              {user && (
                <NavItem
                  label="Squad"
                  link="/user/squad"
                  Icon={Users}
                  onClick={closeMenu}
                />
              )}

              <NavItem
                label="About"
                link="/about"
                Icon={Info}
                onClick={closeMenu}
              />

              {user && (
                <NavItem
                  label="Logout"
                  link="#"
                  Icon={Lock}
                  onClick={handleLogout}
                />
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}