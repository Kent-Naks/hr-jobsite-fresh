export default function AdminLoading() {
  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .sk {
          background: linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.6s ease-in-out infinite;
          border-radius: 6px;
        }
      `}</style>

      <main className="p-6 max-w-5xl mx-auto">

        {/* Header: title + button group */}
        <div className="flex justify-between items-center mb-6 gap-3">
          <div className="sk h-8 w-36" />
          <div className="flex gap-2">
            <div className="sk h-9 w-40 rounded" />
            <div className="sk h-9 w-24 rounded" />
            <div className="sk h-9 w-24 rounded" />
          </div>
        </div>

        {/* Table: header + 8 rows, 7 columns matching real page */}
        <table className="w-full text-sm border border-gray-800">
          <thead>
            <tr className="bg-gray-800">
              {["Title", "Category", "Status", "Posted", "Updated", "Expiring", ""].map((col, i) => (
                <th key={i} className="p-2 text-left">
                  {col && <div className="sk h-4" style={{ width: col === "Title" ? 48 : col === "" ? 0 : 56 }} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, row) => (
              <tr key={row} className="border-t border-gray-800">
                <td className="p-2"><div className="sk h-4" style={{ width: `${55 + (row * 11) % 30}%` }} /></td>
                <td className="p-2"><div className="sk h-4 w-24" /></td>
                <td className="p-2"><div className="sk h-4 w-16" /></td>
                <td className="p-2"><div className="sk h-4 w-32" /></td>
                <td className="p-2"><div className="sk h-4 w-32" /></td>
                <td className="p-2"><div className="sk h-4 w-20" /></td>
                <td className="p-2 text-right"><div className="sk h-4 w-8 ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>

      </main>
    </>
  );
}
