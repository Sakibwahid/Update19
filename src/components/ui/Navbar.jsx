import React, { useState, useEffect } from "react";
import { Text } from "./Text";
import { NavItem } from "./NavItem";
import { Home, User, Info, Lock, Menu, X } from "lucide-react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import PlayerFilter from "../player/PlayerFilter";

export function Navbar() {
  const [userData, setUserData] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  // Track Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserData({ email: user.email, uid: user.uid });
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const toggleMenu = () => {
    setMobileMenu(prev => !prev);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      navigate("/login"); // redirect after logout
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <nav className="relative md:min-h-screen flex md:flex-col justify-between items-center text-white py-6 px-4">
      <Text variant="subheading" className="text-xl text-white font-semibold">
        Nilam420
      </Text>

      {/* Desktop Menu */}
      <div className="hidden md:block">
        <ul className="flex md:flex-col items-center gap-6 w-full text-left">
          <NavItem label="Home" link="/" Icon={Home} />
          <NavItem label="About" link="/about" Icon={Info} />
          {userData && (
            <NavItem
              label="Logout"
              link="#"
              Icon={Lock}
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            />
          )}
        </ul>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden flex items-center">
        <button onClick={toggleMenu}>
          {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {mobileMenu && (
          <div className="absolute top-14 right-0 h-screen backdrop-blur-xl bg-white/5 rounded-xl shadow-lg p-4 z-50">
            <ul className="flex flex-col items-center gap-4 text-left">
              <NavItem label="Home" link="/" Icon={Home} />
              <NavItem label="Players" link={<PlayerFilter />} Icon={User} />
              <NavItem label="About" link="/about" Icon={Info} />
              {userData && (
                <NavItem
                  label="Logout"
                  link="#"
                  Icon={Lock}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                />
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}




