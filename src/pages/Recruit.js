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

  // Universal fetch function
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

  // Load all candidates initially
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
      const url = `${API_BASE}/update-status?id=${iid}&status=${status}&role=${role}`;
      const updatedUser = await fetchJSON(url, { method: "PUT" });

      setMessage(`✅ Status updated to "${status}" for candidate ${iid}.`);

      // Update candidate list
      setCandidates(prev =>
        prev.map(c => (c.iid === iid ? updatedUser : c))
      );

      // Update selected candidate if active
      if (selectedCandidate?.iid === iid) {
        setSelectedCandidate(updatedUser);
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

    try {
      const res = await fetchJSON(`${API_BASE}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedCandidate.email }),
      });
      setMessage(res.message || `Email sent to ${selectedCandidate.email}`);
    } catch (err) {
      setMessage(err.message);
    }
  }

  // =========================
  // SEARCH FUNCTION
  // =========================
  const searchUser = useCallback(async (value, type) => {
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
      setMessage(err.message);
    }
  }, []);

  // Debounce the search to avoid too many requests
  const debouncedSearch = useCallback(debounce(searchUser, 200), [searchUser]);

  // Trigger search on every key press
  useEffect(() => {
    debouncedSearch(searchValue, searchType);
    return debouncedSearch.cancel;
  }, [searchValue, searchType, debouncedSearch]);

  // =========================
  // ACTION BUTTONS
  // =========================
  const renderActionButtons = (candidate) => {
    const status = candidate.status || "ONHOLD";

    if (status === "ONHOLD") {
      if (roleInputFor === candidate.iid) {
        return (
          <div className="role-input">
            <input
              type="text"
              placeholder="Enter role"
              value={roleValue}
              onChange={(e) => setRoleValue(e.target.value)}
            />
            <button
              onClick={() =>
                updateCandidateStatus(candidate.iid, "selected", roleValue)
              }
              disabled={!roleValue.trim()}
            >
              Confirm
            </button>
            <button onClick={() => setRoleInputFor(null)}>Cancel</button>
          </div>
        );
      }

      return (
        <>
          <button
            className="status-btn"
            onClick={() => setRoleInputFor(candidate.iid)}
          >
            Select
          </button>
          <button
            className="status-btn"
            onClick={() => updateCandidateStatus(candidate.iid, "rejected")}
          >
            Reject
          </button>
        </>
      );
    } else if (status === "selected") {
      return <button className="status-btn active" disabled>✅ Selected</button>;
    } else if (status === "rejected") {
      return <button className="status-btn active reject" disabled>❌ Rejected</button>;
    }
  };

  const renderCandidateCard = (c) => (
    <li key={c.iid} className="candidate-item">
      <div
        onClick={() => showCandidate(c.iid)}
        style={{ cursor: "pointer" }}
      >
        <h3>{c.name}</h3>
        <p><strong>Email:</strong> {c.email || "-"}</p>
        <p><strong>Phone:</strong> {c.phone || "-"}</p>
        <p><strong>Interview Id:</strong> {c.iid || "-"}</p>
        <p><strong>Status:</strong> {c.status || "pending"}</p>
      </div>
      <div className="status-buttons">{renderActionButtons(c)}</div>
    </li>
  );

  return (
    <div className="dashboard">
      {/* ========================= */}
      {/* SEARCH SECTION */}
      {/* ========================= */}
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

      {/* ========================= */}
      {/* CANDIDATE LIST (if no search) */}
      {/* ========================= */}
      {!searchResult && (
        <section>
          <h2>Candidates</h2>
          {loadingCandidates && <p className="muted">Loading...</p>}
          {error && <p className="error">Error: {error}</p>}

          <ul className="candidate-list">
            {candidates.map(renderCandidateCard)}
          </ul>
        </section>
      )}

      {/* ========================= */}
      {/* CANDIDATE DETAIL PANEL */}
      {/* ========================= */}
      {selectedCandidate && !searchResult && (
        <section>
          <div className="candidate-detail">
            <h2>{selectedCandidate.name}</h2>
            <p><strong>Email:</strong> {selectedCandidate.email || "-"}</p>
            <p><strong>Phone:</strong> {selectedCandidate.phone || "-"}</p>
            <p><strong>Interview Id:</strong> {selectedCandidate.iid || "-"}</p>
            <p><strong>Status:</strong> {selectedCandidate.status || "pending"}</p>
            <hr />
            <div className="status-buttons">
              {renderActionButtons(selectedCandidate)}
            </div>
            <br />
            <button className="secondary" onClick={sendEmail}>
              Send Result Email
            </button>
          </div>
        </section>
      )}

      {message && <div id="message">{message}</div>}
    </div>
  );
}

export default Recruit;
