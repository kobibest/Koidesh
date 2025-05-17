import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { Settings } from "@/entities/Settings";
import { ChevronRight, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [synagogueName, setSynagogueName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        
        // Load synagogue name if available
        const settings = await Settings.filter({ key: "synagogue_name" });
        if (settings.length > 0) {
          setSynagogueName(settings[0].value.text || "בית הכנסת");
        }
      } catch (error) {
        // If not logged in and not on Display page, redirect to home/login
        if (currentPageName !== "Display") {
          // System will handle redirecting to login
          navigate("/");
        }
      }
    };
    
    checkUser();
  }, [currentPageName, navigate]);

  const handleLogout = async () => {
    await User.logout();
    navigate("/");
  };

  // Do not render layout for Display page
  if (currentPageName === "Display") {
    return children;
  }

  return (
    <div dir="rtl" className="flex h-screen bg-[#F5F7FA] text-[#111827]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 right-0 z-50 h-full w-64 bg-white shadow-md transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold text-[#111827]">
            KodeshBoard
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 border-b">
          <div className="font-medium">{synagogueName}</div>
          <div className="text-sm text-gray-500">{user?.email}</div>
        </div>
        
        <nav className="p-2">
          <Link
            to={createPageUrl("Dashboard")}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-1 ${
              currentPageName === "Dashboard" 
                ? "bg-[#F59E0B]/10 text-[#F59E0B] font-medium" 
                : "hover:bg-gray-100"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <span>מידע כללי</span>
          </Link>
          <Link
            to={createPageUrl("Schedule")}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-1 ${
              currentPageName === "Schedule" 
                ? "bg-[#F59E0B]/10 text-[#F59E0B] font-medium" 
                : "hover:bg-gray-100"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <span>ניהול לוח זמנים</span>
          </Link>
          <Link
            to={createPageUrl("ConstantInfo")}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-1 ${
              currentPageName === "ConstantInfo" 
                ? "bg-[#F59E0B]/10 text-[#F59E0B] font-medium" 
                : "hover:bg-gray-100"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <span>עריכת מידע קבוע</span>
          </Link>
          <Link
            to={createPageUrl("DisplayLayout")}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-1 ${
              currentPageName === "DisplayLayout" 
                ? "bg-[#F59E0B]/10 text-[#F59E0B] font-medium" 
                : "hover:bg-gray-100"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <span>עריכת פריסת תצוגה</span>
          </Link>
          
          <div className="mt-6 border-t pt-4">
            <Link
              to={createPageUrl("Display")}
              target="_blank"
              className="flex items-center justify-between px-4 py-3 rounded-lg mb-1 text-[#F59E0B] font-medium"
              onClick={() => setSidebarOpen(false)}
            >
              <span>פתח תצוגת לוח</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
            
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 ml-2" />
              <span>התנתק</span>
            </Button>
          </div>
        </nav>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">KodeshBoard</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Rubik', sans-serif;
          direction: rtl;
        }
      `}</style>
    </div>
  );
}