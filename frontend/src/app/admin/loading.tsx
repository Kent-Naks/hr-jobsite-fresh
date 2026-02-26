export default function AdminLoading() {
  return (
    <>
      <style>{`
        @keyframes admin-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .sk-admin {
          background: linear-gradient(90deg, #e5e7eb 25%, #d1d5db 50%, #e5e7eb 75%);
          background-size: 200% 100%;
          animation: admin-shimmer 1.6s ease-in-out infinite;
          border-radius: 4px;
        }
      `}</style>

      <main className="p-6 max-w-5xl mx-auto">

        {/* Header: h1 + buttons */}
        <div className="flex justify-between items-center mb-6 gap-3">
          <div className="sk-admin h-8 w-36" />
          <div className="flex gap-2">
            <div className="sk-admin h-9 w-40 rounded" />
            <div className="sk-admin h-9 w-24 rounded" />
            <div className="sk-admin h-9 w-24 rounded" />
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left"><div className="sk-admin h-4 w-10" /></th>
              <th className="p-2 text-left"><div className="sk-admin h-4 w-16" /></th>
              <th className="p-2 text-left"><div className="sk-admin h-4 w-12" /></th>
              <th className="p-2 text-left"><div className="sk-admin h-4 w-14" /></th>
              <th className="p-2 text-left"><div className="sk-admin h-4 w-16" /></th>
              <th className="p-2 text-left"><div className="sk-admin h-4 w-16" /></th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-t border-gray-200">
                <td className="p-2"><div className="sk-admin h-4" style={{ width: `${50 + (i * 9) % 35}%` }} /></td>
                <td className="p-2"><div className="sk-admin h-4 w-24" /></td>
                <td className="p-2"><div className="sk-admin h-4 w-16" /></td>
                <td className="p-2"><div className="sk-admin h-4 w-28" /></td>
                <td className="p-2"><div className="sk-admin h-4 w-28" /></td>
                <td className="p-2"><div className="sk-admin h-4 w-20" /></td>
                <td className="p-2 text-right"><div className="sk-admin h-4 w-8 ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>

      </main>
    </>
  );
}
