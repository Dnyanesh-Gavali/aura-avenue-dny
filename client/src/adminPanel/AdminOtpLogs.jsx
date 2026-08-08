import React from 'react';

/**
 * Admin OTP Logs Component
 * 
 * Description:
 * Renders an audit log table displaying OTP attempts made on admin and developer email accounts.
 * Includes horizontal scroll handling for small screen sizes to prevent column overlap.
 * 
 * @param {Object} props
 * @param {Array} [props.logs=[]] - Array of log objects containing email, otp, createdAt, and _id properties.
 * 
 * @returns {JSX.Element} Rendered table view of admin OTP activity logs.
 */
function AdminOtpLogs({ logs = [] }) {
    return (
        <div className="w-full space-y-6">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1.5 sm:mb-2 text-gray-800 tracking-tight leading-tight">
                    Admin OTP Logs
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">
                    Monitored OTP attempts made on Developer & Admin email accounts.
                </p>
            </div>

            {/* Responsive Table Wrapper (Prevents CSS lag & cell clipping on mobile) */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-x-auto w-full min-w-0">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">
                                Admin Email
                            </th>
                            <th className="p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">
                                OTP Code
                            </th>
                            <th className="p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">
                                Date & Time
                            </th>
                            <th className="p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">
                                Security Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                        {logs.length > 0 ? (
                            logs.map((log) => (
                                <tr key={log._id} className="hover:bg-gray-50/80 transition-colors">
                                    {/* Admin Email */}
                                    <td className="p-3 sm:p-4 font-semibold text-gray-800 whitespace-nowrap">
                                        {log.email}
                                    </td>
                                    
                                    {/* OTP Code Display */}
                                    <td className="p-3 sm:p-4 font-mono text-red-600 font-medium whitespace-nowrap">
                                        {log.otp || 'N/A'}
                                    </td>
                                    
                                    {/* Timestamp */}
                                    <td className="p-3 sm:p-4 text-gray-500 whitespace-nowrap">
                                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Recently'}
                                    </td>
                                    
                                    {/* Security Badge */}
                                    <td className="p-3 sm:p-4 whitespace-nowrap">
                                        <span className="inline-flex items-center bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold shrink-0">
                                            Admin Protected
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            /* Empty State Display */
                            <tr>
                                <td colSpan="4" className="p-6 sm:p-8 text-center text-gray-400 text-xs sm:text-sm">
                                    No admin OTP attempts recorded.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminOtpLogs;