 const API_BASE = "http://localhost:8080"; 

    async function fetchJSON(url, options = {}) {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    }

    async function loadCandidates() {
      const listEl = document.getElementById("candidate-list");
      listEl.innerHTML = "<li class='muted'>Loading...</li>";
      try {
        const candidates = await fetchJSON(`${API_BASE}/candidates`);
        listEl.innerHTML = "";
        candidates.forEach(c => {
          const li = document.createElement("li");
          li.textContent = `${c.name} – ${c.position} (${c.status || "pending"})`;
          li.onclick = () => showCandidate(c.id, li);
          listEl.appendChild(li);
        });
      } catch (err) {
        listEl.innerHTML = `<li class="muted">Error: ${err.message}</li>`;
      }
    }

    async function showCandidate(id, li) {
      document.querySelectorAll("#candidate-list li").forEach(el => el.classList.remove("selected"));
      li.classList.add("selected");

      const detailEl = document.getElementById("candidate-detail");
      detailEl.innerHTML = "<p class='muted'>Loading...</p>";
      try {
        const c = await fetchJSON(`${API_BASE}/api/candidates/${id}`);
        detailEl.innerHTML = `
          <h2>${c.name}</h2>
          <p><strong>Email:</strong> ${c.email || "-"}</p>
          <p><strong>Phone:</strong> ${c.phone || "-"}</p>
          <p><strong>Interview Id:</strong> ${c.Iid || "-"}</p>
          <hr>
          <form id="status-form">
            <label>
              Decision:
              <select id="status">
                <option value="selected" ${c.status==="selected"?"selected":""}>Selected</option>
                <option value="rejected" ${c.status==="rejected"?"selected":""}>Rejected</option>
                <option value="on_hold" ${c.status==="on_hold"?"selected":""}>On Hold</option>
              </select>
            </label>
            <label>
              HR Notes:
              <textarea id="hr-notes">${c.hrNotes||""}</textarea>
            </label>
            <button type="submit">Save Decision</button>
            <button type="button" class="secondary" id="send-email">Send Result Email</button>
          </form>
        `;

        document.getElementById("status-form").onsubmit = async (e) => {
          e.preventDefault();
          const status = document.getElementById("status").value;
          const hrNotes = document.getElementById("hr-notes").value;
          try {
            await fetchJSON(`${API_BASE}/api/candidates/${id}/status`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status, hrNotes })
            });
            showMessage("Decision saved.");
            loadCandidates();
          } catch (err) {
            showMessage("Error: " + err.message);
          }
        };

        document.getElementById("send-email").onclick = async () => {
          if (!c.email) {
            showMessage("No email available.");
            return;
          }
          if (!confirm(`Send result email to ${c.email}?`)) return;
         //Email Tempalte
        };
      } catch (err) {
        detailEl.innerHTML = `<p class="muted">Error: ${err.message}</p>`;
      }
    }

    function showMessage(msg) {
      const el = document.getElementById("message");
      el.textContent = msg;
    }

    // load on page start
    loadCandidates();




  //  Another one
   function searchUser() {
      const type = document.getElementById("searchType").value;
      const value = document.getElementById("searchValue").value;
      const resultDiv = document.getElementById("resultDiv");

      resultDiv.innerHTML = "";

      fetch(`http://localhost:8080/search?type=${type}&value=${value}`)
        .then(res => {
          if (!res.ok) throw new Error("User not found");
          return res.json();
        })
        .then(data => {
          let key = Object.keys(data)[0];
          let val = data[key];
          resultDiv.innerHTML = `<div class="result"><b>${key}:</b> ${val}</div>`;
        })
        .catch(err => {
          resultDiv.innerHTML = `<div class="error">${err.message}</div>`;
        });
    }