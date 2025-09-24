import "../styles/Dashboard.css";
import Logout from "../components/Logout";
import { useState, useEffect } from "react";

function HRDashboard({ setIsAuthenticated }) {
  const [loggingOut, setLoggingOut] = useState(false);

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

  // 🔹 Load candidates on page start
  useEffect(() => {
    loadCandidates();
  }, []);

  async function loadCandidates() {
    setLoadingCandidates(true);
    setError(null);
    try {
      const data = await fetchJSON(`${API_BASE}/candidates`);
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

  // 🔹 Update candidate status (used in list + detail)
  async function updateCandidateStatus(id, status, hrNotes = "") {
    try {
      await fetchJSON(`${API_BASE}/candidates/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, hrNotes }),
      });
      setMessage(`Status updated to "${status}" for candidate ${id}.`);
      loadCandidates();
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  }

  // 🔹 Save decision (from detail form)
  async function saveDecision(e) {
    e.preventDefault();
    if (!selectedCandidate) return;

    const status = e.target.status.value;
    const hrNotes = e.target.hrNotes.value;

    await updateCandidateStatus(selectedCandidate.id, status, hrNotes);

    // refresh detail panel
    const refreshed = await fetchJSON(`${API_BASE}/candidates/${selectedCandidate.id}`);
    setSelectedCandidate(refreshed);
  }

  // 🔹 Send email
  async function sendEmail() {
    if (!selectedCandidate?.email) {
      setMessage("No email available.");
      return;
    }
    if (!window.confirm(`Send result email to ${selectedCandidate.email}?`)) return;

    // Example: implement email API here
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
      <h1>Welcome HR</h1>

      {/* Logout */}
      <div>
        {!loggingOut ? (
          <button
            className="logoutbtn"
            onClick={() => setLoggingOut(true)}
          >
            Logout
          </button>
        ) : (
          <Logout setIsAuthenticated={setIsAuthenticated} />
        )}
      </div>

      {/* Candidate List */}
      <section>
        <h2>Candidates</h2>
        {loadingCandidates && <p className="muted">Loading...</p>}
        {error && <p className="error">Error: {error}</p>}
        <ul>
          {candidates.map((c) => (
            <li
              key={c.id}
              className={selectedCandidate?.id === c.id ? "selected" : ""}
            >
              {/* Candidate name (click to view details) */}
              <div
                onClick={() => showCandidate(c.id)}
                style={{ cursor: "pointer" }}
              >
                {c.name} – {c.position}
              </div>

              {/* Status radio buttons */}
              <div className="status-options">
                <label>
                  <input
                    type="radio"
                    name={`status-${c.id}`}
                    value="selected"
                    checked={c.status === "selected"}
                    onChange={() =>
                      updateCandidateStatus(c.id, "selected", c.hrNotes)
                    }
                  />
                  Selected
                </label>
                <label>
                  <input
                    type="radio"
                    name={`status-${c.id}`}
                    value="rejected"
                    checked={c.status === "rejected"}
                    onChange={() =>
                      updateCandidateStatus(c.id, "rejected", c.hrNotes)
                    }
                  />
                  Rejected
                </label>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Candidate Detail */}
      <section>
        {selectedCandidate ? (
          <div className="candidate-detail">
            <h2>{selectedCandidate.name}</h2>
            <p>
              <strong>Email:</strong>{" "}
              {selectedCandidate.email || "-"}
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              {selectedCandidate.phone || "-"}
            </p>
            <p>
              <strong>Interview Id:</strong>{" "}
              {selectedCandidate.Iid || "-"}
            </p>
            <hr />

            <form onSubmit={saveDecision}>
              <div>
                <strong>Decision:</strong>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="selected"
                    defaultChecked={selectedCandidate.status === "selected"}
                  />
                  Selected
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="rejected"
                    defaultChecked={selectedCandidate.status === "rejected"}
                  />
                  Rejected
                </label>
              </div>
              <br />
              <label>
                HR Notes:
                <textarea
                  name="hrNotes"
                  defaultValue={selectedCandidate.hrNotes || ""}
                />
              </label>
              <br />
              <button type="submit">Save Decision</button>
              <button
                type="button"
                className="secondary"
                onClick={sendEmail}
              >
                Send Result Email
              </button>
            </form>
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
          placeholder="Enter value"
        />
        <button onClick={searchUser}>Search</button>

        {searchResult && (
          <div className="result">
            {Object.entries(searchResult).map(([k, v]) => (
              <div key={k}>
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

export default HRDashboard;
