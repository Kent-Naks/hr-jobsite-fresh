export default function AdminLoading() {
  return (
    <>
      <style>{`
        @keyframes admin-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .sk-admin {
          background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
          background-size: 200% 100%;
          animation: admin-shimmer 1.6s ease-in-out infinite;
          border-radius: 4px;
        }
      `}</style>

      <main className="p-6 max-w-5xl mx-auto">

        {/* Header: "Admin · Jobs" (text-2xl font-bold) + 3 action buttons */}
        <div className="flex justify-between items-center mb-6 gap-3">
          <div className="sk-admin h-8 w-44" /> {/* "Admin · Jobs" */}
          <div className="flex gap-2">
            <div className="sk-admin h-9 w-44 rounded" /> {/* Manage Categories */}
            <div className="sk-admin h-9 w-28 rounded" /> {/* + New Job */}
            <div className="sk-admin h-9 w-24 rounded" /> {/* Analytics */}
          </div>
        </div>

        {/* Table: w-full text-sm border — 7 columns */}
        <table className="w-full text-sm border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left"><div className="sk-admin h-4 w-8" /></th>  {/* Title */}
              <th className="p-2 text-left"><div className="sk-admin h-4 w-16" /></th> {/* Category */}
              <th className="p-2 text-left"><div className="sk-admin h-4 w-12" /></th> {/* Status */}
              <th className="p-2 text-left"><div className="sk-admin h-4 w-12" /></th> {/* Posted */}
              <th className="p-2 text-left"><div className="sk-admin h-4 w-16" /></th> {/* Updated */}
              <th className="p-2 text-left"><div className="sk-admin h-4 w-16" /></th> {/* Expiring */}
              <th className="p-2" />                                                    {/* Edit link col */}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-t border-gray-200">
                {/* Title — varies width to mimic real job titles */}
                <td className="p-2"><div className="sk-admin h-4" style={{ width: `${48 + (i * 11) % 38}%` }} /></td>
                {/* Category label */}
                <td className="p-2"><div className="sk-admin h-4 w-24" /></td>
                {/* Status (draft | published | archived) */}
                <td className="p-2"><div className="sk-admin h-4 w-16" /></td>
                {/* Posted — datetime string */}
                <td className="p-2"><div className="sk-admin h-4 w-32" /></td>
                {/* Updated — datetime string */}
                <td className="p-2"><div className="sk-admin h-4 w-32" /></td>
                {/* Expiring — datetime or "—" */}
                <td className="p-2"><div className="sk-admin h-4 w-20" /></td>
                {/* Edit link — right-aligned */}
                <td className="p-2 text-right"><div className="sk-admin h-4 w-8 ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>

      </main>
    </>
  );
}
