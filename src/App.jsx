import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [masterRecords, setMasterRecords] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);

  // Form state for comprehensive member & coach registration
  const [formData, setFormData] = useState({
    roleType: 'Coach',
    lastName: '',
    firstName: '',
    middleName: '',
    age: '',
    birthday: '',
    address: '',
    email: '',
    coachRole: 'Head Coach', // Head Coach or Assistant Coach only
    membershipType: 'Active Member',
    sports: {
      basketball: false,
      volleyball: false,
      badminton: false
    },
    emergencyContactName: '',
    emergencyContactNumber: ''
  });

  // Log Form State for manual attendance entry in logs tab
  const [logInput, setLogInput] = useState({
    name: '',
    role: 'Coach',
    sessionDetails: 'Training Session'
  });

  // Live Scanner & Manual Search States
  const [scanMode, setScanMode] = useState('qr'); // 'qr' or 'manual'
  const [scannedId, setScannedId] = useState('');
  const [manualSearchQuery, setManualSearchQuery] = useState('');
  const [scannerFeedback, setScannerFeedback] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Handle sports checkbox change
  const handleSportChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      sports: {
        ...prev.sports,
        [name]: checked
      }
    }));
  };

  // Handler to register a new member or coach
  const handleRegister = (e) => {
    e.preventDefault();
    if (!formData.lastName.trim() || !formData.firstName.trim()) return;

    const selectedSports = Object.keys(formData.sports)
      .filter((sport) => formData.sports[sport])
      .map((sport) => sport.charAt(0).toUpperCase() + sport.slice(1))
      .join(', ');

    const prefix = formData.roleType === 'Coach' ? 'coach-26-' : 'dbsc-26-';
    const newId = `${prefix}${String(masterRecords.length + 1).padStart(2, '0')}`;
    
    const newRecord = {
      id: newId,
      roleType: formData.roleType,
      fullName: `${formData.lastName}, ${formData.firstName} ${formData.middleName}`.trim(),
      age: formData.age || 'N/A',
      birthday: formData.birthday || 'N/A',
      address: formData.address || 'N/A',
      email: formData.email || 'N/A',
      type: formData.roleType === 'Coach' ? formData.coachRole : formData.membershipType,
      sports: selectedSports || 'None',
      emergencyContact: `${formData.emergencyContactName || 'N/A'} (${formData.emergencyContactNumber || 'N/A'})`
    };

    setMasterRecords([...masterRecords, newRecord]);

    // Reset form
    setFormData({
      roleType: 'Coach',
      lastName: '',
      firstName: '',
      middleName: '',
      age: '',
      birthday: '',
      address: '',
      email: '',
      coachRole: 'Head Coach',
      membershipType: 'Active Member',
      sports: { basketball: false, volleyball: false, badminton: false },
      emergencyContactName: '',
      emergencyContactNumber: ''
    });

    setActiveTab('directory');
  };

  // Quick Manual Check-in from Search Results
  const handleManualCheckIn = (record) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog = {
      time: timeString,
      name: record.fullName,
      role: record.roleType,
      details: `Manual Lookup Check-in (${record.type})`,
      status: 'Present'
    };

    setAttendanceLogs((prev) => [newLog, ...prev]);

    setScannerFeedback({
      success: true,
      message: `Manual Check-in Successful: ${record.fullName} (${record.roleType})`,
      data: record
    });
  };

  // Live QR / Barcode Scan Handler
  const handleProcessScan = (idToProcess) => {
    const targetId = (idToProcess || scannedId).trim().toLowerCase();
    if (!targetId) return;

    setIsScanning(true);

    setTimeout(() => {
      const match = masterRecords.find((record) => record.id.toLowerCase() === targetId);

      if (match) {
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newLog = {
          time: timeString,
          name: match.fullName,
          role: match.roleType,
          details: `Scanned via QR (${match.type})`,
          status: 'Present'
        };

        setAttendanceLogs((prev) => [newLog, ...prev]);

        setScannerFeedback({
          success: true,
          message: `Access Granted: ${match.fullName} (${match.roleType} - ${match.type})`,
          data: match
        });
      } else {
        setScannerFeedback({
          success: false,
          message: `ID "${targetId}" not found in Master Directory. Please register first.`,
          data: null
        });
      }

      setIsScanning(false);
      setScannedId('');
    }, 600);
  };

  // Protected Delete for Master Records
  const handleDeleteMasterRecord = (idToDelete) => {
    const password = window.prompt("Enter admin password to delete this record:");
    if (password === "DBSC2026") {
      setMasterRecords((prev) => prev.filter((item) => item.id !== idToDelete));
    } else if (password !== null) {
      alert("Incorrect password! Deletion canceled.");
    }
  };

  // Protected Delete for Attendance Logs
  const handleDeleteAttendanceLog = (indexToDelete) => {
    const password = window.prompt("Enter admin password to delete this attendance log:");
    if (password === "DBSC2026") {
      setAttendanceLogs((prev) => prev.filter((_, index) => index !== indexToDelete));
    } else if (password !== null) {
      alert("Incorrect password! Deletion canceled.");
    }
  };

  // Filtered master records for manual search mode
  const filteredSearchRecords = masterRecords.filter((record) => 
    record.fullName.toLowerCase().includes(manualSearchQuery.toLowerCase()) ||
    record.id.toLowerCase().includes(manualSearchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#0b0f19] text-white font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#111625] border-r border-gray-800 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-lg">
              DB
            </div>
            <div>
              <h1 className="font-bold text-white text-base">Don Bosco</h1>
              <p className="text-xs text-amber-500 font-medium">Coaches & Admin Portal</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 ${
                activeTab === 'dashboard' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('registration')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 ${
                activeTab === 'registration' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              Registration & Info
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 ${
                activeTab === 'scanner' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              Live Scanner
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 ${
                activeTab === 'directory' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              Master Directory
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 ${
                activeTab === 'logs' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              Attendance Logs
            </button>
          </nav>
        </div>

        <div className="text-xs text-gray-500">
          Admin Mode © 2026
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="bg-[#111625] border border-gray-800 p-6 rounded-xl mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Don Bosco Sports Club</h2>
                <p className="text-amber-500 text-sm mt-1">Coaches Management & Attendance Directory</p>
              </div>
              <div className="text-right text-xs text-gray-400">
                <p>11/3/2026</p>
                <p>Next ID: dbsc-26-{String(masterRecords.length + 1).padStart(2, '0')}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
              <div className="bg-[#111625] border border-gray-800 p-6 rounded-xl">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Registered Staff</p>
                <p className="text-4xl font-bold mt-2 text-white">{masterRecords.length}</p>
              </div>
              <div className="bg-[#111625] border border-gray-800 p-6 rounded-xl">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Coaches</p>
                <p className="text-4xl font-bold mt-2 text-amber-500">
                  {masterRecords.filter((r) => r.roleType === 'Coach').length}
                </p>
              </div>
              <div className="bg-[#111625] border border-gray-800 p-6 rounded-xl">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Members</p>
                <p className="text-4xl font-bold mt-2 text-blue-400">
                  {masterRecords.filter((r) => r.roleType === 'Member').length}
                </p>
              </div>
              <div className="bg-[#111625] border border-gray-800 p-6 rounded-xl">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Today's Attendance</p>
                <p className="text-4xl font-bold mt-2 text-green-400">{attendanceLogs.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Registration & Info Module */}
        {activeTab === 'registration' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Coach & Member Registration</h2>
            <form onSubmit={handleRegister} className="bg-[#111625] border border-gray-800 p-6 rounded-xl space-y-4">
              
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-semibold text-amber-500 uppercase mb-1">Registration Category</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-[#182032] px-4 py-2 rounded-lg border border-gray-700">
                    <input
                      type="radio"
                      name="roleType"
                      value="Coach"
                      checked={formData.roleType === 'Coach'}
                      onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                      className="accent-amber-500"
                    />
                    Coach / Staff
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-[#182032] px-4 py-2 rounded-lg border border-gray-700">
                    <input
                      type="radio"
                      name="roleType"
                      value="Member"
                      checked={formData.roleType === 'Member'}
                      onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                      className="accent-amber-500"
                    />
                    Athlete / Member
                  </label>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Dela Cruz"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-[#182032] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Juan"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-[#182032] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Middle Name</label>
                  <input
                    type="text"
                    placeholder="Santos"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    className="w-full bg-[#182032] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
              </div>

              {/* Details & Designations */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    placeholder="28"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-[#182032] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Birthday</label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="w-full bg-[#182032] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                    {formData.roleType === 'Coach' ? 'Coach Title' : 'Membership Status'}
                  </label>
                  {formData.roleType === 'Coach' ? (
                    <select
                      value={formData.coachRole}
                      onChange={(e) => setFormData({ ...formData, coachRole: e.target.value })}
                      className="w-full bg-[#182032] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                    >
                      <option value="Head Coach">Head Coach</option>
                      <option value="Assistant Coach">Assistant Coach</option>
                    </select>
                  ) : (
                    <select
                      value={formData.membershipType}
                      onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
                      className="w-full bg-[#182032] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                    >
                      <option value="Active Member">Active Member</option>
                      <option value="Non-Member">Non-Member (Retained)</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="coach@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#182032] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="123 Street, City"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#182032] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
              </div>

              {/* Sports Selection Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Sports Assigned / Handled</label>
                <div className="flex gap-6 bg-[#182032] p-3 rounded-lg border border-gray-700 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="basketball"
                      checked={formData.sports.basketball}
                      onChange={handleSportChange}
                      className="accent-amber-500 w-4 h-4"
                    />
                    Basketball
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="volleyball"
                      checked={formData.sports.volleyball}
                      onChange={handleSportChange}
                      className="accent-amber-500 w-4 h-4"
                    />
                    Volleyball
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="badminton"
                      checked={formData.sports.badminton}
                      onChange={handleSportChange}
                      className="accent-amber-500 w-4 h-4"
                    />
                    Badminton
                  </label>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Emergency Contact Person</label>
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className="w-full bg-[#182032] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Emergency Phone Number</label>
                  <input
                    type="text"
                    placeholder="09123456789"
                    value={formData.emergencyContactNumber}
                    onChange={(e) => setFormData({ ...formData, emergencyContactNumber: e.target.value })}
                    className="w-full bg-[#182032] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold p-3 rounded-lg transition mt-4"
              >
                Register {formData.roleType}
              </button>
            </form>
          </div>
        )}

        {/* Live Scanner & Manual Mode */}
        {activeTab === 'scanner' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Check-in Module</h2>

              {/* Mode Toggle Bar */}
              <div className="flex bg-[#111625] border border-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => { setScanMode('qr'); setScannerFeedback(null); }}
                  className={`px-4 py-2 rounded-md text-xs font-semibold transition ${
                    scanMode === 'qr' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  QR / Barcode Scanner
                </button>
                <button
                  onClick={() => { setScanMode('manual'); setScannerFeedback(null); }}
                  className={`px-4 py-2 rounded-md text-xs font-semibold transition ${
                    scanMode === 'manual' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Manual Name Lookup
                </button>
              </div>
            </div>

            {/* Mode 1: QR Scanner */}
            {scanMode === 'qr' && (
              <div className="bg-[#111625] border border-gray-800 p-8 rounded-xl flex flex-col items-center text-center relative overflow-hidden">
                <div className="w-64 h-64 border-2 border-dashed border-amber-500 rounded-2xl flex flex-col items-center justify-center relative bg-[#182032]/50 mb-6">
                  <div className="absolute inset-0 bg-amber-500/5 animate-pulse rounded-2xl"></div>
                  <svg className="w-16 h-16 text-amber-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                    {isScanning ? 'Processing scan...' : 'Align QR / ID Code Here'}
                  </p>
                </div>

                <div className="w-full max-w-md space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Scan or enter ID (e.g. coach-26-01)"
                      value={scannedId}
                      onChange={(e) => setScannedId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleProcessScan()}
                      className="flex-1 bg-[#182032] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 text-sm font-mono"
                    />
                    <button
                      onClick={() => handleProcessScan()}
                      disabled={isScanning}
                      className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-3 rounded-lg text-sm transition disabled:opacity-50"
                    >
                      Scan ID
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Manual Directory Lookup & Check-in */}
            {scanMode === 'manual' && (
              <div className="bg-[#111625] border border-gray-800 p-6 rounded-xl space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Search Person by Name or ID</label>
                  <input
                    type="text"
                    placeholder="Type last name or ID to search..."
                    value={manualSearchQuery}
                    onChange={(e) => setManualSearchQuery(e.target.value)}
                    className="w-full bg-[#182032] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>

                <div className="border border-gray-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#182032] text-gray-400">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Role</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSearchRecords.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-4 text-center text-gray-500">
                            {manualSearchQuery ? 'No matching records found.' : 'Type above to search registered staff or athletes.'}
                          </td>
                        </tr>
                      ) : (
                        filteredSearchRecords.map((record) => (
                          <tr key={record.id} className="border-b border-gray-800 hover:bg-[#182032]">
                            <td className="p-3 font-mono text-amber-500">{record.id}</td>
                            <td className="p-3 font-medium">{record.fullName}</td>
                            <td className="p-3 text-gray-400">{record.roleType} ({record.type})</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleManualCheckIn(record)}
                                className="bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3 py-1.5 rounded text-xs font-semibold transition"
                              >
                                Check In Now
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Shared Feedback Box */}
            {scannerFeedback && (
              <div className={`p-4 rounded-lg w-full border ${
                scannerFeedback.success ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                <p className="font-semibold text-sm">{scannerFeedback.message}</p>
                {scannerFeedback.data && (
                  <div className="text-xs text-gray-300 mt-2 space-y-1 text-left bg-black/20 p-3 rounded">
                    <p><span className="text-gray-400">Name:</span> {scannerFeedback.data.fullName}</p>
                    <p><span className="text-gray-400">Title:</span> {scannerFeedback.data.type}</p>
                    <p><span className="text-gray-400">Sports:</span> {scannerFeedback.data.sports}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Master Directory View */}
        {activeTab === 'directory' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Master Directory (Coaches & Athletes)</h2>
            <div className="bg-[#111625] border border-gray-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#182032] text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Full Name</th>
                    <th className="p-4">Title / Status</th>
                    <th className="p-4">Sports</th>
                    <th className="p-4">Emergency Contact</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {masterRecords?.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-gray-500">No records found.</td>
                    </tr>
                  ) : (
                    masterRecords?.map((record) => (
                      <tr key={record.id} className="border-b border-gray-800 hover:bg-[#182032]">
                        <td className="p-4 text-amber-500 font-mono">{record.id}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            record.roleType === 'Coach' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {record.roleType}
                          </span>
                        </td>
                        <td className="p-4 font-medium">
                          {record.fullName}
                          <div className="text-xs text-gray-400">{record.email}</div>
                        </td>
                        <td className="p-4 text-gray-300">{record.type}</td>
                        <td className="p-4 text-amber-400">{record.sports}</td>
                        <td className="p-4 text-gray-300 text-xs">{record.emergencyContact}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteMasterRecord(record.id)}
                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1 rounded text-xs transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Attendance Logs View */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Attendance Logs</h2>

            <div className="bg-[#111625] border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#182032] text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="p-4">Time</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Session / Notes</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!attendanceLogs || attendanceLogs?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-500">No attendance records logged for today.</td>
                    </tr>
                  ) : (
                    attendanceLogs?.map((log, index) => (
                      <tr key={index} className="border-b border-gray-800 hover:bg-[#182032]">
                        <td className="p-4 text-gray-400">{log?.time || 'N/A'}</td>
                        <td className="p-4 font-mono text-amber-50">{log?.name || 'Unknown'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            log?.role === 'Coach' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {log?.role || 'Member'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300">{log?.details || 'Standard Shift'}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteAttendanceLog(index)}
                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1 rounded text-xs transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}