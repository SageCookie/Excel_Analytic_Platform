import React, { useEffect } from "react";

export default function PageContainer({ children, title, className = "" }) {
  // scroll to top when page/title changes
  useEffect(() => window.scrollTo(0, 0), [title]);

  return (
    <main className={`flex-1 overflow-auto bg-gray-100 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">
            {title}
          </h1>
        )}
        {children}
      </div>
    </main>
  );
}
