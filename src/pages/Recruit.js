import "../styles/Dashboard.css";
import { useState, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";

function Recruit({ setIsAuthenticated }) {
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [error, setError] = useState(null);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [message, setMessage] = useState("");

  const [searchType, setSearchType] = useState("email");
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const [roleInputFor, setRoleInputFor] = useState(null);
  const [roleValue, setRoleValue] = useState("");

  const API_BASE = "http://localhost:8080";

  // 🔹 Fetch utility
  async function fetchJSON(url, options = {}) {
    const res = await fetch(url, options);
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Invalid server response");
    }
    if (!res.ok) {
      throw new Error(data.error || data.message || "Something went wrong");
    }
    return data;
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

  async function showCandidate(iid) {
    setMessage("");
    setSelectedCandidate(null);
    try {
      const c = await fetchJSON(`${API_BASE}/candidates/${iid}`);
      setSelectedCandidate(c);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function updateCandidateStatus(iid, status, role = "") {
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

      setRoleInputFor(null);
      setRoleValue("");
    } catch (err) {
      setMessage(err.message);
    }
  }

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
    setSelectedCandidate(null);
    setMessage("");

    if (!value.trim()) {
      setSearchResult(null);
      return;
    }

    let url = "";
    if (type === "email") {
      url = `${API_BASE}/searchEmail?email=${encodeURIComponent(value)}`;
    } else if (type === "phone") {
      url = `${API_BASE}/searchPhone?phone=${encodeURIComponent(value)}`;
    } else if (type === "name") {
      url = `${API_BASE}/searchName?fullName=${encodeURIComponent(value)}`;
    }

    try {
      const data = await fetchJSON(url);

      if (Array.isArray(data) && data.length === 0) {
        setMessage("No user found");
      } else if (Array.isArray(data) && data.length === 1) {
        setSearchResult(data[0]);
      } else {
        setSearchResult(data);
      }
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
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="name">Name</option>
        </select>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Type to search..."
        />
        {searchResult && (
          Array.isArray(searchResult) ? (
            <ul className="candidate-list">
              {searchResult.map(renderCandidateCard)}
            </ul>
          ) : (
            <ul className="candidate-list">
              {renderCandidateCard(searchResult)}
            </ul>
          )
        )}
      </section>

      {/* Global Message */}
      {message && <div id="message">{message}</div>}
    </div>
  );
}

export default Recruit;
