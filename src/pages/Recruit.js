import "../styles/Dashboard.css";
import { useState, useEffect } from "react";

function Recruit({ setIsAuthenticated }) {
  // Candidates state
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [error, setError] = useState(null);

  // Selected candidate
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Messages
  const [message, setMessage] = useState("");

  // Search
  const [searchType, setSearchType] = useState("email");
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const API_BASE = "http://localhost:8080";

  // 🔹 Fetch utility
  async function fetchJSON(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // 🔹 Load candidates
  useEffect(() => {
    loadCandidates();
  }, []);

  async function loadCandidates() {
    setLoadingCandidates(true);
    setError(null);
    try {
      const data = await fetchJSON(`${API_BASE}/getAllUsers`);
      setCandidates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCandidates(false);
    }
  }

  // 🔹 Show candidate details
  async function showCandidate(id) {
    setMessage("");
    setSelectedCandidate(null);
    try {
      const c = await fetchJSON(`${API_BASE}/candidates/${id}`);
      setSelectedCandidate(c);
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  }

  // 🔹 Update candidate status
  async function updateCandidateStatus(id, status) {
    try {
      await fetchJSON(`${API_BASE}/update-status?${id}=active&role=${Role}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setMessage(`Status updated to "${status}" for candidate ${id}.`);
      loadCandidates();

      if (selectedCandidate?.id === id) {
        const refreshed = await fetchJSON(`${API_BASE}/update-status?${id}=active&role=${Role}`);
        setSelectedCandidate(refreshed);
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  }

  // 🔹 Send email
  async function sendEmail() {
    if (!selectedCandidate?.email) {
      setMessage("No email available.");
      return;
    }
    if (!window.confirm(`Send result email to ${selectedCandidate.email}?`)) return;

    setMessage(`Email sent to ${selectedCandidate.email} (stub).`);
  }

  // 🔹 Search user
  async function searchUser() {
    setSearchResult(null);
    setMessage("");
    try {
      const data = await fetchJSON(
        `${API_BASE}/search?type=${searchType}&value=${searchValue}`
      );
      setSearchResult(data);
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  }

  return (
    <div className="dashboard">
      {/* Candidate List */}
      <section>
        <h2>Candidates</h2>
        {loadingCandidates && <p className="muted">Loading...</p>}
        {error && <p className="error">Error: {error}</p>}

        <ul className="candidate-list">
          {candidates.map((c, index) => (
            <li key={c.id ?? index} className="candidate-item">
              <div onClick={() => showCandidate(c.id)} style={{ cursor: "pointer" }}>
                <h3>{c.name}</h3>
                <p><strong>Email:</strong> {c.email || "-"}</p>
                <p><strong>Phone:</strong> {c.phone || "-"}</p>
                <p><strong>Interview Id:</strong> {c.iid || "-"}</p>
                <p><strong>Status:</strong> {c.status || "-"}</p>
              </div>

              <div className="status-buttons">
                <button
                  className={`status-btn ${c.status === "selected" ? "active" : ""}`}
                  onClick={() => updateCandidateStatus(c.id, "selected")}
                >
                  ✅ Selected
                </button>
                <button
                  className={`status-btn ${c.status === "rejected" ? "active" : ""}`}
                  onClick={() => updateCandidateStatus(c.id, "rejected")}
                >
                  ❌ Rejected
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Candidate Detail Panel */}
      <section>
        {selectedCandidate ? (
          <div className="candidate-detail">
            <h2>{selectedCandidate.name}</h2>
            <p><strong>Email:</strong> {selectedCandidate.email || "-"}</p>
            <p><strong>Phone:</strong> {selectedCandidate.phone || "-"}</p>
            <p><strong>Interview Id:</strong> {selectedCandidate.iid || "-"}</p>
            <p><strong>Status:</strong> {selectedCandidate.status || "-"}</p>
            <hr />

            <div className="status-buttons">
              <button
                type="button"
                className={`status-btn ${selectedCandidate.status === "selected" ? "active" : ""}`}
                onClick={() => updateCandidateStatus(selectedCandidate.id, "selected")}
              >
                ✅ Selected
              </button>
              <button
                type="button"
                className={`status-btn ${selectedCandidate.status === "rejected" ? "active" : ""}`}
                onClick={() => updateCandidateStatus(selectedCandidate.id, "rejected")}
              >
                ❌ Rejected
              </button>
            </div>
            <br />
            <button type="button" className="secondary" onClick={sendEmail}>
              Send Result Email
            </button>
          </div>
        ) : (
          <p className="muted">Select a candidate to see details</p>
        )}
      </section>

      {/* Search Section */}
      <section>
        <h2>Search User</h2>
        <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="name">Name</option>
        </select>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Enter value"
        />
        <button onClick={searchUser}>Search</button>

        {searchResult && (
          <div className="result">
            {Object.entries(searchResult).map(([k, v], index) => (
              <div key={`${k}-${index}`}>
                <b>{k}:</b> {v}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Global Message */}
      {message && <div id="message">{message}</div>}
    </div>
  );
}

export default Recruit;
