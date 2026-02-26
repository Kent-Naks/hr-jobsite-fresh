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
          border-radius: 4px;
        }
      `}</style>

      <main className="p-6 max-w-5xl mx-auto">

        {/* Header: h1 + 3 buttons */}
        <div className="flex justify-between items-center mb-6 gap-3">
          <div className="sk h-8 w-32" />
          <div className="flex gap-2">
            <div className="sk h-9 w-40 rounded" />
            <div className="sk h-9 w-24 rounded" />
            <div className="sk h-9 w-24 rounded" />
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm border border-gray-800">
          {/* thead matching bg-gray-50 → dark equivalent */}
          <thead>
            <tr className="bg-gray-800">
              <th className="p-2 text-left"><div className="sk h-4 w-10" /></th>
              <th className="p-2 text-left"><div className="sk h-4 w-16" /></th>
              <th className="p-2 text-left"><div className="sk h-4 w-12" /></th>
              <th className="p-2 text-left"><div className="sk h-4 w-14" /></th>
              <th className="p-2 text-left"><div className="sk h-4 w-16" /></th>
              <th className="p-2 text-left"><div className="sk h-4 w-16" /></th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-t border-gray-800">
                {/* Title — varies width */}
                <td className="p-2"><div className="sk h-4" style={{ width: `${50 + (i * 9) % 35}%` }} /></td>
                {/* Category */}
                <td className="p-2"><div className="sk h-4 w-24" /></td>
                {/* Status */}
                <td className="p-2"><div className="sk h-4 w-16" /></td>
                {/* Posted */}
                <td className="p-2"><div className="sk h-4 w-28" /></td>
                {/* Updated */}
                <td className="p-2"><div className="sk h-4 w-28" /></td>
                {/* Expiring */}
                <td className="p-2"><div className="sk h-4 w-20" /></td>
                {/* Edit link */}
                <td className="p-2 text-right"><div className="sk h-4 w-8 ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>

      </main>
    </>
  );
}
