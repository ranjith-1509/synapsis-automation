import React from "react";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9fc] to-[#eef2f7]">
      <header className="px-6 pt-8 pb-4">
        <div className="max-w-6xl mx-auto flex flex-col gap-2">
          <p className="text-sm font-semibold text-blue-600 tracking-[0.15em] uppercase">
            Automation Center
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PowerShell Automation</h1>
              <p className="text-base text-gray-600">
                Run desktop automations, file utilities, and diagnostics in one place.
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                Live demo
              </span>
              <p className="text-xs text-gray-500 mt-1">Requires Electron runtime</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto pb-10">{children}</main>
    </div>
  );
};

export default MainLayout;
