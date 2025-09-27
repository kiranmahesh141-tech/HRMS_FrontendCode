import "../styles/Dashboard.css";
import { useState, useEffect } from "react";

function Recruit({ setIsAuthenticated }) {
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [error, setError] = useState(null);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [message, setMessage] = useState("");

  const [searchType, setSearchType] = useState("email");
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  // State to track role input
  const [roleInputFor, setRoleInputFor] = useState(null); // iid of candidate waiting for role
  const [roleValue, setRoleValue] = useState("");

  const API_BASE = "http://localhost:8080";

  async function fetchJSON(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

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
      setMessage("Error: " + err.message);
    }
  }

  async function updateCandidateStatus(iid, status, role = "") {
    try {
      const url = `${API_BASE}/update-status?id=${iid}&status=${status}&role=${role}`;
      const updatedUser = await fetchJSON(url, { method: "PUT" });

      setMessage(`Status updated to "${status}" for candidate ${iid}.`);
      loadCandidates();

      if (selectedCandidate?.iid === iid) {
        setSelectedCandidate(updatedUser);
      }

      setRoleInputFor(null);
      setRoleValue("");
    } catch (err) {
      setMessage("Error: " + err.message);
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
            <li key={c.iid ?? index} className="candidate-item">
              <div onClick={() => showCandidate(c.iid)} style={{ cursor: "pointer" }}>
                <h3>{c.name}</h3>
                <p><strong>Email:</strong> {c.email || "-"}</p>
                <p><strong>Phone:</strong> {c.phone || "-"}</p>
                <p><strong>Interview Id:</strong> {c.iid || "-"}</p>
                <p><strong>Status:</strong> {c.status || "-"}</p>
              </div>

              <div className="status-buttons">
                {roleInputFor === c.iid ? (
                  <>
                    <input
                      type="text"
                      placeholder="Enter role"
                      value={roleValue}
                      onChange={(e) => setRoleValue(e.target.value)}
                    />
                    <button
                      onClick={() => updateCandidateStatus(c.iid, "selected", roleValue)}
                      disabled={!roleValue.trim()}
                    >
                      Confirm
                    </button>
                    <button onClick={() => setRoleInputFor(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button
                      className={`status-btn ${c.status === "selected" ? "active" : ""}`}
                      onClick={() => setRoleInputFor(c.iid)}
                    >
                      ✅ Selected
                    </button>
                    <button
                      className={`status-btn ${c.status === "rejected" ? "active" : ""}`}
                      onClick={() => updateCandidateStatus(c.iid, "rejected")}
                    >
                      ❌ Rejected
                    </button>
                  </>
                )}
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
              {roleInputFor === selectedCandidate.iid ? (
                <>
                  <input
                    type="text"
                    placeholder="Enter role"
                    value={roleValue}
                    onChange={(e) => setRoleValue(e.target.value)}
                  />
                  <button
                    onClick={() => updateCandidateStatus(selectedCandidate.iid, "selected", roleValue)}
                    disabled={!roleValue.trim()}
                  >
                    Confirm
                  </button>
                  <button onClick={() => setRoleInputFor(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={`status-btn ${selectedCandidate.status === "selected" ? "active" : ""}`}
                    onClick={() => setRoleInputFor(selectedCandidate.iid)}
                  >
                    ✅ Selected
                  </button>
                  <button
                    type="button"
                    className={`status-btn ${selectedCandidate.status === "rejected" ? "active" : ""}`}
                    onClick={() => updateCandidateStatus(selectedCandidate.iid, "rejected")}
                  >
                    ❌ Rejected
                  </button>
                </>
              )}
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

      {message && <div id="message">{message}</div>}
    </div>
  );
}

export default Recruit;
